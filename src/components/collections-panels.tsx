"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Collection } from "@/lib/content-types";

const isExternal = (href: string) => /^https?:\/\//.test(href);
const isMobile = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

/**
 * Koleksiyon panelleri (globals.css → .cx-*).
 * Masaüstü: yan yana; üzerine gelinen panel CSS ile genişler.
 * Mobil: yine yan yana; açık panel geniş, diğerleri ince dikey şerit. Kapalı panele ilk dokunuş açar,
 * açık panele dokunmak bağlantıya gider. Açık panel data-open ile işaretlenir (yalnızca mobilde kullanılır).
 * Mobilde bölüm ekrandayken sırayla kendiliğinden ilerler (Mutfak → Yaşam Alanı → …), parmakla sağa/sola
 * kaydırılarak da geçilir. Kullanıcı dokunur ya da kaydırırsa otomatik geçiş durur.
 */
const AUTO_MS = 5000;
export function CollectionsPanels({
  items,
  siteName,
}: {
  items: Collection[];
  siteName: string;
}) {
  const [open, setOpen] = useState(0);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const list = useRef<HTMLUListElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const total = String(items.length).padStart(2, "0");
  const n = items.length;

  // Bölüm ekrana girince otomatik geçiş başlar, çıkınca durur
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Otomatik geçiş: yalnızca mobilde, "hareketi azalt" kapalıyken ve kullanıcı dokunmadıysa
  const running = auto && inView && n > 1;
  useEffect(() => {
    if (!running || !isMobile() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setOpen((o) => (o + 1) % n), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [running, open, n]);

  const go = (i: number) => {
    setAuto(false);
    setOpen(((i % n) + n) % n);
  };

  return (
    <ul
      ref={list}
      className="cx mx-auto max-w-[1680px]"
      data-auto={running || undefined}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchEnd={(e) => {
        const start = touch.current;
        touch.current = null;
        if (!start) return;
        const dx = e.changedTouches[0].clientX - start.x;
        const dy = e.changedTouches[0].clientY - start.y;
        // Yatay kaydırma: sola → sonraki, sağa → önceki
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) go(open + (dx < 0 ? 1 : -1));
      }}
    >
      {items.map((c, i) => {
        const num = String(i + 1).padStart(2, "0");
        const href = c.linkHref;
        const isOpen = open === i;
        const onClick = (e: React.MouseEvent) => {
          if (!isOpen && isMobile()) {
            e.preventDefault();
            go(i);
          }
        };
        const body = (
          <>
            {c.image && (
              <Image
                src={c.image}
                alt={`${siteName} ${c.title}`}
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className="cx-img object-cover"
                priority={i === 0}
              />
            )}
            <span className="cx-shade" aria-hidden />
            {/* Mobilde otomatik geçişin ilerleme çizgisi; her açılışta baştan başlar */}
            {isOpen && <span key={open} className="cx-progress" aria-hidden />}

            {/* Kapalı panel: dikey başlık */}
            <span className="cx-rail" aria-hidden>
              <span className="text-[11px] tracking-[0.3em] text-clay">{num}</span>
              <span className="cx-rail-title">{c.title}</span>
            </span>

            {/* Açık panel içeriği */}
            <span className="cx-body">
              <span className="mb-5 flex items-center gap-4 text-[11px] tracking-[0.3em] text-clay">
                {num}
                <span className="h-px w-10 bg-clay/60" />
                <span className="text-white/45">{total}</span>
              </span>
              <span className="mb-4 block text-3xl font-extralight uppercase tracking-[0.15em] md:text-5xl">
                {c.title}
              </span>
              {c.body && (
                <span className="mb-8 block max-w-md font-light leading-relaxed text-white/75">{c.body}</span>
              )}
              {href && c.linkLabel && (
                <span className="cx-cta inline-flex items-center gap-3 border-b border-white/40 pb-2 text-[11px] uppercase tracking-[0.3em]">
                  {c.linkLabel}
                  <ArrowUpRight className="size-3.5" />
                </span>
              )}
            </span>
          </>
        );

        return (
          <li key={c.id} className="cx-item" data-open={isOpen || undefined}>
            {href ? (
              <a
                href={href}
                className="cx-panel"
                aria-label={`${c.title}${c.linkLabel ? ` — ${c.linkLabel}` : ""}`}
                aria-expanded={isOpen}
                onClick={onClick}
                onFocus={() => isMobile() && !isOpen && go(i)}
                {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {body}
              </a>
            ) : (
              <div
                className="cx-panel"
                tabIndex={0}
                role="button"
                aria-expanded={isOpen}
                onClick={onClick}
                onFocus={() => isMobile() && !isOpen && go(i)}
              >
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
