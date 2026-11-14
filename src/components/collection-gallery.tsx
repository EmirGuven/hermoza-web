"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import type { GalleryImage } from "@/lib/content-types";

const EASE = [0.16, 1, 0.3, 1] as const;

type RowType = "full" | "bento" | "bentoR" | "duo";
type Row = { type: RowType; items: number[] };
const SIZE: Record<RowType, number> = { full: 1, bento: 3, bentoR: 3, duo: 2 };

/**
 * Görselleri hizaları birebir oturan bir ızgaraya böler. Sıra:
 * tam genişlik → büyük + üst üste iki küçük → eşit ikili → büyük sağda + iki küçük solda → …
 * Kalan görsel sayısı bir düzene yetmezse daha küçük düzene geçilir.
 */
function layout(n: number): Row[] {
  const rows: Row[] = [];
  const pattern: RowType[] = ["full", "bento", "duo", "bentoR"];
  let i = 0;
  let p = 0;
  while (i < n) {
    const left = n - i;
    let type = pattern[p++ % pattern.length];
    if (SIZE[type] > left) type = left >= 2 ? "duo" : "full";
    rows.push({ type, items: Array.from({ length: SIZE[type] }, (_, k) => i + k) });
    i += SIZE[type];
  }
  return rows;
}

function Tile({
  img,
  index,
  total,
  alt,
  className = "",
  sizes,
  delay = 0,
  onOpen,
}: {
  img: GalleryImage;
  index: number;
  total: number;
  alt: string;
  className?: string;
  sizes: string;
  delay?: number;
  onOpen: (i: number) => void;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
      className={`relative min-h-0 ${className}`}
    >
      <button
        type="button"
        onClick={() => onOpen(index)}
        className="group relative block h-full w-full cursor-zoom-in overflow-hidden bg-forest/5"
        aria-label={`${alt} — görsel ${index + 1} / ${total}, büyüt`}
      >
        <Image
          src={img.src}
          alt={img.caption || alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[1.8s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
        />
        {/* Görsel altı yazısı görselin üstünde: mobilde hep, masaüstünde üzerine gelince */}
        <span className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-700 md:opacity-0 md:group-hover:opacity-100" />
        <figcaption className="absolute inset-x-0 bottom-0 flex items-baseline gap-4 p-5 text-left text-white transition-all duration-700 md:translate-y-2 md:p-7 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <span className="text-[10px] tracking-[0.3em] text-white/70">{String(index + 1).padStart(2, "0")}</span>
          {img.caption && <span className="text-[13px] font-light tracking-[0.06em]">{img.caption}</span>}
        </figcaption>
        <span className="absolute right-5 top-5 hidden size-9 items-center justify-center rounded-full bg-white/90 text-forest opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:flex">
          <Expand className="size-3.5" strokeWidth={1.5} />
        </span>
      </button>
    </motion.figure>
  );
}

/**
 * Koleksiyon galerisi: hizalı ızgara, görseller büyük ve ön planda.
 * Tıklayınca tam ekran görüntüleyici: ok tuşları / kaydırma ile gezinme, Esc ile kapatma.
 */
export function CollectionGallery({
  images,
  title,
  from = 0,
  to,
}: {
  images: GalleryImage[];
  title: string;
  /** Sayfada yalnızca bu aralık gösterilir (galeri bölünerek araya bölüm konabilir); büyük görüntüleyici tüm görsellerde gezinir */
  from?: number;
  to?: number;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const n = images.length;
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touch = useRef<number | null>(null);

  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, go]);

  const end = Math.min(to ?? n, n);
  if (!n || from >= end) return null;
  // Düzen aralığa göre kurulur, indeksler tüm galeriye göre kalır
  const rows = layout(end - from).map((r) => ({ ...r, items: r.items.map((i) => i + from) }));
  const tile = (i: number, sizes: string, className?: string, delay?: number) => (
    <Tile key={i} img={images[i]} index={i} total={n} alt={title} sizes={sizes} className={className} delay={delay} onOpen={setOpen} />
  );

  // Masaüstünde her satırın oranı sabit: görseller birebir hizalanır. Mobilde alt alta.
  return (
    <>
      <div className="mx-auto max-w-[1680px] space-y-3 md:space-y-4">
        {rows.map((row, r) => {
          const [a, b, c] = row.items;
          if (row.type === "full")
            return (
              <div key={r} className="aspect-[4/5] md:aspect-[21/9]">
                {tile(a, "100vw", "h-full")}
              </div>
            );
          if (row.type === "duo")
            return (
              <div key={r} className="grid gap-3 md:grid-cols-2 md:gap-4">
                {tile(a, "(min-width: 768px) 50vw, 100vw", "aspect-[4/5]")}
                {tile(b, "(min-width: 768px) 50vw, 100vw", "aspect-[4/5]", 0.08)}
              </div>
            );
          const rev = row.type === "bentoR";
          return (
            <div key={r} className="grid gap-3 md:aspect-[16/9] md:grid-cols-3 md:grid-rows-2 md:gap-4">
              {tile(a, "(min-width: 768px) 66vw, 100vw", `aspect-[4/5] md:aspect-auto md:col-span-2 md:row-span-2 ${rev ? "md:col-start-2 md:row-start-1" : ""}`)}
              {tile(b, "(min-width: 768px) 33vw, 100vw", `aspect-[4/5] md:aspect-auto ${rev ? "md:col-start-1 md:row-start-1" : ""}`, 0.08)}
              {tile(c, "(min-width: 768px) 33vw, 100vw", `aspect-[4/5] md:aspect-auto ${rev ? "md:col-start-1 md:row-start-2" : ""}`, 0.16)}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} galerisi`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[90] flex flex-col bg-forest-deep/97 text-white"
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touch.current === null) return;
              const dx = e.changedTouches[0].clientX - touch.current;
              touch.current = null;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
              <p className="text-[11px] tracking-[0.35em] text-white/60">
                <span className="text-clay">{String(open + 1).padStart(2, "0")}</span>
                <span className="mx-3">/</span>
                {String(n).padStart(2, "0")}
                <span className="ml-6 uppercase max-sm:hidden">{title}</span>
              </p>
              <button
                ref={closeBtn}
                type="button"
                onClick={() => setOpen(null)}
                className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/70 hover:text-white"
              >
                Kapat <X className="size-5" strokeWidth={1.25} />
              </button>
            </div>

            <div className="relative min-h-0 flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={open}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute inset-0 mx-4 md:mx-24"
                >
                  <Image
                    src={images[open].src}
                    alt={images[open].caption || title}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              {n > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Önceki görsel"
                    className="absolute left-2 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white/80 backdrop-blur-sm transition-colors hover:bg-white hover:text-forest md:left-6"
                  >
                    <ArrowLeft className="size-5" strokeWidth={1.25} />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Sonraki görsel"
                    className="absolute right-2 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white/80 backdrop-blur-sm transition-colors hover:bg-white hover:text-forest md:right-6"
                  >
                    <ArrowRight className="size-5" strokeWidth={1.25} />
                  </button>
                </>
              )}
            </div>

            <p className="min-h-16 px-5 py-5 text-center text-sm font-light tracking-wide text-white/65 md:px-10">
              {images[open].caption}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
