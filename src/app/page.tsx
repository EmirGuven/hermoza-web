import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { BackgroundVideo } from "@/components/background-video";
import { CollectionsShowcase } from "@/components/collections-showcase";
import { ContactForm } from "@/components/contact-form";
import { CookieConsent } from "@/components/cookie-consent";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCollections, getPosts, getSetting } from "@/lib/content";
import { phoneDigits } from "@/lib/content-types";
import { SITE_URL, absUrl } from "@/lib/site";

// Tüm içerik panelden (/admin) yönetilir; önbellekte tutulur, panelde kayıt yapılınca yenilenir.

export async function generateMetadata(): Promise<Metadata> {
  const g = await getSetting("general");
  const image = g.ogImage || "/og-hermoza.jpg";
  return {
    title: g.seoTitle,
    description: g.seoDescription,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: "/",
      siteName: g.siteName,
      title: g.seoTitle,
      description: g.seoDescription,
      images: [{ url: image, width: 1200, height: 630, alt: g.siteName }],
    },
    twitter: { card: "summary_large_image", title: g.seoTitle, description: g.seoDescription, images: [image] },
    verification: {
      google: g.googleVerification || undefined,
      other: g.bingVerification ? { "msvalidate.01": g.bingVerification } : undefined,
    },
  };
}

/** Google ve yapay zekâ asistanları için işletme bilgisi (schema.org JSON-LD) */
function jsonLd(
  general: Awaited<ReturnType<typeof getSetting<"general">>>,
  contact: Awaited<ReturnType<typeof getSetting<"contact">>>,
  collections: Awaited<ReturnType<typeof getCollections>>
) {
  const sameAs = [contact.facebook, contact.instagram].filter(Boolean);
  const business = {
    "@type": "HomeAndConstructionBusiness",
    "@id": `${SITE_URL}/#isletme`,
    name: general.siteName,
    description: general.seoDescription,
    url: `${SITE_URL}/`,
    logo: absUrl("/icon.png"),
    image: absUrl(general.ogImage || "/og-hermoza.jpg"),
    telephone: contact.phone || undefined,
    email: contact.email || undefined,
    address: contact.address
      ? { "@type": "PostalAddress", streetAddress: contact.address, addressRegion: "İstanbul", addressCountry: "TR" }
      : undefined,
    hasMap: contact.mapsUrl || undefined,
    areaServed: { "@type": "Country", name: "Türkiye" },
    sameAs: sameAs.length ? sameAs : undefined,
    hasOfferCatalog: collections.length
      ? {
          "@type": "OfferCatalog",
          name: "Ölçüye özel mobilya",
          itemListElement: collections.map((c) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: c.title, description: c.body },
          })),
        }
      : undefined,
  };
  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#site`,
    url: `${SITE_URL}/`,
    name: general.siteName,
    inLanguage: "tr-TR",
    publisher: { "@id": `${SITE_URL}/#isletme` },
  };
  // </script> kaçışı: içerikteki "<" karakterleri güvenli hale getirilir
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [business, website] }).replace(/</g, "\\u003c");
}

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`mb-6 text-[10px] font-medium uppercase tracking-[0.5em] ${className}`}>
      {children}
    </p>
  );
}

/** Başlıktaki vurgulanacak kısmı renklendirir */
function Highlighted({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const i = text.indexOf(highlight);
  return (
    <>
      {text.slice(0, i)}
      <span className="text-clay">{highlight}</span>
      {text.slice(i + highlight.length)}
    </>
  );
}

export default async function Home() {
  const [general, contact, home, collections, journal] = await Promise.all([
    getSetting("general"),
    getSetting("contact"),
    getSetting("home"),
    getCollections(),
    getPosts(),
  ]);
  const tel = contact.phone ? `tel:+${phoneDigits(contact.phone)}` : "";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(general, contact, collections) }} />
      <SiteHeader general={general} contact={contact} />

      <main>
        <Hero video={home.hero} title={`${general.siteName} — ölçüye özel mutfak, yaşam alanı ve giyinme odası`} />

        {/* Koleksiyonlar */}
        {collections.length > 0 && (
          <CollectionsShowcase items={collections} section={home.collections} siteName={general.siteName} />
        )}

        {/* Video bandı */}
        <section className="relative flex min-h-[80svh] items-center justify-center overflow-hidden text-center text-white">
          <BackgroundVideo video={home.bespoke.video} />
          <div className="absolute inset-0 bg-forest-deep/70" />
          <div className="relative px-6">
            {home.bespoke.eyebrow && <Eyebrow className="text-clay">{home.bespoke.eyebrow}</Eyebrow>}
            <h2 className="mx-auto mb-8 max-w-4xl text-2xl font-extralight leading-relaxed tracking-wide md:text-4xl">
              <Highlighted text={home.bespoke.heading} highlight={home.bespoke.highlight} />
            </h2>
            {home.bespoke.text && (
              <p className="mx-auto mb-12 max-w-lg font-light text-white/70">{home.bespoke.text}</p>
            )}
            {home.bespoke.buttonLabel && (
              <a
                href={home.bespoke.buttonHref || "#iletisim"}
                className="inline-flex items-center gap-3 border border-white/40 px-9 py-4 text-xs uppercase tracking-[0.3em] transition-colors hover:bg-white hover:text-forest"
              >
                {home.bespoke.buttonLabel}
              </a>
            )}
          </div>
        </section>

        {/* Blog */}
        {journal.length > 0 && (
          <section id="journal" className="mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-36">
            <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow className="text-rust">{home.journal.eyebrow}</Eyebrow>
                <h2 className="text-4xl font-extralight uppercase tracking-[0.15em] text-forest md:text-5xl">
                  {home.journal.title}
                </h2>
              </div>
              <Link
                href="/blog"
                className="group inline-flex items-center gap-3 border-b border-forest/30 pb-2 text-[11px] uppercase tracking-[0.3em] text-forest transition-colors hover:border-rust hover:text-rust"
              >
                Tüm yazılar
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid gap-10 md:grid-cols-3">
              {journal.slice(0, 3).map((j, i) => (
                <Reveal key={j.id} delay={i * 0.12}>
                  <Link href={`/blog/${j.slug}`} className="group block">
                    <article>
                      <div className="relative mb-6 aspect-[4/3] overflow-hidden bg-clay/30">
                        {j.image && (
                          <Image
                            src={j.image}
                            alt=""
                            fill
                            sizes="(min-width: 768px) 30vw, 100vw"
                            className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                          />
                        )}
                      </div>
                      {j.category && (
                        <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-clay">{j.category}</p>
                      )}
                      <h3 className="mb-3 text-lg font-light leading-snug text-forest">{j.title}</h3>
                      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-ink/50 transition-colors group-hover:text-rust">
                        Oku <ArrowRight className="size-3.5" />
                      </span>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* İletişim */}
        <section id="iletisim" className="bg-forest text-white">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 md:grid-cols-2 md:px-12 md:py-36">
            <div>
              <Eyebrow className="text-clay">{home.contact.eyebrow}</Eyebrow>
              <h2 className="mb-8 max-w-md text-4xl font-extralight uppercase tracking-[0.15em] md:text-5xl">
                {home.contact.title}
              </h2>
              <p className="mb-12 max-w-md font-light text-white/65">{home.contact.text}</p>
              <ul className="space-y-5 text-sm font-light text-white/80">
                {contact.address && (
                  <li>
                    <a
                      href={contact.mapsUrl || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 transition-colors hover:text-clay"
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0 text-clay" strokeWidth={1.5} />
                      {contact.address}
                    </a>
                  </li>
                )}
                {contact.phone && (
                  <li>
                    <a href={tel} className="flex items-center gap-4 transition-colors hover:text-clay">
                      <Phone className="size-4 shrink-0 text-clay" strokeWidth={1.5} />
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-4 transition-colors hover:text-clay">
                      <Mail className="size-4 shrink-0 text-clay" strokeWidth={1.5} />
                      {contact.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <SiteFooter general={general} contact={contact} />

      <CookieConsent newsletterPopup={general.newsletterPopup} />
    </>
  );
}
