-- Fix emergency_sos.service_types: was single enum value, should be JSONB array
ALTER TABLE "emergency_sos"
  ALTER COLUMN "service_types" TYPE jsonb
  USING to_jsonb(ARRAY[service_types::text]);
--> statement-breakpoint

-- Fix share_tokens.scope: was share_token_scope[] enum array, should be JSONB array
ALTER TABLE "share_tokens"
  ALTER COLUMN "scope" TYPE jsonb
  USING to_jsonb(scope);
--> statement-breakpoint

-- Drop the unused share_token_scope enum (no longer referenced)
DROP TYPE IF EXISTS "share_token_scope";
