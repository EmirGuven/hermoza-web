import type { MetadataRoute } from "next";
import { getLastUpdated, getPosts } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

// Search Console'a eklenecek adres: https://hermoza.com.tr/sitemap.xml
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [lastModified, posts] = await Promise.all([getLastUpdated(), getPosts()]);
  const newest = posts.reduce<Date>((d, p) => (new Date(p.updatedAt) > d ? new Date(p.updatedAt) : d), lastModified);
  return [
    { url: `${SITE_URL}/`, lastModified: newest, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: newest, changeFrequency: "weekly", priority: 0.8 },
    ...posts
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
        ...(p.image ? { images: [`${SITE_URL}${p.image.startsWith("/") ? "" : "/"}${p.image}`] } : {}),
      })),
    { url: `${SITE_URL}/cerez-politikasi`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
