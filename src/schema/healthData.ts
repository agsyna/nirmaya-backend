import { pgTable, uuid, timestamp, numeric, smallint, varchar, text } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const healthData = pgTable('health_data', {
  healthDataId: uuid('health_data_id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.patientId, { onDelete: 'cascade' }),
  bloodPressure: varchar('blood_pressure', { length: 20 }), // e.g., "120/80"
  bloodGlucose: numeric('blood_glucose', { precision: 6, scale: 2 }),
  heartRate: smallint('heart_rate'),
  temperature: numeric('temperature', { precision: 5, scale: 2 }),
  weight: numeric('weight', { precision: 6, scale: 2 }),
  notes: text('notes'),
  recordedAt: timestamp('recorded_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type HealthData = typeof healthData.$inferSelect;
export type NewHealthData = typeof healthData.$inferInsert;
