import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { reminderFrequencyEnum, reminderStatusEnum, reminderTypeEnum } from './enums';

export const reminders = pgTable('reminders', {
  reminderId: uuid('reminder_id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.patientId, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  type: reminderTypeEnum('type').notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  frequency: reminderFrequencyEnum('frequency'),
  status: reminderStatusEnum('status').default('pending'),
  nextReminderDate: timestamp('next_reminder_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;
