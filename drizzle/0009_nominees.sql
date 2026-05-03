-- Migration: create nominees table
-- Each nominee belongs to a patient and has a name and email

CREATE TABLE IF NOT EXISTS "nominees" (
  "nominee_id"  uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "patient_id"  uuid NOT NULL,
  "name"        text NOT NULL,
  "email"       text NOT NULL,
  "created_at"  timestamp with time zone DEFAULT now(),
  "updated_at"  timestamp with time zone DEFAULT now(),
  CONSTRAINT "nominees_patient_id_patients_patient_id_fk"
    FOREIGN KEY ("patient_id")
    REFERENCES "patients"("patient_id")
    ON DELETE CASCADE
);
