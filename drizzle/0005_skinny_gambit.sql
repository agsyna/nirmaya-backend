CREATE TYPE "public"."emergency_service_type" AS ENUM('ambulance', 'police', 'fire', 'medical-support', 'other');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'system',
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "emergency_sos" ADD COLUMN "affected_patient_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_sos" ADD COLUMN "service_type" "emergency_service_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_sos" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_sos" ADD CONSTRAINT "emergency_sos_affected_patient_id_patients_patient_id_fk" FOREIGN KEY ("affected_patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE cascade ON UPDATE no action;