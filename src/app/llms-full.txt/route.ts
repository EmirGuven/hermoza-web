import { buildLlms } from "@/lib/llms";

// Yapay zeka asistanları için tüm içeriğin tam metni (koleksiyon açıklamaları, blog yazıları). Ayrıntı: lib/llms.ts
export async function GET() {
  return new Response(await buildLlms(true), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
