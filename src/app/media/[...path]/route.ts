import { open, stat } from "node:fs/promises";
import { mimeOf, resolveUpload } from "@/lib/media";

/** Dosyanın [start, end] aralığını parça parça okuyan akış. İstemci bağlantıyı keserse
 *  (video ileri sarma vb.) cancel ile dosya kapanır; hata fırlatmaz. */
function fileStream(file: string, start: number, end: number): ReadableStream<Uint8Array> {
  let fh: Awaited<ReturnType<typeof open>> | undefined;
  let pos = start;
  const CHUNK = 256 * 1024;
  const close = async () => {
    const h = fh;
    fh = undefined;
    await h?.close().catch(() => {});
  };
  return new ReadableStream({
    async start() {
      fh = await open(file, "r");
    },
    async pull(controller) {
      const len = Math.min(CHUNK, end - pos + 1);
      if (!fh || len <= 0) {
        await close();
        controller.close();
        return;
      }
      const buf = Buffer.alloc(len);
      const { bytesRead } = await fh.read(buf, 0, len, pos);
      if (!bytesRead) {
        await close();
        controller.close();
        return;
      }
      pos += bytesRead;
      controller.enqueue(new Uint8Array(buf.buffer, buf.byteOffset, bytesRead));
    },
    cancel: close,
  });
}

// Yüklenen dosyaları (görsel, video) UPLOAD_DIR'den servis eder.
// Videolar için Range isteklerini destekler (Safari ve ileri sarma bunu ister).
export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await params;
  const file = resolveUpload(parts.map(decodeURIComponent).join("/"));
  if (!file) return new Response("Geçersiz yol", { status: 400, headers: { "Cache-Control": "no-store" } });

  let size: number;
  let mtime: Date;
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error("dosya değil");
    size = s.size;
    mtime = s.mtime;
  } catch {
    // 404 önbelleğe alınmasın: Cloudflare aksi halde saatlerce "yok" der, sonradan yüklenen dosya görünmez
    return new Response("Bulunamadı", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const etag = `W/"${size.toString(16)}-${mtime.getTime().toString(16)}"`;
  const headers = new Headers({
    "Content-Type": mimeOf(file),
    "Accept-Ranges": "bytes",
    "Last-Modified": mtime.toUTCString(),
    ETag: etag,
    // Aynı adla dosya değişebilir (panelden üzerine yükleme), o yüzden kısa önbellek + yeniden doğrulama
    "Cache-Control": "public, max-age=3600, must-revalidate",
  });

  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }

  const range = req.headers.get("range");
  const m = range?.match(/^bytes=(\d*)-(\d*)$/);
  if (m) {
    let start = m[1] ? Number(m[1]) : NaN;
    let end = m[2] ? Number(m[2]) : size - 1;
    if (Number.isNaN(start)) {
      // bytes=-500 → son 500 bayt
      start = Math.max(0, size - Number(m[2]));
      end = size - 1;
    }
    end = Math.min(end, size - 1);
    if (start > end || start >= size) {
      headers.set("Content-Range", `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(fileStream(file, start, end), { status: 206, headers });
  }

  headers.set("Content-Length", String(size));
  return new Response(fileStream(file, 0, size - 1), { status: 200, headers });
}
