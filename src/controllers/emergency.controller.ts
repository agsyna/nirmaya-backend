import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import {
  getEmergencySosByPatient,
  getEmergencySosById,
  createEmergencySos,
  updateEmergencySos,
} from '../repositories/emergencySos.repository';
import {
  getPatientByUserId,
  getPatientProfile,
  getPatientAllergies,
  getPatientChronicConditions,
  getPatientHealthData,
} from '../repositories/patient.repository';
import { createEmergencySosSchema, updateEmergencySosSchema } from '../validators/patient.validators';

/**
 * POST /emergency
 * Activate emergency SOS - shares critical health information with emergency contacts
 */
export const activateEmergencySosController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const validated = createEmergencySosSchema.parse(request.body);

  // Get the affected patient profile
  const affectedPatient = await getPatientProfile(validated.affectedPatientId);

  if (!affectedPatient) {
    throw new AppError(404, 'Affected patient profile not found');
  }

  // Fetch critical health information for the affected patient
  const [allergies, chronicConditions, healthDataRecords] = await Promise.all([
    getPatientAllergies(affectedPatient.patientId),
    getPatientChronicConditions(affectedPatient.patientId),
    getPatientHealthData(affectedPatient.patientId, 1),
  ]);

  const criticalInfo = {
    bloodGroup: affectedPatient.bloodGroup,
    age: affectedPatient.age,
    gender: affectedPatient.gender,
    height: affectedPatient.height,
    weight: affectedPatient.weight,
    allergies: allergies.map((a: any) => ({
      name: a.allergyName,
      severity: a.severity,
      description: a.description,
    })),
    chronicConditions: chronicConditions.map((cc: any) => ({
      name: cc.conditionName,
      status: cc.status,
      diagnosisDate: cc.diagnosisDate,
      notes: cc.notes,
    })),
    latestHealthData: healthDataRecords[0] || null,
  };

  const sos = await createEmergencySos({
    patientId: patient.patientId,
    affectedPatientId: affectedPatient.patientId,
    latitude: validated.latitude,
    longitude: validated.longitude,
    serviceTypes: validated.serviceTypes,
    description: validated.description,
    criticalInfoShared: criticalInfo,
  });

  response.status(201).json({
    status: 'success',
    data: {
      sosId: sos.sosId,
      patientId: sos.patientId,
      affectedPatientId: sos.affectedPatientId,
      status: sos.status,
      latitude: sos.latitude,
      longitude: sos.longitude,
      serviceTypes: sos.serviceTypes,
      description: sos.description,
      affectedPatientProfile: {
        age: affectedPatient.age,
        gender: affectedPatient.gender,
        bloodGroup: affectedPatient.bloodGroup,
        height: affectedPatient.height,
        weight: affectedPatient.weight,
      },
      criticalInfoShared: criticalInfo,
      createdAt: sos.createdAt,
      message: 'Emergency SOS activated.',
    },
  });
});

/**
 * PUT /emergency/:sosId
 * Update emergency SOS status
 */
export const updateEmergencySosController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const sosId = Array.isArray(request.params.sosId) ? request.params.sosId[0] : request.params.sosId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const validated = updateEmergencySosSchema.partial().parse(request.body);

  const sos = await updateEmergencySos(sosId, patient.patientId, {
    ...validated,
    resolvedAt: validated.status === 'resolved' ? new Date() : undefined,
  });

  response.status(200).json({
    status: 'success',
    data: {
      sosId: sos.sosId,
      status: sos.status,
      resolvedAt: sos.resolvedAt,
      updatedAt: new Date(),
    },
  });
});

/**
 * GET /emergency
 * Get list of all emergency SOS records for the patient
 */
export const getEmergencySosHistoryController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const limit = Math.min(Number(request.query.limit) || 10, 100);
  const offset = Number(request.query.offset) || 0;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const sosList = await getEmergencySosByPatient(patient.patientId);
  const paginatedSos = sosList.slice(offset, offset + limit);

  // Fetch affected patient profiles for all records
  const sosWithProfiles = await Promise.all(
    paginatedSos.map(async (sos: any) => {
      const affectedPatient = await getPatientProfile(sos.affectedPatientId);
      return {
        sosId: sos.sosId,
        status: sos.status,
        serviceTypes: sos.serviceTypes,
        description: sos.description,
        latitude: sos.latitude,
        longitude: sos.longitude,
        affectedPatientProfile: affectedPatient
          ? {
              age: affectedPatient.age,
              gender: affectedPatient.gender,
              bloodGroup: affectedPatient.bloodGroup,
            }
          : null,
        createdAt: sos.createdAt,
        resolvedAt: sos.resolvedAt,
      };
    })
  );

  response.status(200).json({
    status: 'success',
    data: sosWithProfiles,
    meta: {
      count: sosWithProfiles.length,
      total: sosList.length,
      limit,
      offset,
      hasMore: offset + sosWithProfiles.length < sosList.length,
    },
  });
});

/**
 * GET /emergency/:sosId
 * Get specific emergency SOS record details
 */
export const getEmergencySosDetailController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const sosId = Array.isArray(request.params.sosId) ? request.params.sosId[0] : request.params.sosId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const sos = await getEmergencySosById(sosId);

  // Fetch affected patient profile and health data
  const affectedPatient = await getPatientProfile(sos.affectedPatientId);

  if (!affectedPatient) {
    throw new AppError(404, 'Affected patient profile not found');
  }

  const healthDataRecords = await getPatientHealthData(affectedPatient.patientId, 1);

  response.status(200).json({
    status: 'success',
    data: {
      sosId: sos.sosId,
      status: sos.status,
      latitude: sos.latitude,
      longitude: sos.longitude,
      serviceTypes: sos.serviceTypes,
      description: sos.description,
      affectedPatientProfile: {
        age: affectedPatient.age,
        gender: affectedPatient.gender,
        bloodGroup: affectedPatient.bloodGroup,
        height: affectedPatient.height,
        weight: affectedPatient.weight,
      },
      latestHealthData: healthDataRecords[0] || null,
      criticalInfoShared: sos.criticalInfoShared,
      createdAt: sos.createdAt,
      resolvedAt: sos.resolvedAt,
    },
  });
});
