import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import type { Collection, HomeSettings } from "@/lib/content-types";

const isExternal = (href: string) => /^https?:\/\//.test(href);

/**
 * Ana sayfa koleksiyonları.
 * Masaüstü: yan yana tam boy paneller; üzerine gelinen (ya da klavyeyle odaklanılan) panel genişler,
 * görsel ve açıklama açılır. Hiçbiri seçili değilken ilk panel açık durur.
 * Mobil: alt alta büyük görsel kartlar, yazılar görselin üstünde.
 * Tüm etkileşim CSS ile (globals.css → .cx-*), istemci tarafı JS yok.
 */
export function CollectionsShowcase({
  items,
  section,
  siteName,
}: {
  items: Collection[];
  section: HomeSettings["collections"];
  siteName: string;
}) {
  const total = String(items.length).padStart(2, "0");

  return (
    <section id="koleksiyonlar" className="bg-cream py-24 md:py-32">
      <div className="mx-auto mb-14 grid max-w-7xl gap-8 px-6 md:mb-20 md:grid-cols-[1.2fr_1fr] md:items-end md:px-12">
        <Reveal>
          {section.eyebrow && (
            <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.5em] text-rust">{section.eyebrow}</p>
          )}
          <h2 className="max-w-xl text-4xl font-extralight uppercase leading-[1.15] tracking-[0.12em] text-forest md:text-5xl">
            {section.title}
          </h2>
        </Reveal>
        <Reveal delay={0.12} className="md:justify-self-end">
          {section.text && <p className="mb-6 max-w-sm font-light leading-relaxed text-ink/60">{section.text}</p>}
        </Reveal>
      </div>

      <Reveal className="px-4 md:px-12">
        <ul className="cx mx-auto max-w-[1680px]">
          {items.map((c, i) => {
            const num = String(i + 1).padStart(2, "0");
            const href = c.linkHref;
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

                {/* Daralmış panel: dikey başlık */}
                <span className="cx-rail" aria-hidden>
                  <span className="text-[11px] tracking-[0.3em] text-clay">{num}</span>
                  <span className="cx-rail-title">{c.title}</span>
                </span>

                {/* Açık panel / mobil kart içeriği */}
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
              <li key={c.id} className="cx-item">
                {href ? (
                  <a
                    href={href}
                    className="cx-panel"
                    aria-label={`${c.title}${c.linkLabel ? ` — ${c.linkLabel}` : ""}`}
                    {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {body}
                  </a>
                ) : (
                  <div className="cx-panel" tabIndex={0}>
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
