import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCollections, getPosts, getSetting } from "@/lib/content";
import { breadcrumb, ldJson } from "@/lib/schema";

// İnsanlar için site haritası (botlar için olan: /sitemap.xml)
export const metadata: Metadata = {
  title: "Site Haritası",
  description: "Hermoza Kitchen & Atelier sitesindeki tüm sayfalar: koleksiyonlar, hakkımızda, iletişim ve blog yazıları.",
  alternates: { canonical: "/site-haritasi" },
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-8 text-[10px] uppercase tracking-[0.55em] text-clay">{children}</p>;
}

function Group({ title, items }: { title: string; items: { href: string; label: string; note?: string }[] }) {
  if (!items.length) return null;
  return (
    <Reveal>
      <Eyebrow>{title}</Eyebrow>
      <ul className="border-t border-forest/12">
        {items.map((it, i) => (
          <li key={it.href} className="border-b border-forest/12">
            <Link href={it.href} className="group flex items-baseline gap-6 py-5">
              <span className="w-6 shrink-0 text-[10px] tracking-[0.3em] text-clay">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-light tracking-[0.04em] text-forest transition-colors group-hover:text-rust">{it.label}</span>
              {it.note && <span className="ml-auto hidden text-[10px] uppercase tracking-[0.3em] text-ink/35 sm:block">{it.note}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export default async function SiteMapPage() {
  const [general, contact, collections, posts] = await Promise.all([
    getSetting("general"),
    getSetting("contact"),
    getCollections(),
    getPosts(),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson({ "@context": "https://schema.org", ...breadcrumb([{ name: "Site Haritası", path: "/site-haritasi" }]) }) }} />
      <SiteHeader general={general} contact={contact} home={false} />
      <main>
        <header className="bg-forest-deep text-white">
          <div className="mx-auto max-w-[1680px] px-6 pb-20 pt-44 md:px-12 md:pb-24 md:pt-56">
            <p className="kx-rise mb-8 text-[10px] uppercase tracking-[0.55em] text-white/60">{general.siteName}</p>
            <h1 className="kx-rise text-3xl font-extralight uppercase tracking-[0.3em] [animation-delay:150ms] md:text-5xl">
              Site haritası
            </h1>
          </div>
        </header>

        <section className="bg-mist">
          <div className="mx-auto grid max-w-6xl gap-20 px-6 py-24 md:grid-cols-2 md:gap-x-24 md:px-12 md:py-32">
            <div className="space-y-20">
              <Group
                title="Sayfalar"
                items={[
                  { href: "/", label: "Ana sayfa" },
                  { href: "/hakkimizda", label: "Hakkımızda" },
                  { href: "/iletisim", label: "İletişim ve showroom" },
                  { href: "/blog", label: "Blog" },
                ]}
              />
              <Group
                title="Koleksiyonlar"
                items={collections.filter((c) => c.slug).map((c) => ({ href: `/koleksiyonlar/${c.slug}`, label: c.title }))}
              />
            </div>
            <div className="space-y-20">
              <Group
                title="Blog yazıları"
                items={posts.filter((p) => p.slug).map((p) => ({ href: `/blog/${p.slug}`, label: p.title, note: p.category }))}
              />
              <Group title="Yasal" items={[{ href: "/cerez-politikasi", label: "Çerez politikası ve aydınlatma metni" }]} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter general={general} contact={contact} home={false} />
    </>
  );
}
