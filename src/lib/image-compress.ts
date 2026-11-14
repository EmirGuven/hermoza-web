import "server-only";
import sharp from "sharp";

/** Uzun kenar bundan büyükse küçültülür (retina ekranlarda tam genişlik için yeterli). */
const MAX_DIMENSION = 2560;
/** Bundan küçük ve boyutu uygun dosyalara dokunulmaz. */
const SKIP_BELOW = 500 * 1024; // 500 KB

const COMPRESSIBLE = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/**
 * Yüklenen görseli otomatik küçültür: büyük çözünürlükleri MAX_DIMENSION'a indirir,
 * telefon fotoğraflarındaki EXIF yönünü uygular ve aynı formatta yeniden sıkıştırır.
 * Uzantı (ve dolayısıyla URL / MIME) değişmez. Sonuç orijinalden büyükse orijinal kalır.
 * GIF (animasyon) ve SVG olduğu gibi bırakılır.
 */
export async function compressImage(input: Buffer, ext: string): Promise<Buffer> {
  if (!COMPRESSIBLE.includes(ext)) return input;

  try {
    const img = sharp(input, { failOn: "none", limitInputPixels: false });
    const meta = await img.metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
    if (input.length < SKIP_BELOW && longest <= MAX_DIMENSION) return input;

    let pipeline = img
      .rotate() // EXIF yönünü piksellere uygula (metadata atılınca yan dönmesin)
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true });

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
        break;
      case ".png":
        pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality: 85 });
        break;
      case ".webp":
        pipeline = pipeline.webp({ quality: 80 });
        break;
      case ".avif":
        pipeline = pipeline.avif({ quality: 60 });
        break;
    }

    const out = await pipeline.toBuffer();
    return out.length < input.length ? out : input;
  } catch (err) {
    // Bozuk / desteklenmeyen dosyada yüklemeyi engelleme, orijinali kaydet
    console.error("Görsel sıkıştırılamadı, orijinal kaydediliyor:", err);
    return input;
  }
}
