import "server-only";
import { SITE_URL } from "@/lib/site";

/**
 * IndexNow: sayfa eklenince/değişince Bing, Yandex ve diğer arama motorlarına anında haber verir
 * (ChatGPT arama sonuçları Bing'i kullanır). Doğrulama dosyası: public/<anahtar>.txt
 * Yalnızca canlı adreste (https, localhost değil) çalışır; hata siteyi etkilemez.
 */
const KEY = "6670e25a879fb04c84316530fe45bffa";

export async function pingIndexNow(paths: string[]) {
  if (!SITE_URL.startsWith("https://") || SITE_URL.includes("localhost")) return;
  const host = new URL(SITE_URL).host;
  const urlList = [...new Set(paths)].map((p) => `${SITE_URL}${p}`);
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok && res.status !== 202) console.error("[indexnow] yanıt:", res.status);
  } catch (e) {
    console.error("[indexnow] gönderilemedi:", (e as Error).message);
  }
}
