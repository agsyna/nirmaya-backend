ALTER TYPE "user_type" ADD VALUE IF NOT EXISTS 'admin';

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "password_reset_token_hash" varchar(255),
ADD COLUMN IF NOT EXISTS "password_reset_token_expires_at" timestamp with time zone;

CREATE TABLE IF NOT EXISTS "admins" (
  "admin_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL UNIQUE,
  "super_admin" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;