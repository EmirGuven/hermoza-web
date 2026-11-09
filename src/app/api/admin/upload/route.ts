import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { getAdmin } from "@/lib/session";
import { kindOf, mediaUrl, mimeOf, resolveUpload, slugifyFileName } from "@/lib/media";

const MAX_IMAGE = 15 * 1024 * 1024; // 15 MB
const MAX_VIDEO = 60 * 1024 * 1024; // 60 MB (videolar önce sıkıştırılmalı)

// Panelden dosya yükleme. Oturum kontrolü burada yapılır (proxy sadece sayfaları korur).
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Oturum gerekli" }, { status: 401 });

  const form = await req.formData();
  const files = form.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return Response.json({ error: "Dosya seçilmedi" }, { status: 400 });

  const saved = [];
  for (const file of files) {
    const kind = kindOf(file.name);
    if (kind === "other") {
      return Response.json({ error: `${file.name}: desteklenmeyen dosya türü` }, { status: 400 });
    }
    const limit = kind === "video" ? MAX_VIDEO : MAX_IMAGE;
    if (file.size > limit) {
      return Response.json(
        { error: `${file.name}: en fazla ${Math.round(limit / 1024 / 1024)} MB olabilir` },
        { status: 413 }
      );
    }

    const dir = kind === "video" ? "videos" : "images";
    const { base, ext } = slugifyFileName(file.name);
    // Aynı ad varsa sonuna -2, -3 … ekle
    let rel = `${dir}/${base}${ext}`;
    for (let i = 2; ; i++) {
      const full = resolveUpload(rel)!;
      try {
        await stat(full);
        rel = `${dir}/${base}-${i}${ext}`;
      } catch {
        break;
      }
    }
    const full = resolveUpload(rel);
    if (!full) return Response.json({ error: "Geçersiz dosya adı" }, { status: 400 });

    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, Buffer.from(await file.arrayBuffer()));

    const [row] = await db
      .insert(media)
      .values({ path: rel, kind, mime: mimeOf(rel), size: file.size, originalName: file.name })
      .returning();
    saved.push({ ...row, url: mediaUrl(rel) });
  }

  return Response.json({ files: saved });
}
