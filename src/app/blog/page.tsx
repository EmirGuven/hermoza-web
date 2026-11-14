import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PostCard, PostMeta, postExcerpt } from "@/components/blog";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPosts, getSetting } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const [g, home] = await Promise.all([getSetting("general"), getSetting("home")]);
  const title = `${home.journal.title} — Blog`;
  const description = `${g.siteName} atölyesinden malzeme rehberleri, proje hikâyeleri ve ölçüye özel mobilya üzerine notlar.`;
  return {
    title,
    description,
    alternates: { canonical: "/blog" },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: "/blog",
      siteName: g.siteName,
      title,
      description,
      images: [{ url: g.ogImage || "/og-hermoza.jpg", width: 1200, height: 630, alt: g.siteName }],
    },
  };
}

export default async function BlogIndex() {
  const [general, contact, home, posts] = await Promise.all([
    getSetting("general"),
    getSetting("contact"),
    getSetting("home"),
    getPosts(),
  ]);
  const [featured, ...rest] = posts;

  return (
    <>
      <SiteHeader general={general} contact={contact} home={false} />
      <main>
        <section className="bg-forest px-6 pb-20 pt-40 text-white md:px-12 md:pb-28 md:pt-48">
          <div className="mx-auto max-w-7xl">
            <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.5em] text-clay">{home.journal.eyebrow}</p>
            <h1 className="max-w-3xl text-4xl font-extralight uppercase leading-[1.15] tracking-[0.12em] md:text-6xl">
              {home.journal.title}
            </h1>
            <p className="mt-8 max-w-xl font-light leading-relaxed text-white/65">
              Malzeme rehberleri, proje hikâyeleri ve ölçüye özel mobilya üzerine atölyeden notlar.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
          {!featured ? (
            <p className="py-20 text-center font-light text-ink/50">Henüz yayınlanmış yazı yok.</p>
          ) : (
            <>
              <Reveal>
                <Link href={`/blog/${featured.slug}`} className="group grid items-center gap-10 md:grid-cols-[7fr_5fr] md:gap-16">
                  <div className="relative aspect-[4/3] overflow-hidden bg-clay/30 md:aspect-[16/11]">
                    {featured.image && (
                      <Image
                        src={featured.image}
                        alt=""
                        fill
                        priority
                        sizes="(min-width: 768px) 58vw, 100vw"
                        className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div>
                    <PostMeta post={featured} />
                    <h2 className="mb-6 mt-5 text-3xl font-extralight leading-tight text-forest transition-colors group-hover:text-rust md:text-4xl">
                      {featured.title}
                    </h2>
                    {postExcerpt(featured) && (
                      <p className="mb-8 font-light leading-relaxed text-ink/60">{postExcerpt(featured)}</p>
                    )}
                    <span className="inline-flex items-center gap-3 border-b border-forest/30 pb-2 text-[11px] uppercase tracking-[0.3em] text-forest transition-colors group-hover:border-rust group-hover:text-rust">
                      Yazıyı oku
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>

              {rest.length > 0 && (
                <div className="mt-24 grid gap-x-10 gap-y-16 border-t border-forest/10 pt-16 md:grid-cols-3">
                  {rest.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 3) * 0.1}>
                      <PostCard post={p} />
                    </Reveal>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <SiteFooter general={general} contact={contact} home={false} />
    </>
  );
}
