import { desc } from "drizzle-orm";
import { Mail, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { messages } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { Card, PageHead, formatDate } from "@/components/admin/ui";
import { MessageActions } from "./message-actions";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function MessagesPage() {
  await requireAdmin();
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(500);

  return (
    <div className="stack">
      <PageHead title="Mesajlar" description="Sitedeki iletişim formundan gelen randevu ve proje talepleri." />
      <Card flush>
        <div className="dt-wrap">
          <table className="dt">
            <thead>
              <tr>
                <th>Gönderen</th>
                <th>Mesaj</th>
                <th>Tarih</th>
                <th className="ta-r">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr className="dt-none"><td colSpan={4}>Henüz mesaj yok.</td></tr>
              )}
              {rows.map((m) => (
                <tr key={m.id} className={m.read ? "" : "is-unread"}>
                  <td style={{ minWidth: 200 }}>
                    <div className="strong">
                      {m.name} {!m.read && <span className="badge badge--accent" style={{ marginLeft: 6 }}>Yeni</span>}
                    </div>
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
                  <td style={{ whiteSpace: "pre-wrap", maxWidth: 520 }}>{m.body || <span className="muted">—</span>}</td>
                  <td className="small muted" style={{ whiteSpace: "nowrap" }}>{formatDate(m.createdAt)}</td>
                  <td className="ta-r">
                    <MessageActions id={m.id} read={m.read} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
