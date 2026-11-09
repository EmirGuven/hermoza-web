"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";

/**
 * Çerez onayı ve bülten açılır penceresi.
 * - "hermoza_consent" çerezi: seçilen kategoriler, ör. "zorunlu" ya da "zorunlu.olcum.pazarlama" (180 gün)
 * - Bülten penceresi: tercih yapıldıktan sonra, sayfada bir süre gezinince bir kez açılır ("hermoza_nl" çerezi)
 * Diğer kodlar onaya göre davranmak için hasConsent("olcum" | "pazarlama") kullanabilir.
 */
const CONSENT = "hermoza_consent";
const NL_SEEN = "hermoza_nl";

type Category = "olcum" | "pazarlama";

function readCookie(name: string) {
  return document.cookie.split("; ").find((c) => c.startsWith(name + "="))?.split("=")[1] ?? "";
}
function writeCookie(name: string, value: string, days: number) {
  document.cookie = `${name}=${value}; Max-Age=${days * 86400}; Path=/; SameSite=Lax`;
}

const listeners = new Set<() => void>();
const consentStore = {
  get: () => readCookie(CONSENT),
  set: (cats: Category[]) => {
    writeCookie(CONSENT, ["zorunlu", ...cats].join("."), 180);
    listeners.forEach((l) => l());
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

/** Ziyaretçi bu kategoriye onay verdi mi? (tarayıcıda çağrılmalı) */
export function hasConsent(cat: Category) {
  return readCookie(CONSENT).split(".").includes(cat);
}

function Toggle({
  label,
  checked,
  locked,
  onChange,
}: {
  label: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className={`flex items-center gap-2 text-[12.5px] ${locked ? "cursor-not-allowed text-white/60" : "cursor-pointer text-white/90"}`}>
      <span className="relative inline-flex">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={locked}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span
          className={`h-5 w-9 rounded-full transition-colors ${
            locked ? "bg-white/25" : checked ? "bg-rust" : "bg-white/15"
          } peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-clay`}
        />
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          } ${locked ? "opacity-70" : ""}`}
        />
      </span>
      {label}
    </label>
  );
}

export function CookieConsent({ newsletterPopup }: { newsletterPopup: boolean }) {
  // Sunucuda "?" döner: pencere ilk HTML'de çizilmez, tarayıcıda karar verilir
  const consent = useSyncExternalStore(consentStore.subscribe, consentStore.get, () => "?");
  const [olcum, setOlcum] = useState(false);
  const [pazarlama, setPazarlama] = useState(false);
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    if (!newsletterPopup || !consent || consent === "?" || readCookie(NL_SEEN)) return;
    // Sayfada 25 sn geçirince ya da sayfanın yarısına inince bir kez göster
    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setPopup(true);
      writeCookie(NL_SEEN, "1", 60);
    };
    const timer = setTimeout(show, 25000);
    const onScroll = () => {
      if (window.scrollY > document.body.scrollHeight * 0.5) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [consent, newsletterPopup]);

  const selected = (): Category[] => [...(olcum ? ["olcum" as const] : []), ...(pazarlama ? ["pazarlama" as const] : [])];
  const custom = olcum || pazarlama;

  return (
    <>
      <AnimatePresence>
        {consent === "" && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="false"
            aria-labelledby="cookie-title"
            className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-h-[80svh] max-w-[720px] overflow-y-auto bg-[#262626]/95 p-5 font-sans text-white shadow-2xl backdrop-blur-md md:bottom-5 md:p-6"
          >
            <h2 id="cookie-title" className="mb-2.5 text-sm font-semibold tracking-wide">
              Çerez Tercihleriniz
            </h2>
            <div className="space-y-2 text-[12.5px] font-light leading-relaxed text-white/80">
              <p>
                Hermoza Kitchen &amp; Atelier olarak sitemizin güvenli ve sorunsuz çalışması için zorunlu
                çerezler kullanıyoruz. Onay vermeniz halinde, hangi koleksiyonların ilginizi çektiğini anlamak
                için <strong className="font-semibold text-white">ölçüm</strong>, size yeni projelerimizi ve
                özel davetlerimizi ulaştırabilmek için de <strong className="font-semibold text-white">pazarlama</strong>{" "}
                çerezlerinden yararlanırız. Ayrıntılar{" "}
                <Link href="/cerez-politikasi" className="underline underline-offset-2 hover:text-clay">
                  çerez politikamızda
                </Link>
                .
              </p>
              <p>
                Tercihinizi dilediğiniz zaman sayfanın altındaki “Çerez politikası” bağlantısından
                değiştirebilirsiniz; onay vermemeniz siteyi gezmenize engel olmaz.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              <Toggle label="Zorunlu" checked locked />
              <Toggle label="Ölçüm" checked={olcum} onChange={setOlcum} />
              <Toggle label="Pazarlama" checked={pazarlama} onChange={setPazarlama} />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/cerez-politikasi"
                className="rounded-full bg-white/15 px-5 py-2 text-center text-[12.5px] font-semibold transition-colors hover:bg-white/25"
              >
                Daha fazla bilgi
              </Link>
              <div className="flex flex-col gap-2 sm:flex-row">
                {custom ? (
                  <button
                    type="button"
                    onClick={() => consentStore.set(selected())}
                    className="rounded-full bg-white/15 px-5 py-2 text-[12.5px] font-semibold transition-colors hover:bg-white/25"
                  >
                    Seçimimi kaydet
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => consentStore.set([])}
                    className="rounded-full bg-white/15 px-5 py-2 text-[12.5px] font-semibold transition-colors hover:bg-white/25"
                  >
                    Tümünü reddet
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => consentStore.set(["olcum", "pazarlama"])}
                  className="rounded-full bg-rust px-5 py-2 text-[12.5px] font-semibold transition-colors hover:bg-rust/85"
                >
                  Tümünü kabul et
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => e.target === e.currentTarget && setPopup(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-label="Bülten"
              className="relative w-full max-w-md bg-forest p-8 text-white shadow-2xl md:p-10"
            >
              <button
                type="button"
                onClick={() => setPopup(false)}
                aria-label="Kapat"
                className="absolute right-4 top-4 text-white/60 hover:text-white"
              >
                <X className="size-5" strokeWidth={1.25} />
              </button>
              <p className="mb-4 text-[10px] uppercase tracking-[0.5em] text-clay">Bülten</p>
              <h2 className="mb-4 text-2xl font-extralight uppercase tracking-[0.12em]">Atölyeden ilk siz haberdar olun</h2>
              <p className="mb-8 text-sm font-light leading-relaxed text-white/65">
                Yeni koleksiyonlar, tamamlanan projeler, showroom davetleri ve malzeme rehberleri.
                Ayda birkaç kez, sizi yormadan.
              </p>
              <NewsletterForm source="popup" onDone={() => setTimeout(() => setPopup(false), 2500)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
