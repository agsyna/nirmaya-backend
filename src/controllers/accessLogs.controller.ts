import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import {
  getAuditLogsByPatient,
  getAuditLogById,
  createAuditLog,
  updateAuditLog,
} from '../repositories/auditLogs.repository';
import { getPatientByUserId } from '../repositories/patient.repository';
import { z } from 'zod';

/**
 * GET /access-logs
 * GET /access-logs?id={accessLogId}
 * 
 * Returns list of all access logs, or a specific access log record if id is provided
 */
export const getAccessLogsController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const accessLogId = (() => {
    const id = request.query.id;
    if (typeof id === 'string') return id;
    if (Array.isArray(id)) return id[0];
    return undefined;
  })() as string | undefined;

  if (accessLogId) {
    // Fetch specific access log
    const log = await getAuditLogById(accessLogId, patient.patientId);

    response.status(200).json({
      status: 'success',
      data: {
        accessLogId: log.auditId,
        action: log.action, // view, download, print, share
        status: log.status,
        timestamp: log.timestamp,
        accessedByUserId: log.accessedByUserId,
        accessedRecordId: log.accessedRecordId,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        errorMessage: log.errorMessage,
        metadata: log.metadata,
      },
    });
    return;
  }

  // Fetch all access logs for the patient
  const logs = await getAuditLogsByPatient(patient.patientId, 100);

  response.status(200).json({
    status: 'success',
    data: logs.map((log) => ({
      accessLogId: log.auditId,
      action: log.action,
      status: log.status,
      timestamp: log.timestamp,
      accessedByUserId: log.accessedByUserId,
      accessedRecordId: log.accessedRecordId,
      ipAddress: log.ipAddress,
    })),
    meta: {
      count: logs.length,
    },
  });
});

/**
 * POST /access-logs
 * Create a new access log record
 * 
 * Note: This is typically created automatically by the system when data is accessed,
 * but can be manually created for tracking purposes
 */
export const createAccessLogController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const createAccessLogSchema = z.object({
    shareTokenId: z.string().uuid(),
    action: z.enum(['view', 'download', 'print', 'share']),
    accessedByUserId: z.string().uuid(),
    accessedRecordId: z.string().uuid().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    status: z.enum(['success', 'failed']).default('success'),
    errorMessage: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  });

  const validated = createAccessLogSchema.parse(request.body);

  const log = await createAuditLog({
    patientId: patient.patientId,
    ...validated,
  });

  response.status(201).json({
    status: 'success',
    data: {
      accessLogId: log.auditId,
      action: log.action,
      status: log.status,
      timestamp: log.timestamp,
      accessedByUserId: log.accessedByUserId,
    },
  });
});

/**
 * PUT /access-logs/:accessLogId
 * Update a specific access log record (e.g., status, metadata)
 */
export const updateAccessLogController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const accessLogId = Array.isArray(request.params.accessLogId) ? request.params.accessLogId[0] : request.params.accessLogId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const updateAccessLogSchema = z.object({
    status: z.enum(['success', 'failed']).optional(),
    errorMessage: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  });

  const validated = updateAccessLogSchema.partial().parse(request.body);

  const log = await updateAuditLog(accessLogId, patient.patientId, validated);

  response.status(200).json({
    status: 'success',
    data: {
      accessLogId: log.auditId,
      action: log.action,
      status: log.status,
      errorMessage: log.errorMessage,
      timestamp: log.timestamp,
    },
  });
});
