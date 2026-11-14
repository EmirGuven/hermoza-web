import "server-only";
import { getCollections, getLastUpdated, getPosts } from "@/lib/content";
import { SITE_URL, absUrl } from "@/lib/site";

// Sitemap: sitemap.xml bir dizindir; altında Sayfalar, Koleksiyonlar ve Blog ayrı sitemap'lerdir.
// Botlar içindir; insanlar için okunur sürüm: /site-haritasi sayfası.

type Entry = { path: string; lastmod: Date; images?: string[] };
export type SitemapGroup = "sayfalar" | "koleksiyonlar" | "blog";

export const SITEMAP_GROUPS: { key: SitemapGroup; title: string }[] = [
  { key: "sayfalar", title: "Sayfalar" },
  { key: "koleksiyonlar", title: "Koleksiyonlar" },
  { key: "blog", title: "Blog" },
];

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const day = (d: Date) => new Date(d).toISOString();
const latest = (dates: Date[], fallback: Date) =>
  dates.reduce((a, b) => (new Date(b) > a ? new Date(b) : a), new Date(fallback));

async function entries(group: SitemapGroup): Promise<Entry[]> {
  const [updated, posts, collections] = await Promise.all([getLastUpdated(), getPosts(), getCollections()]);
  const postsUpdated = latest(posts.map((p) => p.updatedAt), updated);
  if (group === "sayfalar")
    return [
      { path: "/", lastmod: postsUpdated, images: collections.map((c) => c.image) },
      { path: "/hakkimizda", lastmod: updated },
      { path: "/iletisim", lastmod: updated },
      { path: "/blog", lastmod: postsUpdated },
      { path: "/site-haritasi", lastmod: postsUpdated },
      { path: "/cerez-politikasi", lastmod: updated },
    ];
  if (group === "koleksiyonlar")
    return collections
      .filter((c) => c.slug)
      .map((c) => ({ path: `/koleksiyonlar/${c.slug}`, lastmod: updated, images: [c.image, ...c.gallery.map((g) => g.src)] }));
  return posts
    .filter((p) => p.slug)
    .map((p) => ({ path: `/blog/${p.slug}`, lastmod: p.updatedAt, images: [p.image] }));
}

const HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n';

export async function sitemapXml(group: SitemapGroup): Promise<string> {
  const list = await entries(group);
  const urls = list
    .map((e) => {
      const imgs = [...new Set((e.images ?? []).filter(Boolean))]
        .map((src) => `\n    <image:image><image:loc>${esc(absUrl(src))}</image:loc></image:image>`)
        .join("");
      return `  <url>\n    <loc>${esc(SITE_URL + e.path)}</loc>\n    <lastmod>${day(e.lastmod)}</lastmod>${imgs}\n  </url>`;
    })
    .join("\n");
  return `${HEAD}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`;
}

export async function sitemapIndexXml(): Promise<string> {
  const items = await Promise.all(
    SITEMAP_GROUPS.map(async (g) => {
      const list = await entries(g.key);
      const lastmod = latest(list.map((e) => e.lastmod), new Date(0));
      return `  <sitemap>\n    <loc>${esc(`${SITE_URL}/sitemap-${g.key}.xml`)}</loc>\n    <lastmod>${day(lastmod)}</lastmod>\n  </sitemap>`;
    })
  );
  return `${HEAD}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("\n")}\n</sitemapindex>\n`;
}

export const xmlResponse = (body: string) =>
  new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
