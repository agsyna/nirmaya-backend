import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { medicalRecords } from '../schema';
import { AppError } from '../utils/appError';

/**
 * Medical Records Repository
 * Handles all database queries related to medical records (reports, prescriptions, etc)
 */

export const getMedicalRecordsByPatientAndType = async (patientId: string, type: 'report' | 'prescription', limit: number = 1000) => {
  const records = await db
    .select()
    .from(medicalRecords)
    .where(
      and(
        eq(medicalRecords.patientId, patientId),
        eq(medicalRecords.type, type)
      )
    )
    .orderBy(desc(medicalRecords.createdAt))
    .limit(limit);
  return records;
};

export const getMedicalRecordById = async (recordId: string, patientId: string) => {
  const [record] = await db
    .select()
    .from(medicalRecords)
    .where(
      and(
        eq(medicalRecords.recordId, recordId),
        eq(medicalRecords.patientId, patientId)
      )
    )
    .limit(1);

  if (!record) {
    throw new AppError(404, 'Medical record not found');
  }

  return record;
};

export const createMedicalRecord = async (record: {
  patientId: string;
  type: 'prescription' | 'report' | 'scan' | 'vaccination' | 'other';
  title: string;
  fileUrl: string;
  originalContent?: string;
  aiSummary?: string;
  documentDate?: string | Date;
  uploadedBy?: string;
  privacy?: 'private' | 'shared';
  metadata?: Record<string, any>;
}) => {
  const [result] = await db
    .insert(medicalRecords)
    .values({
      ...record,
      documentDate: record.documentDate ? (record.documentDate instanceof Date ? record.documentDate.toISOString().split('T')[0] : record.documentDate) : undefined,
    })
    .returning();
  return result;
};

export const updateMedicalRecord = async (
  recordId: string,
  patientId: string,
  updates: {
    title?: string;
    aiSummary?: string;
    aiSummaryGeneratedAt?: Date;
    privacy?: 'private' | 'shared';
    metadata?: Record<string, any>;
  }
) => {
  const [result] = await db
    .update(medicalRecords)
    .set(updates)
    .where(
      and(
        eq(medicalRecords.recordId, recordId),
        eq(medicalRecords.patientId, patientId)
      )
    )
    .returning();

  if (!result) {
    throw new AppError(404, 'Medical record not found');
  }

  return result;
};

export const deleteMedicalRecord = async (recordId: string, patientId: string) => {
  const result = await db
    .delete(medicalRecords)
    .where(
      and(
        eq(medicalRecords.recordId, recordId),
        eq(medicalRecords.patientId, patientId)
      )
    )
    .returning();

  if (result.length === 0) {
    throw new AppError(404, 'Medical record not found');
  }

  return result[0];
};
