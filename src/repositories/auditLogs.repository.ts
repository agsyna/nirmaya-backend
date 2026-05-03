import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { auditLogs, users } from '../schema';
import { AppError } from '../utils/appError';

/**
 * Audit Logs Repository
 * Handles all database queries related to audit logs tracking data access
 */

export const getAuditLogsByPatient = async (patientId: string, limit: number = 50, offset: number = 0) => {
  const logs = await db
    .select({
      auditId: auditLogs.auditId,
      shareTokenId: auditLogs.shareTokenId,
      patientId: auditLogs.patientId,
      accessedByUserId: auditLogs.accessedByUserId,
      accessedByUserName: users.name,         // joined from users table
      accessedRecordId: auditLogs.accessedRecordId,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      action: auditLogs.action,
      status: auditLogs.status,
      errorMessage: auditLogs.errorMessage,
      metadata: auditLogs.metadata,
      timestamp: auditLogs.timestamp,
    })
    .from(auditLogs)
    .innerJoin(users, eq(auditLogs.accessedByUserId, users.userId))
    .where(eq(auditLogs.patientId, patientId))
    .orderBy(desc(auditLogs.timestamp))
    .limit(limit)
    .offset(offset);
  return logs;
};

export const getAuditLogsByPatientTotal = async (patientId: string): Promise<number> => {
  const result = await db
    .select({ auditId: auditLogs.auditId })
    .from(auditLogs)
    .where(eq(auditLogs.patientId, patientId));
  return result.length;
};

export const getAuditLogById = async (auditId: string, patientId: string) => {
  const [log] = await db
    .select({
      auditId: auditLogs.auditId,
      shareTokenId: auditLogs.shareTokenId,
      patientId: auditLogs.patientId,
      accessedByUserId: auditLogs.accessedByUserId,
      accessedByUserName: users.name,
      accessedRecordId: auditLogs.accessedRecordId,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      action: auditLogs.action,
      status: auditLogs.status,
      errorMessage: auditLogs.errorMessage,
      metadata: auditLogs.metadata,
      timestamp: auditLogs.timestamp,
    })
    .from(auditLogs)
    .innerJoin(users, eq(auditLogs.accessedByUserId, users.userId))
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
