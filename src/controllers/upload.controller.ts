import type { Request, Response } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { createUploadUrlSchema, finalizeUploadSchema } from '../validators/patient.validators';
import { getSupabaseAdmin } from '../lib/supabase';
import { env } from '../config/env';
import { getPatientByUserId } from '../repositories/patient.repository';
import { createMedicalRecord } from '../repositories/medicalRecords.repository';

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');
const sanitizeFolder = (name: string) => (name || 'other').replace(/[^a-zA-Z0-9_-]/g, '');

export const createUploadUrlController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  if (!userId) throw new AppError(401, 'Unauthorized');

  const payload = createUploadUrlSchema.parse(request.body);
  const supabase = getSupabaseAdmin();

  const fileName = sanitizeFileName(payload.fileName);
  const randomId = crypto.randomBytes(8).toString('hex');
  const path = `${userId}/${payload.folder}/${Date.now()}-${randomId}-${fileName}`;

  console.log('Creating upload URL for path:', path);
  console.log('Supabase bucket:', env.supabaseBucket);

  const { data, error } = await supabase.storage.from(env.supabaseBucket).createSignedUploadUrl(path);

  if (error || !data) {
    throw new AppError(500, 'Failed to create upload URL', error?.message);
  }

  response.status(201).json({
    status: 'success',
    data: {
      bucket: env.supabaseBucket,
      path: data.path,
      signedUrl: data.signedUrl,
      token: data.token,
      contentType: payload.contentType,
    },
  });
});

export const finalizeUploadController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  if (!userId) throw new AppError(401, 'Unauthorized');

  const payload = finalizeUploadSchema.parse(request.body);
  if (!payload.path.startsWith(`${userId}/`)) {
    throw new AppError(403, 'Invalid upload path');
  }

  const patient = await getPatientByUserId(userId);
  if (!patient) throw new AppError(404, 'Patient profile not found');

  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage.from(env.supabaseBucket).getPublicUrl(payload.path);
  const fileUrl = data.publicUrl;

  const record = await createMedicalRecord({
    patientId: patient.patientId,
    uploadedBy: userId,
    type: payload.type,
    title: payload.title,
    fileUrl,
    originalContent: payload.originalContent,
    documentDate: payload.documentDate,
    privacy: payload.privacy,
    metadata: {
      ...(payload.metadata ?? {}),
      storageProvider: 'supabase',
      storageBucket: env.supabaseBucket,
      storagePath: payload.path,
    },
  });

  response.status(201).json({
    status: 'success',
    data: {
      recordId: record.recordId,
      type: record.type,
      title: record.title,
      fileUrl: record.fileUrl,
      privacy: record.privacy,
      createdAt: record.createdAt,
    },
  });
});

export const uploadFileDirectController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  if (!userId) throw new AppError(401, 'Unauthorized');

  const reqWithFile = request as Request & { file?: Express.Multer.File };
  const file = reqWithFile.file;
  if (!file) throw new AppError(400, 'File is required');

  const folder = sanitizeFolder(String(request.body?.folder || 'other'));
  const fileName = sanitizeFileName(file.originalname || 'upload.bin');
  const randomId = crypto.randomBytes(8).toString('hex');
  const path = `${userId}/${folder}/${Date.now()}-${randomId}-${fileName}`;


  console.log('Creating upload URL for path:', path);
  console.log('Supabase bucket:', env.supabaseBucket);
  console.log("File mimetype:", file.mimetype);
console.log("File size:", file.size);


  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(env.supabaseBucket).upload(path, new Uint8Array(file.buffer), {
    contentType: file.mimetype || 'application/octet-stream',
    upsert: false,
  });

  if (error) throw new AppError(500, 'Failed to upload file', error.message);

  const { data } = supabase.storage.from(env.supabaseBucket).getPublicUrl(path);

  response.status(201).json({
    status: 'success',
    data: {
      bucket: env.supabaseBucket,
      path,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      fileUrl: data.publicUrl,
    },
  });
});
