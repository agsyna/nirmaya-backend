import { pgTable, uuid, text, timestamp, smallint, varchar } from 'drizzle-orm/pg-core';
import { genderEnum, userTypeEnum } from './enums';

export const users = pgTable('users', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: varchar('phone', { length: 20 }),
  type: userTypeEnum('type').notNull(),
  age: smallint('age'),
  gender: genderEnum('gender'),
  passwordResetTokenHash: varchar('password_reset_token_hash', { length: 255 }),
  passwordResetTokenExpiresAt: timestamp('password_reset_token_expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
