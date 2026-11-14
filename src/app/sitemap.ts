import type { MetadataRoute } from "next";
import { getCollections, getLastUpdated, getPosts } from "@/lib/content";
import { SITE_URL, absUrl } from "@/lib/site";

// Search Console'a eklenecek adres: https://hermoza.com.tr/sitemap.xml
// Görseller de listelenir (Google Görseller ve yapay zeka aramaları için).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [lastModified, posts, collections] = await Promise.all([getLastUpdated(), getPosts(), getCollections()]);
  const newest = posts.reduce<Date>((d, p) => (new Date(p.updatedAt) > d ? new Date(p.updatedAt) : d), lastModified);
  const img = (list: string[]) => {
    const urls = [...new Set(list.filter(Boolean))].map((s) => absUrl(s));
    return urls.length ? { images: urls } : {};
  };

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: newest,
      changeFrequency: "weekly",
      priority: 1,
      ...img(collections.map((c) => c.image)),
    },
    ...collections
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${SITE_URL}/koleksiyonlar/${c.slug}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.9,
        ...img([c.image, ...c.gallery.map((g) => g.src)]),
      })),
    { url: `${SITE_URL}/hakkimizda`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/iletisim`, lastModified, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: newest, changeFrequency: "weekly", priority: 0.7 },
    ...posts
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        ...img([p.image]),
      })),
    { url: `${SITE_URL}/cerez-politikasi`, lastModified, changeFrequency: "yearly", priority: 0.1 },
  ];
}
