import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND_PILLARS, BRAND_PROCESS, BRAND_STORY, faqWithAddress } from "@/lib/brand";
import { getCollections, getSetting } from "@/lib/content";
import { breadcrumb } from "@/lib/schema";
import { SITE_URL } from "@/lib/site";

const HERO = "/media/images/img-4970.png";
const ATELIER = "/media/images/3.jpg";
const LIVING = "/media/images/1.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const g = await getSetting("general");
  const title = `Hakkımızda | ${g.siteName}`;
  const description = BRAND_STORY[0];
  return {
    title: "Hakkımızda",
    description,
    alternates: { canonical: "/hakkimizda" },
    openGraph: { type: "website", locale: "tr_TR", url: "/hakkimizda", siteName: g.siteName, title, description, images: [{ url: HERO }] },
  };
}

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[10px] font-normal uppercase tracking-[0.55em] ${className}`}>{children}</p>;
}

export default async function AboutPage() {
  const [general, contact, collections] = await Promise.all([
    getSetting("general"),
    getSetting("contact"),
    getCollections(),
  ]);
  const faq = faqWithAddress(contact.address);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/hakkimizda#sayfa`,
        url: `${SITE_URL}/hakkimizda`,
        name: `Hakkımızda — ${general.siteName}`,
        about: { "@id": `${SITE_URL}/#isletme` },
        inLanguage: "tr-TR",
      },
      breadcrumb([{ name: "Hakkımızda", path: "/hakkimizda" }]),
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  }).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <SiteHeader general={general} contact={contact} home={false} />
      <main>
        {/* Kapak */}
        <header className="relative flex h-[88svh] min-h-[560px] items-end overflow-hidden bg-forest-deep text-white">
          <Image src={HERO} alt={general.siteName} fill priority sizes="100vw" className="kx-hero-img object-cover" />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative mx-auto w-full max-w-[1680px] px-6 pb-16 md:px-12 md:pb-24">
            <Eyebrow className="kx-rise mb-8 text-white/70">Hakkımızda</Eyebrow>
            <h1 className="kx-rise max-w-3xl text-3xl font-extralight uppercase leading-[1.35] tracking-[0.3em] [animation-delay:150ms] md:text-5xl">
              Ölçüyle başlayan bir zanaat
            </h1>
          </div>
          <span className="absolute bottom-16 right-6 hidden md:right-12 md:block md:bottom-24" aria-hidden>
            <span className="kx-scroll-line block h-14 w-px bg-white/50" />
          </span>
        </header>

        {/* Manifesto */}
        <section className="bg-mist">
          <Reveal className="mx-auto max-w-2xl px-6 py-28 text-center md:py-40">
            <Eyebrow className="mb-10 text-clay">{general.siteName}</Eyebrow>
            <p className="text-xl font-extralight leading-[1.7] text-forest md:text-2xl md:leading-[1.7]">{BRAND_STORY[0]}</p>
            <span aria-hidden className="mx-auto my-14 block h-16 w-px bg-forest/20" />
            <div className="space-y-6 font-light leading-relaxed text-ink/60">
              {BRAND_STORY.slice(1).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Üç ilke: footer rengiyle koyu bant */}
        <section className="bg-forest-deep text-white">
          <div className="mx-auto max-w-6xl px-6 py-28 md:px-12 md:py-36">
            <Reveal>
              <Eyebrow className="mb-16 text-center text-clay">İlkelerimiz</Eyebrow>
            </Reveal>
            <ol className="grid gap-14 md:grid-cols-3 md:gap-16">
              {BRAND_PILLARS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.1}>
                  <li className="border-t border-white/15 pt-8 text-center">
                    <span className="mb-6 block text-[10px] tracking-[0.3em] text-clay">{String(i + 1).padStart(2, "0")}</span>
                    <span className="mb-5 block text-lg font-extralight uppercase tracking-[0.3em]">{p.title}</span>
                    <span className="mx-auto block max-w-xs font-light leading-relaxed text-white/65">{p.text}</span>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Atölye: görsel + metin */}
        <section className="bg-mist">
          <div className="mx-auto grid max-w-[1680px] items-center gap-16 px-4 py-28 md:grid-cols-[7fr_5fr] md:gap-24 md:px-12 md:py-40">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden md:aspect-[5/6]">
                <Image src={ATELIER} alt="Atölyede el işçiliği" fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="px-2 md:px-0">
              <Eyebrow className="mb-10 text-clay">Atölye</Eyebrow>
              <h2 className="mb-8 text-2xl font-extralight uppercase leading-snug tracking-[0.24em] text-forest md:text-3xl">
                Her parça elden geçer
              </h2>
              <p className="mb-6 font-light leading-relaxed text-ink/60">
                Üretimin tamamı kendi atölyemizde yapılır. Kesimden birleşime, yüzey işleminden son kontrole kadar her
                adımda aynı titizlik vardır.
              </p>
              <p className="font-light leading-relaxed text-ink/60">
                Montajı da kendi ekibimiz üstlenir. Böylece çizimde söz verdiğimiz her detay, mekanınızda birebir hayat
                bulur.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Süreç */}
        <section className="border-t border-forest/10 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-28 md:px-12 md:py-36">
            <Reveal>
              <Eyebrow className="mb-16 text-center text-clay">Süreç</Eyebrow>
            </Reveal>
            <ol className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {BRAND_PROCESS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <li className="border-t border-forest/15 pt-8">
                    <span className="mb-5 block text-[10px] tracking-[0.3em] text-clay">{String(i + 1).padStart(2, "0")}</span>
                    <span className="mb-4 block font-light uppercase tracking-[0.2em] text-forest">{p.title}</span>
                    <span className="block text-[15px] font-light leading-relaxed text-ink/60">{p.text}</span>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Koleksiyonlar */}
        {collections.length > 0 && (
          <section className="relative flex min-h-[70svh] items-center overflow-hidden bg-forest-deep text-white">
            <Image src={LIVING} alt="" fill sizes="100vw" className="object-cover opacity-45" />
            <div className="absolute inset-0 bg-black/25" />
            <Reveal className="relative mx-auto w-full max-w-3xl px-6 py-28 text-center">
              <Eyebrow className="mb-12 text-white/70">Koleksiyonlar</Eyebrow>
              <ul className="space-y-6">
                {collections.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={c.slug ? `/koleksiyonlar/${c.slug}` : "/#koleksiyonlar"}
                      className="group inline-flex items-center gap-5 text-2xl font-extralight uppercase tracking-[0.3em] transition-colors hover:text-clay md:text-4xl"
                    >
                      {c.title}
                      <ArrowRight className="size-5 opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100" strokeWidth={1} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>
        )}

        {/* Sık sorulan sorular */}
        <section className="bg-mist">
          <div className="mx-auto max-w-3xl px-6 py-28 md:py-36">
            <Reveal>
              <Eyebrow className="mb-14 text-center text-clay">Sık sorulan sorular</Eyebrow>
            </Reveal>
            <div className="border-t border-forest/12">
              {faq.map((f) => (
                <details key={f.q} className="group border-b border-forest/12">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-light text-forest [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden className="relative size-3 shrink-0">
                      <span className="absolute inset-x-0 top-1/2 h-px bg-forest/50" />
                      <span className="absolute inset-y-0 left-1/2 w-px bg-forest/50 transition-transform duration-300 group-open:scale-y-0" />
                    </span>
                  </summary>
                  <p className="pb-7 pr-10 font-light leading-relaxed text-ink/60">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Davet */}
        <section className="border-t border-forest/10 bg-white">
          <Reveal className="mx-auto max-w-xl px-6 py-28 text-center md:py-36">
            <Eyebrow className="mb-8 text-clay">Tanışalım</Eyebrow>
            <h2 className="mb-12 text-2xl font-extralight uppercase tracking-[0.28em] text-forest md:text-3xl">
              Projenizi konuşalım
            </h2>
            <Link
              href="/iletisim"
              className="group inline-flex items-center gap-4 border-b border-forest/40 pb-2 text-[11px] uppercase tracking-[0.35em] text-forest transition-colors hover:border-forest"
            >
              İletişime geçin
              <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.25} />
            </Link>
          </Reveal>
        </section>
      </main>
      <SiteFooter general={general} contact={contact} home={false} />
    </>
  );
}
