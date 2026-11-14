"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { HermozaLogo } from "@/components/hermoza-logo";
import { phoneDigits, type ContactSettings, type GeneralSettings } from "@/lib/content-types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function SiteHeader({
  general,
  contact,
  home = true,
}: {
  general: GeneralSettings;
  contact: ContactSettings;
  /** Ana sayfa dışında (blog vb.) false: "#bolum" bağlantıları ana sayfadaki bölüme gider */
  home?: boolean;
}) {
  const links = general.menuLinks;
  const fix = (href: string) => (!home && href.startsWith("#") ? `/${href}` : href);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // iPhone çentik alanı header ile aynı renkte olsun: mobilde kaydırınca beyaz, üstteyken koyu yeşil
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const color = mobile && scrolled && !open ? "#ffffff" : "#0d2622";
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", color));
    // Safari bazı sürümlerde sayfa zeminine bakar: html zemini de aynı renge çekilir (üst kaydırma taşması)
    document.documentElement.style.backgroundColor = mobile && scrolled && !open ? "#ffffff" : "";
  }, [scrolled, open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        // Kaydırınca: mobilde beyaz zemin + koyu yeşil yazı/logo, masaüstünde koyu yeşil zemin + beyaz
        className={`fixed inset-x-0 top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center px-6 transition-[height,background-color,color,box-shadow] duration-500 md:px-12 ${
          scrolled
            ? "h-16 bg-white text-forest-deep shadow-[0_1px_0_rgb(21_58_52/0.08)] md:bg-forest-deep/85 md:text-white md:shadow-none md:backdrop-blur-md"
            : "h-20 bg-black/10 text-white backdrop-blur-[2px]"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="group flex w-fit items-center gap-4 text-[11px] uppercase tracking-[0.3em] opacity-75 transition-opacity hover:opacity-100"
        >
          <span className="flex w-7 flex-col gap-[5px]">
            <span className="h-px w-full bg-current" />
            <span className="h-px w-2/3 bg-current transition-all group-hover:w-full" />
          </span>
          <span className="hidden sm:inline">Menü</span>
        </button>
        <a href={home ? "#" : "/"} aria-label="Hermoza ana sayfa" className="relative block">
          <Image
            src={general.logo}
            alt={general.siteName}
            width={212}
            height={522}
            priority
            className={`w-auto transition-[height,opacity] duration-500 ${scrolled ? "h-9 max-md:opacity-0" : "h-11"}`}
          />
          {/* Mobilde kaydırınca beyaz zeminde logo koyu yeşil: aynı logo maske olarak kullanılıp boyanır */}
          <span
            aria-hidden
            className={`absolute inset-0 bg-forest-deep transition-opacity duration-500 md:hidden ${scrolled ? "opacity-100" : "opacity-0"}`}
            style={{
              WebkitMaskImage: `url("${general.logo}")`,
              maskImage: `url("${general.logo}")`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </a>
        <a
          href={fix(general.headerCtaHref)}
          className="justify-self-end text-[11px] uppercase tracking-[0.3em] opacity-75 transition-opacity hover:opacity-100"
        >
          {general.headerCtaLabel}
        </a>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menüsü"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="fixed inset-0 z-[60] grid bg-forest text-white md:grid-cols-[1.2fr_1fr]"
          >
            <div className="flex flex-col px-6 py-6 md:px-12">
              <div className="flex items-center justify-between">
                <HermozaLogo />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/70 hover:text-white"
                >
                  Kapat <X className="size-5" strokeWidth={1.25} />
                </button>
              </div>
              <nav className="my-auto py-12">
                <ul className="space-y-2 md:space-y-4">
                  {links.map((l, i) => (
                    <motion.li
                      key={l.href + l.label}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.07, duration: 0.8, ease: EASE }}
                    >
                      <a
                        href={fix(l.href)}
                        onClick={() => setOpen(false)}
                        className="group flex items-baseline gap-6 text-4xl font-extralight uppercase tracking-[0.12em] transition-colors hover:text-clay md:text-6xl"
                      >
                        <span className="text-xs font-light tracking-[0.3em] text-clay/70">
                          0{i + 1}
                        </span>
                        {l.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="flex flex-wrap gap-x-10 gap-y-2 text-xs font-light tracking-wide text-white/50">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a>
                )}
                {contact.phone && (
                  <a href={`tel:+${phoneDigits(contact.phone)}`} className="hover:text-white">{contact.phone}</a>
                )}
              </div>
            </div>
            <div className="relative hidden md:block">
              {general.menuImage && (
              <Image
                src={general.menuImage}
                alt=""
                fill
                sizes="45vw"
                className="object-cover"
              />
              )}
              <div className="absolute inset-0 bg-forest-deep/30" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
