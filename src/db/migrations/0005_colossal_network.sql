CREATE TABLE "enrollments" (
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"enrolled_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "created_by" TO "updated_at";--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "courses_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "thumbnail_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "teacher_id" uuid;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE cascade;