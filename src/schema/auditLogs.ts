import { pgTable, uuid, text, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core';
import { shareTokens } from './shareTokens';
import { patients } from './patients';
import { users } from './users';
import { medicalRecords } from './medicalRecords';
import { auditLogActionEnum, auditLogStatusEnum } from './enums';

export const auditLogs = pgTable('audit_logs', {
  auditId: uuid('audit_id').primaryKey().defaultRandom(),
  shareTokenId: uuid('share_token_id')
    .notNull()
    .references(() => shareTokens.tokenId, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.patientId, { onDelete: 'cascade' }),
  accessedByUserId: uuid('accessed_by_user_id')
    .notNull()
    .references(() => users.userId, { onDelete: 'restrict' }),
  accessedRecordId: uuid('accessed_record_id').references(
    () => medicalRecords.recordId,
    { onDelete: 'set null' }
  ),
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 and IPv6
  userAgent: text('user_agent'),
  action: auditLogActionEnum('action').notNull(),
  status: auditLogStatusEnum('status').default('success'),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'), // Additional context
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
