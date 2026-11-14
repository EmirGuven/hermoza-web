import { sitemapIndexXml, xmlResponse } from "@/lib/sitemap";

// Search Console'a eklenecek adres: https://hermoza.com.tr/sitemap.xml (alt sitemap'lerin dizini)
export async function GET() {
  return xmlResponse(await sitemapIndexXml());
}
