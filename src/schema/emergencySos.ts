import { pgTable, uuid, timestamp, boolean, numeric, integer, jsonb } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { emergencySosStatusEnum } from './enums';

export const emergencySos = pgTable('emergency_sos', {
  sosId: uuid('sos_id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.patientId, { onDelete: 'cascade' }),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
  criticalInfoShared: jsonb('critical_info_shared'), // Blood group, allergies, conditions
  ambulanceCalled: boolean('ambulance_called').default(false),
  ambulanceEta: integer('ambulance_eta'), // in minutes
  contactsNotified: jsonb('contacts_notified'), // Array of contact IDs notified
  voiceMessageSent: boolean('voice_message_sent').default(false),
  status: emergencySosStatusEnum('status').default('active'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type EmergencySos = typeof emergencySos.$inferSelect;
export type NewEmergencySos = typeof emergencySos.$inferInsert;
