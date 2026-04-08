import { pgTable, uuid, text, timestamp, date, jsonb } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { users } from './users';
import { medicalRecordPrivacyEnum, medicalRecordTypeEnum } from './enums';

export const medicalRecords = pgTable('medical_records', {
  recordId: uuid('record_id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.patientId, { onDelete: 'cascade' }),
  type: medicalRecordTypeEnum('type').notNull(),
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  originalContent: text('original_content'), // Raw text from OCR
  aiSummary: text('ai_summary'), // AI-generated summary (stub for now)
  aiSummaryGeneratedAt: timestamp('ai_summary_generated_at', { withTimezone: true }),
  documentDate: date('document_date'), // Date of the medical record itself
  uploadedBy: uuid('uploaded_by').references(() => users.userId, { onDelete: 'set null' }),
  privacy: medicalRecordPrivacyEnum('privacy').default('private'),
  metadata: jsonb('metadata'), // Additional data like prescriber name, lab name
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type NewMedicalRecord = typeof medicalRecords.$inferInsert;
