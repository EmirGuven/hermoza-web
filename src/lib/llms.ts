import "server-only";
import { BRAND_PILLARS, BRAND_PROCESS, BRAND_STORY, BRAND_TAGLINE, faqWithAddress } from "@/lib/brand";
import { getCollections, getPosts, getSetting } from "@/lib/content";
import { plainText } from "@/lib/markdown";
import { SITE_URL } from "@/lib/site";

// GEO (Generative Engine Optimization): ChatGPT, Claude, Perplexity, Gemini gibi yapay zeka asistanlarının
// firmayı doğru tanıması için sade metin. llms.txt: özet + bağlantılar; llms-full.txt: tüm içeriğin tam metni.
// Biçim: https://llmstxt.org — tüm bilgiler panelden yönetilen içerikten ve lib/brand.ts'ten gelir.

export async function buildLlms(full: boolean): Promise<string> {
  const [general, contact, collections, posts] = await Promise.all([
    getSetting("general"),
    getSetting("contact"),
    getCollections(),
    getPosts(),
  ]);
  const faq = faqWithAddress(contact.address);
  const L: (string | false | undefined)[] = [];
  const push = (...x: (string | false | undefined)[]) => L.push(...x);

  push(
    `# ${general.siteName}`,
    "",
    `> ${general.seoDescription}`,
    "",
    `${general.siteName}: ${BRAND_TAGLINE.toLocaleLowerCase("tr-TR")}. İstanbul merkezli tasarım ve üretim atölyesi. Web sitesi: ${SITE_URL}`,
    "",
    "## Marka",
    ...BRAND_STORY.map((p) => `- ${p}`),
    "",
    "## İlkeler",
    ...BRAND_PILLARS.map((p) => `- ${p.title}: ${p.text}`),
    "",
    "## Koleksiyonlar",
    ...collections.map(
      (c) => `- [${c.title}](${SITE_URL}/koleksiyonlar/${c.slug})${c.subtitle ? ` — ${c.subtitle.replace(/[.!]$/, "")}` : ""}: ${c.body}`
    ),
    ""
  );

  if (full) {
    for (const c of collections) {
      push(`### ${c.title}`, "", c.body, "");
      if (c.content) push(plainText(c.content), "");
      if (c.highlights.length) push("Detaylar:", ...c.highlights.map((h) => `- ${h}`), "");
      push(`Sayfa: ${SITE_URL}/koleksiyonlar/${c.slug}`, "");
    }
  }

  push(
    "## Çalışma şekli",
    ...BRAND_PROCESS.map((p, i) => `${i + 1}. ${p.title}: ${p.text}`),
    "- Keşif ücretsizdir; taleplere 48 saat içinde dönüş yapılır.",
    "",
    "## Sık sorulan sorular",
    ...faq.flatMap((f) => [`### ${f.q}`, f.a, ""]),
    "## İletişim",
    contact.address && `- Showroom: ${contact.address}`,
    contact.phone && `- Telefon: ${contact.phone}`,
    contact.email && `- E-posta: ${contact.email}`,
    contact.mapsUrl && `- Harita: ${contact.mapsUrl}`,
    contact.instagram && `- Instagram: ${contact.instagram}`,
    contact.facebook && `- Facebook: ${contact.facebook}`,
    `- Randevu ve iletişim formu: ${SITE_URL}/iletisim`,
    "",
    "## Sayfalar",
    `- [Ana sayfa](${SITE_URL}/): koleksiyonlar, atölye yaklaşımı ve iletişim`,
    `- [Hakkımızda](${SITE_URL}/hakkimizda): marka hikayesi, ilkeler, süreç ve sık sorulan sorular`,
    `- [İletişim](${SITE_URL}/iletisim): showroom adresi ve randevu talebi`,
    `- [Blog](${SITE_URL}/blog): malzeme rehberleri, proje hikayeleri ve atölyeden notlar`,
    ...(full ? [] : [`- [Tam metin (llms-full.txt)](${SITE_URL}/llms-full.txt): tüm koleksiyon ve blog içeriği`]),
    ""
  );

  if (posts.length) {
    push("## Blog yazıları");
    for (const p of posts) {
      push(`- [${p.title}](${SITE_URL}/blog/${p.slug})${p.category ? ` (${p.category})` : ""}${p.excerpt ? `: ${p.excerpt}` : ""}`);
      if (full && p.content) push("", plainText(p.content), "");
    }
    push("");
  }

  return L.filter((l): l is string => typeof l === "string").join("\n").replace(/\n{3,}/g, "\n\n") + "\n";
}
