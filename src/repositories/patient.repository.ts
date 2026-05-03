import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { patients, users, allergies, chronicConditions, vaccinations, healthData } from '../schema';

/**
 * Patient Repository
 * Handles all database queries related to patient data
 */

export const getPatientByUserId = async (userId: string) => {
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.userId, userId))
    .limit(1);
  return patient;
};

export const getPatientProfile = async (patientId: string) => {
  const result = await db
    .select()
    .from(patients)
    .innerJoin(users, eq(patients.userId, users.userId))
    .where(eq(patients.patientId, patientId))
    .limit(1);

  if (!result || result.length === 0) return null;

  const { patients: patientData, users: userData } = result[0];
  return {
    ...patientData,
    age: userData.age,
    gender: userData.gender,
  };
};

export const getUserWithPatient = async (userId: string) => {
  // Use a JOIN to avoid N+1 query
  const result = await db
    .select({
      user: users,
      patient: patients,
    })
    .from(users)
    .leftJoin(patients, eq(patients.userId, users.userId))
    .where(eq(users.userId, userId))
    .limit(1);

  if (!result || result.length === 0 || !result[0].user) return null;

  return {
    user: result[0].user,
    patient: result[0].patient,
  };
};

export const getPatientHealthData = async (patientId: string, limit: number = 10) => {
  const data = await db
    .select()
    .from(healthData)
    .where(eq(healthData.patientId, patientId))
    .orderBy(desc(healthData.recordedAt))
    .limit(limit);
  return data;
};

export const getPatientAllergies = async (patientId: string) => {
  const data = await db
    .select()
    .from(allergies)
    .where(eq(allergies.patientId, patientId))
    .orderBy(allergies.severity);
  return data;
};

export const getPatientChronicConditions = async (patientId: string) => {
  const data = await db
    .select()
    .from(chronicConditions)
    .where(eq(chronicConditions.patientId, patientId));
  return data;
};

export const getPatientVaccinations = async (patientId: string) => {
  const data = await db
    .select()
    .from(vaccinations)
    .where(eq(vaccinations.patientId, patientId))
    .orderBy(vaccinations.dateAdministered);
  return data;
};

export const createHealthRecord = async (record: {
  patientId: string;
  bloodPressure?: string;
  bloodGlucose?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  notes?: string;
  recordedAt?: Date;
}) => {
  const [result] = await db
    .insert(healthData)
    .values({
      patientId: record.patientId,
      bloodPressure: record.bloodPressure,
      bloodGlucose: record.bloodGlucose ? String(record.bloodGlucose) : undefined,
      heartRate: record.heartRate,
      temperature: record.temperature ? String(record.temperature) : undefined,
      weight: record.weight ? String(record.weight) : undefined,
      notes: record.notes,
      recordedAt: record.recordedAt,
    } as any)
    .returning();
  return result;
};
