import { desc } from "drizzle-orm";
import { Download } from "lucide-react";
import { db } from "@/lib/db";
import { subscribers } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { Card, PageHead, formatDate } from "@/components/admin/ui";
import { SubscriberDelete } from "./subscriber-delete";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function SubscribersPage() {
  await requireAdmin();
  const rows = await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  const active = rows.filter((r) => !r.unsubscribedAt).length;

  return (
    <div className="stack">
      <PageHead
        title="Bülten Aboneleri"
        description={`${active} aktif abone · ${rows.length - active} abonelikten çıkmış. Footer'daki kutudan ve açılır pencereden kayıt olanlar.`}
      >
        <a href="/api/admin/aboneler" className="btn">
          <Download /> CSV indir
        </a>
      </PageHead>
      <Card flush>
        <div className="dt-wrap">
          <table className="dt">
            <thead>
              <tr>
                <th>E-posta</th>
                <th>Kaynak</th>
                <th>Durum</th>
                <th>Kayıt tarihi</th>
                <th className="ta-r" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr className="dt-none"><td colSpan={5}>Henüz abone yok.</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="strong">{r.email}</td>
                  <td className="small">{r.source === "popup" ? "Açılır pencere" : "Footer"}</td>
                  <td>
                    {r.unsubscribedAt ? (
                      <span className="badge badge--muted" title={formatDate(r.unsubscribedAt)}>Çıktı</span>
                    ) : (
                      <span className="badge badge--success">Aktif</span>
                    )}
                  </td>
                  <td className="small muted">{formatDate(r.createdAt)}</td>
                  <td className="ta-r"><SubscriberDelete id={r.id} email={r.email} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
