import "server-only";
import { eq } from "drizzle-orm";
import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";
import { db } from "@/lib/db";
import { mailLog, mailTemplates } from "@/db/schema";
import { readSetting } from "@/lib/content";
import { templateDef, type TemplateKey } from "@/lib/mail-templates";
import { SITE_URL } from "@/lib/site";

const globalForMail = globalThis as unknown as { mailer?: Transporter };

function transporter(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  globalForMail.mailer ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: Number(SMTP_PORT || 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return globalForMail.mailer;
}

export const siteUrl = () => SITE_URL;

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** {{degisken}} yerine değerleri koyar. Değerler HTML'e güvenli şekilde ve satır sonları <br> olarak girer. */
export function fill(tpl: string, vars: Record<string, string>, html = true) {
  return tpl.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (_, k: string) => {
    const v = vars[k] ?? "";
    return html ? escapeHtml(v).replace(/\r?\n/g, "<br>") : v;
  });
}

/** Ortak değişkenler (firma bilgileri) */
export async function commonVars(): Promise<Record<string, string>> {
  const [general, contact] = await Promise.all([readSetting("general"), readSetting("contact")]);
  const url = siteUrl();
  const logo = general.logo.startsWith("http") ? general.logo : url + general.logo;
  return {
    site_adi: general.siteName,
    site_url: url,
    logo_url: logo,
    firma_telefon: contact.phone,
    firma_eposta: contact.email,
    firma_adres: contact.address,
    harita_url: contact.mapsUrl || url,
    yil: String(new Date().getFullYear()),
  };
}

/** Şablonu (panelde düzenlenmişse onu, değilse varsayılanı) okur */
export async function loadTemplate(key: TemplateKey) {
  const def = templateDef(key)!;
  const row = await db.query.mailTemplates.findFirst({ where: eq(mailTemplates.key, key) });
  return {
    subject: row?.subject ?? def.subject,
    html: row?.html ?? def.html,
    enabled: row?.enabled ?? true,
  };
}

export type SendResult = { ok: boolean; status: "gonderildi" | "hata" | "kapali"; error?: string };

/**
 * Şablonlu mail gönderir. Hata fırlatmaz: sonucu döndürür ve mail_log'a yazar.
 * SMTP ayarlı değilse veya şablon kapalıysa gönderilmez, kayda düşer.
 */
export async function sendTemplate(opts: {
  key: TemplateKey;
  to: string;
  vars: Record<string, string>;
  messageId?: number;
  replyTo?: string;
  attachments?: SendMailOptions["attachments"];
  /** Test maili: şablon kapalı olsa da gönder */
  force?: boolean;
}): Promise<SendResult> {
  const tpl = await loadTemplate(opts.key);
  const vars = { ...(await commonVars()), ...opts.vars };
  const subject = fill(tpl.subject, vars, false);
  const log = async (status: SendResult["status"], error = "") => {
    await db
      .insert(mailLog)
      .values({ template: opts.key, to: opts.to, subject, status, error: error.slice(0, 500), messageId: opts.messageId })
      .catch((e) => console.error("[mail] kayıt yazılamadı:", e));
    return { ok: status === "gonderildi", status, error: error || undefined } as SendResult;
  };

  if (!tpl.enabled && !opts.force) return log("kapali", "Şablon panelden kapatılmış");
  const t = transporter();
  if (!t) return log("hata", "SMTP ayarları eksik (.env)");

  try {
    await t.sendMail({
      from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
      to: opts.to,
      replyTo: opts.replyTo,
      subject,
      html: fill(tpl.html, vars),
      attachments: opts.attachments,
    });
    return log("gonderildi");
  } catch (e) {
    const err = e as { response?: string; message?: string };
    console.error("[mail] gönderilemedi:", err.response ?? err.message);
    return log("hata", err.response ?? err.message ?? "Bilinmeyen hata");
  }
}

export const adminInbox = () => process.env.MAIL_ADMIN_TO ?? "info@hermoza.com.tr";

/** Türkiye saatiyle tarih metni */
export function trDate(d: Date, withTime = false) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : { weekday: "long" }),
    timeZone: "Europe/Istanbul",
  }).format(d);
}

export function trTime(d: Date) {
  return new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(d);
}

/** Randevu için takvim daveti (.ics) */
export function appointmentIcs(opts: { start: Date; minutes?: number; title: string; location: string; description: string }) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(opts.start.getTime() + (opts.minutes ?? 60) * 60000);
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hermoza//Randevu//TR",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${fmt(opts.start)}-${Math.random().toString(36).slice(2)}@hermoza.com.tr`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(opts.start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(opts.title)}`,
    `LOCATION:${esc(opts.location)}`,
    `DESCRIPTION:${esc(opts.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
