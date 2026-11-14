import "server-only";
import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { resolveUpload } from "@/lib/media";

// Paylaşım kartı (WhatsApp, LinkedIn, X, Instagram DM…): kapak fotoğrafı + başlık + Hermoza imzası, 1200x630.
export const OG_SIZE = { width: 1200, height: 630 };

/** /media/... görselini diskten okuyup kart için JPEG data URL'ine çevirir (webp/png/büyük dosyalar dahil) */
async function mediaDataUrl(src: string, width: number, height: number, fit: "cover" | "inside" = "cover") {
  if (!src?.startsWith("/media/")) return null;
  const file = resolveUpload(decodeURIComponent(src.replace(/^\/media\//, "")));
  if (!file) return null;
  try {
    const buf = await readFile(file);
    // Kapakta yazı okunsun diye alttan koyu yeşil geçiş fotoğrafın üstüne işlenir
    const shade = Buffer.from(
      `<svg width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">` +
        `<stop offset="0" stop-color="#081614" stop-opacity="0.93"/><stop offset="0.4" stop-color="#081614" stop-opacity="0.6"/>` +
        `<stop offset="0.72" stop-color="#081614" stop-opacity="0.18"/><stop offset="1" stop-color="#081614" stop-opacity="0.4"/>` +
        `</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`
    );
    const out =
      fit === "cover"
        ? await sharp(buf)
            .rotate()
            .resize(width, height, { fit: "cover" })
            .composite([{ input: shade }])
            .jpeg({ quality: 82 })
            .toBuffer()
        : await sharp(buf).resize(width, height, { fit: "inside" }).png().toBuffer();
    return `data:image/${fit === "cover" ? "jpeg" : "png"};base64,${out.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Montserrat (Türkçe karakterli) — Google Fonts'tan yalnızca gereken harflerle TTF olarak alınır */
async function font(weight: number, text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Montserrat:wght@${weight}&text=${encodeURIComponent(text)}`, {
        signal: AbortSignal.timeout(5000),
      })
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url, { signal: AbortSignal.timeout(5000) })).arrayBuffer();
  } catch {
    return null;
  }
}

export async function ogImage({
  title,
  eyebrow,
  image,
  logo,
}: {
  title: string;
  eyebrow: string;
  image: string;
  logo: string;
}) {
  const text = `${title}${eyebrow}HERMOZA KITCHEN & ATELIER`.toLocaleUpperCase("tr-TR") + title + eyebrow;
  const [bg, mark, light, regular] = await Promise.all([
    mediaDataUrl(image, OG_SIZE.width, OG_SIZE.height),
    mediaDataUrl(logo, 360, 130, "inside"),
    font(200, text),
    font(400, text),
  ]);
  const fonts = [
    ...(light ? [{ name: "Montserrat", data: light, weight: 200 as const }] : []),
    ...(regular ? [{ name: "Montserrat", data: regular, weight: 400 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0d2622",
          fontFamily: fonts.length ? "Montserrat" : "sans-serif",
        }}
      >
        {bg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bg} alt="" width={OG_SIZE.width} height={OG_SIZE.height} style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", left: 72, right: 72, bottom: 64, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 18, fontWeight: 400, letterSpacing: 9, color: "#c9957d", marginBottom: 22 }}>
            {eyebrow.toLocaleUpperCase("tr-TR")}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 40 ? 46 : 58,
              fontWeight: 200,
              letterSpacing: title.length > 40 ? 3 : 10,
              lineHeight: 1.2,
              color: "#fff",
              maxWidth: 940,
            }}
          >
            {title.length > 40 ? title : title.toLocaleUpperCase("tr-TR")}
          </div>
        </div>
        {mark ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mark} alt="" height={64} style={{ position: "absolute", top: 56, left: 72 }} />
        ) : (
          <div style={{ position: "absolute", top: 60, left: 72, display: "flex", fontSize: 22, letterSpacing: 8, color: "#fff" }}>
            HERMOZA
          </div>
        )}
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
