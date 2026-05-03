ALTER TABLE "emergency_sos" RENAME COLUMN "service_type" TO "service_types";--> statement-breakpoint
ALTER TABLE "emergency_sos" DROP COLUMN "ambulance_called";--> statement-breakpoint
ALTER TABLE "emergency_sos" DROP COLUMN "ambulance_eta";--> statement-breakpoint
ALTER TABLE "emergency_sos" DROP COLUMN "contacts_notified";--> statement-breakpoint
ALTER TABLE "emergency_sos" DROP COLUMN "voice_message_sent";