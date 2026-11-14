"use client";

import { useState } from "react";
import { FolderOpen, ImageIcon, Trash2 } from "lucide-react";
import { MediaPicker, MediaThumb } from "@/components/admin/media-picker";

/** Formda görsel/video alanı: önizleme + kütüphaneden seç. Değer gizli input'ta gider. */
export function MediaField({
  name,
  label,
  defaultValue = "",
  kind = "image",
  hint,
  dark,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  kind?: "image" | "video";
  hint?: string;
  /** Beyaz logo gibi açık renkli görseller için koyu önizleme zemini */
  dark?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  // Kayıttan sonra sunucudan yeni değer gelirse alanı ona eşitle (eski seçim kalıp yeni veriyi ezmesin)
  const [prevDefault, setPrevDefault] = useState(defaultValue);
  if (prevDefault !== defaultValue) {
    setPrevDefault(defaultValue);
    setValue(defaultValue);
  }
  const [open, setOpen] = useState(false);

  return (
    <div className="field">
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={value} />
      <div className="pick">
        <div className={`pick__preview ${dark ? "pick__preview--dark" : ""}`}>
          {value ? <MediaThumb file={{ url: value, kind }} /> : <ImageIcon />}
        </div>
        <div className="col grow" style={{ gap: 8 }}>
          <input
            className="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="/media/…"
            aria-label={`${label} adresi`}
          />
          <div className="row">
            <button type="button" className="btn btn--sm" onClick={() => setOpen(true)}>
              <FolderOpen /> {kind === "video" ? "Video seç" : "Görsel seç"}
            </button>
            {value && (
              <button type="button" className="btn btn--sm btn--text" onClick={() => setValue("")}>
                <Trash2 /> Kaldır
              </button>
            )}
          </div>
          {hint && <span className="hint">{hint}</span>}
        </div>
      </div>
      <MediaPicker
        kind={kind}
        open={open}
        current={value}
        onClose={() => setOpen(false)}
        onPick={(url) => {
          setValue(url);
          setOpen(false);
        }}
      />
    </div>
  );
}
