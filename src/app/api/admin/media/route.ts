import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { getAdmin } from "@/lib/session";
import { mediaUrl } from "@/lib/media";

// Medya seçici için kütüphane listesi: /api/admin/media?kind=image|video
export async function GET(req: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Oturum gerekli" }, { status: 401 });
  const kind = new URL(req.url).searchParams.get("kind");
  const rows = await db
    .select()
    .from(media)
    .where(kind === "image" || kind === "video" ? eq(media.kind, kind) : undefined)
    .orderBy(desc(media.createdAt), desc(media.id));
  return Response.json({ files: rows.map((r) => ({ ...r, url: mediaUrl(r.path) })) });
}
