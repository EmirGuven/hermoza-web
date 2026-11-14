ALTER TABLE "journal_posts" ADD COLUMN "slug" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_posts" ADD COLUMN "excerpt" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_posts" ADD COLUMN "content" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_posts" ADD COLUMN "seo_title" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_posts" ADD COLUMN "seo_description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_posts" ADD COLUMN "published_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_posts" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
-- Mevcut yazılar: yayın tarihi = oluşturulma tarihi, adres (slug) başlıktan üretilir
UPDATE "journal_posts" SET "published_at" = "created_at", "updated_at" = "created_at";--> statement-breakpoint
UPDATE "journal_posts" SET "slug" = trim(both '-' from regexp_replace(lower(translate("title", 'çğıöşüâîûÇĞİIÖŞÜÂÎÛ’', 'cgiosuaiucgiiosuaiu')), '[^a-z0-9]+', '-', 'g')) WHERE "slug" = '';--> statement-breakpoint
-- Aynı başlıktan aynı adres çıkarsa sonuna id eklenir
UPDATE "journal_posts" p SET "slug" = p."slug" || '-' || p."id" WHERE EXISTS (SELECT 1 FROM "journal_posts" q WHERE q."slug" = p."slug" AND q."id" < p."id");--> statement-breakpoint
CREATE UNIQUE INDEX "journal_posts_slug_idx" ON "journal_posts" USING btree ("slug") WHERE "journal_posts"."slug" <> '';