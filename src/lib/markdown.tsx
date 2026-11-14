import type { ReactNode } from "react";

/**
 * Blog yazıları için küçük Markdown çevirici. HTML üretmez, doğrudan React elemanı döner:
 * içerikteki metin her zaman kaçışlanır, ham HTML çalışmaz (XSS yok).
 *
 * Desteklenen söz dizimi:
 *   ## Başlık / ### Alt başlık          paragraf (boş satırla ayrılır)
 *   **kalın**  *italik*  [bağlantı](https://…)
 *   - madde / 1. numaralı madde         > alıntı
 *   ![açıklama](/media/images/x.jpg)    tek satırda görsel (açıklama altta yazı olarak görünür)
 *   ---                                 ayraç
 */

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
const SAFE_SRC = /^(https?:\/\/|\/)/i;

function inline(text: string, key = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  // Sıra önemli: bağlantı, kalın, italik
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${n++}`;
    if (m[1] !== undefined) {
      const href = m[2];
      if (SAFE_HREF.test(href)) {
        const ext = /^https?:\/\//i.test(href);
        out.push(
          <a key={k} href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {inline(m[1], k)}
          </a>
        );
      } else out.push(m[1]);
    } else if (m[3] !== undefined || m[4] !== undefined) {
      out.push(<strong key={k}>{inline(m[3] ?? m[4], k)}</strong>);
    } else {
      out.push(<em key={k}>{inline(m[5] ?? m[6], k)}</em>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Satır içi biçim + tek satır sonlarını <br> olarak korur */
function lines(text: string, key: string): ReactNode[] {
  return text.split("\n").flatMap((l, i) => (i ? [<br key={`${key}-br${i}`} />, ...inline(l, `${key}-${i}`)] : inline(l, `${key}-${i}`)));
}

export function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  const all = source.replace(/\r\n?/g, "\n").split("\n");
  let i = 0;
  let k = 0;

  while (i < all.length) {
    const line = all[i];
    const t = line.trim();
    if (!t) {
      i++;
      continue;
    }
    const key = `b${k++}`;

    // Başlık
    const h = /^(#{1,4})\s+(.*)$/.exec(t);
    if (h) {
      const level = Math.max(2, h[1].length); // sayfada tek h1 (yazı başlığı) olsun
      const content = inline(h[2], key);
      blocks.push(level === 2 ? <h2 key={key}>{content}</h2> : level === 3 ? <h3 key={key}>{content}</h3> : <h4 key={key}>{content}</h4>);
      i++;
      continue;
    }

    // Ayraç
    if (/^(-{3,}|\*{3,})$/.test(t)) {
      blocks.push(<hr key={key} />);
      i++;
      continue;
    }

    // Görsel (tek satır)
    const img = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(t);
    if (img) {
      if (SAFE_SRC.test(img[2])) {
        blocks.push(
          <figure key={key}>
            {/* Boyutları bilinmeyen içerik görseli: düz img, tembel yükleme */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img[2]} alt={img[1]} loading="lazy" decoding="async" />
            {img[1] && <figcaption>{img[1]}</figcaption>}
          </figure>
        );
      }
      i++;
      continue;
    }

    // Alıntı
    if (t.startsWith(">")) {
      const buf: string[] = [];
      while (i < all.length && all[i].trim().startsWith(">")) buf.push(all[i++].trim().replace(/^>\s?/, ""));
      blocks.push(<blockquote key={key}><p>{lines(buf.join("\n"), key)}</p></blockquote>);
      continue;
    }

    // Liste
    const isUl = (s: string) => /^[-*•]\s+/.test(s.trim());
    const isOl = (s: string) => /^\d+[.)]\s+/.test(s.trim());
    if (isUl(t) || isOl(t)) {
      const ordered = isOl(t);
      const items: string[] = [];
      while (i < all.length && all[i].trim() && (ordered ? isOl(all[i]) : isUl(all[i]))) {
        items.push(all[i++].trim().replace(ordered ? /^\d+[.)]\s+/ : /^[-*•]\s+/, ""));
      }
      const lis = items.map((it, j) => <li key={`${key}-${j}`}>{inline(it, `${key}-${j}`)}</li>);
      blocks.push(ordered ? <ol key={key}>{lis}</ol> : <ul key={key}>{lis}</ul>);
      continue;
    }

    // Paragraf: boş satıra ya da başka bir blok başlangıcına kadar
    const buf: string[] = [];
    while (i < all.length) {
      const s = all[i].trim();
      if (!s || /^#{1,4}\s/.test(s) || s.startsWith(">") || isUl(s) || isOl(s) || /^!\[[^\]]*\]\([^)]+\)$/.test(s) || /^(-{3,}|\*{3,})$/.test(s)) break;
      buf.push(s);
      i++;
    }
    blocks.push(<p key={key}>{lines(buf.join("\n"), key)}</p>);
  }

  return <>{blocks}</>;
}

/** Markdown işaretlerini temizleyip düz metin döner (özet, meta açıklama, okuma süresi) */
export function plainText(source: string): string {
  return source
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^([-*•]|\d+[.)])\s+/gm, "")
    .replace(/(\*\*|__|\*|_)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingMinutes(source: string): number {
  const words = plainText(source).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : max).replace(/[,.;:\s]+$/, "") + "…";
}
