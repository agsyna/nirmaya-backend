import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import {
  getAuditLogsByPatient,
  getAuditLogsByPatientTotal,
  getAuditLogById,
} from '../repositories/auditLogs.repository';
import { getPatientByUserId } from '../repositories/patient.repository';

/**
 * GET /audit-logs
 * GET /audit-logs?id={auditId}
 *
 * Returns list of all audit logs with the accessor's name, or a specific entry if id is provided.
 */
export const getAuditLogsController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const limit = Math.min(Number(request.query.limit) || 10, 100);
  const offset = Number(request.query.offset) || 0;
  const auditId = (() => {
    const id = request.query.id;
    if (typeof id === 'string') return id;
    if (Array.isArray(id)) return id[0];
    return undefined;
  })() as string | undefined;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  // Return single entry if specific ID requested
  if (auditId) {
    const auditLog = await getAuditLogById(auditId, patient.patientId);

    response.status(200).json({
      status: 'success',
      data: {
        auditId: auditLog.auditId,
        action: auditLog.action,
        status: auditLog.status,
        timestamp: auditLog.timestamp,
        accessedByUserId: auditLog.accessedByUserId,
        accessedByUserName: auditLog.accessedByUserName,
        accessedRecordId: auditLog.accessedRecordId,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        errorMessage: auditLog.errorMessage,
        metadata: auditLog.metadata,
      },
    });
    return;
  }

  // Paginated list — DB-level limit+offset (not in-memory slice)
  const [logs, total] = await Promise.all([
    getAuditLogsByPatient(patient.patientId, limit, offset),
    getAuditLogsByPatientTotal(patient.patientId),
  ]);

  response.status(200).json({
    status: 'success',
    data: logs.map((log: any) => ({
      auditId: log.auditId,
      action: log.action,
      status: log.status,
      timestamp: log.timestamp,
      accessedByUserId: log.accessedByUserId,
      accessedByUserName: log.accessedByUserName, // doctor's real name
      accessedRecordId: log.accessedRecordId,
      ipAddress: log.ipAddress,
      errorMessage: log.errorMessage,
      metadata: log.metadata,
    })),
    meta: {
      count: logs.length,
      total,
      limit,
      offset,
      hasMore: offset + logs.length < total,
    },
  });
});
