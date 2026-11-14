import { HermozaLogo } from "@/components/hermoza-logo";
import { NewsletterForm } from "@/components/newsletter-form";
import { phoneDigits, type ContactSettings, type GeneralSettings } from "@/lib/content-types";

const isExternal = (href: string) => /^https?:\/\//.test(href);

/** Tüm herkese açık sayfaların altbilgisi. Ana sayfa dışında "#bolum" bağlantıları ana sayfaya gider. */
export function SiteFooter({
  general,
  contact,
  home = true,
}: {
  general: GeneralSettings;
  contact: ContactSettings;
  home?: boolean;
}) {
  const fix = (href: string) => (!home && href.startsWith("#") ? `/${href}` : href);
  const tel = contact.phone ? `tel:+${phoneDigits(contact.phone)}` : "";
  const socials = [
    { label: "Facebook", href: contact.facebook },
    { label: "Instagram", href: contact.instagram },
    { label: "WhatsApp", href: contact.whatsapp ? `https://wa.me/${phoneDigits(contact.whatsapp)}` : "" },
  ].filter((s) => s.href);

  return (
    <footer className="bg-forest-deep px-6 py-16 text-white md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <HermozaLogo />
          {general.newsletterEnabled && (
            <>
              <p className="mb-4 mt-10 text-[10px] uppercase tracking-[0.35em] text-clay">Bülten</p>
              <NewsletterForm />
            </>
          )}
        </div>
        {general.footerLinks.length > 0 && (
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-[11px] uppercase tracking-[0.3em] text-white/55">
            {general.footerLinks.map((l) => (
              <a
                key={l.href + l.label}
                href={fix(l.href)}
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
          <a href="/cerez-politikasi" className="hover:text-white">Çerez politikası</a>
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              {s.label}
            </a>
          ))}
        </span>
      </div>
    </footer>
  );
}
