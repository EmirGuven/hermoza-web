import { SITE_URL } from "@/lib/site";

/** schema.org sayfa yolu (Google'da arama sonucunda "Ana sayfa › Blog › …" olarak görünür) */
export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Ana sayfa", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

/** JSON-LD'yi <script> içine güvenle yazmak için ("</script>" kaçışı) */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
