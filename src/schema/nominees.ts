import { pgTable, uuid, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const nominees = pgTable('nominees', {
  nomineeId: uuid('nominee_id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.patientId, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type Nominee = typeof nominees.$inferSelect;
export type NewNominee = typeof nominees.$inferInsert;
