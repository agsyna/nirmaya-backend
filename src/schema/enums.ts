import { pgEnum } from 'drizzle-orm/pg-core';

export const userTypeEnum = pgEnum('user_type', ['admin', 'doctor', 'patient']);

export const genderEnum = pgEnum('gender', [
  'male',
  'female',
  'other',
  'prefer_not_to_say',
]);

export const doctorSpecializationEnum = pgEnum('doctor_specialization', [
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
]);

export const bloodGroupEnum = pgEnum('blood_group', [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
]);

export const allergySeverityEnum = pgEnum('allergy_severity', ['mild', 'moderate', 'severe']);

export const chronicConditionStatusEnum = pgEnum('chronic_condition_status', [
  'active',
  'inactive',
  'resolved',
]);

export const medicalRecordTypeEnum = pgEnum('medical_record_type', [
  'prescription',
  'report',
  'scan',
  'vaccination',
  'other',
]);

export const medicalRecordPrivacyEnum = pgEnum('medical_record_privacy', ['private', 'shared']);

export const reminderTypeEnum = pgEnum('reminder_type', ['medicine', 'checkup', 'vaccination', 'custom']);

export const reminderFrequencyEnum = pgEnum('reminder_frequency', ['once', 'daily', 'weekly', 'monthly']);

export const reminderStatusEnum = pgEnum('reminder_status', ['pending', 'completed', 'missed']);

export const shareTokenScopeEnum = pgEnum('share_token_scope', [
  'prescriptions',
  'reports',
  'vaccinations',
  'all',
]);

export const shareTokenStatusEnum = pgEnum('share_token_status', ['active', 'revoked', 'expired']);

export const auditLogActionEnum = pgEnum('audit_log_action', ['view', 'download', 'print', 'share']);

export const auditLogStatusEnum = pgEnum('audit_log_status', ['success', 'failed']);

export const emergencySosStatusEnum = pgEnum('emergency_sos_status', ['active', 'resolved', 'cancelled']);

export const emergencyServiceTypeEnum = pgEnum('emergency_service_type', [
  'ambulance',
  'police',
  'fire',
  'medical-support',
  'other',
]);

export const emergencyContactRelationshipEnum = pgEnum('emergency_contact_relationship', [
  'spouse',
  'parent',
  'sibling',
  'child',
  'relative',
  'friend',
  'caregiver',
  'other',
]);

export const accessRequestStatusEnum = pgEnum('access_request_status', [
  'pending',
  'approved',
  'rejected',
  'expired',
  'revoked',
]);