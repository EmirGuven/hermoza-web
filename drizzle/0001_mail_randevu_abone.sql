CREATE TABLE "mail_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"template" text NOT NULL,
	"to" text NOT NULL,
	"subject" text NOT NULL,
	"status" text NOT NULL,
	"error" text DEFAULT '' NOT NULL,
	"message_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mail_templates" (
	"key" text PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"html" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'footer' NOT NULL,
	"token" text NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email"),
	CONSTRAINT "subscribers_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "status" text DEFAULT 'yeni' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "appointment_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "appointment_note" text DEFAULT '' NOT NULL;