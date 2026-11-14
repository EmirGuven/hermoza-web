import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import path from "node:path";
import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { getAdmin } from "@/lib/session";
import { compressImage } from "@/lib/image-compress";
import { kindOf, mediaUrl, mimeOf, resolveUpload, slugifyFileName } from "@/lib/media";

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
    // Görsellerde boyut sınırı yok (kaydederken otomatik küçültülür); yalnızca videolar sınırlı
    if (kind === "video" && file.size > MAX_VIDEO) {
      return Response.json(
        { error: `${file.name}: en fazla ${Math.round(MAX_VIDEO / 1024 / 1024)} MB olabilir` },
        { status: 413 }
      );
    }

    const dir = kind === "video" ? "videos" : "images";
    const { base, ext } = slugifyFileName(file.name);
    // Aynı ad diskte ya da medya kaydında varsa sonuna -2, -3 … ekle.
    // Veritabanına da bakılır: localhost canlı veritabanına bağlıyken yüklenen bir dosyanın kaydı
    // canlıda olup dosyası olmayabilir; yalnızca diske bakmak "media_path_unique" hatasına yol açar.
    let rel = `${dir}/${base}${ext}`;
    for (let i = 2; ; i++) {
      const full = resolveUpload(rel)!;
      const onDisk = await stat(full).then(() => true, () => false);
      const inDb = onDisk
        ? true
        : !!(await db.query.media.findFirst({ columns: { id: true }, where: eq(media.path, rel) }));
      if (!onDisk && !inDb) break;
      rel = `${dir}/${base}-${i}${ext}`;
    }
    const full = resolveUpload(rel);
    if (!full) return Response.json({ error: "Geçersiz dosya adı" }, { status: 400 });

    await mkdir(path.dirname(full), { recursive: true });
    const original = Buffer.from(await file.arrayBuffer());
    // Görseller otomatik küçültülür; videolar olduğu gibi kaydedilir
    const data = kind === "image" ? await compressImage(original, ext) : original;
    await writeFile(full, data);

    let row;
    try {
      [row] = await db
        .insert(media)
        .values({ path: rel, kind, mime: mimeOf(rel), size: data.length, originalName: file.name })
        .returning();
    } catch (e) {
      // Kayıt olmadıysa diskte sahipsiz dosya bırakma
      await unlink(full).catch(() => {});
      console.error("[upload] medya kaydı oluşturulamadı:", (e as Error).message);
      return Response.json({ error: `${file.name}: kaydedilemedi, lütfen tekrar deneyin` }, { status: 500 });
    }
    saved.push({ ...row, url: mediaUrl(rel) });
  }

  return Response.json({ files: saved });
}
