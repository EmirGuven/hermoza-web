import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { mediaUrl } from "@/lib/media";
import { PageHead } from "@/components/admin/ui";
import { MediaLibrary } from "./media-library";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function MediaPage() {
  await requireAdmin();
  const rows = await db.select().from(media).orderBy(desc(media.createdAt), desc(media.id));
  const files = rows.map((r) => ({
    id: r.id,
    path: r.path,
    url: mediaUrl(r.path),
    kind: r.kind as "image" | "video" | "other",
    size: r.size,
    originalName: r.originalName,
  }));

  return (
    <div className="stack">
      <PageHead
        title="Medya Kütüphanesi"
        description="Sitede kullanılan görseller ve videolar. Görsel en fazla 15 MB, video en fazla 60 MB."
      />
      <MediaLibrary initial={files} />
    </div>
  );
}
