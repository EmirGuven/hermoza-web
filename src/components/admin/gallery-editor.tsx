"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { MediaPicker } from "@/components/admin/media-picker";

export type GalleryItem = { src: string; caption: string };

/**
 * Koleksiyon galerisi: görsel ekle (çoklu seçim/yükleme), sırala, altına yazı ekle, sil.
 * Değer gizli input'ta JSON olarak gider.
 */
export function GalleryEditor({
  name,
  label,
  defaultValue = [],
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: GalleryItem[];
  hint?: string;
}) {
  const [items, setItems] = useState<GalleryItem[]>(defaultValue);
  // Kayıttan sonra sunucudan yeni değer gelirse ona eşitle
  const [prev, setPrev] = useState(defaultValue);
  if (prev !== defaultValue && JSON.stringify(prev) !== JSON.stringify(defaultValue)) {
    setPrev(defaultValue);
    setItems(defaultValue);
  }
  const [open, setOpen] = useState(false);

  const move = (i: number, d: -1 | 1) =>
    setItems((list) => {
      const j = i + d;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="field">
      <div className="spread">
        <span className="label">{label}</span>
        <span className="hint">{items.length} görsel</span>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div className="gallery-ed">
        {items.map((it, i) => (
          <div key={it.src + i} className="gallery-ed__item">
            <div className="gallery-ed__img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.src} alt="" loading="lazy" />
              <span className="gallery-ed__no">{String(i + 1).padStart(2, "0")}</span>
              <div className="gallery-ed__acts">
                <button type="button" className="btn btn--icon btn--sm" title="Öne al" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowLeft />
                </button>
                <button type="button" className="btn btn--icon btn--sm" title="Geri al" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  className="btn btn--icon btn--sm btn--danger"
                  title="Kaldır"
                  onClick={() => setItems((list) => list.filter((_, k) => k !== i))}
                >
                  <Trash2 />
                </button>
              </div>
            </div>
            <input
              className="input"
              placeholder="Görsel altı yazısı (isteğe bağlı)"
              value={it.caption}
              onChange={(e) =>
                setItems((list) => list.map((x, k) => (k === i ? { ...x, caption: e.target.value } : x)))
              }
            />
          </div>
        ))}
        <button type="button" className="gallery-ed__add" onClick={() => setOpen(true)}>
          <ImagePlus />
          Görsel ekle
          <span className="hint">Birden fazla seçebilir ya da toplu yükleyebilirsiniz</span>
        </button>
      </div>
      {hint && <span className="hint">{hint}</span>}

      <MediaPicker
        kind="image"
        open={open}
        onClose={() => setOpen(false)}
        onPickMany={(urls) => {
          setItems((list) => [...list, ...urls.map((src) => ({ src, caption: "" }))]);
          setOpen(false);
        }}
      />
    </div>
  );
}
