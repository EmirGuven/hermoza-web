import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { CollectionGallery } from "@/components/collection-gallery";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCollection, getCollections, getSetting } from "@/lib/content";
import type { Collection } from "@/lib/content-types";
import { Markdown, plainText, truncate } from "@/lib/markdown";
import { SITE_URL, absUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// Build sırasında yayındaki koleksiyonlar önceden üretilir; sonradan eklenenler ilk istekte üretilir.
export async function generateStaticParams() {
  const items = await getCollections();
  const slugs = items.filter((c) => c.slug).map((c) => ({ slug: c.slug }));
  return slugs.length ? slugs : [{ slug: "__koleksiyon-yok__" }];
}

const description = (c: Collection) => c.seoDescription || c.body || truncate(plainText(c.content), 160);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [c, g] = await Promise.all([getCollection(slug), getSetting("general")]);
  if (!c) return { title: "Koleksiyon bulunamadı" };
  const title = c.seoTitle || `${c.title} — ${g.siteName}`;
  const desc = description(c);
  const image = c.image || g.ogImage || "/og-hermoza.jpg";
  return {
    title,
    description: desc,
    alternates: { canonical: `/koleksiyonlar/${c.slug}` },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: `/koleksiyonlar/${c.slug}`,
      siteName: g.siteName,
      title,
      description: desc,
      images: [{ url: image, alt: c.title }],
    },
    twitter: { card: "summary_large_image", title, description: desc, images: [image] },
  };
}

// Header/footer önbellekten hemen gelir; içerik adrese (params) bağlı olduğu için Suspense içinde
export default async function CollectionPage({ params }: Props) {
  const [general, contact] = await Promise.all([getSetting("general"), getSetting("contact")]);
  return (
    <>
      <SiteHeader general={general} contact={contact} home={false} />
      <main>
        <Suspense fallback={<div className="h-svh bg-forest-deep" />}>
          <CollectionContent params={params} siteName={general.siteName} />
        </Suspense>
      </main>
      <SiteFooter general={general} contact={contact} home={false} />
    </>
  );
}

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[10px] font-normal uppercase tracking-[0.55em] ${className}`}>{children}</p>;
}

/** İnce dikey ayraç çizgisi */
function Rule({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`mx-auto block h-16 w-px ${className}`} />;
}

async function CollectionContent({ params, siteName }: { params: Props["params"]; siteName: string }) {
  const { slug } = await params;
  const [c, all] = await Promise.all([getCollection(slug), getCollections()]);
  if (!c) notFound();

  const index = Math.max(0, all.findIndex((x) => x.id === c.id));
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;
  const url = `${SITE_URL}/koleksiyonlar/${c.slug}`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#hizmet`,
        name: c.title,
        description: description(c),
        url,
        image: [c.image, ...c.gallery.map((g) => g.src)].filter(Boolean).map((s) => absUrl(s)),
        provider: { "@id": `${SITE_URL}/#isletme`, "@type": "HomeAndConstructionBusiness", name: siteName },
        areaServed: { "@type": "Country", name: "Türkiye" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Koleksiyonlar", item: `${SITE_URL}/#koleksiyonlar` },
          { "@type": "ListItem", position: 3, name: c.title, item: url },
        ],
      },
    ],
  }).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* Kapak: tam ekran görsel, ortalanmış sade başlık */}
      <header className="relative flex h-svh min-h-[620px] items-center justify-center overflow-hidden bg-forest-deep text-center text-white">
        {c.image && (
          <Image src={c.image} alt={`${siteName} ${c.title}`} fill priority sizes="100vw" className="kx-hero-img object-cover" />
        )}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="relative px-6">
          <Eyebrow className="kx-rise mb-8 text-white/70">
            Koleksiyon {String(index + 1).padStart(2, "0")}
          </Eyebrow>
          <h1 className="kx-rise text-3xl font-extralight uppercase tracking-[0.32em] [animation-delay:150ms] sm:text-4xl md:text-5xl md:tracking-[0.38em]">
            {c.title}
          </h1>
          {c.subtitle && (
            <p className="kx-rise mx-auto mt-8 max-w-md text-sm font-light tracking-[0.08em] text-white/75 [animation-delay:300ms] md:text-base">
              {c.subtitle}
            </p>
          )}
        </div>
        <span className="absolute bottom-10 left-1/2 -translate-x-1/2" aria-hidden>
          <span className="kx-scroll-line block h-14 w-px bg-white/50" />
        </span>
      </header>

      {/* Giriş: ortalanmış dar sütun */}
      <section className="bg-mist">
        <div className="mx-auto max-w-2xl px-6 py-28 text-center md:py-40">
          <Reveal>
            <Eyebrow className="mb-10 text-clay">{c.title}</Eyebrow>
            <p className="text-xl font-extralight leading-[1.7] text-forest md:text-2xl md:leading-[1.7]">{c.body}</p>
          </Reveal>
          {c.content && (
            <Reveal delay={0.1}>
              <Rule className="my-14 bg-forest/20" />
              <div className="post-body text-left">
                <Markdown source={c.content} />
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Galeri */}
      {c.gallery.length > 0 && (
        <section aria-label={`${c.title} galerisi`} className="bg-mist px-4 pb-32 md:px-12 md:pb-44">
          <CollectionGallery images={c.gallery} title={c.title} />
        </section>
      )}

      {/* Detaylar: ince çizgili sade liste */}
      {c.highlights.length > 0 && (
        <section className="border-t border-forest/10 bg-white">
          <div className="mx-auto max-w-4xl px-6 py-24 md:py-32">
            <Reveal>
              <Eyebrow className="mb-14 text-center text-clay">Detaylar</Eyebrow>
            </Reveal>
            <ul className="grid border-t border-forest/10 md:grid-cols-2 md:gap-x-16">
              {c.highlights.map((h, i) => (
                <Reveal key={h + i} delay={(i % 2) * 0.08}>
                  <li className="flex items-baseline gap-6 border-b border-forest/10 py-6">
                    <span className="w-6 shrink-0 text-[10px] tracking-[0.3em] text-clay">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-light tracking-[0.02em] text-forest">{h}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Davet: tek, zarif bağlantı */}
      <section className="border-t border-forest/10 bg-mist">
        <Reveal className="mx-auto max-w-xl px-6 py-28 text-center md:py-36">
          <Eyebrow className="mb-8 text-clay">Özel tasarım</Eyebrow>
          <h2 className="mb-6 text-2xl font-extralight uppercase tracking-[0.28em] text-forest md:text-3xl">
            Sizin için tasarlayalım
          </h2>
          <p className="mx-auto mb-12 font-light leading-relaxed text-ink/55">
            Her {c.title.toLocaleLowerCase("tr-TR")} projesi, mekanın kendisiyle başlar. Showroom’da ya da yerinde, size
            özel bir görüşme için randevu oluşturun.
          </p>
          <Link
            href="/#iletisim"
            className="group inline-flex items-center gap-4 border-b border-forest/40 pb-2 text-[11px] uppercase tracking-[0.35em] text-forest transition-colors hover:border-forest"
          >
            Randevu oluşturun
            <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.25} />
          </Link>
        </Reveal>
      </section>

      {/* Sonraki koleksiyon */}
      {next && (
        <Link
          href={`/koleksiyonlar/${next.slug}`}
          className="group relative flex h-[56svh] min-h-[400px] items-center justify-center overflow-hidden bg-forest-deep text-center text-white"
        >
          {next.image && (
            <Image
              src={next.image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-55 transition-all duration-[1.8s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-75"
            />
          )}
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative px-6">
            <Eyebrow className="mb-6 text-white/65">Sonraki koleksiyon</Eyebrow>
            <p className="text-2xl font-extralight uppercase tracking-[0.32em] md:text-4xl">{next.title}</p>
            <span className="mx-auto mt-8 block h-px w-10 bg-white/50 transition-all duration-700 group-hover:w-20" aria-hidden />
          </div>
        </Link>
      )}
    </>
  );
}
