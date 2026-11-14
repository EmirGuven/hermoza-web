import { buildLlms } from "@/lib/llms";

// Yapay zeka asistanları için site özeti (https://llmstxt.org). Ayrıntı: lib/llms.ts
export async function GET() {
  return new Response(await buildLlms(false), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
