"use server";

import { unlink } from "node:fs/promises";
import { and, asc, eq, gt, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { admins, collections, journalPosts, media, messages, settings } from "@/db/schema";
import { getSession, requireAdmin } from "@/lib/session";
import { SITE_TAG, readSetting } from "@/lib/content";
import type { NavLink, SettingKey } from "@/lib/content-types";
import { resolveUpload } from "@/lib/media";

/** Bülten kayıtları mesajlar listesinde bu adla görünür */
const NEWSLETTER_NAME = "Bülten aboneliği";

export type ActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
  at?: number;
  /** Hata sonrası formda korunacak değerler (React form sıfırlamasına karşı) */
  values?: Record<string, string>;
};

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";
const done = (message = "Kaydedildi"): ActionState => ({ ok: true, message, at: Date.now() });
const fail = (error: string): ActionState => ({ ok: false, error, at: Date.now() });

function links(f: FormData, k: string): NavLink[] {
  try {
    const v = JSON.parse(str(f, k) || "[]");
    return Array.isArray(v)
      ? v
          .map((l) => ({ label: String(l.label ?? "").trim(), href: String(l.href ?? "").trim() }))
          .filter((l) => l.label && l.href)
      : [];
  } catch {
    return [];
  }
}

// Kullanıcı bulunamadığında da gerçek bir karşılaştırma yapılsın diye sahte hash (ilk girişte bir kez üretilir)
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hash("hermoza-dummy-password", 12));

async function saveSetting(key: SettingKey, value: unknown) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  updateTag(SITE_TAG);
}

/* ---------------- Oturum ---------------- */

export async function login(_: ActionState, f: FormData): Promise<ActionState> {
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") ?? "");
  if (!email || !password) return { ...fail("Kullanıcı adı ve şifre gerekli"), values: { email } };
  const admin = await db.query.admins.findFirst({ where: eq(admins.email, email) });
  // Kullanıcı yoksa da hash karşılaştırması yap: yanıt süresi e-postanın varlığını ele vermesin
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? (await getDummyHash()));
  if (!admin || !ok) return { ...fail("Kullanıcı adı veya şifre hatalı"), values: { email } };
  const session = await getSession();
  session.adminId = admin.id;
  await session.save();
  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/giris");
}

export async function changePassword(_: ActionState, f: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const current = String(f.get("current") ?? "");
  const next = String(f.get("next") ?? "");
  const again = String(f.get("again") ?? "");
  if (next.length < 8) return fail("Yeni şifre en az 8 karakter olmalı");
  if (next !== again) return fail("Yeni şifreler aynı değil");
  const row = await db.query.admins.findFirst({ where: eq(admins.id, me.id) });
  if (!row || !(await bcrypt.compare(current, row.passwordHash))) return fail("Mevcut şifre hatalı");
  await db.update(admins).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(admins.id, me.id));
  return done("Şifre değiştirildi");
}

/* ---------------- Ayarlar ---------------- */

export async function saveGeneral(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const prev = await readSetting("general");
  await saveSetting("general", {
    ...prev,
    siteName: str(f, "siteName"),
    seoTitle: str(f, "seoTitle"),
    seoDescription: str(f, "seoDescription"),
    logo: str(f, "logo"),
    menuImage: str(f, "menuImage"),
    headerCtaLabel: str(f, "headerCtaLabel"),
    headerCtaHref: str(f, "headerCtaHref"),
    menuLinks: links(f, "menuLinks"),
    footerLinks: links(f, "footerLinks"),
    footerCopyright: str(f, "footerCopyright"),
    newsletterEnabled: bool(f, "newsletterEnabled"),
  });
  return done();
}

export async function saveContact(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  await saveSetting("contact", {
    phone: str(f, "phone"),
    email: str(f, "email"),
    address: str(f, "address"),
    mapsUrl: str(f, "mapsUrl"),
    facebook: str(f, "facebook"),
    instagram: str(f, "instagram"),
    whatsapp: str(f, "whatsapp"),
  });
  return done();
}

export async function saveHome(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const heading = str(f, "bespoke.heading");
  const highlight = str(f, "bespoke.highlight");
  if (highlight && !heading.includes(highlight)) {
    return fail("Vurgulanacak kısım başlığın içinde birebir geçmeli");
  }
  await saveSetting("home", {
    hero: {
      desktop: str(f, "hero.desktop"),
      mobile: str(f, "hero.mobile"),
      poster: str(f, "hero.poster"),
    },
    bespoke: {
      eyebrow: str(f, "bespoke.eyebrow"),
      heading,
      highlight,
      text: str(f, "bespoke.text"),
      buttonLabel: str(f, "bespoke.buttonLabel"),
      buttonHref: str(f, "bespoke.buttonHref"),
      video: {
        desktop: str(f, "bespoke.video.desktop"),
        mobile: str(f, "bespoke.video.mobile"),
        poster: str(f, "bespoke.video.poster"),
      },
    },
    journal: { eyebrow: str(f, "journal.eyebrow"), title: str(f, "journal.title") },
    contact: {
      eyebrow: str(f, "contact.eyebrow"),
      title: str(f, "contact.title"),
      text: str(f, "contact.text"),
    },
  });
  return done();
}

/* ---------------- Koleksiyonlar ---------------- */

export async function saveCollection(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = Number(f.get("id") || 0);
  const data = {
    title: str(f, "title"),
    body: str(f, "body"),
    image: str(f, "image"),
    linkLabel: str(f, "linkLabel") || "Keşfet",
    linkHref: str(f, "linkHref") || "#iletisim",
    active: bool(f, "active"),
  };
  if (!data.title) return fail("Başlık gerekli");
  if (id) {
    await db.update(collections).set(data).where(eq(collections.id, id));
  } else {
    const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${collections.sort}), 0)` }).from(collections);
    await db.insert(collections).values({ ...data, sort: Number(max) + 1 });
  }
  updateTag(SITE_TAG);
  redirect("/admin/koleksiyonlar?kaydedildi=1");
}

export async function deleteCollection(id: number) {
  await requireAdmin();
  await db.delete(collections).where(eq(collections.id, id));
  updateTag(SITE_TAG);
}

export async function toggleCollection(id: number) {
  await requireAdmin();
  await db.update(collections).set({ active: sql`not ${collections.active}` }).where(eq(collections.id, id));
  updateTag(SITE_TAG);
}

export async function moveCollection(id: number, dir: -1 | 1) {
  await requireAdmin();
  await db.transaction(async (tx) => {
    // Sıra numaralarını önce 1..n olarak düzelt, sonra komşuyla yer değiştir
    const rows = await tx.select({ id: collections.id }).from(collections).orderBy(asc(collections.sort), asc(collections.id));
    const i = rows.findIndex((r) => r.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= rows.length) return;
    [rows[i], rows[j]] = [rows[j], rows[i]];
    for (const [n, r] of rows.entries()) await tx.update(collections).set({ sort: n + 1 }).where(eq(collections.id, r.id));
  });
  updateTag(SITE_TAG);
}

/* ---------------- Journal ---------------- */

export async function saveJournal(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = Number(f.get("id") || 0);
  const data = {
    category: str(f, "category"),
    title: str(f, "title"),
    image: str(f, "image"),
    href: str(f, "href"),
    active: bool(f, "active"),
  };
  if (!data.title) return fail("Başlık gerekli");
  if (id) {
    await db.update(journalPosts).set(data).where(eq(journalPosts.id, id));
  } else {
    const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${journalPosts.sort}), 0)` }).from(journalPosts);
    await db.insert(journalPosts).values({ ...data, sort: Number(max) + 1 });
  }
  updateTag(SITE_TAG);
  redirect("/admin/journal?kaydedildi=1");
}

export async function deleteJournal(id: number) {
  await requireAdmin();
  await db.delete(journalPosts).where(eq(journalPosts.id, id));
  updateTag(SITE_TAG);
}

export async function toggleJournal(id: number) {
  await requireAdmin();
  await db.update(journalPosts).set({ active: sql`not ${journalPosts.active}` }).where(eq(journalPosts.id, id));
  updateTag(SITE_TAG);
}

export async function moveJournal(id: number, dir: -1 | 1) {
  await requireAdmin();
  await db.transaction(async (tx) => {
    const rows = await tx.select({ id: journalPosts.id }).from(journalPosts).orderBy(asc(journalPosts.sort), asc(journalPosts.id));
    const i = rows.findIndex((r) => r.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= rows.length) return;
    [rows[i], rows[j]] = [rows[j], rows[i]];
    for (const [n, r] of rows.entries()) await tx.update(journalPosts).set({ sort: n + 1 }).where(eq(journalPosts.id, r.id));
  });
  updateTag(SITE_TAG);
}

/* ---------------- Medya ---------------- */

export async function deleteMedia(id: number): Promise<ActionState> {
  await requireAdmin();
  const row = await db.query.media.findFirst({ where: eq(media.id, id) });
  if (!row) return fail("Dosya bulunamadı");
  const file = resolveUpload(row.path);
  if (file) await unlink(file).catch(() => {});
  await db.delete(media).where(eq(media.id, id));
  return done("Dosya silindi");
}

/* ---------------- Mesajlar ---------------- */

export async function setMessageRead(id: number, read: boolean) {
  await requireAdmin();
  await db.update(messages).set({ read }).where(eq(messages.id, id));
}

export async function deleteMessage(id: number) {
  await requireAdmin();
  await db.delete(messages).where(eq(messages.id, id));
}

/* ---------------- Footer bülten kaydı (herkese açık) ---------------- */

export async function subscribeNewsletter(_: ActionState, f: FormData): Promise<ActionState> {
  const email = str(f, "newsletter").toLowerCase().slice(0, 160);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Geçerli bir e-posta yazın");
  // Aynı adres daha önce kaydolduysa tekrar ekleme
  const exists = await db
    .select({ id: messages.id })
    .from(messages)
    .where(and(eq(messages.email, email), eq(messages.name, NEWSLETTER_NAME)))
    .limit(1);
  if (!exists.length) {
    await db.insert(messages).values({ name: NEWSLETTER_NAME, email, body: "Bülten aboneliği" });
  }
  return done("Teşekkürler, bültene kaydoldunuz.");
}

/* ---------------- Sitedeki iletişim formu (herkese açık) ---------------- */

export async function submitContact(_: ActionState, f: FormData): Promise<ActionState> {
  // Bot tuzağı: görünmez alan doluysa sessizce başarılı say
  if (str(f, "website")) return done("Mesajınız alındı");
  const name = str(f, "name").slice(0, 120);
  const email = str(f, "email").slice(0, 160);
  const phone = str(f, "phone").slice(0, 40);
  const body = str(f, "message").slice(0, 4000);
  if (!name) return fail("Lütfen adınızı yazın");
  if (!email && !phone) return fail("Size ulaşabilmemiz için e-posta veya telefon gerekli");
  // Aynı kişiden kısa sürede art arda gönderimi sınırla
  const recent = await db
    .select({ n: sql<number>`count(*)` })
    .from(messages)
    .where(and(eq(messages.email, email), gt(messages.createdAt, sql`now() - interval '1 minute'`)));
  if (email && Number(recent[0]?.n) > 2) return fail("Çok sık gönderim yapıldı, lütfen biraz bekleyin");
  await db.insert(messages).values({ name, email, phone, body });
  return done("Teşekkürler! Mesajınız alındı, en kısa sürede dönüş yapacağız.");
}
