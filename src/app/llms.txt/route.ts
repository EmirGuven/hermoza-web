import { getCollections, getPosts, getSetting } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

// GEO (Generative Engine Optimization): ChatGPT, Perplexity, Gemini gibi yapay zekâ asistanlarının
// firmayı doğru özetlemesi için sade metin özet. İçerik panelden yönetilen verilerden oluşur.
export async function GET() {
  const [general, contact, home, collections, journal] = await Promise.all([
    getSetting("general"),
    getSetting("contact"),
    getSetting("home"),
    getCollections(),
    getPosts(),
  ]);

  const lines = [
    `# ${general.siteName}`,
    "",
    `> ${general.seoDescription}`,
    "",
    home.bespoke.heading,
    home.bespoke.text,
    "",
    "## Hizmetler / Koleksiyonlar",
    ...collections.map((c) => `- ${c.title}: ${c.body}`),
    "",
    "## Çalışma şekli",
    "- Ücretsiz keşif: talep formu ya da telefonla; 48 saat içinde dönüş yapılır.",
    "- Mekân yerinde ölçülür, tasarım ve malzeme seçimi birlikte yapılır.",
    "- Üretim kendi atölyemizde, montaj kendi ekibimizle yapılır.",
    "",
    "## İletişim",
    contact.address && `- Adres: ${contact.address}`,
    contact.phone && `- Telefon: ${contact.phone}`,
    contact.email && `- E-posta: ${contact.email}`,
    contact.mapsUrl && `- Harita: ${contact.mapsUrl}`,
    contact.facebook && `- Facebook: ${contact.facebook}`,
    contact.instagram && `- Instagram: ${contact.instagram}`,
    "",
    "## Sayfalar",
    `- [Ana sayfa](${SITE_URL}/): koleksiyonlar, atölye yaklaşımı ve iletişim formu`,
    `- [Blog](${SITE_URL}/blog): malzeme rehberleri, proje hikâyeleri ve atölyeden notlar`,
    `- [Çerez politikası ve aydınlatma metni](${SITE_URL}/cerez-politikasi)`,
    ...(journal.length
      ? [
          "",
          "## Blog yazıları",
          ...journal.map(
            (j) => `- [${j.title}](${SITE_URL}/blog/${j.slug})${j.category ? ` (${j.category})` : ""}${j.excerpt ? `: ${j.excerpt}` : ""}`
          ),
        ]
      : []),
  ].filter((l): l is string => typeof l === "string");

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
