import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import {
  createShareToken,
  revokeShareToken,
  getShareTokensByPatient,
  getPatientDoctorToken,
} from '../repositories/shareTokens.repository';
import { getPatientByUserId, getPatientHealthData, getPatientAllergies, getPatientChronicConditions, getPatientVaccinations } from '../repositories/patient.repository';
import { getMedicalRecordsByPatientAndType } from '../repositories/medicalRecords.repository';
import { generateQRCode } from '../lib/qrcode';
import { env } from '../config/env';
import type { HealthData, Allergy, ChronicCondition } from '../schema';
import { accessRequests } from '../schema';
import { z } from 'zod';
import { createAuditLog } from '../repositories/auditLogs.repository';
import { db } from '../db';
import { eq } from 'drizzle-orm';

const createShareTokenSchema = z.object({
  doctorId: z.string().uuid().optional(),
  scope: z.array(z.enum(['prescriptions', 'reports', 'health_data', 'vaccinations'])).min(1),
  accessLevel: z.enum(['public', 'doctor']).default('doctor'),
  maxAccesses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  accessType: z.enum(['anyone', 'restricted']).default('anyone').optional(),
  allowedEmails: z.array(z.string().email()).optional(),
});

/**
 * POST /api/v1/patient/share-tokens
 * Create a new share token for data access
 */
export const createShareTokenController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;

  if (!userId || request.auth?.role !== 'patient') {
    throw new AppError(401, 'Patient authentication required');
  }

  const patient = await getPatientByUserId(userId);
  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const validated = createShareTokenSchema.parse(request.body);

  // If creating doctor-specific token, cannot create multiple for same doctor
  if (validated.accessLevel === 'doctor' && validated.doctorId) {
    const existingToken = await getPatientDoctorToken(patient.patientId, validated.doctorId);
    if (existingToken) {
      throw new AppError(409, 'Active token already exists for this doctor');
    }
  }

  const token = await createShareToken({
    patientId: patient.patientId,
    doctorId: validated.doctorId,
    scope: validated.scope,
    accessLevel: validated.accessLevel,
    maxAccesses: validated.maxAccesses,
    expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : undefined,
    accessType: validated.accessType || 'anyone',
    allowedEmails: validated.allowedEmails,
  });

  // Generate QR code
  let qrCodeDataUrl: string | null = null;
  try {
    qrCodeDataUrl = await generateQRCode(token.token, env.baseUrl);
  } catch (error) {
    // QR code generation failed, but continue - it's optional
    console.error('QR code generation failed:', error);
  }

  response.status(201).json({
    status: 'success',
    data: {
      tokenId: token.tokenId,
      token: token.token, // Only returned at creation!
      qrCode: qrCodeDataUrl,
      scope: token.scope,
      accessLevel: token.accessLevel,
      expiresAt: token.expiresAt,
      maxAccesses: token.maxAccesses,
      createdAt: token.createdAt,
    },
    message: 'Share token created. Save this token securely - you will not see it again!',
  });
});

/**
 * GET /api/v1/patient/share-tokens
 * List all share tokens for the patient with access history
 */
export const getShareTokensController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const limit = Math.min(Number(request.query.limit) || 10, 100);
  const offset = Number(request.query.offset) || 0;

  if (!userId || request.auth?.role !== 'patient') {
    throw new AppError(401, 'Patient authentication required');
  }

  const patient = await getPatientByUserId(userId);
  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const tokens = await getShareTokensByPatient(patient.patientId);
  const paginatedTokens = tokens.slice(offset, offset + limit);

  response.status(200).json({
    status: 'success',
    data: paginatedTokens.map((token: any) => ({
      tokenId: token.tokenId,
      doctorId: token.doctorId,
      scope: token.scope,
      accessLevel: token.accessLevel,
      status: token.status,
      currentAccesses: token.currentAccesses,
      maxAccesses: token.maxAccesses,
      lastAccessedAt: token.lastAccessedAt,
      expiresAt: token.expiresAt,
      revokedAt: token.revokedAt,
      createdAt: token.createdAt,
    })),
    meta: {
      count: paginatedTokens.length,
      total: tokens.length,
      limit,
      offset,
      hasMore: offset + paginatedTokens.length < tokens.length,
    },
  });
});

/**
 * DELETE /api/v1/patient/share-tokens/:tokenId
 * Revoke a share token
 */
export const revokeShareTokenController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const tokenId = Array.isArray(request.params.tokenId) ? request.params.tokenId[0] : request.params.tokenId;

  if (!userId || request.auth?.role !== 'patient') {
    throw new AppError(401, 'Patient authentication required');
  }

  const patient = await getPatientByUserId(userId);
  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const revoked = await revokeShareToken(tokenId, patient.patientId, userId);

  response.status(200).json({
    status: 'success',
    data: {
      tokenId: revoked.tokenId,
      status: revoked.status,
      revokedAt: revoked.revokedAt,
    },
    message: 'Token revoked successfully',
  });
});

/**
 * POST /api/v1/share/:token/access
 * Public endpoint - Doctor accesses shared patient data via token
 * Returns all data matching the token's scope
 */
export const accessSharedDataController = asyncHandler(async (request: Request, response: Response) => {
  // request.shareToken is populated by validateShareTokenMiddleware
  if (!request.shareToken) {
    throw new AppError(401, 'Invalid or expired token');
  }

  const { patientId, scope } = request.shareToken;

  // Fetch all data matching the scope
  const dataResponse: Record<string, any> = {};

  // Fetch health data if in scope
  if (scope.includes('health_data')) {
    const healthData = await getPatientHealthData(patientId, 100);
    dataResponse.healthData = healthData.map((hd: HealthData) => ({
      heartRate: hd.heartRate,
      bloodPressure: hd.bloodPressure,
      bloodGlucose: hd.bloodGlucose,
      temperature: hd.temperature,
      weight: hd.weight,
      notes: hd.notes,
      recordedAt: hd.recordedAt,
    }));
  }

  // Fetch allergies if in scope
  if (scope.includes('health_data')) {
    const allergies = await getPatientAllergies(patientId);
    dataResponse.allergies = allergies.map((a: Allergy) => ({
      allergyName: a.allergyName,
      severity: a.severity,
      description: a.description,
    }));
  }

  // Fetch chronic conditions if in scope
  if (scope.includes('health_data')) {
    const chronicConditions = await getPatientChronicConditions(patientId);
    dataResponse.chronicConditions = chronicConditions.map((cc: ChronicCondition) => ({
      conditionName: cc.conditionName,
      status: cc.status,
      diagnosisDate: cc.diagnosisDate,
      notes: cc.notes,
    }));
  }

  // Fetch medical records if in scope
  if (scope.includes('prescriptions')) {
    const prescriptions = await getMedicalRecordsByPatientAndType(patientId, 'prescription');
    dataResponse.prescriptions = prescriptions.map((p: any) => ({
      recordId: p.recordId,
      title: p.title,
      fileUrl: p.fileUrl,
      documentDate: p.documentDate,
      aiSummary: p.aiSummary,
      metadata: p.metadata,
    }));
  }

  if (scope.includes('reports')) {
    const reports = await getMedicalRecordsByPatientAndType(patientId, 'report');
    dataResponse.reports = reports.map((r: any) => ({
      recordId: r.recordId,
      title: r.title,
      fileUrl: r.fileUrl,
      documentDate: r.documentDate,
      aiSummary: r.aiSummary,
      metadata: r.metadata,
    }));
  }

  // Fetch vaccinations if in scope
  if (scope.includes('vaccinations')) {
    const vaccinations = await getPatientVaccinations(patientId);
    dataResponse.vaccinations = vaccinations.map((v: any) => ({
      vaccinationId: v.vaccinationId,
      vaccineName: v.vaccineName,
      dateAdministered: v.dateAdministered,
      nextDueDate: v.nextDueDate,
      healthFacility: v.healthFacility,
      certificateUrl: v.certificateUrl,
    }));
  }

  response.status(200).json({
    status: 'success',
    data: dataResponse,
    meta: {
      scope: scope,
      accessedAt: new Date(),
      remainingAccesses: request.shareToken.maxAccesses === -1 ? 'unlimited' : request.shareToken.maxAccesses - request.shareToken.currentAccesses - 1,
    },
  });

  // Log access
  if (request.shareToken.doctorId) {
    const [accessReq] = await db
      .select()
      .from(accessRequests)
      .where(eq(accessRequests.shareTokenId, request.shareToken.tokenId))
      .limit(1);

    try {
      await createAuditLog({
        shareTokenId: request.shareToken.tokenId,
        patientId,
        accessedByUserId: request.shareToken.doctorId,
        action: 'view',
        metadata: {
          requestId: accessReq?.id,
          scope,
        },
      });
    } catch (err) {
      console.error('Failed to log access:', err);
    }
  }
});
