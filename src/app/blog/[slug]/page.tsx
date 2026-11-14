import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PostCard, PostMeta, postExcerpt } from "@/components/blog";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPost, getPosts, getSetting } from "@/lib/content";
import { Markdown, plainText, truncate } from "@/lib/markdown";
import { SITE_URL, absUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// Build sırasında yayındaki yazılar önceden üretilir; sonradan eklenenler ilk istekte üretilip saklanır.
// Cache Components en az bir parametre ister: yazı yoksa yer tutucu döner (sayfası 404 verir).
export async function generateStaticParams() {
  const posts = await getPosts();
  const slugs = posts.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
  return slugs.length ? slugs : [{ slug: "__yazi-yok__" }];
}

const description = (p: NonNullable<Awaited<ReturnType<typeof getPost>>>) =>
  p.seoDescription || p.excerpt || truncate(plainText(p.content), 160);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, g] = await Promise.all([getPost(slug), getSetting("general")]);
  if (!post) return { title: "Yazı bulunamadı" };
  const title = post.seoTitle || post.title;
  const desc = description(post);
  const image = post.image || g.ogImage || "/og-hermoza.jpg";
  return {
    title,
    description: desc,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      locale: "tr_TR",
      url: `/blog/${post.slug}`,
      siteName: g.siteName,
      title,
      description: desc,
      publishedTime: new Date(post.publishedAt).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      section: post.category || undefined,
      images: [{ url: image, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title, description: desc, images: [image] },
  };
}

// Header/footer önbellekten hemen gelir; yazı adrese (params) bağlı olduğu için Suspense içinde.
// Build'den sonra eklenen yazıların adresi önceden bilinmez, Next bu erişimin Suspense içinde olmasını ister.
export default async function BlogPostPage({ params }: Props) {
  const [general, contact] = await Promise.all([getSetting("general"), getSetting("contact")]);
  return (
    <>
      <SiteHeader general={general} contact={contact} home={false} />
      <main>
        <Suspense fallback={<PostSkeleton />}>
          <PostContent params={params} siteName={general.siteName} />
        </Suspense>
      </main>
      <SiteFooter general={general} contact={contact} home={false} />
    </>
  );
}

function PostSkeleton() {
  return (
    <>
      <div className="min-h-[72svh] bg-forest" />
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-16 md:py-24">
        <div className="h-4 w-full bg-forest/5" />
        <div className="h-4 w-11/12 bg-forest/5" />
        <div className="h-4 w-4/5 bg-forest/5" />
      </div>
    </>
  );
}

async function PostContent({ params, siteName }: { params: Props["params"]; siteName: string }) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();

  // Diğer yazılar: önce aynı kategoriden, sonra en yeniler
  const others = posts.filter((p) => p.id !== post.id);
  const related = [
    ...others.filter((p) => post.category && p.category === post.category),
    ...others.filter((p) => !post.category || p.category !== post.category),
  ].slice(0, 3);

  const url = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#yazi`,
        headline: post.title,
        description: description(post),
        image: post.image ? absUrl(post.image) : undefined,
        datePublished: new Date(post.publishedAt).toISOString(),
        dateModified: new Date(post.updatedAt).toISOString(),
        articleSection: post.category || undefined,
        inLanguage: "tr-TR",
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: siteName, url: `${SITE_URL}/` },
        publisher: { "@id": `${SITE_URL}/#isletme`, "@type": "Organization", name: siteName, logo: absUrl("/icon.png") },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  }).replace(/</g, "\\u003c");

  const lead = postExcerpt(post);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        {/* Kapak */}
        <header className="relative flex min-h-[72svh] items-end overflow-hidden bg-forest text-white">
          {post.image && (
            <Image src={post.image} alt="" fill priority sizes="100vw" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/55 to-forest-deep/20" />
          <div className="relative mx-auto w-full max-w-4xl px-6 pb-16 pt-40 md:pb-20">
            <nav aria-label="Konum" className="mb-10 text-[10px] uppercase tracking-[0.35em] text-white/55">
              <Link href="/" className="hover:text-white">Ana sayfa</Link>
              <span className="mx-3">/</span>
              <Link href="/blog" className="hover:text-white">Blog</Link>
            </nav>
            <PostMeta post={post} light />
            <h1 className="mt-6 text-3xl font-extralight leading-tight tracking-wide md:text-5xl md:leading-[1.15]">
              {post.title}
            </h1>
          </div>
        </header>

        {/* Yazı */}
        <article className="mx-auto max-w-2xl px-6 py-16 md:py-24">
          {lead && post.excerpt && (
            <p className="mb-12 border-l-2 border-clay pl-6 text-xl font-light leading-relaxed text-forest">{lead}</p>
          )}
          {post.content ? (
            <div className="post-body">
              <Markdown source={post.content} />
            </div>
          ) : (
            !post.excerpt && <p className="font-light text-ink/50">Bu yazının içeriği yakında eklenecek.</p>
          )}

          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-forest/10 pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-forest transition-colors hover:text-rust"
            >
              <ArrowLeft className="size-3.5" /> Tüm yazılar
            </Link>
            <Link
              href="/#iletisim"
              className="inline-flex items-center gap-3 border border-forest px-7 py-3.5 text-[11px] uppercase tracking-[0.3em] text-forest transition-colors hover:bg-forest hover:text-white"
            >
              Projenizi konuşalım <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-forest/10 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
              <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.5em] text-rust">Okumaya devam edin</p>
              <h2 className="mb-14 text-3xl font-extralight uppercase tracking-[0.15em] text-forest md:text-4xl">
                Diğer yazılar
              </h2>
              <div className="grid gap-x-10 gap-y-16 md:grid-cols-3">
                {related.map((p, i) => (
                  <Reveal key={p.id} delay={i * 0.1}>
                    <PostCard post={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}
    </>
  );
}
