import { desc, inArray } from "drizzle-orm";
import { CalendarClock, Mail, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { mailLog, messages } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { Card, PageHead, formatDate } from "@/components/admin/ui";
import { MessageActions } from "./message-actions";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

const STATUS: Record<string, [string, string]> = {
  yeni: ["badge--accent", "Yeni"],
  randevu: ["badge", "Randevu verildi"],
  tamamlandi: ["badge--success", "Tamamlandı"],
  iptal: ["badge--muted", "İptal"],
};

const MAIL_LABEL: Record<string, string> = {
  contact_customer: "Müşteriye onay",
  contact_admin: "Firmaya bildirim",
  appointment_customer: "Randevu maili",
};

export default async function MessagesPage() {
  await requireAdmin();
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(500);
  const logs = rows.length
    ? await db
        .select()
        .from(mailLog)
        .where(inArray(mailLog.messageId, rows.map((r) => r.id)))
        .orderBy(desc(mailLog.createdAt))
    : [];

  return (
    <div className="stack">
      <PageHead
        title="Mesajlar ve Randevular"
        description="Sitedeki iletişim formundan gelen talepler. Randevu verince müşteriye tarih ve saatiyle e-posta gider."
      />
      <Card flush>
        <div className="dt-wrap">
          <table className="dt">
            <thead>
              <tr>
                <th>Gönderen</th>
                <th>Mesaj</th>
                <th>Durum / Randevu</th>
                <th>Mailler</th>
                <th>Tarih</th>
                <th className="ta-r">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr className="dt-none"><td colSpan={6}>Henüz mesaj yok.</td></tr>
              )}
              {rows.map((m) => {
                const [cls, label] = STATUS[m.status] ?? STATUS.yeni;
                // Her mail türünün en son denemesi
                const mails = Object.values(
                  Object.fromEntries(
                    logs.filter((l) => l.messageId === m.id).reverse().map((l) => [l.template, l])
                  )
                );
                return (
                  <tr key={m.id} className={m.read ? "" : "is-unread"}>
                    <td style={{ minWidth: 190 }}>
                      <div className="strong">{m.name}</div>
                      {m.email && (
                        <a href={`mailto:${m.email}`} className="small row" style={{ gap: 4 }}>
                          <Mail style={{ width: 13, height: 13 }} /> {m.email}
                        </a>
                      )}
                      {m.phone && (
                        <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="small row" style={{ gap: 4 }}>
                          <Phone style={{ width: 13, height: 13 }} /> {m.phone}
                        </a>
                      )}
                    </td>
                    <td style={{ whiteSpace: "pre-wrap", maxWidth: 380 }}>{m.body || <span className="muted">—</span>}</td>
                    <td style={{ minWidth: 170 }}>
                      <span className={`badge ${cls}`}>{label}</span>
                      {m.appointmentAt && (
                        <div className="small row" style={{ gap: 4, marginTop: 6 }}>
                          <CalendarClock style={{ width: 13, height: 13, color: "var(--accent)" }} />
                          <strong>{formatDate(m.appointmentAt)}</strong>
                        </div>
                      )}
                      {m.appointmentNote && <div className="small muted">{m.appointmentNote}</div>}
                    </td>
                    <td style={{ minWidth: 150 }}>
                      {mails.length === 0 && <span className="small muted">—</span>}
                      {mails.map((l) => (
                        <div key={l.id} className="small" title={l.error || l.to}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 7,
                              height: 7,
                              marginRight: 6,
                              background: l.status === "gonderildi" ? "var(--success)" : l.status === "hata" ? "var(--danger)" : "var(--muted)",
                            }}
                          />
                          {MAIL_LABEL[l.template] ?? l.template}
                        </div>
                      ))}
                    </td>
                    <td className="small muted" style={{ whiteSpace: "nowrap" }}>{formatDate(m.createdAt)}</td>
                    <td className="ta-r">
                      <MessageActions
                        message={{
                          id: m.id,
                          name: m.name,
                          email: m.email,
                          read: m.read,
                          status: m.status,
                          appointmentAt: m.appointmentAt?.toISOString() ?? null,
                          appointmentNote: m.appointmentNote,
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="small muted">
        Mail renkleri: <span style={{ color: "var(--success)" }}>■</span> gönderildi ·{" "}
        <span style={{ color: "var(--danger)" }}>■</span> gönderilemedi (üzerine gelince sebebi görünür) ·{" "}
        <span style={{ color: "var(--muted)" }}>■</span> şablon kapalı
      </p>
    </div>
  );
}
