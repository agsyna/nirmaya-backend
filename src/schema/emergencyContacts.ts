import { pgTable, uuid, text, timestamp, varchar, smallint } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { emergencyContactRelationshipEnum } from './enums';

export const emergencyContacts = pgTable('emergency_contacts', {
  emergencyContactId: uuid('emergency_contact_id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.patientId, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  relationship: emergencyContactRelationshipEnum('relationship'),
  priority: smallint('priority').default(1), // 1 = highest
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type NewEmergencyContact = typeof emergencyContacts.$inferInsert;
