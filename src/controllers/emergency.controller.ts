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
  getPatientAllergies,
  getPatientChronicConditions,
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

  if (!patient.emergencySosEnabled) {
    throw new AppError(403, 'Emergency SOS is not enabled for this patient');
  }

  const validated = createEmergencySosSchema.parse(request.body);

  // Fetch critical health information
  const [allergies, chronicConditions] = await Promise.all([
    getPatientAllergies(patient.patientId),
    getPatientChronicConditions(patient.patientId),
  ]);

  const criticalInfo = {
    bloodGroup: patient.bloodGroup,
    allergies: allergies.map((a: any) => ({
      name: a.allergyName,
      severity: a.severity,
    })),
    chronicConditions: chronicConditions.map((cc: any) => ({
      name: cc.conditionName,
      status: cc.status,
    })),
  };

  const sos = await createEmergencySos({
    patientId: patient.patientId,
    latitude: validated.latitude,
    longitude: validated.longitude,
    criticalInfoShared: criticalInfo,
    ambulanceCalled: validated.ambulanceCalled,
    contactsNotified: validated.contactsNotified,
    voiceMessageSent: validated.voiceMessageSent,
  });

  response.status(201).json({
    status: 'success',
    data: {
      sosId: sos.sosId,
      patientId: sos.patientId,
      status: sos.status,
      latitude: sos.latitude,
      longitude: sos.longitude,
      ambulanceCalled: sos.ambulanceCalled,
      voiceMessageSent: sos.voiceMessageSent,
      criticalInfoShared: sos.criticalInfoShared,
      createdAt: sos.createdAt,
      message: 'Emergency SOS activated. Emergency contacts are being notified.',
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
      ambulanceCalled: sos.ambulanceCalled,
      ambulanceEta: sos.ambulanceEta,
      voiceMessageSent: sos.voiceMessageSent,
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

  response.status(200).json({
    status: 'success',
    data: paginatedSos.map((sos: any) => ({
      sosId: sos.sosId,
      status: sos.status,
      latitude: sos.latitude,
      longitude: sos.longitude,
      ambulanceCalled: sos.ambulanceCalled,
      ambulanceEta: sos.ambulanceEta,
      voiceMessageSent: sos.voiceMessageSent,
      createdAt: sos.createdAt,
      resolvedAt: sos.resolvedAt,
    })),
    meta: {
      count: paginatedSos.length,
      total: sosList.length,
      limit,
      offset,
      hasMore: offset + paginatedSos.length < sosList.length,
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

  const sos = await getEmergencySosById(sosId, patient.patientId);

  response.status(200).json({
    status: 'success',
    data: {
      sosId: sos.sosId,
      status: sos.status,
      latitude: sos.latitude,
      longitude: sos.longitude,
      ambulanceCalled: sos.ambulanceCalled,
      ambulanceEta: sos.ambulanceEta,
      contactsNotified: sos.contactsNotified,
      voiceMessageSent: sos.voiceMessageSent,
      criticalInfoShared: sos.criticalInfoShared,
      createdAt: sos.createdAt,
      resolvedAt: sos.resolvedAt,
    },
  });
});
