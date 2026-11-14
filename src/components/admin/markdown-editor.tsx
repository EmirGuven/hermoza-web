"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pencil,
  Quote,
} from "lucide-react";
import { MediaPicker } from "@/components/admin/media-picker";
import { Markdown, plainText, readingMinutes } from "@/lib/markdown";

type Tool = "h2" | "h3" | "bold" | "italic" | "link" | "ul" | "ol" | "quote" | "image" | "hr";

const TOOLS: { id: Tool; title: string; icon: React.ReactNode }[] = [
  { id: "h2", title: "Ara başlık", icon: <Heading2 /> },
  { id: "h3", title: "Alt başlık", icon: <Heading3 /> },
  { id: "bold", title: "Kalın (⌘B)", icon: <Bold /> },
  { id: "italic", title: "İtalik (⌘I)", icon: <Italic /> },
  { id: "link", title: "Bağlantı (⌘K)", icon: <Link2 /> },
  { id: "ul", title: "Madde listesi", icon: <List /> },
  { id: "ol", title: "Numaralı liste", icon: <ListOrdered /> },
  { id: "quote", title: "Alıntı", icon: <Quote /> },
  { id: "image", title: "Görsel ekle", icon: <ImagePlus /> },
  { id: "hr", title: "Ayraç", icon: <Minus /> },
];

/**
 * Blog yazısı editörü: araç çubuklu Markdown alanı + site görünümünde önizleme.
 * Değer textarea'nın kendisiyle (name) formla gider.
 */
export function MarkdownEditor({
  name,
  label,
  defaultValue = "",
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  // Kayıttan sonra sunucudan yeni değer gelirse ona eşitle
  const [prevDefault, setPrevDefault] = useState(defaultValue);
  if (prevDefault !== defaultValue) {
    setPrevDefault(defaultValue);
    setValue(defaultValue);
  }
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [picker, setPicker] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);

  /** Metni değiştirip seçimi/imleci geri yerleştirir */
  function apply(next: string, selStart: number, selEnd: number) {
    setValue(next);
    requestAnimationFrame(() => {
      const el = ta.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  }

  /** Seçimi iki işaret arasına alır: **kalın**, *italik* */
  function wrap(before: string, after: string, placeholder: string) {
    const el = ta.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    apply(next, s + before.length, s + before.length + sel.length);
  }

  /** Seçili satırların başına işaret koyar (## , - , > , 1. ); varsa kaldırır */
  function linePrefix(prefix: string | ((i: number) => string)) {
    const el = ta.current;
    if (!el) return;
    const s = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    let e = value.indexOf("\n", el.selectionEnd);
    if (e === -1) e = value.length;
    const lines = value.slice(s, e).split("\n");
    const pre = (i: number) => (typeof prefix === "function" ? prefix(i) : prefix);
    const all = lines.every((l, i) => l.startsWith(pre(i)));
    // Satırda başka bir blok işareti varsa (ör. "- " iken "## ") önce onu kaldır
    const existing = /^(#{1,4}\s+|>\s?|[-*]\s+|\d+[.)]\s+)/;
    const out = lines
      .map((l, i) => (all ? l.slice(pre(i).length) : pre(i) + l.replace(existing, "")))
      .join("\n");
    const next = value.slice(0, s) + out + value.slice(e);
    apply(next, s, s + out.length);
  }

  /** İmlecin olduğu yere ayrı bir blok ekler (görsel, ayraç) */
  function insertBlock(block: string) {
    const el = ta.current;
    const pos = el ? el.selectionEnd : value.length;
    const before = value.slice(0, pos).replace(/\s*$/, "");
    const after = value.slice(pos).replace(/^\s*/, "");
    const head = before ? before + "\n\n" : "";
    const next = head + block + "\n\n" + after;
    const caret = head.length + block.length + 2;
    apply(next, caret, caret);
  }

  function link() {
    const url = window.prompt("Bağlantı adresi (https://… ya da /blog/…)", "https://");
    if (!url) return;
    const el = ta.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const text = value.slice(s, e) || "bağlantı metni";
    const md = `[${text}](${url.trim()})`;
    apply(value.slice(0, s) + md + value.slice(e), s + 1, s + 1 + text.length);
  }

  const words = plainText(value).split(" ").filter(Boolean).length;
  function runTool(tool: Tool) {
    switch (tool) {
      case "h2": return linePrefix("## ");
      case "h3": return linePrefix("### ");
      case "bold": return wrap("**", "**", "kalın metin");
      case "italic": return wrap("*", "*", "italik metin");
      case "link": return link();
      case "ul": return linePrefix("- ");
      case "ol": return linePrefix((i) => `${i + 1}. `);
      case "quote": return linePrefix("> ");
      case "image": return setPicker(true);
      case "hr": return insertBlock("---");
    }
  }

  return (
    <div className="field md-editor">
      <div className="spread">
        <span className="label">{label}</span>
        <span className="hint">
          {words} kelime · {readingMinutes(value)} dk okuma
        </span>
      </div>
      <div className="md-editor__box">
        <div className="md-editor__bar">
          <div className="md-editor__tools" aria-hidden={tab === "preview"}>
            {TOOLS.map((t) => (
              <button
                key={t.title}
                type="button"
                className="btn btn--icon btn--sm btn--text"
                title={t.title}
                aria-label={t.title}
                disabled={tab === "preview"}
                onClick={() => runTool(t.id)}
              >
                {t.icon}
              </button>
            ))}
          </div>
          <div className="md-editor__tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === "write"} className={tab === "write" ? "is-on" : ""} onClick={() => setTab("write")}>
              <Pencil /> Yaz
            </button>
            <button type="button" role="tab" aria-selected={tab === "preview"} className={tab === "preview" ? "is-on" : ""} onClick={() => setTab("preview")}>
              <Eye /> Önizle
            </button>
          </div>
        </div>
        <textarea
          ref={ta}
          name={name}
          className="md-editor__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          hidden={tab === "preview"}
          rows={22}
          spellCheck
          placeholder={"Yazınızı buraya yazın.\n\n## Ara başlık\nParagraflar arasında bir boş satır bırakın.\n\n- Madde\n- Madde"}
          onKeyDown={(e) => {
            if (!(e.metaKey || e.ctrlKey)) return;
            if (e.key === "b") { e.preventDefault(); wrap("**", "**", "kalın metin"); }
            if (e.key === "i") { e.preventDefault(); wrap("*", "*", "italik metin"); }
            if (e.key === "k") { e.preventDefault(); link(); }
          }}
        />
        {tab === "preview" && (
          <div className="md-editor__preview">
            {value.trim() ? (
              <div className="post-body">
                <Markdown source={value} />
              </div>
            ) : (
              <p className="muted">Önizlenecek içerik yok.</p>
            )}
          </div>
        )}
      </div>
      <span className="hint">
        Paragraflar arasında bir boş satır bırakın. Kısayollar: ⌘B kalın, ⌘I italik, ⌘K bağlantı. Görseller medya kütüphanesinden eklenir.
      </span>
      <MediaPicker
        kind="image"
        open={picker}
        onClose={() => setPicker(false)}
        onPick={(url) => {
          setPicker(false);
          const alt = window.prompt("Görsel açıklaması (altında yazı olarak görünür, boş bırakılabilir)", "") ?? "";
          insertBlock(`![${alt.replace(/[[\]]/g, "")}](${url})`);
        }}
      />
    </div>
  );
}
