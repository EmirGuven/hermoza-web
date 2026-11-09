import Image from "next/image";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { BackgroundVideo } from "@/components/background-video";
import { Hero } from "@/components/hero";
import { contact } from "@/lib/contact";
import { HermozaLogo } from "@/components/hermoza-logo";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";

// Görseller sunucuda /srv/docker/apps/hermoza/uploads/images altında; lokalde public/uploads/images.
const img = (name: string) => `/uploads/images/${name}.jpg`;

const collections = [
  {
    no: "01",
    title: "Mutfak",
    text: "Masif kapaklar, doğal taş tezgâhlar ve her çekmecesi kullanıma göre planlanmış iç düzen.",
    img: img("koleksiyon-mutfak"),
  },
  {
    no: "02",
    title: "Yaşam Alanı",
    text: "Kitaplıklar, TV duvarları ve konsollar; mekânın mimarisiyle bütünleşen ahşap yüzeyler.",
    img: img("koleksiyon-yasam-alani"),
  },
  {
    no: "03",
    title: "Giyinme Odası",
    text: "Gömme dolaplar ve giyinme odaları; sessiz kapanan kapaklar, gizli aydınlatma.",
    img: img("koleksiyon-giyinme-odasi"),
  },
];

const journal = [
  {
    cat: "Malzeme",
    title: "Masif ceviz neden yıllar geçtikçe güzelleşir?",
    img: img("journal-ceviz"),
  },
  {
    cat: "Proje",
    title: "Zekeriyaköy’de taş ve ahşabın buluştuğu bir mutfak",
    img: img("journal-zekeriyakoy"),
  },
  {
    cat: "Rehber",
    title: "Ada mutfak planlarken dikkat edilmesi gereken 5 ölçü",
    img: img("journal-ada-mutfak"),
  },
];

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`mb-6 text-[10px] font-medium uppercase tracking-[0.5em] ${className}`}>
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <Hero />

        {/* Collections */}
        <section id="koleksiyonlar" className="bg-white">
          {collections.map((c, i) => (
            <article
              key={c.title}
              className="grid items-stretch md:grid-cols-2"
            >
              <div className={`relative aspect-[4/3] md:aspect-auto md:min-h-[640px] ${i % 2 ? "md:order-2" : ""}`}>
                <Image
                  src={c.img}
                  alt={`Hermoza ${c.title} koleksiyonu`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <Reveal className="flex flex-col justify-center px-6 py-16 md:px-20">
                <span className="mb-8 text-sm font-light tracking-[0.3em] text-clay">{c.no}</span>
                <h2 className="mb-6 text-4xl font-extralight uppercase tracking-[0.15em] text-forest md:text-5xl">
                  {c.title}
                </h2>
                <p className="mb-10 max-w-md font-light leading-relaxed text-ink/60">{c.text}</p>
                <a
                  href="#iletisim"
                  className="group inline-flex w-fit items-center gap-3 border-b border-forest/30 pb-2 text-[11px] uppercase tracking-[0.3em] text-forest transition-colors hover:border-rust hover:text-rust"
                >
                  Keşfet
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </a>
              </Reveal>
            </article>
          ))}
        </section>

        {/* Bespoke band */}
        <section className="relative flex min-h-[80svh] items-center justify-center overflow-hidden text-center text-white">
          <BackgroundVideo name="bespoke" />
          <div className="absolute inset-0 bg-forest-deep/70" />
          <div className="relative px-6">
            <Eyebrow className="text-clay">Bespoke</Eyebrow>
            <h2 className="mx-auto mb-8 max-w-4xl text-2xl font-extralight leading-relaxed tracking-wide md:text-4xl">
              Bir mobilyanın değeri, yıllar sonra bile ilk günkü gibi kapanan bir
              kapakta gizlidir. Biz o kapağı <span className="text-clay">ölçüyle,
              sabırla ve elle</span> yapıyoruz.
            </h2>
            <p className="mx-auto mb-12 max-w-lg font-light text-white/70">
              Katalogdan seçmek yerine mekânınız için sıfırdan çizilen
              mobilyalar. Her proje tek, her parça imzalı.
            </p>
            <a
              href="#iletisim"
              className="inline-flex items-center gap-3 border border-white/40 px-9 py-4 text-xs uppercase tracking-[0.3em] transition-colors hover:bg-white hover:text-forest"
            >
              Projenizi anlatın
            </a>
          </div>
        </section>

        {/* Journal */}
        <section id="journal" className="mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-36">
          <div className="mb-14 flex items-end justify-between gap-6">
            <div>
              <Eyebrow className="text-rust">Journal</Eyebrow>
              <h2 className="text-4xl font-extralight uppercase tracking-[0.15em] text-forest md:text-5xl">
                Atölyeden notlar
              </h2>
            </div>
            <a
              href="#journal"
              className="hidden border-b border-forest/30 pb-2 text-[11px] uppercase tracking-[0.3em] text-forest transition-colors hover:border-rust hover:text-rust md:inline"
            >
              Tümü
            </a>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {journal.map((j, i) => (
              <Reveal key={j.title} delay={i * 0.12}>
                <article className="group">
                  <div className="relative mb-6 aspect-[4/3] overflow-hidden bg-clay/30">
                    <Image
                      src={j.img}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 30vw, 100vw"
                      className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                    />
                  </div>
                  <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-clay">{j.cat}</p>
                  <h3 className="mb-3 text-lg font-light leading-snug text-forest">{j.title}</h3>
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-ink/50 transition-colors group-hover:text-rust">
                    Oku <ArrowRight className="size-3.5" />
                  </span>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="iletisim" className="bg-forest text-white">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 md:grid-cols-2 md:px-12 md:py-36">
            <div>
              <Eyebrow className="text-clay">İletişim</Eyebrow>
              <h2 className="mb-8 text-4xl font-extralight uppercase tracking-[0.15em] md:text-5xl">
                Showroom’da
                <br />
                buluşalım
              </h2>
              <p className="mb-12 max-w-md font-light text-white/65">
                Malzemelere dokunmak, numuneleri görmek ve projenizi konuşmak
                için randevu oluşturun. 48 saat içinde dönüş yapıyoruz.
              </p>
              <ul className="space-y-5 text-sm font-light text-white/80">
                <li>
                  <a href={contact.mapsHref} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 transition-colors hover:text-clay">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-clay" strokeWidth={1.5} />
                    {contact.address}
                  </a>
                </li>
                <li>
                  <a href={contact.phoneHref} className="flex items-center gap-4 transition-colors hover:text-clay">
                    <Phone className="size-4 shrink-0 text-clay" strokeWidth={1.5} />
                    {contact.phone}
                  </a>
                </li>
                <li>
                  <a href={contact.emailHref} className="flex items-center gap-4 transition-colors hover:text-clay">
                    <Mail className="size-4 shrink-0 text-clay" strokeWidth={1.5} />
                    {contact.email}
                  </a>
                </li>
              </ul>
            </div>
            <form className="space-y-8">
              {[
                { name: "name", label: "Ad soyad", type: "text" },
                { name: "email", label: "E-posta", type: "email" },
                { name: "phone", label: "Telefon", type: "tel" },
              ].map((f) => (
                <label key={f.name} className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.35em] text-white/50">
                    {f.label}
                  </span>
                  <input
                    name={f.name}
                    type={f.type}
                    className="w-full border-b border-white/25 bg-transparent py-3 font-light outline-none transition-colors focus:border-clay"
                  />
                </label>
              ))}
              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.35em] text-white/50">
                  Projeniz
                </span>
                <textarea
                  name="message"
                  rows={3}
                  className="w-full resize-none border-b border-white/25 bg-transparent py-3 font-light outline-none transition-colors focus:border-clay"
                />
              </label>
              <button
                type="submit"
                className="group inline-flex items-center gap-3 bg-rust px-10 py-4 text-xs uppercase tracking-[0.3em] transition-colors hover:bg-rust/85"
              >
                Gönder
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-forest-deep px-6 py-16 text-white md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <HermozaLogo />
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
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-[11px] uppercase tracking-[0.3em] text-white/55">
            <a href="#koleksiyonlar" className="hover:text-white">Koleksiyonlar</a>
            <a href="#iletisim" className="hover:text-white">İletişim</a>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-7xl flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs font-light text-white/40 md:flex-row">
          <span>© 2026 Hermoza Wood Industry</span>
          <span className="flex flex-wrap gap-x-6 gap-y-1">
            <a href={contact.phoneHref} className="hover:text-white">{contact.phone}</a>
            <a href={contact.emailHref} className="hover:text-white">{contact.email}</a>
            <a href={contact.facebookHref} target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a>
          </span>
        </div>
      </footer>
    </>
  );
}
