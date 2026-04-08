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