ALTER TABLE "share_tokens" ADD COLUMN "access_type" text DEFAULT 'anyone' NOT NULL;--> statement-breakpoint
ALTER TABLE "share_tokens" ADD COLUMN "allowed_emails" jsonb;