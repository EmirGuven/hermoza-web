ALTER TABLE "collections" ADD COLUMN "slug" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "subtitle" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "content" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "gallery" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "highlights" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "seo_title" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "seo_description" text DEFAULT '' NOT NULL;--> statement-breakpoint
-- Mevcut koleksiyonlar: adres (slug) başlıktan üretilir, aynı çıkarsa sonuna id eklenir
UPDATE "collections" SET "slug" = trim(both '-' from regexp_replace(lower(translate("title", 'çğıöşüâîûÇĞİIÖŞÜÂÎÛ’', 'cgiosuaiucgiiosuaiu')), '[^a-z0-9]+', '-', 'g')) WHERE "slug" = '';--> statement-breakpoint
UPDATE "collections" p SET "slug" = p."slug" || '-' || p."id" WHERE EXISTS (SELECT 1 FROM "collections" q WHERE q."slug" = p."slug" AND q."id" < p."id");--> statement-breakpoint
CREATE UNIQUE INDEX "collections_slug_idx" ON "collections" USING btree ("slug") WHERE "collections"."slug" <> '';