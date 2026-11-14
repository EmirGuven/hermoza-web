import { CollectionsPanels } from "@/components/collections-panels";
import { Reveal } from "@/components/reveal";
import type { Collection, HomeSettings } from "@/lib/content-types";

/**
 * Ana sayfa koleksiyonları.
 * Masaüstü: yan yana tam boy paneller; üzerine gelinen (ya da klavyeyle odaklanılan) panel genişler,
 * görsel ve açıklama açılır. Hiçbiri seçili değilken ilk panel açık durur.
 * Mobil: yine yan yana; açık panel geniş, diğerleri ince dikey şerit, dokununca açılır.
 * Paneller: components/collections-panels.tsx, stiller: globals.css → .cx-*
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
        <CollectionsPanels items={items} siteName={siteName} />
      </Reveal>
    </section>
  );
}
