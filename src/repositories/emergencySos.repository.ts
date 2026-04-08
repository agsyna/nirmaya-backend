import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { emergencySos } from '../schema';
import { AppError } from '../utils/appError';

/**
 * Emergency SOS Repository
 * Handles all database queries related to emergency SOS requests
 */

export const getEmergencySosByPatient = async (patientId: string, limit: number = 20) => {
  const records = await db
    .select()
    .from(emergencySos)
    .where(eq(emergencySos.patientId, patientId))
    .orderBy(desc(emergencySos.createdAt))
    .limit(limit);
  return records;
};

export const getEmergencySosById = async (sosId: string, patientId: string) => {
  const [record] = await db
    .select()
    .from(emergencySos)
    .where(eq(emergencySos.sosId, sosId))
    .limit(1);

  if (!record || record.patientId !== patientId) {
    throw new AppError(404, 'Emergency SOS record not found');
  }

  return record;
};

export const createEmergencySos = async (sos: {
  patientId: string;
  latitude?: string;
  longitude?: string;
  criticalInfoShared?: Record<string, any>;
  ambulanceCalled?: boolean;
  ambulanceEta?: number;
  contactsNotified?: any[];
  voiceMessageSent?: boolean;
}) => {
  const [result] = await db
    .insert(emergencySos)
    .values(sos)
    .returning();
  return result;
};

export const updateEmergencySos = async (
  sosId: string,
  _patientId: string,
  updates: {
    ambulanceCalled?: boolean;
    ambulanceEta?: number;
    contactsNotified?: any[];
    voiceMessageSent?: boolean;
    status?: 'active' | 'resolved' | 'cancelled';
    resolvedAt?: Date;
  }
) => {
  const [result] = await db
    .update(emergencySos)
    .set(updates)
    .where(eq(emergencySos.sosId, sosId))
    .returning();

  if (!result) {
    throw new AppError(404, 'Emergency SOS record not found');
  }

  return result;
};
