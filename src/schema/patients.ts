import { pgTable, uuid, timestamp, boolean, numeric } from 'drizzle-orm/pg-core';
import { users } from './users';
import { bloodGroupEnum } from './enums';

export const patients = pgTable('patients', {
  patientId: uuid('patient_id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
  bloodGroup: bloodGroupEnum('blood_group'),
  height: numeric('height', { precision: 5, scale: 2 }), // in cm
  weight: numeric('weight', { precision: 6, scale: 2 }), // in kg
  emergencySosEnabled: boolean('emergency_sos_enabled').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
