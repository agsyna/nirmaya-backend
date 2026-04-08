import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { getPatientByUserId, getUserWithPatient, getPatientHealthData, getPatientAllergies, getPatientChronicConditions } from '../repositories/patient.repository';
import { createHealthRecord } from '../repositories/patient.repository';
import { z } from 'zod';

/**
 * GET /user/me
 * Returns current authenticated user's profile with patient data
 */
export const getCurrentUserController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const userPatientData = await getUserWithPatient(userId);

  if (!userPatientData) {
    throw new AppError(404, 'User not found');
  }

  const { user, patient } = userPatientData;

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  // Sanitize sensitive data
  const { password, passwordResetTokenHash, passwordResetTokenExpiresAt, ...userSafe } = user;

  response.status(200).json({
    status: 'success',
    data: {
      user: {
        ...userSafe,
        age: user.age,
        name: user.name,
        gender: user.gender,
      },
      patient: {
        patientId: patient.patientId,
        bloodGroup: patient.bloodGroup,
        height: patient.height,
        weight: patient.weight,
        emergencySosEnabled: patient.emergencySosEnabled,
      },
      // In production, generate/fetch QR code - could be stored in DB or generated on-the-fly
      qrCode: {
        code: `https://health-app.com/qr/${patient.patientId}`, // Placeholder
        generatedAt: new Date(),
      },
    },
  });
});

/**
 * GET /user/health
 * Returns comprehensive health data for the current user
 */
export const getUserHealthController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  // Fetch all health-related data in parallel
  const [healthData, allergies, chronicConditions] = await Promise.all([
    getPatientHealthData(patient.patientId, 50),
    getPatientAllergies(patient.patientId),
    getPatientChronicConditions(patient.patientId),
  ]);

  response.status(200).json({
    status: 'success',
    data: {
      patient: {
        patientId: patient.patientId,
        bloodGroup: patient.bloodGroup,
        height: patient.height,
        weight: patient.weight,
      },
      healthData: healthData.map((hd) => ({
        healthDataId: hd.healthDataId,
        heartRate: hd.heartRate,
        bloodPressure: hd.bloodPressure,
        bloodGlucose: hd.bloodGlucose,
        temperature: hd.temperature,
        weight: hd.weight,
        recordedAt: hd.recordedAt,
        notes: hd.notes,
      })),
      allergies: allergies.map((a) => ({
        allergyId: a.allergyId,
        allergyName: a.allergyName,
        severity: a.severity, // mild, moderate, severe
        description: a.description,
      })),
      chronicConditions: chronicConditions.map((cc) => ({
        conditionId: cc.conditionId,
        conditionName: cc.conditionName,
        status: cc.status, // active, inactive, resolved
        diagnosisDate: cc.diagnosisDate,
        notes: cc.notes,
      })),
    },
  });
});

/**
 * POST /user/health
 * Create a new health record for the current user
 */
export const createUserHealthRecordController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const healthRecordSchema = z.object({
    bloodPressure: z.string().regex(/^\d+\/\d+$/).optional(),
    bloodGlucose: z.number().positive().optional(),
    heartRate: z.number().int().positive().optional(),
    temperature: z.number().positive().optional(),
    weight: z.number().positive().optional(),
    notes: z.string().max(500).optional(),
    recordedAt: z.string().datetime().optional(),
  });

  const validated = healthRecordSchema.parse(request.body);

  const healthData = await createHealthRecord({
    patientId: patient.patientId,
    ...validated,
    recordedAt: validated.recordedAt ? new Date(validated.recordedAt) : new Date(),
  });

  response.status(201).json({
    status: 'success',
    data: {
      healthDataId: healthData.healthDataId,
      heartRate: healthData.heartRate,
      bloodPressure: healthData.bloodPressure,
      bloodGlucose: healthData.bloodGlucose,
      temperature: healthData.temperature,
      weight: healthData.weight,
      notes: healthData.notes,
      recordedAt: healthData.recordedAt,
    },
  });
});
