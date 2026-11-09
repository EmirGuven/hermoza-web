import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { journalPosts } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { saveJournal } from "@/app/admin/actions";
import { ActionForm, FormFooter } from "@/components/admin/action-form";
import { MediaField } from "@/components/admin/media-field";
import { Card, PageHead, Switch, TextField } from "@/components/admin/ui";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function JournalEdit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "yeni";
  const row = isNew
    ? null
    : await db.query.journalPosts.findFirst({ where: eq(journalPosts.id, Number(id) || 0) });
  if (!isNew && !row) notFound();

  return (
    <ActionForm action={saveJournal} className="stack">
      <PageHead title={isNew ? "Yeni yazı" : row!.title}>
        <Link href="/admin/journal" className="btn"><ArrowLeft /> Listeye dön</Link>
      </PageHead>
      <input type="hidden" name="id" value={row?.id ?? ""} />
      <Card>
        <div className="grid-2">
          <div className="stack">
            <TextField label="Başlık" name="title" defaultValue={row?.title} required />
            <TextField label="Kategori" name="category" defaultValue={row?.category} placeholder="Malzeme, Proje, Rehber…" />
            <TextField
              label="Bağlantı"
              name="href"
              defaultValue={row?.href}
              placeholder="https://… (isteğe bağlı)"
              hint="Doluysa karta tıklayınca bu adres açılır (ör. Instagram gönderisi)."
            />
            <Switch name="active" label="Sitede göster" defaultChecked={row?.active ?? true} />
          </div>
          <MediaField name="image" label="Görsel" defaultValue={row?.image} />
        </div>
      </Card>
      <div className="card"><FormFooter /></div>
    </ActionForm>
  );
}
