import { pgTable, uuid, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { users } from './users';
import { shareTokenStatusEnum } from './enums';

export const shareTokens = pgTable('share_tokens', {
  tokenId: uuid('token_id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.patientId, { onDelete: 'cascade' }),
  
  // Token recipient - null means public/any doctor can access
  doctorId: uuid('doctor_id')
    .references(() => users.userId, { onDelete: 'cascade' }),
    
  accessType: text('access_type').notNull().default('anyone'), // 'anyone' | 'restricted'
  allowedEmails: jsonb('allowed_emails'), // array of strings

  // Hashed token for security - actual token never stored
  tokenHash: text('token_hash').notNull().unique(),
  
  // Access scope - which record types can be accessed
  scope: jsonb('scope').notNull(), // ['prescriptions', 'reports', 'health_data', 'vaccinations']
  
  // Access level determines who can use this token
  accessLevel: text('access_level').notNull().default('doctor'), // 'public' | 'doctor'
  
  // Usage limits
  maxAccesses: integer('max_accesses').notNull().default(-1), // -1 = unlimited
  currentAccesses: integer('current_accesses').notNull().default(0),
  
  // Time-bound access
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  
  // Revocation
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedBy: uuid('revoked_by').references(() => users.userId, { onDelete: 'set null' }),
  
  // Status tracking
  status: shareTokenStatusEnum('status').notNull().default('active'),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
  
  // QR code reference
  qrCodeUrl: text('qr_code_url'),
  
  // Additional metadata
  metadata: jsonb('metadata'),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type ShareToken = typeof shareTokens.$inferSelect;
export type NewShareToken = typeof shareTokens.$inferInsert;
