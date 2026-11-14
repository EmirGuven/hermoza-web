import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { collections } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { saveCollection } from "@/app/admin/actions";
import { ActionForm, FormFooter } from "@/components/admin/action-form";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { MediaField } from "@/components/admin/media-field";
import { Card, PageHead, Switch, TextArea, TextField } from "@/components/admin/ui";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function CollectionEdit({
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
    : await db.query.collections.findFirst({ where: eq(collections.id, Number(id) || 0) });
  if (!isNew && !row) notFound();

  return (
    <ActionForm action={saveCollection} className="stack">
      <PageHead title={isNew ? "Yeni koleksiyon" : row!.title}>
        <Link href="/admin/koleksiyonlar" className="btn"><ArrowLeft /> Listeye dön</Link>
        {row?.active && row.slug && (
          <a href={`/koleksiyonlar/${row.slug}`} target="_blank" rel="noopener noreferrer" className="btn">
            <ExternalLink /> Sitede gör
          </a>
        )}
      </PageHead>
      {kaydedildi && <div className="alert alert--info">Koleksiyon oluşturuldu. Galeriyi ve detayları ekleyebilirsiniz.</div>}
      <input type="hidden" name="id" value={row?.id ?? ""} />

      <div className="post-layout">
        <div className="stack">
          <Card title="Ana sayfa" sub="Ana sayfadaki panelde görünen bilgiler">
            <div className="stack">
              <TextField label="Başlık" name="title" defaultValue={row?.title} required />
              <TextArea label="Kısa açıklama" name="body" defaultValue={row?.body} rows={3} hint="Ana sayfada ve detay sayfasının girişinde görünür." />
            </div>
          </Card>

          <Card title="Galeri" sub="Detay sayfasının kalbi: görseller büyük ve dergi düzeninde gösterilir">
            <GalleryEditor
              name="gallery"
              label="Görseller"
              defaultValue={row?.gallery ?? []}
              hint="Sıralama sayfadaki sırayı belirler. Yatay ve dikey görselleri karıştırmak düzeni zenginleştirir; en az 5–6 görsel önerilir."
            />
          </Card>

          <Card title="Detay sayfası">
            <div className="stack">
              <TextField label="Slogan" name="subtitle" defaultValue={row?.subtitle} placeholder="Ör. Ailenin toplandığı yer" hint="Kapakta başlığın altında görünür." />
              <MarkdownEditor name="content" label="Detaylı açıklama" defaultValue={row?.content} />
              <TextArea
                label="Öne çıkanlar"
                name="highlights"
                defaultValue={(row?.highlights ?? []).join("\n")}
                rows={5}
                hint="Her satıra bir madde. Ör. Masif ceviz kapaklar"
              />
            </div>
          </Card>

          <Card title="Arama motorları (SEO)" sub="Boş bırakılırsa başlık ve açıklama kullanılır.">
            <div className="stack">
              <TextField label="SEO başlığı" name="seoTitle" defaultValue={row?.seoTitle} hint="60 karakteri geçmemesi önerilir." />
              <TextArea label="SEO açıklaması" name="seoDescription" defaultValue={row?.seoDescription} rows={2} hint="150–160 karakter önerilir." />
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card title="Yayın">
            <div className="stack">
              <Switch name="active" label="Sitede göster" defaultChecked={row?.active ?? true} />
              <TextField
                label="Adres (slug)"
                name="slug"
                defaultValue={row?.slug}
                placeholder="bos-birakilirsa-basliktan-uretilir"
                hint="Detay sayfasının adresi: /koleksiyonlar/… Yayınlandıktan sonra değiştirmemeniz önerilir."
              />
              <TextField label="Buton yazısı" name="linkLabel" defaultValue={row?.linkLabel ?? "Keşfet"} hint="Ana sayfadaki panelde, detay sayfasına götürür." />
            </div>
          </Card>
          <Card title="Kapak görseli">
            <MediaField name="image" label="Görsel" defaultValue={row?.image} hint="Ana sayfa paneli ve detay sayfasının tam ekran kapağı. Yatay, en az 2000px genişlik önerilir." />
          </Card>
        </div>
      </div>

      <div className="card"><FormFooter /></div>
    </ActionForm>
  );
}
