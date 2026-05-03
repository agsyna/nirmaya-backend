import { z } from 'zod';

export const healthDataSchema = z.object({
  bloodPressure: z.string().regex(/^\d+\/\d+$/, 'Invalid blood pressure format (e.g., 120/80)').optional(),
  bloodGlucose: z.number().positive().optional(),
  heartRate: z.number().int().positive().optional(),
  temperature: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
  recordedAt: z.string().datetime().optional(),
});

// Medical record validators
export const createMedicalRecordSchema = z.object({
  type: z.enum(['prescription', 'report', 'scan', 'vaccination', 'other']),
  title: z.string().min(1).max(255),
  fileUrl: z.string().url(),
  originalContent: z.string().optional(),
  documentDate: z.string().date().optional(),
  privacy: z.enum(['private', 'shared']).default('private'),
  metadata: z.record(z.any()).optional(),
});

export const updateMedicalRecordSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  aiSummary: z.string().optional(),
  privacy: z.enum(['private', 'shared']).optional(),
  metadata: z.record(z.any()).optional(),
});

// Emergency SOS validators
export const createEmergencySosSchema = z.object({
  affectedPatientId: z.string().uuid(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  serviceTypes: z.array(z.enum(['ambulance', 'police', 'fire', 'medical-support', 'other'])).min(1),
  description: z.string().max(500).optional(),
});

export const updateEmergencySosSchema = z.object({
  ambulanceCalled: z.boolean().optional(),
  ambulanceEta: z.number().int().positive().optional(),
  contactsNotified: z.array(z.string().uuid()).optional(),
  voiceMessageSent: z.boolean().optional(),
  status: z.enum(['active', 'resolved', 'cancelled']).optional(),
});

export const createUploadUrlSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.enum(['reports', 'prescriptions', 'scans', 'other']).default('other'),
});

export const finalizeUploadSchema = z.object({
  path: z.string().min(1),
  type: z.enum(['prescription', 'report', 'scan', 'vaccination', 'other']),
  title: z.string().min(1).max(255),
  originalContent: z.string().optional(),
  documentDate: z.string().date().optional(),
  privacy: z.enum(['private', 'shared']).default('private'),
  metadata: z.record(z.any()).optional(),
});

// Audit log query validator
export const auditLogQuerySchema = z.object({
  id: z.string().uuid().optional(),
});
