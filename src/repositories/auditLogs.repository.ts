import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { auditLogs } from '../schema';
import { AppError } from '../utils/appError';

/**
 * Audit Logs Repository
 * Handles all database queries related to audit logs tracking data access
 */

export const getAuditLogsByPatient = async (patientId: string, limit: number = 50) => {
  const logs = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.patientId, patientId))
    .orderBy(desc(auditLogs.timestamp))
    .limit(limit);
  return logs;
};

export const getAuditLogById = async (auditId: string, patientId: string) => {
  const [log] = await db
    .select()
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.auditId, auditId),
        eq(auditLogs.patientId, patientId)
      )
    )
    .limit(1);

  if (!log) {
    throw new AppError(404, 'Audit log not found');
  }

  return log;
};

export const createAuditLog = async (log: {
  shareTokenId: string;
  patientId: string;
  accessedByUserId: string;
  accessedRecordId?: string;
  ipAddress?: string;
  userAgent?: string;
  action: 'view' | 'download' | 'print' | 'share';
  status?: 'success' | 'failed';
  errorMessage?: string;
  metadata?: Record<string, any>;
}) => {
  const [result] = await db
    .insert(auditLogs)
    .values(log)
    .returning();
  return result;
};

export const updateAuditLog = async (
  auditId: string,
  patientId: string,
  updates: {
    status?: 'success' | 'failed';
    errorMessage?: string;
    metadata?: Record<string, any>;
  }
) => {
  const [result] = await db
    .update(auditLogs)
    .set(updates)
    .where(
      and(
        eq(auditLogs.auditId, auditId),
        eq(auditLogs.patientId, patientId)
      )
    )
    .returning();

  if (!result) {
    throw new AppError(404, 'Audit log not found');
  }

  return result;
};
