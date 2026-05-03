-- Migration: create nominees table with phone field
-- Each nominee belongs to a patient and has a name, email, and optional phone

CREATE TABLE IF NOT EXISTS "nominees" (
  "nominee_id"  uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "patient_id"  uuid NOT NULL,
  "name"        text NOT NULL,
  "email"       text NOT NULL,
  "phone"       varchar(20),
  "created_at"  timestamp with time zone DEFAULT now(),
  "updated_at"  timestamp with time zone DEFAULT now(),
  CONSTRAINT "nominees_patient_id_patients_patient_id_fk"
    FOREIGN KEY ("patient_id")
    REFERENCES "patients"("patient_id")
    ON DELETE CASCADE
);
