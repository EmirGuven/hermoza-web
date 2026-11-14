"use client";

import { useState } from "react";
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
 */
export function CollectionsPanels({
  items,
  siteName,
}: {
  items: Collection[];
  siteName: string;
}) {
  const [open, setOpen] = useState(0);
  const total = String(items.length).padStart(2, "0");

  return (
    <ul className="cx mx-auto max-w-[1680px]">
      {items.map((c, i) => {
        const num = String(i + 1).padStart(2, "0");
        const href = c.linkHref;
        const isOpen = open === i;
        const onClick = (e: React.MouseEvent) => {
          if (!isOpen && isMobile()) {
            e.preventDefault();
            setOpen(i);
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
                onFocus={() => isMobile() && setOpen(i)}
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
                onFocus={() => isMobile() && setOpen(i)}
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
