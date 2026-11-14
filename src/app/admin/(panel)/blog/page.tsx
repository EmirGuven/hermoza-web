import Link from "next/link";
import { desc } from "drizzle-orm";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { journalPosts } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { deletePost, togglePost } from "@/app/admin/actions";
import { RowActions } from "@/components/admin/row-actions";
import { Card, PageHead, formatDate } from "@/components/admin/ui";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function BlogAdminPage() {
  await requireAdmin();
  const rows = await db
    .select()
    .from(journalPosts)
    .orderBy(desc(journalPosts.publishedAt), desc(journalPosts.id));

  return (
    <div className="stack">
      <PageHead
        title="Blog"
        description="Yazılar /blog sayfasında en yeniden eskiye listelenir; ana sayfada en yeni 3 yazı görünür."
      >
        <Link href="/admin/blog/yeni" className="btn btn--primary">
          <Plus /> Yeni yazı
        </Link>
      </PageHead>

      <Card flush>
        <div className="dt-wrap">
          <table className="dt">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Kapak</th>
                <th>Başlık</th>
                <th>Kategori</th>
                <th>Yayın tarihi</th>
                <th>Durum</th>
                <th className="ta-r">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr className="dt-none"><td colSpan={6}>Henüz yazı yok. “Yeni yazı” ile başlayın.</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {r.image ? <img className="thumb" src={r.image} alt="" /> : <span className="thumb" />}
                  </td>
                  <td>
                    <Link href={`/admin/blog/${r.id}`} className="strong">{r.title}</Link>
                    <div className="muted small">/blog/{r.slug || "—"}</div>
                  </td>
                  <td><span className="badge badge--accent">{r.category || "—"}</span></td>
                  <td className="muted">{formatDate(r.publishedAt)}</td>
                  <td>
                    {r.active ? <span className="badge badge--success">Yayında</span> : <span className="badge badge--muted">Taslak</span>}
                  </td>
                  <td className="ta-r">
                    <span className="acts">
                      {r.active && r.slug && (
                        <a href={`/blog/${r.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn--icon btn--sm btn--text" title="Sitede gör">
                          <ExternalLink />
                        </a>
                      )}
                      <Link href={`/admin/blog/${r.id}`} className="btn btn--icon btn--sm btn--text" title="Düzenle">
                        <Pencil />
                      </Link>
                      <RowActions
                        first={i === 0}
                        last={i === rows.length - 1}
                        active={r.active}
                        onToggle={togglePost.bind(null, r.id)}
                        onDelete={deletePost.bind(null, r.id)}
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
