import Link from "next/link";
import { desc } from "drizzle-orm";
import { Mail, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { mailLog, mailTemplates } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { TEMPLATES, templateDef } from "@/lib/mail-templates";
import { Card, PageHead, formatDate } from "@/components/admin/ui";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

const STATUS: Record<string, [string, string]> = {
  gonderildi: ["badge--success", "Gönderildi"],
  hata: ["badge--danger", "Hata"],
  kapali: ["badge--muted", "Kapalı"],
};

export default async function MailTemplatesPage() {
  await requireAdmin();
  const [saved, log] = await Promise.all([
    db.select().from(mailTemplates),
    db.select().from(mailLog).orderBy(desc(mailLog.createdAt)).limit(30),
  ]);
  const smtpReady = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  return (
    <div className="stack">
      <PageHead
        title="Mail Şablonları"
        description="Sitenin otomatik gönderdiği e-postalar. HTML'leri düzenleyebilir, test maili gönderebilirsiniz."
      />
      {!smtpReady && (
        <div className="alert alert--danger">SMTP ayarları eksik; mailler gönderilemez. Sunucudaki .env dosyasına SMTP bilgileri girilmeli.</div>
      )}

      <Card flush title="Şablonlar">
        <div className="dt-wrap">
          <table className="dt">
            <thead>
              <tr>
                <th>Şablon</th>
                <th>Ne zaman gider?</th>
                <th>Durum</th>
                <th className="ta-r" />
              </tr>
            </thead>
            <tbody>
              {TEMPLATES.map((t) => {
                const row = saved.find((s) => s.key === t.key);
                return (
                  <tr key={t.key}>
                    <td>
                      <Link href={`/admin/mail-sablonlari/${t.key}`} className="strong row" style={{ gap: 8 }}>
                        <Mail style={{ width: 16, height: 16 }} /> {t.title}
                      </Link>
                    </td>
                    <td className="small soft" style={{ maxWidth: 420 }}>{t.description}</td>
                    <td>
                      {row?.enabled === false ? (
                        <span className="badge badge--muted">Kapalı</span>
                      ) : (
                        <span className="badge badge--success">Açık</span>
                      )}{" "}
                      {row && <span className="badge badge--accent">Düzenlendi</span>}
                    </td>
                    <td className="ta-r">
                      <Link href={`/admin/mail-sablonlari/${t.key}`} className="btn btn--sm">
                        <Pencil /> Düzenle
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card flush title="Son gönderimler" sub="Son 30 mail">
        <div className="dt-wrap">
          <table className="dt">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Şablon</th>
                <th>Alıcı</th>
                <th>Konu</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {log.length === 0 && (
                <tr className="dt-none"><td colSpan={5}>Henüz mail gönderilmedi.</td></tr>
              )}
              {log.map((l) => {
                const [cls, label] = STATUS[l.status] ?? ["badge--muted", l.status];
                return (
                  <tr key={l.id}>
                    <td className="small muted" style={{ whiteSpace: "nowrap" }}>{formatDate(l.createdAt)}</td>
                    <td className="small">{templateDef(l.template)?.title ?? l.template}</td>
                    <td className="small">{l.to}</td>
                    <td className="small ellipsis" style={{ maxWidth: 280 }}>{l.subject}</td>
                    <td>
                      <span className={`badge ${cls}`} title={l.error || undefined}>{label}</span>
                      {l.error && <div className="small muted ellipsis" style={{ maxWidth: 260 }} title={l.error}>{l.error}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
