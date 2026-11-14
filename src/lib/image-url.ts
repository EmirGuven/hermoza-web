/**
 * next/image kullanılamayan yerler (video posteri gibi) için küçültülmüş görsel adresi.
 * Next'in görsel servisinden WebP ve uygun genişlikte döner. Genişlik next.config'teki deviceSizes içinde olmalı.
 */
export function optimizedImage(src: string, width: 640 | 828 | 1080 | 1280 | 1600 | 1920 = 1280, quality = 70) {
  if (!src || !src.startsWith("/")) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
