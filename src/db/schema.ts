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

/** İletişim formundan gelen talepler (randevu adminden verilir) */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  body: text("body").notNull().default(""),
  read: boolean("read").notNull().default(false),
  /** yeni | randevu | tamamlandi | iptal */
  status: text("status").notNull().default("yeni"),
  appointmentAt: timestamp("appointment_at", { withTimezone: true }),
  appointmentNote: text("appointment_note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Bülten aboneleri (footer, açılır pencere). token: abonelikten çıkma bağlantısı için */
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").notNull().default("footer"),
  token: text("token").notNull().unique(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Panelden düzenlenen mail şablonları */
export const mailTemplates = pgTable("mail_templates", {
  key: text("key").primaryKey(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Gönderilen her mailin kaydı (başarılı/başarısız) */
export const mailLog = pgTable("mail_log", {
  id: serial("id").primaryKey(),
  template: text("template").notNull(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull(), // gonderildi | hata | kapali
  error: text("error").notNull().default(""),
  messageId: integer("message_id"),
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
