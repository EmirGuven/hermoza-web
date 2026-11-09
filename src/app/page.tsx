import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { BackgroundVideo } from "@/components/background-video";
import { ContactForm } from "@/components/contact-form";
import { Hero } from "@/components/hero";
import { HermozaLogo } from "@/components/hermoza-logo";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { getCollections, getJournal, getSetting } from "@/lib/content";
import { phoneDigits } from "@/lib/content-types";

// Tüm içerik panelden (/admin) yönetilir; önbellekte tutulur, panelde kayıt yapılınca yenilenir.

export async function generateMetadata(): Promise<Metadata> {
  const g = await getSetting("general");
  return { title: g.seoTitle, description: g.seoDescription };
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

const isExternal = (href: string) => /^https?:\/\//.test(href);

export default async function Home() {
  const [general, contact, home, collections, journal] = await Promise.all([
    getSetting("general"),
    getSetting("contact"),
    getSetting("home"),
    getCollections(),
    getJournal(),
  ]);
  const tel = contact.phone ? `tel:+${phoneDigits(contact.phone)}` : "";
  const socials = [
    { label: "Facebook", href: contact.facebook },
    { label: "Instagram", href: contact.instagram },
    { label: "WhatsApp", href: contact.whatsapp ? `https://wa.me/${phoneDigits(contact.whatsapp)}` : "" },
  ].filter((s) => s.href);

  return (
    <>
      <SiteHeader general={general} contact={contact} />

      <main>
        <Hero video={home.hero} />

        {/* Koleksiyonlar */}
        {collections.length > 0 && (
          <section id="koleksiyonlar" className="bg-white">
            {collections.map((c, i) => (
              <article key={c.id} className="grid items-stretch md:grid-cols-2">
                <div className={`relative aspect-[4/3] bg-clay/20 md:aspect-auto md:min-h-[640px] ${i % 2 ? "md:order-2" : ""}`}>
                  {c.image && (
                    <Image
                      src={c.image}
                      alt={`${general.siteName} ${c.title}`}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <Reveal className="flex flex-col justify-center px-6 py-16 md:px-20">
                  <span className="mb-8 text-sm font-light tracking-[0.3em] text-clay">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mb-6 text-4xl font-extralight uppercase tracking-[0.15em] text-forest md:text-5xl">
                    {c.title}
                  </h2>
                  <p className="mb-10 max-w-md font-light leading-relaxed text-ink/60">{c.body}</p>
                  {c.linkLabel && c.linkHref && (
                    <a
                      href={c.linkHref}
                      {...(isExternal(c.linkHref) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group inline-flex w-fit items-center gap-3 border-b border-forest/30 pb-2 text-[11px] uppercase tracking-[0.3em] text-forest transition-colors hover:border-rust hover:text-rust"
                    >
                      {c.linkLabel}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </a>
                  )}
                </Reveal>
              </article>
            ))}
          </section>
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

        {/* Journal */}
        {journal.length > 0 && (
          <section id="journal" className="mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-36">
            <div className="mb-14">
              <Eyebrow className="text-rust">{home.journal.eyebrow}</Eyebrow>
              <h2 className="text-4xl font-extralight uppercase tracking-[0.15em] text-forest md:text-5xl">
                {home.journal.title}
              </h2>
            </div>
            <div className="grid gap-10 md:grid-cols-3">
              {journal.slice(0, 3).map((j, i) => {
                const card = (
                  <article className="group">
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
                    {j.href && (
                      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-ink/50 transition-colors group-hover:text-rust">
                        Oku <ArrowRight className="size-3.5" />
                      </span>
                    )}
                  </article>
                );
                return (
                  <Reveal key={j.id} delay={i * 0.12}>
                    {j.href ? (
                      <a href={j.href} {...(isExternal(j.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        {card}
                      </a>
                    ) : (
                      card
                    )}
                  </Reveal>
                );
              })}
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

      <footer className="bg-forest-deep px-6 py-16 text-white md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <HermozaLogo />
            {general.newsletterEnabled && (
              <>
                <p className="mb-4 mt-10 text-[10px] uppercase tracking-[0.35em] text-clay">Bülten</p>
                <form className="flex border-b border-white/25 focus-within:border-clay">
                  <input
                    type="email"
                    name="newsletter"
                    placeholder="E-posta adresiniz"
                    aria-label="E-posta adresiniz"
                    className="w-full bg-transparent py-3 text-sm font-light outline-none placeholder:text-white/35"
                  />
                  <button type="submit" aria-label="Bültene kaydol" className="px-2 text-white/60 hover:text-clay">
                    <ArrowRight className="size-4" />
                  </button>
                </form>
              </>
            )}
          </div>
          {general.footerLinks.length > 0 && (
            <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-[11px] uppercase tracking-[0.3em] text-white/55">
              {general.footerLinks.map((l) => (
                <a
                  key={l.href + l.label}
                  href={l.href}
                  {...(isExternal(l.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="mx-auto mt-16 flex max-w-7xl flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs font-light text-white/40 md:flex-row">
          <span>{general.footerCopyright}</span>
          <span className="flex flex-wrap gap-x-6 gap-y-1">
            {contact.phone && <a href={tel} className="hover:text-white">{contact.phone}</a>}
            {contact.email && <a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a>}
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {s.label}
              </a>
            ))}
          </span>
        </div>
      </footer>
    </>
  );
}
