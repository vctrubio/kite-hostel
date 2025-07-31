CREATE TYPE "public"."kite_event_status" AS ENUM('planned', 'completed', 'tbc', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('active', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."languages" AS ENUM('Spanish', 'French', 'English', 'German', 'Italian');--> statement-breakpoint
CREATE TYPE "public"."lesson_status" AS ENUM('planned', 'rest', 'delegated', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."location" AS ENUM('Los Lances', 'Valdevaqueros', 'Palmones');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'teacher', 'teacherAdmin', 'locked', 'reference');--> statement-breakpoint
CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid NOT NULL,
	"date_start" timestamp NOT NULL,
	"date_end" timestamp NOT NULL,
	"status" "booking_status" NOT NULL,
	"reference_id" uuid,
	"commission_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "booking_student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	CONSTRAINT "booking_student_unique" UNIQUE("booking_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "commission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"price_per_hour" integer NOT NULL,
	"desc" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"location" "location" NOT NULL,
	"status" "kite_event_status" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serial_id" text NOT NULL,
	"model" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "kite_serial_id_unique" UNIQUE("serial_id")
);
--> statement-breakpoint
CREATE TABLE "kite_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"kite_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lesson" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"status" "lesson_status" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "package_student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"duration" integer NOT NULL,
	"description" text,
	"price_per_student" integer NOT NULL,
	"capacity_students" integer NOT NULL,
	"capacity_kites" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" integer NOT NULL,
	"teacher_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"languages" "languages"[] NOT NULL,
	"passport_number" text,
	"country" text,
	"phone" text,
	"size" text,
	"desc" text,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "teacher" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"languages" "languages"[] NOT NULL,
	"passport_number" text,
	"country" text,
	"phone" text,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "teacher_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "teacher_kite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"kite_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "teacher_kite_unique" UNIQUE("teacher_id","kite_id")
);
--> statement-breakpoint
CREATE TABLE "user_wallet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "user_role" NOT NULL,
	"sk" uuid,
	"pk" uuid,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_wallet_sk_unique" UNIQUE("sk"),
	CONSTRAINT "user_wallet_pk_unique" UNIQUE("pk")
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."package_student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_reference_id_fk" FOREIGN KEY ("reference_id") REFERENCES "public"."user_wallet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_commission_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."commission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_student" ADD CONSTRAINT "booking_student_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_student" ADD CONSTRAINT "booking_student_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission" ADD CONSTRAINT "commission_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kite_event" ADD CONSTRAINT "kite_event_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kite_event" ADD CONSTRAINT "kite_event_kite_id_fk" FOREIGN KEY ("kite_id") REFERENCES "public"."kite"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_kite" ADD CONSTRAINT "teacher_kite_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_kite" ADD CONSTRAINT "teacher_kite_kite_id_fk" FOREIGN KEY ("kite_id") REFERENCES "public"."kite"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wallet" ADD CONSTRAINT "user_wallet_sk_users_id_fk" FOREIGN KEY ("sk") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wallet" ADD CONSTRAINT "user_wallet_pk_teacher_id_fk" FOREIGN KEY ("pk") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_student_booking_id_idx" ON "booking_student" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_student_student_id_idx" ON "booking_student" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "commission_teacher_id_idx" ON "commission" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "event_lesson_id_idx" ON "event" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "equipment_serial_id_idx" ON "kite" USING btree ("serial_id");--> statement-breakpoint
CREATE INDEX "kite_event_event_id_idx" ON "kite_event" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "kite_event_kite_id_idx" ON "kite_event" USING btree ("kite_id");--> statement-breakpoint
CREATE INDEX "lesson_teacher_booking_id_idx" ON "lesson" USING btree ("teacher_id","booking_id");--> statement-breakpoint
CREATE INDEX "payment_teacher_id_idx" ON "payment" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "student_id_idx" ON "student" USING btree ("id");--> statement-breakpoint
CREATE INDEX "teacher_id_idx" ON "teacher" USING btree ("id");--> statement-breakpoint
CREATE INDEX "teacher_kite_teacher_id_idx" ON "teacher_kite" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "teacher_kite_kite_id_idx" ON "teacher_kite" USING btree ("kite_id");