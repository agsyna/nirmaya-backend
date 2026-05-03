import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { getPatientByUserId } from '../repositories/patient.repository';
import {
  getNomineesByPatientId,
  getNomineeById,
  createNominee,
  updateNominee,
} from '../repositories/nominees.repository';

/**
 * GET /patient/nominees
 * Returns all nominees for the authenticated patient
 */
export const getNomineesController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const allNominees = await getNomineesByPatientId(patient.patientId);

  response.status(200).json({
    status: 'success',
    data: allNominees.map((n) => ({
      nomineeId: n.nomineeId,
      name: n.name,
      email: n.email,
      phone: n.phone ?? null,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    })),
    meta: {
      count: allNominees.length,
    },
  });
});

/**
 * POST /patient/nominees
 * Add a new nominee for the authenticated patient
 */
export const createNomineeController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const { name, email, phone } = request.body as { name: string; email: string; phone?: string };

  const nominee = await createNominee({
    patientId: patient.patientId,
    name,
    email,
    phone,
  });

  response.status(201).json({
    status: 'success',
    data: {
      nomineeId: nominee.nomineeId,
      name: nominee.name,
      email: nominee.email,
      phone: nominee.phone ?? null,
      createdAt: nominee.createdAt,
      updatedAt: nominee.updatedAt,
    },
  });
});

/**
 * PUT /patient/nominees/:id
 * Update an existing nominee's details (name and/or email)
 */
export const updateNomineeController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const id = request.params.id as string;

  // Verify the nominee exists and belongs to this patient
  const existing = await getNomineeById(id);

  if (!existing) {
    throw new AppError(404, 'Nominee not found');
  }

  if (existing.patientId !== patient.patientId) {
    throw new AppError(403, 'You do not have permission to update this nominee');
  }

  const { name, email, phone } = request.body as { name?: string; email?: string; phone?: string };

  const updated = await updateNominee(id, { name, email, phone });

  response.status(200).json({
    status: 'success',
    data: {
      nomineeId: updated!.nomineeId,
      name: updated!.name,
      email: updated!.email,
      phone: updated!.phone ?? null,
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
    },
  });
});
