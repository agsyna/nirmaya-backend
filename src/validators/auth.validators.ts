import { z } from 'zod';

const genderValues = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
const bloodGroupValues = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const doctorSpecializationValues = [
  'cardiology',
  'dermatology',
  'endocrinology',
  'ent',
  'family_medicine',
  'gastroenterology',
  'general_medicine',
  'gynecology',
  'neurology',
  'oncology',
  'ophthalmology',
  'orthopedics',
  'pediatrics',
  'psychiatry',
  'radiology',
  'urology',
  'other',
] as const;
const emergencyRelationshipValues = [
  'spouse',
  'parent',
  'sibling',
  'child',
  'relative',
  'friend',
  'caregiver',
  'other',
] as const;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export const registerPatientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().max(20).optional(),
  age: z.number().int().positive().optional(),
  gender: z.enum(genderValues).optional(),
  bloodGroup: z.enum(bloodGroupValues).optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  heartRate: z.number().int().positive().optional(),
  bloodPressure: z.string().regex(/^\d+\/\d+$/).optional(),
  bloodGlucose: z.number().positive().optional(),
  allergies: z.array(z.object({
    name: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe'])
  })).optional(),
  chronicConditions: z.array(z.object({
    name: z.string(),
    diagnosisDate: z.string().date().optional(), // YYYY-MM-DD
    status: z.enum(['active', 'inactive', 'resolved']).optional(),
    notes: z.string().optional(),
  })).optional(),
  emergencyContacts: z.array(z.object({
    name: z.string(),
    phone: z.string().max(20),
    relationship: z.enum(emergencyRelationshipValues).optional(),
    priority: z.number().int().min(1).max(10).optional(),
  })).optional()
});

export const registerDoctorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().max(20).optional(),
  age: z.number().int().positive().optional(),
  gender: z.enum(genderValues).optional(),
  specialization: z.enum(doctorSpecializationValues),
  licenseNumber: z.string().min(1),
  bio: z.string().optional(),
  verified: z.boolean().optional(),
});