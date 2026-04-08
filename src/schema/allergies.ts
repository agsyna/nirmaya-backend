import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { allergySeverityEnum } from './enums';

export const allergies = pgTable('allergies', {
  allergyId: uuid('allergy_id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.patientId, { onDelete: 'cascade' }),
  allergyName: text('allergy_name').notNull(),
  severity: allergySeverityEnum('severity').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type Allergy = typeof allergies.$inferSelect;
export type NewAllergy = typeof allergies.$inferInsert;
