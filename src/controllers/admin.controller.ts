import type { Request, Response } from 'express';
import { and, eq, sql, count } from 'drizzle-orm';
import { asyncHandler } from '../utils/asyncHandler';
import { registerDoctor } from '../services/auth.service';
import { db } from '../db';
import { patients, users } from '../schema';
import { AppError } from '../utils/appError';
import { z } from 'zod';

export const registerDoctorController = asyncHandler(async (request: Request, response: Response) => {
  const result = await registerDoctor(request.body);
  response.status(201).json(result);
});

export const listPatientsAdminController = asyncHandler(async (request: Request, response: Response) => {
  const limit = Math.min(Number(request.query.limit) || 10, 100);
  const offset = Number(request.query.offset) || 0;

  const rows = await db
    .select({
      userId: users.userId,
      patientId: patients.patientId,
      name: users.name,
      email: users.email,
      phone: users.phone,
      age: users.age,
      gender: users.gender,
      bloodGroup: patients.bloodGroup,
      emergencySosEnabled: patients.emergencySosEnabled,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(patients, eq(patients.userId, users.userId))
    .where(eq(users.type, 'patient'))
    .orderBy(sql`${users.createdAt} DESC`)
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(users)
    .innerJoin(patients, eq(patients.userId, users.userId))
    .where(eq(users.type, 'patient'));

  response.status(200).json({
    status: 'success',
    data: rows,
    meta: {
      count: rows.length,
      total: total,
      limit,
      offset,
      hasMore: offset + rows.length < total,
    },
  });
});

export const getPatientAdminController = asyncHandler(async (request: Request, response: Response) => {
  const patientId = Array.isArray(request.params.patientId) ? request.params.patientId[0] : request.params.patientId;
  const row = await db
    .select({
      userId: users.userId,
      patientId: patients.patientId,
      name: users.name,
      email: users.email,
      phone: users.phone,
      age: users.age,
      gender: users.gender,
      bloodGroup: patients.bloodGroup,
      height: patients.height,
      weight: patients.weight,
      emergencySosEnabled: patients.emergencySosEnabled,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .innerJoin(patients, eq(patients.userId, users.userId))
    .where(and(eq(patients.patientId, patientId), eq(users.type, 'patient')))
    .limit(1);

  if (row.length === 0) throw new AppError(404, 'Patient not found');

  response.status(200).json({ status: 'success', data: row[0] });
});

const updatePatientAdminSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().max(20).optional(),
  age: z.number().int().positive().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  emergencySosEnabled: z.boolean().optional(),
});

export const updatePatientAdminController = asyncHandler(async (request: Request, response: Response) => {
  const patientId = Array.isArray(request.params.patientId) ? request.params.patientId[0] : request.params.patientId;
  const input = updatePatientAdminSchema.parse(request.body);

  const existing = await db
    .select({ userId: users.userId, patientId: patients.patientId })
    .from(users)
    .innerJoin(patients, eq(patients.userId, users.userId))
    .where(and(eq(patients.patientId, patientId), eq(users.type, 'patient')))
    .limit(1);
  if (existing.length === 0) throw new AppError(404, 'Patient not found');

  const { name, phone, age, gender, bloodGroup, emergencySosEnabled } = input;
  if (name !== undefined || phone !== undefined || age !== undefined || gender !== undefined) {
    await db
      .update(users)
      .set({ name, phone, age, gender, updatedAt: new Date() })
      .where(eq(users.userId, existing[0].userId));
  }

  if (bloodGroup !== undefined || emergencySosEnabled !== undefined) {
    await db
      .update(patients)
      .set({ bloodGroup, emergencySosEnabled, updatedAt: new Date() })
      .where(eq(patients.patientId, patientId));
  }

  response.status(200).json({ status: 'success', message: 'Patient updated successfully' });
});

export const deletePatientAdminController = asyncHandler(async (request: Request, response: Response) => {
  const patientId = Array.isArray(request.params.patientId) ? request.params.patientId[0] : request.params.patientId;
  const existing = await db
    .select({ userId: users.userId })
    .from(users)
    .innerJoin(patients, eq(patients.userId, users.userId))
    .where(and(eq(patients.patientId, patientId), eq(users.type, 'patient')))
    .limit(1);

  if (existing.length === 0) throw new AppError(404, 'Patient not found');

  await db.delete(users).where(eq(users.userId, existing[0].userId));

  response.status(200).json({ status: 'success', message: 'Patient deleted successfully' });
});