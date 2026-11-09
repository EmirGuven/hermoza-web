import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { collections } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { saveCollection } from "@/app/admin/actions";
import { ActionForm, FormFooter } from "@/components/admin/action-form";
import { MediaField } from "@/components/admin/media-field";
import { Card, PageHead, Switch, TextArea, TextField } from "@/components/admin/ui";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function CollectionEdit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "yeni";
  const row = isNew
    ? null
    : await db.query.collections.findFirst({ where: eq(collections.id, Number(id) || 0) });
  if (!isNew && !row) notFound();

  return (
    <ActionForm action={saveCollection} className="stack">
      <PageHead title={isNew ? "Yeni koleksiyon" : row!.title}>
        <Link href="/admin/koleksiyonlar" className="btn"><ArrowLeft /> Listeye dön</Link>
      </PageHead>
      <input type="hidden" name="id" value={row?.id ?? ""} />
      <Card>
        <div className="grid-2">
          <div className="stack">
            <TextField label="Başlık" name="title" defaultValue={row?.title} required />
            <TextArea label="Açıklama" name="body" defaultValue={row?.body} rows={4} />
            <div className="grid-2">
              <TextField label="Bağlantı yazısı" name="linkLabel" defaultValue={row?.linkLabel ?? "Keşfet"} />
              <TextField label="Bağlantı adresi" name="linkHref" defaultValue={row?.linkHref ?? "#iletisim"} />
            </div>
            <Switch name="active" label="Sitede göster" defaultChecked={row?.active ?? true} />
          </div>
          <MediaField name="image" label="Görsel" defaultValue={row?.image} hint="Yatay ya da dikey, en az 1600px genişlik önerilir." />
        </div>
      </Card>
      <div className="card"><FormFooter /></div>
    </ActionForm>
  );
}
