import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import {
  createAccessRequest,
  getAccessRequestById,
  getActiveAccessRequestForDoctor,
  updateAccessRequest,
  getAccessRequestsByPatient,
  getAccessRequestsByDoctor,
} from '../repositories/accessRequests.repository';
import { getPatientByUserId } from '../repositories/patient.repository';
import { getDoctorByUserId, getDoctorWithUser } from '../repositories/doctor.repository';
import { createShareToken, revokeShareToken } from '../repositories/shareTokens.repository';
import {
  createAccessRequestSchema,
  approveAccessRequestSchema,
  updateAccessRequestSchema,
} from '../validators/accessRequests';
import { db } from '../db';
import { users, patients } from '../schema';
import { eq } from 'drizzle-orm';

// Doctor requests access
export const createAccessRequestController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  if (!userId || request.auth?.role !== 'doctor') {
    throw new AppError(401, 'Doctor authentication required');
  }

  const doctor = await getDoctorByUserId(userId);
  if (!doctor) throw new AppError(404, 'Doctor profile not found');

  const validated = createAccessRequestSchema.parse(request.body);

  const activeRequest = await getActiveAccessRequestForDoctor(validated.patientId, doctor.doctorId);
  if (activeRequest) {
    throw new AppError(409, 'An active access request or connection already exists for this patient');
  }

  const newRequest = await createAccessRequest({
    patientId: validated.patientId,
    doctorId: doctor.doctorId,
  });

  const [patientUser] = await db
    .select({ name: users.name })
    .from(patients)
    .innerJoin(users, eq(patients.userId, users.userId))
    .where(eq(patients.patientId, validated.patientId))
    .limit(1);

  response.status(201).json({
    status: 'success',
    data: {
      requestId: newRequest.id,
      status: newRequest.status,
      patientName: patientUser?.name || 'Unknown Patient',
    },
  });
});

// Doctor fetches history
export const getDoctorAccessRequestsController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  if (!userId || request.auth?.role !== 'doctor') {
    throw new AppError(401, 'Doctor authentication required');
  }

  const doctor = await getDoctorByUserId(userId);
  if (!doctor) throw new AppError(404, 'Doctor profile not found');

  const requests = await getAccessRequestsByDoctor(doctor.doctorId);

  // Map patient names
  const patientIds = [...new Set(requests.map(r => r.patientId))];
  const patientNamesMap: Record<string, string> = {};
  if (patientIds.length > 0) {
    for (const pId of patientIds) {
      const [p] = await db
        .select({ name: users.name })
        .from(patients)
        .innerJoin(users, eq(patients.userId, users.userId))
        .where(eq(patients.patientId, pId))
        .limit(1);
      if (p) patientNamesMap[pId] = p.name;
    }
  }

  response.status(200).json({
    status: 'success',
    data: requests.map(r => ({
      requestId: r.id,
      patientName: patientNamesMap[r.patientId] || 'Unknown Patient',
      status: r.status,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      approvedScope: r.approvedScope,
    })),
  });
});

// Patient fetches all requests
export const getPatientAccessRequestsController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  if (!userId || request.auth?.role !== 'patient') {
    throw new AppError(401, 'Patient authentication required');
  }

  const patient = await getPatientByUserId(userId);
  if (!patient) throw new AppError(404, 'Patient profile not found');

  const requests = await getAccessRequestsByPatient(patient.patientId);

  // Map doctor names
  const doctorIds = [...new Set(requests.map(r => r.doctorId))];
  const doctorsMap: Record<string, any> = {};
  for (const dId of doctorIds) {
    const dData = await getDoctorWithUser(dId);
    if (dData) doctorsMap[dId] = { name: dData.user.name, specialization: dData.doctor.specialization };
  }

  response.status(200).json({
    status: 'success',
    data: requests.map(r => ({
      requestId: r.id,
      doctorInfo: doctorsMap[r.doctorId] || { name: 'Unknown', specialization: 'Unknown' },
      status: r.status,
      approvedScope: r.approvedScope,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
    })),
  });
});

// Patient approves request
export const approveAccessRequestController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  if (!userId || request.auth?.role !== 'patient') throw new AppError(401, 'Patient authentication required');
  const patient = await getPatientByUserId(userId);
  if (!patient) throw new AppError(404, 'Patient profile not found');

  const requestId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const accessReq = await getAccessRequestById(requestId);

  if (!accessReq) throw new AppError(404, 'Access request not found');
  if (accessReq.patientId !== patient.patientId) throw new AppError(403, 'Forbidden');
  if (accessReq.status !== 'pending') throw new AppError(400, 'Request is not pending');
  if (accessReq.requestExpiresAt && new Date() > accessReq.requestExpiresAt) {
    await updateAccessRequest(accessReq.id, { status: 'expired' });
    throw new AppError(400, 'Request has expired');
  }

  const validated = approveAccessRequestSchema.parse(request.body);

  let expiresAt: Date | undefined;
  if (validated.expiresInMinutes) {
    expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + validated.expiresInMinutes);
  }

  // Create share token programmatically
  const shareToken = await createShareToken({
    patientId: patient.patientId,
    doctorId: accessReq.doctorId,
    scope: validated.scope,
    accessLevel: 'doctor',
    accessType: 'restricted',
    expiresAt,
  });

  const updatedReq = await updateAccessRequest(accessReq.id, {
    status: 'approved',
    approvedScope: validated.scope,
    shareTokenId: shareToken.tokenId,
    expiresAt,
  });

  response.status(200).json({
    status: 'success',
    data: updatedReq,
  });
});

// Patient rejects request
export const rejectAccessRequestController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  if (!userId || request.auth?.role !== 'patient') throw new AppError(401, 'Patient authentication required');
  const patient = await getPatientByUserId(userId);
  if (!patient) throw new AppError(404, 'Patient profile not found');

  const requestId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const accessReq = await getAccessRequestById(requestId);

  if (!accessReq) throw new AppError(404, 'Access request not found');
  if (accessReq.patientId !== patient.patientId) throw new AppError(403, 'Forbidden');
  if (accessReq.status !== 'pending') throw new AppError(400, 'Request is not pending');

  const updatedReq = await updateAccessRequest(accessReq.id, { status: 'rejected' });

  response.status(200).json({ status: 'success', data: updatedReq });
});

// Patient updates request
export const updateAccessRequestController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  if (!userId || request.auth?.role !== 'patient') throw new AppError(401, 'Patient authentication required');
  const patient = await getPatientByUserId(userId);
  if (!patient) throw new AppError(404, 'Patient profile not found');

  const requestId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const accessReq = await getAccessRequestById(requestId);

  if (!accessReq) throw new AppError(404, 'Access request not found');
  if (accessReq.patientId !== patient.patientId) throw new AppError(403, 'Forbidden');
  if (accessReq.status !== 'approved') throw new AppError(400, 'Request is not approved');

  const validated = updateAccessRequestSchema.parse(request.body);

  let expiresAt: Date | undefined;
  if (validated.expiresInMinutes) {
    expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + validated.expiresInMinutes);
  }

  // Generate new share token and revoke the old one, or handle logic
  if (accessReq.shareTokenId) {
    await revokeShareToken(accessReq.shareTokenId, patient.patientId, userId);
  }

  const shareToken = await createShareToken({
    patientId: patient.patientId,
    doctorId: accessReq.doctorId,
    scope: validated.scope,
    accessLevel: 'doctor',
    accessType: 'restricted',
    expiresAt,
  });

  const updatedReq = await updateAccessRequest(accessReq.id, {
    approvedScope: validated.scope,
    shareTokenId: shareToken.tokenId,
    expiresAt,
  });

  response.status(200).json({ status: 'success', data: updatedReq });
});

// Patient revokes request
export const revokeAccessRequestController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  if (!userId || request.auth?.role !== 'patient') throw new AppError(401, 'Patient authentication required');
  const patient = await getPatientByUserId(userId);
  if (!patient) throw new AppError(404, 'Patient profile not found');

  const requestId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const accessReq = await getAccessRequestById(requestId);

  if (!accessReq) throw new AppError(404, 'Access request not found');
  if (accessReq.patientId !== patient.patientId) throw new AppError(403, 'Forbidden');
  if (accessReq.status !== 'approved') throw new AppError(400, 'Request is not approved');

  if (accessReq.shareTokenId) {
    await revokeShareToken(accessReq.shareTokenId, patient.patientId, userId);
  }

  const updatedReq = await updateAccessRequest(accessReq.id, { status: 'revoked' });

  response.status(200).json({ status: 'success', data: updatedReq });
});
