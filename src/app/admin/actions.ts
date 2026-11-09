"use server";

import { randomBytes } from "node:crypto";
import { unlink } from "node:fs/promises";
import { and, asc, eq, gt, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  admins,
  collections,
  journalPosts,
  mailTemplates,
  media,
  messages,
  settings,
  subscribers,
} from "@/db/schema";
import { getSession, requireAdmin } from "@/lib/session";
import { SITE_TAG, readSetting } from "@/lib/content";
import type { NavLink, SettingKey } from "@/lib/content-types";
import { resolveUpload } from "@/lib/media";
import { adminInbox, appointmentIcs, sendTemplate, siteUrl, trDate, trTime } from "@/lib/mail";
import { SAMPLE_VARS, templateDef } from "@/lib/mail-templates";


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
    newsletterPopup: bool(f, "newsletterPopup"),
    ogImage: str(f, "ogImage"),
    googleVerification: str(f, "googleVerification").replace(/.*content="([^"]+)".*/, "$1"),
    bingVerification: str(f, "bingVerification").replace(/.*content="([^"]+)".*/, "$1"),
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

/* ---------------- Mesajlar ve randevu ---------------- */

export async function setMessageRead(id: number, read: boolean) {
  await requireAdmin();
  await db.update(messages).set({ read }).where(eq(messages.id, id));
}

export async function deleteMessage(id: number) {
  await requireAdmin();
  await db.delete(messages).where(eq(messages.id, id));
}

export async function setMessageStatus(id: number, status: string) {
  await requireAdmin();
  if (!["yeni", "randevu", "tamamlandi", "iptal"].includes(status)) return;
  await db.update(messages).set({ status, read: true }).where(eq(messages.id, id));
}

/** Randevu tarih/saatini kaydeder ve müşteriye randevu maili (takvim davetiyle) gönderir. */
export async function scheduleAppointment(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = Number(f.get("id"));
  const date = str(f, "date"); // 2026-11-12
  const time = str(f, "time"); // 14:30
  const note = str(f, "note").slice(0, 1000);
  const notify = bool(f, "notify");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return fail("Tarih ve saat seçin");
  // Türkiye 2016'dan beri sabit UTC+3
  const at = new Date(`${date}T${time}:00+03:00`);
  if (Number.isNaN(at.getTime())) return fail("Geçersiz tarih");

  const msg = await db.query.messages.findFirst({ where: eq(messages.id, id) });
  if (!msg) return fail("Talep bulunamadı");
  await db
    .update(messages)
    .set({ appointmentAt: at, appointmentNote: note, status: "randevu", read: true })
    .where(eq(messages.id, id));

  if (!notify) return done("Randevu kaydedildi");
  if (!msg.email) return done("Randevu kaydedildi (müşterinin e-postası yok, mail gönderilmedi)");

  const contact = await readSetting("contact");
  const general = await readSetting("general");
  const res = await sendTemplate({
    key: "appointment_customer",
    to: msg.email,
    messageId: id,
    replyTo: contact.email || undefined,
    vars: { ad: msg.name, randevu_tarih: trDate(at), randevu_saat: trTime(at), randevu_not: note },
    attachments: [
      {
        filename: "randevu.ics",
        contentType: "text/calendar; charset=utf-8; method=PUBLISH",
        content: appointmentIcs({
          start: at,
          title: `${general.siteName} randevusu`,
          location: contact.address,
          description: note || `${general.siteName} — ${contact.phone}`,
        }),
      },
    ],
  });
  return res.ok
    ? done(`Randevu kaydedildi, ${msg.email} adresine mail gönderildi`)
    : fail(`Randevu kaydedildi ama mail gönderilemedi: ${res.error}`);
}

/* ---------------- Mail şablonları ---------------- */

export async function saveTemplate(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const key = str(f, "key");
  if (!templateDef(key)) return fail("Şablon bulunamadı");
  const subject = str(f, "subject");
  const html = String(f.get("html") ?? "");
  if (!subject || !html.trim()) return fail("Konu ve HTML boş olamaz");
  const enabled = bool(f, "enabled");
  await db
    .insert(mailTemplates)
    .values({ key, subject, html, enabled })
    .onConflictDoUpdate({ target: mailTemplates.key, set: { subject, html, enabled, updatedAt: new Date() } });
  return done("Şablon kaydedildi");
}

export async function resetTemplate(key: string): Promise<ActionState> {
  await requireAdmin();
  await db.delete(mailTemplates).where(eq(mailTemplates.key, key));
  return done("Varsayılan şablona dönüldü");
}

export async function sendTestMail(key: string, to: string): Promise<ActionState> {
  await requireAdmin();
  const def = templateDef(key);
  if (!def) return fail("Şablon bulunamadı");
  const addr = to.trim() || adminInbox();
  const res = await sendTemplate({
    key: def.key,
    to: addr,
    vars: { ...SAMPLE_VARS, panel_url: `${siteUrl()}/admin/mesajlar`, iptal_url: `${siteUrl()}/bulten/iptal` },
    force: true,
  });
  return res.ok ? done(`Test maili ${addr} adresine gönderildi`) : fail(`Gönderilemedi: ${res.error}`);
}

/* ---------------- Aboneler ---------------- */

export async function deleteSubscriber(id: number) {
  await requireAdmin();
  await db.delete(subscribers).where(eq(subscribers.id, id));
}

/* ---------------- Bülten kaydı (herkese açık) ---------------- */

export async function subscribeNewsletter(_: ActionState, f: FormData): Promise<ActionState> {
  const email = str(f, "newsletter").toLowerCase().slice(0, 160);
  const source = str(f, "source") === "popup" ? "popup" : "footer";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Geçerli bir e-posta yazın");
  if (!bool(f, "consent")) return fail("Devam etmek için izin kutusunu işaretleyin");

  const existing = await db.query.subscribers.findFirst({ where: eq(subscribers.email, email) });
  if (existing && !existing.unsubscribedAt) return done("Bu adres zaten bültenimize kayıtlı. Teşekkürler!");

  const token = existing?.token ?? randomBytes(24).toString("base64url");
  if (existing) {
    await db.update(subscribers).set({ unsubscribedAt: null, source }).where(eq(subscribers.id, existing.id));
  } else {
    await db.insert(subscribers).values({ email, source, token });
  }
  // Hoş geldin maili yanıtı bekletmeden gönderilir
  after(() =>
    sendTemplate({
      key: "newsletter_welcome",
      to: email,
      vars: { eposta: email, iptal_url: `${siteUrl()}/bulten/iptal?t=${token}` },
    })
  );
  return done("Teşekkürler, bültene kaydoldunuz.");
}

/* ---------------- Sitedeki iletişim formu (herkese açık) ---------------- */

export async function submitContact(_: ActionState, f: FormData): Promise<ActionState> {
  // Bot tuzağı: görünmez alan doluysa sessizce başarılı say
  if (str(f, "website")) return done("Mesajınız alındı");
  const name = str(f, "name").slice(0, 120);
  const email = str(f, "email").toLowerCase().slice(0, 160);
  const phone = str(f, "phone").slice(0, 40);
  const body = str(f, "message").slice(0, 4000);
  if (!name) return fail("Lütfen adınızı yazın");
  if (!email && !phone) return fail("Size ulaşabilmemiz için e-posta veya telefon gerekli");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("E-posta adresi geçersiz görünüyor");
  // Aynı kişiden kısa sürede art arda gönderimi sınırla
  const recent = await db
    .select({ n: sql<number>`count(*)` })
    .from(messages)
    .where(and(eq(messages.email, email), gt(messages.createdAt, sql`now() - interval '1 minute'`)));
  if (email && Number(recent[0]?.n) > 2) return fail("Çok sık gönderim yapıldı, lütfen biraz bekleyin");

  const [row] = await db.insert(messages).values({ name, email, phone, body }).returning();

  // Mailler yanıt gönderildikten sonra gider; ziyaretçi beklemez
  after(async () => {
    const vars = {
      ad: name,
      eposta: email || "—",
      telefon: phone || "—",
      mesaj: body || "—",
      tarih: trDate(row.createdAt, true),
      panel_url: `${siteUrl()}/admin/mesajlar`,
    };
    await Promise.allSettled([
      sendTemplate({ key: "contact_admin", to: adminInbox(), vars, messageId: row.id, replyTo: email || undefined }),
      email ? sendTemplate({ key: "contact_customer", to: email, vars, messageId: row.id }) : Promise.resolve(),
    ]);
  });

  return done("Teşekkürler! Talebiniz alındı. Size bir onay e-postası gönderdik; en kısa sürede randevu için arayacağız.");
}
