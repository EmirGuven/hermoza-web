import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/** Tek satırlık ayar grupları: "general", "contact", "home" */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Koleksiyonlar / hizmetler (Mutfak, Yaşam Alanı …) */
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  sort: integer("sort").notNull().default(0),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  image: text("image").notNull().default(""),
  linkLabel: text("link_label").notNull().default("Keşfet"),
  linkHref: text("link_href").notNull().default("#iletisim"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Journal yazıları */
export const journalPosts = pgTable("journal_posts", {
  id: serial("id").primaryKey(),
  sort: integer("sort").notNull().default(0),
  category: text("category").notNull().default(""),
  title: text("title").notNull(),
  image: text("image").notNull().default(""),
  href: text("href").notNull().default(""),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Medya kütüphanesi (dosyalar UPLOAD_DIR altında, adres /media/...) */
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  path: text("path").notNull().unique(), // ör. images/mutfak.jpg
  kind: text("kind").notNull(), // image | video | other
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  originalName: text("original_name").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** İletişim formundan gelen mesajlar */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  body: text("body").notNull().default(""),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Panel kullanıcıları */
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
