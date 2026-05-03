import { pgTable, uuid, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { doctors } from './doctors';
import { accessRequestStatusEnum } from './enums';
import { shareTokens } from './shareTokens';

export const accessRequests = pgTable('access_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.patientId, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.doctorId, { onDelete: 'cascade' }),
  status: accessRequestStatusEnum('status').notNull().default('pending'),
  approvedScope: jsonb('approved_scope').$type<string[]>(),
  shareTokenId: uuid('share_token_id')
    .references(() => shareTokens.tokenId, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  requestExpiresAt: timestamp('request_expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type AccessRequest = typeof accessRequests.$inferSelect;
export type NewAccessRequest = typeof accessRequests.$inferInsert;
