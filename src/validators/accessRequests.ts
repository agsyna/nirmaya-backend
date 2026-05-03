import { z } from 'zod';

export const createAccessRequestSchema = z.object({
  patientId: z.string().uuid(),
});

export const approveAccessRequestSchema = z.object({
  scope: z.array(z.enum(['reports', 'prescriptions', 'health_data'])).min(1),
  expiresInMinutes: z.number().int().positive().optional(),
});

export const updateAccessRequestSchema = z.object({
  scope: z.array(z.enum(['reports', 'prescriptions', 'health_data'])).min(1),
  expiresInMinutes: z.number().int().positive().optional(),
});
