import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSetting } from "@/lib/content";
import { phoneDigits } from "@/lib/content-types";
import { SITE_URL } from "@/lib/site";

const SHOWROOM = "/media/images/2.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const [g, contact] = await Promise.all([
    getSetting("general"),
    getSetting("contact"),
  ]);
  const title = `İletişim — ${g.siteName}`;
  const description = `Showroom’da buluşalım. ${contact.address ? `${contact.address}. ` : ""}Ücretsiz keşif için randevu oluşturun; 48 saat içinde dönüş yapıyoruz.`;
  return {
    title,
    description,
    alternates: { canonical: "/iletisim" },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: "/iletisim",
      siteName: g.siteName,
      title,
      description,
      images: [{ url: SHOWROOM }],
    },
  };
}

function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[10px] font-normal uppercase tracking-[0.55em] ${className}`}
    >
      {children}
    </p>
  );
}

function Line({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-forest/12 py-6">
      <p className="mb-2 text-[10px] uppercase tracking-[0.4em] text-ink/40">
        {label}
      </p>
      <div className="font-light text-forest">{children}</div>
    </div>
  );
}

export default async function ContactPage() {
  const [general, contact] = await Promise.all([
    getSetting("general"),
    getSetting("contact"),
  ]);
  const tel = contact.phone ? `tel:+${phoneDigits(contact.phone)}` : "";
  const socials = [
    { label: "Instagram", href: contact.instagram },
    { label: "Facebook", href: contact.facebook },
    {
      label: "WhatsApp",
      href: contact.whatsapp
        ? `https://wa.me/${phoneDigits(contact.whatsapp)}`
        : "",
    },
  ].filter((s) => s.href);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${SITE_URL}/iletisim#sayfa`,
    url: `${SITE_URL}/iletisim`,
    name: `İletişim — ${general.siteName}`,
    about: { "@id": `${SITE_URL}/#isletme` },
    inLanguage: "tr-TR",
  }).replace(/</g, "\\u003c");

  const link = "transition-colors hover:text-rust";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <SiteHeader general={general} contact={contact} home={false} />
      <main>
        {/* Başlık: koyu bant (header okunur kalsın) */}
        <header className="bg-forest-deep text-white">
          <div className="mx-auto max-w-[1680px] px-6 pb-20 pt-44 md:px-12 md:pb-24 md:pt-56">
            <Eyebrow className="kx-rise mb-8 text-white/60">İletişim</Eyebrow>
            <h1 className="kx-rise text-3xl font-extralight uppercase tracking-[0.3em] [animation-delay:150ms] md:text-5xl">
              Showroom’da buluşalım
            </h1>
            <p className="kx-rise mt-8 max-w-md text-sm font-light leading-relaxed tracking-[0.04em] text-white/65 [animation-delay:300ms] md:text-base">
              Malzemelere dokunmak, numuneleri görmek ve projenizi konuşmak için
              randevu oluşturun. 48 saat içinde dönüş yapıyoruz.
            </p>
          </div>
        </header>

        {/* Bilgiler + form */}
        <section className="bg-mist">
          <div className="mx-auto grid max-w-6xl gap-20 px-6 py-24 md:grid-cols-[5fr_6fr] md:gap-24 md:px-12 md:py-36">
            <Reveal>
              <Eyebrow className="mb-10 text-clay">Bilgiler</Eyebrow>
              <div className="border-t border-forest/12">
                {contact.address && (
                  <Line label="Showroom">
                    <p className="leading-relaxed">{contact.address}</p>
                    {contact.mapsUrl && (
                      <a
                        href={contact.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-clay ${link}`}
                      >
                        Yol tarifi{" "}
                        <ArrowUpRight className="size-3.5" strokeWidth={1.25} />
                      </a>
                    )}
                  </Line>
                )}
                {contact.phone && (
                  <Line label="Telefon">
                    <a href={tel} className={link}>
                      {contact.phone}
                    </a>
                  </Line>
                )}
                {contact.email && (
                  <Line label="E-posta">
                    <a href={`mailto:${contact.email}`} className={link}>
                      {contact.email}
                    </a>
                  </Line>
                )}
                {socials.length > 0 && (
                  <Line label="Sosyal">
                    <div className="flex flex-wrap gap-x-8 gap-y-2">
                      {socials.map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={link}
                        >
                          {s.label}
                        </a>
                      ))}
                    </div>
                  </Line>
                )}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <Eyebrow className="mb-10 text-clay">Randevu talebi</Eyebrow>
              <ContactForm />
            </Reveal>
          </div>
        </section>

        {/* Showroom görseli */}
        <section className="relative h-[70svh] min-h-[420px] overflow-hidden bg-forest-deep">
          <Image
            src={SHOWROOM}
            alt={`${general.siteName} showroom`}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-12 text-center text-white md:pb-16">
            <Eyebrow className="mb-4 text-white/75">Ücretsiz keşif</Eyebrow>
            <p className="text-lg font-extralight uppercase tracking-[0.3em] md:text-2xl">
              Mekanınızda, yerinde ölçü
            </p>
          </div>
        </section>
      </main>
      <SiteFooter general={general} contact={contact} home={false} />
    </>
  );
}
