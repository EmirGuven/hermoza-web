"use client";

import { useRouter } from "next/navigation";

/** Çerez tercihini siler ve ana sayfaya döner; tercih penceresi tekrar açılır. */
export function CookieReset() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        document.cookie = "hermoza_consent=; Max-Age=0; Path=/";
        router.push("/");
      }}
      className="mt-4 bg-forest px-7 py-3 text-[11px] uppercase tracking-[0.25em] text-white transition-colors hover:bg-forest-deep"
    >
      Çerez tercihlerimi değiştir
    </button>
  );
}
