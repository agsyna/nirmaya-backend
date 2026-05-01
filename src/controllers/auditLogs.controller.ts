import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import {
  getAuditLogsByPatient,
  getAuditLogById,
} from '../repositories/auditLogs.repository';
import { getPatientByUserId } from '../repositories/patient.repository';

/**
 * GET /audit-logs
 * GET /audit-logs?id={auditId}
 * 
 * Returns list of all audit logs, or a specific audit log entry if id is provided
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

  // Check if specific audit log ID is requested
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
        accessedRecordId: auditLog.accessedRecordId,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        errorMessage: auditLog.errorMessage,
        metadata: auditLog.metadata,
      },
    });
    return;
  }

  // Get all audit logs with pagination
  const auditLogs = await getAuditLogsByPatient(patient.patientId, 1000);
  const paginatedLogs = auditLogs.slice(offset, offset + limit);

  response.status(200).json({
    status: 'success',
    data: paginatedLogs.map((log: any) => ({
      auditId: log.auditId,
      action: log.action, // view, download, print, share
      status: log.status, // success, failed
      timestamp: log.timestamp,
      accessedByUserId: log.accessedByUserId,
      accessedRecordId: log.accessedRecordId,
      ipAddress: log.ipAddress,
      errorMessage: log.errorMessage,
      metadata: log.metadata,
    })),
    meta: {
      count: paginatedLogs.length,
      total: auditLogs.length,
      limit,
      offset,
      hasMore: offset + paginatedLogs.length < auditLogs.length,
    },
  });
});
