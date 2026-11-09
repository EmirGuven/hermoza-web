import type { MetadataRoute } from "next";
import { getLastUpdated } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

// Search Console'a eklenecek adres: https://hermoza.com.tr/sitemap.xml
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = await getLastUpdated();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/cerez-politikasi`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
