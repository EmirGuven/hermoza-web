"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import type { GalleryImage } from "@/lib/content-types";

const EASE = [0.16, 1, 0.3, 1] as const;

type Row = { type: "full"; items: number[] } | { type: "pairA" | "pairB"; items: [number, number] };

/** Görselleri dergi düzenine böler: tam genişlik → asimetrik ikili → ters asimetrik ikili → … */
function layout(n: number): Row[] {
  const rows: Row[] = [];
  const pattern = ["full", "pairA", "pairB"] as const;
  let i = 0;
  let p = 0;
  while (i < n) {
    const type = pattern[p++ % pattern.length];
    if (type === "full" || i + 1 >= n) {
      rows.push({ type: "full", items: [i] });
      i += 1;
    } else {
      rows.push({ type, items: [i, i + 1] });
      i += 2;
    }
  }
  return rows;
}

function Tile({
  img,
  index,
  total,
  alt,
  className,
  frame,
  sizes,
  onOpen,
}: {
  img: GalleryImage;
  index: number;
  total: number;
  alt: string;
  className?: string;
  frame: string;
  sizes: string;
  onOpen: (i: number) => void;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.2, ease: EASE }}
      className={className}
    >
      <button
        type="button"
        onClick={() => onOpen(index)}
        className={`group relative block w-full cursor-zoom-in overflow-hidden bg-forest/5 ${frame}`}
        aria-label={`${alt} — görsel ${index + 1} / ${total}, büyüt`}
      >
        <Image
          src={img.src}
          alt={img.caption || alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 bg-forest-deep/0 transition-colors duration-700 group-hover:bg-forest-deep/15" />
        <span className="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-forest opacity-0 transition-all duration-500 group-hover:opacity-100 max-md:hidden">
          <Expand className="size-4" strokeWidth={1.5} />
        </span>
      </button>
      <figcaption className="mt-4 flex items-baseline gap-4 text-[11px] tracking-[0.3em] text-ink/45">
        <span className="text-clay">{String(index + 1).padStart(2, "0")}</span>
        {img.caption && <span className="tracking-[0.12em] font-light text-ink/60">{img.caption}</span>}
      </figcaption>
    </motion.figure>
  );
}

/**
 * Koleksiyon galerisi: görseller dergi düzeninde, büyük ve ön planda.
 * Tıklayınca tam ekran görüntüleyici: ok tuşları / kaydırma ile gezinme, Esc ile kapatma.
 */
export function CollectionGallery({ images, title }: { images: GalleryImage[]; title: string }) {
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

  if (!n) return null;
  const rows = layout(n);
  const tile = (i: number, frame: string, sizes: string, className?: string) => (
    <Tile
      key={i}
      img={images[i]}
      index={i}
      total={n}
      alt={title}
      frame={frame}
      sizes={sizes}
      className={className}
      onOpen={setOpen}
    />
  );

  return (
    <>
      <div className="mx-auto max-w-[1680px] space-y-20 md:space-y-36">
        {rows.map((row, r) =>
          row.type === "full" ? (
            <div key={r}>{tile(row.items[0], "aspect-[4/5] md:aspect-[21/10]", "100vw")}</div>
          ) : row.type === "pairA" ? (
            <div key={r} className="grid gap-20 md:grid-cols-[7fr_5fr] md:gap-12">
              {tile(row.items[0], "aspect-[4/5] md:aspect-[5/6]", "(min-width: 768px) 58vw, 100vw")}
              {tile(row.items[1], "aspect-[4/5]", "(min-width: 768px) 42vw, 100vw", "md:mt-48")}
            </div>
          ) : (
            <div key={r} className="grid gap-20 md:grid-cols-[5fr_7fr] md:items-end md:gap-12">
              {tile(row.items[0], "aspect-[3/4]", "(min-width: 768px) 42vw, 100vw", "md:mb-40")}
              {tile(row.items[1], "aspect-[4/5] md:aspect-[6/5]", "(min-width: 768px) 58vw, 100vw")}
            </div>
          )
        )}
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
