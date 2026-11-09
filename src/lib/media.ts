import "server-only";
import path from "node:path";

/** Yüklenen dosyaların kök klasörü. Sunucuda Docker volume olarak bağlanır. */
// turbopackIgnore: build, bu çalışma zamanı klasörünü izleyip tüm projeyi imaja katmasın
export const UPLOAD_ROOT = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR ?? "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

export const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];
export const VIDEO_EXT = [".mp4", ".webm", ".mov"];

export function mimeOf(file: string) {
  return MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

export function kindOf(file: string): "image" | "video" | "other" {
  const ext = path.extname(file).toLowerCase();
  if (IMAGE_EXT.includes(ext)) return "image";
  if (VIDEO_EXT.includes(ext)) return "video";
  return "other";
}

/** Göreli yolu UPLOAD_ROOT altına güvenli şekilde çözer (../ ile dışarı çıkmayı engeller). */
export function resolveUpload(rel: string): string | null {
  const full = path.resolve(UPLOAD_ROOT, rel);
  if (full !== UPLOAD_ROOT && !full.startsWith(UPLOAD_ROOT + path.sep)) return null;
  return full;
}

/** Türkçe karakterleri sadeleştirip dosya adını URL dostu yapar. */
export function slugifyFileName(name: string) {
  const ext = path.extname(name).toLowerCase();
  const base = path
    .basename(name, path.extname(name))
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "dosya";
  return { base, ext };
}

export const mediaUrl = (rel: string) => `/media/${rel.split(path.sep).join("/")}`;
