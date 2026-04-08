import { pgTable, uuid, text, timestamp, date } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const vaccinations = pgTable('vaccinations', {
  vaccinationId: uuid('vaccination_id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.patientId, { onDelete: 'cascade' }),
  vaccineName: text('vaccine_name').notNull(),
  dateAdministered: date('date_administered').notNull(),
  nextDueDate: date('next_due_date'),
  healthFacility: text('health_facility'),
  certificateUrl: text('certificate_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type Vaccination = typeof vaccinations.$inferSelect;
export type NewVaccination = typeof vaccinations.$inferInsert;
