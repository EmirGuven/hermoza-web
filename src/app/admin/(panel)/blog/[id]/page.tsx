import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { journalPosts } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { savePost } from "@/app/admin/actions";
import { ActionForm, FormFooter } from "@/components/admin/action-form";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { MediaField } from "@/components/admin/media-field";
import { Card, PageHead, Switch, TextArea, TextField } from "@/components/admin/ui";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

/** datetime-local alanı için Türkiye saatiyle (UTC+3) "YYYY-MM-DDTHH:mm" */
const toLocalInput = (d: Date) => new Date(d.getTime() + 3 * 3600_000).toISOString().slice(0, 16);

export default async function BlogEdit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kaydedildi?: string }>;
}) {
  await requireAdmin();
  const [{ id }, { kaydedildi }] = await Promise.all([params, searchParams]);
  const isNew = id === "yeni";
  const row = isNew
    ? null
    : await db.query.journalPosts.findFirst({ where: eq(journalPosts.id, Number(id) || 0) });
  if (!isNew && !row) notFound();

  return (
    <ActionForm action={savePost} className="stack">
      <PageHead title={isNew ? "Yeni yazı" : row!.title}>
        <Link href="/admin/blog" className="btn"><ArrowLeft /> Listeye dön</Link>
        {row?.active && row.slug && (
          <a href={`/blog/${row.slug}`} target="_blank" rel="noopener noreferrer" className="btn">
            <ExternalLink /> Sitede gör
          </a>
        )}
      </PageHead>
      {kaydedildi && <div className="alert alert--info">Yazı oluşturuldu. Düzenlemeye devam edebilirsiniz.</div>}
      <input type="hidden" name="id" value={row?.id ?? ""} />

      <div className="post-layout">
        <div className="stack">
          <Card>
            <div className="stack">
              <TextField label="Başlık" name="title" defaultValue={row?.title} required />
              <MarkdownEditor name="content" label="İçerik" defaultValue={row?.content} />
            </div>
          </Card>
          <Card title="Arama motorları (SEO)" sub="Boş bırakılırsa başlık ve özet kullanılır.">
            <div className="stack">
              <TextField label="SEO başlığı" name="seoTitle" defaultValue={row?.seoTitle} hint="Google sonuçlarında görünen başlık. 60 karakteri geçmemesi önerilir." />
              <TextArea label="SEO açıklaması" name="seoDescription" defaultValue={row?.seoDescription} rows={2} hint="Google sonuçlarında başlığın altındaki metin. 150–160 karakter önerilir." />
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card title="Yayın">
            <div className="stack">
              <Switch name="active" label="Sitede yayınla" defaultChecked={row?.active ?? true} />
              <TextField
                label="Yayın tarihi"
                name="publishedAt"
                type="datetime-local"
                defaultValue={toLocalInput(row?.publishedAt ?? new Date())}
                hint="Yazılar bu tarihe göre sıralanır."
              />
              <TextField label="Kategori" name="category" defaultValue={row?.category} placeholder="Malzeme, Proje, Rehber…" />
              <TextField
                label="Adres (slug)"
                name="slug"
                defaultValue={row?.slug}
                placeholder="bos-birakilirsa-basliktan-uretilir"
                hint="Yazının adresi: /blog/… Yayınlandıktan sonra değiştirmemeniz önerilir."
              />
            </div>
          </Card>
          <Card title="Kapak görseli">
            <MediaField name="image" label="Görsel" defaultValue={row?.image} hint="Yatay, en az 1600px genişlik önerilir. Paylaşım kartında da kullanılır." />
          </Card>
          <Card title="Özet">
            <TextArea
              label="Kısa özet"
              name="excerpt"
              defaultValue={row?.excerpt}
              rows={4}
              hint="Liste sayfasında ve yazının başında görünür. Boş bırakılırsa içerikten üretilir."
            />
          </Card>
        </div>
      </div>

      <div className="card"><FormFooter /></div>
    </ActionForm>
  );
}
