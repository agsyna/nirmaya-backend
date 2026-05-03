CREATE TYPE "public"."access_request_status" AS ENUM('pending', 'approved', 'rejected', 'expired', 'revoked');--> statement-breakpoint
CREATE TABLE "access_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"status" "access_request_status" DEFAULT 'pending' NOT NULL,
	"approved_scope" jsonb,
	"share_token_id" uuid,
	"expires_at" timestamp with time zone,
	"request_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_doctor_id_doctors_doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_share_token_id_share_tokens_token_id_fk" FOREIGN KEY ("share_token_id") REFERENCES "public"."share_tokens"("token_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER PUBLICATION supabase_realtime ADD TABLE access_requests;