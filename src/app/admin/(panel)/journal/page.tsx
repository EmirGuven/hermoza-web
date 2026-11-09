import Link from "next/link";
import { asc } from "drizzle-orm";
import { Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { journalPosts } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { deleteJournal, moveJournal, toggleJournal } from "@/app/admin/actions";
import { RowActions } from "@/components/admin/row-actions";
import { Card, PageHead } from "@/components/admin/ui";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ kaydedildi?: string }>;
}) {
  await requireAdmin();
  const { kaydedildi } = await searchParams;
  const rows = await db.select().from(journalPosts).orderBy(asc(journalPosts.sort), asc(journalPosts.id));

  return (
    <div className="stack">
      <PageHead title="Journal" description="Ana sayfadaki “Atölyeden notlar” kartları. İlk 3 yayındaki yazı gösterilir.">
        <Link href="/admin/journal/yeni" className="btn btn--primary">
          <Plus /> Yeni yazı
        </Link>
      </PageHead>
      {kaydedildi && <div className="alert alert--info">Kaydedildi. Değişiklik sitede hemen görünür.</div>}

      <Card flush>
        <div className="dt-wrap">
          <table className="dt">
            <thead>
              <tr>
                <th style={{ width: 50 }}>Sıra</th>
                <th style={{ width: 80 }}>Görsel</th>
                <th>Başlık</th>
                <th>Kategori</th>
                <th>Durum</th>
                <th className="ta-r">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr className="dt-none"><td colSpan={6}>Henüz yazı yok.</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td className="muted">{String(i + 1).padStart(2, "0")}</td>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {r.image ? <img className="thumb" src={r.image} alt="" /> : <span className="thumb" />}
                  </td>
                  <td>
                    <Link href={`/admin/journal/${r.id}`} className="strong">{r.title}</Link>
                  </td>
                  <td><span className="badge badge--accent">{r.category || "—"}</span></td>
                  <td>
                    {r.active ? <span className="badge badge--success">Yayında</span> : <span className="badge badge--muted">Gizli</span>}
                  </td>
                  <td className="ta-r">
                    <span className="acts">
                      <Link href={`/admin/journal/${r.id}`} className="btn btn--icon btn--sm btn--text" title="Düzenle">
                        <Pencil />
                      </Link>
                      <RowActions
                        first={i === 0}
                        last={i === rows.length - 1}
                        active={r.active}
                        onMove={moveJournal.bind(null, r.id)}
                        onToggle={toggleJournal.bind(null, r.id)}
                        onDelete={deleteJournal.bind(null, r.id)}
                        deleteLabel={`“${r.title}” silinsin mi?`}
                      />
                    </span>
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
