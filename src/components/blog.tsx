import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/content-types";
import { plainText, readingMinutes, truncate } from "@/lib/markdown";

const DATE = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

export const postDate = (d: Date | string) => DATE.format(new Date(d));

/** Özet boşsa içerikten üretilir */
export const postExcerpt = (p: Pick<BlogPost, "excerpt" | "content">, max = 180) =>
  p.excerpt || truncate(plainText(p.content), max);

export function PostMeta({ post, light }: { post: BlogPost; light?: boolean }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.35em] ${light ? "text-white/60" : "text-ink/45"}`}>
      {post.category && <span className="text-clay">{post.category}</span>}
      {post.category && <span aria-hidden>·</span>}
      <time dateTime={new Date(post.publishedAt).toISOString()}>{postDate(post.publishedAt)}</time>
      {post.content && (
        <>
          <span aria-hidden>·</span>
          <span>{readingMinutes(post.content)} dk okuma</span>
        </>
      )}
    </p>
  );
}

/** Liste ve "diğer yazılar" kartı */
export function PostCard({ post, sizes = "(min-width: 768px) 30vw, 100vw" }: { post: BlogPost; sizes?: string }) {
  const excerpt = postExcerpt(post, 140);
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article>
        <div className="relative mb-6 aspect-[4/3] overflow-hidden bg-clay/30">
          {post.image && (
            <Image
              src={post.image}
              alt=""
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
            />
          )}
        </div>
        <PostMeta post={post} />
        <h3 className="mb-3 mt-3 text-xl font-light leading-snug text-forest transition-colors group-hover:text-rust">
          {post.title}
        </h3>
        {excerpt && <p className="mb-5 font-light leading-relaxed text-ink/60">{excerpt}</p>}
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-ink/50 transition-colors group-hover:text-rust">
          Oku <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </article>
    </Link>
  );
}
