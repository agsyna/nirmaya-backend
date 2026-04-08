import { pgTable, uuid, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';
import { doctorSpecializationEnum } from './enums';

export const doctors = pgTable('doctors', {
  doctorId: uuid('doctor_id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
  licenseNumber: varchar('license_number', { length: 50 }).notNull().unique(),
  specialization: doctorSpecializationEnum('specialization').notNull(),
  bio: text('bio'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;
