import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const PRIVATE = ["/admin", "/api/", "/bulten/"];

// GEO: yapay zeka arama ve asistan botlarına site açıkça açılır (ChatGPT, Claude, Perplexity, Gemini, Apple…).
// Hepsi zaten "*" kuralına uyar; ayrı ayrı yazmak niyeti netleştirir ve bazı botlar yalnızca kendi adına bakar.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  "DuckAssistBot",
  "meta-externalagent",
  "MistralAI-User",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: ["/", "/llms.txt", "/llms-full.txt"], disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
