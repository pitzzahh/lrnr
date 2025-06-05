CREATE TYPE "public"."enrollment_status" AS ENUM('ACTIVE', 'COMPLETED', 'DROPPED', 'PENDING');--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "progress" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "status" "enrollment_status" DEFAULT 'PENDING' NOT NULL;