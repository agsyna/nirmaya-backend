import { pgTable, uuid, text, timestamp, date } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { chronicConditionStatusEnum } from './enums';

export const chronicConditions = pgTable('chronic_conditions', {
  conditionId: uuid('condition_id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.patientId, { onDelete: 'cascade' }),
  conditionName: text('condition_name').notNull(),
  diagnosisDate: date('diagnosis_date'),
  status: chronicConditionStatusEnum('status').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type ChronicCondition = typeof chronicConditions.$inferSelect;
export type NewChronicCondition = typeof chronicConditions.$inferInsert;
