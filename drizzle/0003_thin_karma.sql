CREATE TYPE "public"."allergy_severity" AS ENUM('mild', 'moderate', 'severe');--> statement-breakpoint
CREATE TYPE "public"."audit_log_action" AS ENUM('view', 'download', 'print', 'share');--> statement-breakpoint
CREATE TYPE "public"."audit_log_status" AS ENUM('success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."blood_group" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');--> statement-breakpoint
CREATE TYPE "public"."chronic_condition_status" AS ENUM('active', 'inactive', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."doctor_specialization" AS ENUM('cardiology', 'dermatology', 'endocrinology', 'ent', 'family_medicine', 'gastroenterology', 'general_medicine', 'gynecology', 'neurology', 'oncology', 'ophthalmology', 'orthopedics', 'pediatrics', 'psychiatry', 'radiology', 'urology', 'other');--> statement-breakpoint
CREATE TYPE "public"."emergency_contact_relationship" AS ENUM('spouse', 'parent', 'sibling', 'child', 'relative', 'friend', 'caregiver', 'other');--> statement-breakpoint
CREATE TYPE "public"."emergency_sos_status" AS ENUM('active', 'resolved', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."medical_record_privacy" AS ENUM('private', 'shared');--> statement-breakpoint
CREATE TYPE "public"."medical_record_type" AS ENUM('prescription', 'report', 'scan', 'vaccination', 'other');--> statement-breakpoint
CREATE TYPE "public"."reminder_frequency" AS ENUM('once', 'daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('pending', 'completed', 'missed');--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('medicine', 'checkup', 'vaccination', 'custom');--> statement-breakpoint
CREATE TYPE "public"."share_token_scope" AS ENUM('prescriptions', 'reports', 'vaccinations', 'all');--> statement-breakpoint
CREATE TYPE "public"."share_token_status" AS ENUM('active', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('admin', 'doctor', 'patient');--> statement-breakpoint
CREATE TABLE "admins" (
	"admin_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"super_admin" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "admins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "share_tokens" RENAME COLUMN "share_token_id" TO "token_id";--> statement-breakpoint
ALTER TABLE "share_tokens" RENAME COLUMN "token" TO "token_hash";--> statement-breakpoint
ALTER TABLE "share_tokens" RENAME COLUMN "access_scope" TO "scope";--> statement-breakpoint
ALTER TABLE "share_tokens" RENAME COLUMN "max_access_count" TO "max_accesses";--> statement-breakpoint
ALTER TABLE "share_tokens" RENAME COLUMN "access_count" TO "current_accesses";--> statement-breakpoint
ALTER TABLE "share_tokens" DROP CONSTRAINT "share_tokens_token_unique";--> statement-breakpoint
ALTER TABLE "share_tokens" DROP CONSTRAINT "share_tokens_doctor_id_doctors_doctor_id_fk";
--> statement-breakpoint
ALTER TABLE "share_tokens" DROP CONSTRAINT "share_tokens_created_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_share_token_id_share_tokens_share_token_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "type" SET DATA TYPE "public"."user_type" USING "type"::"public"."user_type";--> statement-breakpoint
ALTER TABLE "doctors" ALTER COLUMN "specialization" SET DATA TYPE "public"."doctor_specialization" USING "specialization"::"public"."doctor_specialization";--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "blood_group" SET DATA TYPE "public"."blood_group" USING "blood_group"::"public"."blood_group";--> statement-breakpoint
ALTER TABLE "allergies" ALTER COLUMN "severity" SET DATA TYPE "public"."allergy_severity" USING "severity"::"public"."allergy_severity";--> statement-breakpoint
ALTER TABLE "chronic_conditions" ALTER COLUMN "status" SET DATA TYPE "public"."chronic_condition_status" USING "status"::"public"."chronic_condition_status";--> statement-breakpoint
ALTER TABLE "medical_records" ALTER COLUMN "type" SET DATA TYPE "public"."medical_record_type" USING "type"::"public"."medical_record_type";--> statement-breakpoint
ALTER TABLE "medical_records" ALTER COLUMN "privacy" SET DEFAULT 'private'::"public"."medical_record_privacy";--> statement-breakpoint
ALTER TABLE "medical_records" ALTER COLUMN "privacy" SET DATA TYPE "public"."medical_record_privacy" USING "privacy"::"public"."medical_record_privacy";--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "type" SET DATA TYPE "public"."reminder_type" USING "type"::"public"."reminder_type";--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "frequency" SET DATA TYPE "public"."reminder_frequency" USING "frequency"::"public"."reminder_frequency";--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."reminder_status";--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "status" SET DATA TYPE "public"."reminder_status" USING "status"::"public"."reminder_status";--> statement-breakpoint
ALTER TABLE "share_tokens" ALTER COLUMN "doctor_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "share_tokens" ALTER COLUMN "expires_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "share_tokens" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."share_token_status";--> statement-breakpoint
ALTER TABLE "share_tokens" ALTER COLUMN "status" SET DATA TYPE "public"."share_token_status" USING "status"::"public"."share_token_status";--> statement-breakpoint
ALTER TABLE "share_tokens" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "action" SET DATA TYPE "public"."audit_log_action" USING "action"::"public"."audit_log_action";--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "status" SET DEFAULT 'success'::"public"."audit_log_status";--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "status" SET DATA TYPE "public"."audit_log_status" USING "status"::"public"."audit_log_status";--> statement-breakpoint
ALTER TABLE "emergency_contacts" ALTER COLUMN "relationship" SET DATA TYPE "public"."emergency_contact_relationship" USING "relationship"::"public"."emergency_contact_relationship";--> statement-breakpoint
ALTER TABLE "emergency_sos" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."emergency_sos_status";--> statement-breakpoint
ALTER TABLE "emergency_sos" ALTER COLUMN "status" SET DATA TYPE "public"."emergency_sos_status" USING "status"::"public"."emergency_sos_status";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gender" "gender";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "share_tokens" ADD COLUMN "access_level" text DEFAULT 'doctor' NOT NULL;--> statement-breakpoint
ALTER TABLE "share_tokens" ADD COLUMN "revoked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "share_tokens" ADD COLUMN "revoked_by" uuid;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_tokens" ADD CONSTRAINT "share_tokens_doctor_id_users_user_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_tokens" ADD CONSTRAINT "share_tokens_revoked_by_users_user_id_fk" FOREIGN KEY ("revoked_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_share_token_id_share_tokens_token_id_fk" FOREIGN KEY ("share_token_id") REFERENCES "public"."share_tokens"("token_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaccinations" DROP COLUMN "dose_number";--> statement-breakpoint
ALTER TABLE "vaccinations" DROP COLUMN "batch_number";--> statement-breakpoint
ALTER TABLE "share_tokens" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "share_tokens" ADD CONSTRAINT "share_tokens_token_hash_unique" UNIQUE("token_hash");