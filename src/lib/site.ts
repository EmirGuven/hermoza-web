/**
 * Sitenin herkese açık adresi (sitemap, robots, kanonik adres, paylaşım kartları, mailler).
 * Sitemap gibi sayfalar BUILD sırasında üretildiği için bu değer build anında okunur:
 * üretim build'inde SITE_URL verilmemişse canlı alan adı kullanılır, localhost sadece geliştirmede.
 */
export const SITE_URL = (
  process.env.SITE_URL ||
  (process.env.NODE_ENV === "production" ? "https://hermoza.com.tr" : "http://localhost:3000")
).replace(/\/$/, "");

export const absUrl = (path: string) =>
  /^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
