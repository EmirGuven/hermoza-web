"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Film, ImageIcon, Upload, X } from "lucide-react";
import { useToast } from "@/components/admin/toast";

export type MediaFile = {
  id: number;
  path: string;
  url: string;
  kind: "image" | "video" | "other";
  size: number;
  originalName: string;
};

/** Dosyaları panel yükleme ucuna gönderir. */
export async function uploadFiles(files: FileList | File[]): Promise<MediaFile[]> {
  const fd = new FormData();
  for (const f of Array.from(files)) fd.append("file", f);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Yükleme başarısız");
  return data.files;
}

export function MediaThumb({ file }: { file: Pick<MediaFile, "url" | "kind"> }) {
  if (file.kind === "video") return <video src={file.url} muted playsInline preload="metadata" />;
  if (file.kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={file.url} alt="" loading="lazy" />;
  }
  return <ImageIcon />;
}

/** Kütüphaneden dosya seçme penceresi; içinden yeni dosya da yüklenebilir. */
export function MediaPicker({
  kind,
  open,
  current,
  onClose,
  onPick,
  onPickMany,
}: {
  kind: "image" | "video";
  open: boolean;
  current?: string;
  onClose: () => void;
  onPick?: (url: string) => void;
  /** Verilirse çoklu seçim: kütüphaneden birden fazla dosya işaretlenip birlikte eklenir */
  onPickMany?: (urls: string[]) => void;
}) {
  const multi = !!onPickMany;
  const [picked, setPicked] = useState<string[]>([]);
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [reload, setReload] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Pencere açılınca (ve yüklemeden sonra) kütüphaneyi getir
  useEffect(() => {
    if (!open) return;
    let alive = true;
    fetch(`/api/admin/media?kind=${kind}`)
      .then((r) => r.json())
      .then((d) => alive && setFiles(d.files ?? []))
      .catch(() => alive && setFiles([]));
    return () => {
      alive = false;
    };
  }, [open, kind, reload]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function onUpload(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    try {
      const up = await uploadFiles(list);
      toast.success(`${up.length} dosya yüklendi`);
      setReload((n) => n + 1);
      const urls = up.filter((f) => f.kind === kind).map((f) => f.url);
      if (multi) {
        // Çoklu modda yüklenenler doğrudan eklenir
        if (urls.length) {
          onPickMany!(urls);
          setPicked([]);
        }
      } else if (urls.length === 1) onPick?.(urls[0]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  if (!open) return null;
  const close = () => {
    setPicked([]);
    onClose();
  };
  const shown = (files ?? []).filter((f) =>
    (f.originalName + f.path).toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR"))
  );

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="modal modal--wide" role="dialog" aria-modal="true">
        <div className="modal__head">
          <div>
            <div className="modal__title">{kind === "video" ? "Video seç" : "Görsel seç"}</div>
            <div className="modal__sub">
              {multi
                ? "Birden fazla görsel işaretleyip ekleyin ya da bilgisayarınızdan toplu yükleyin."
                : "Kütüphaneden seçin ya da bilgisayarınızdan yükleyin."}
            </div>
          </div>
          <button type="button" className="btn btn--icon btn--text" onClick={close} aria-label="Kapat">
            <X />
          </button>
        </div>
        <div className="modal__body">
          <div className="row" style={{ marginBottom: 12 }}>
            <input
              className="input grow"
              placeholder="Dosya adında ara…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <input
              ref={input}
              type="file"
              hidden
              multiple
              accept={kind === "video" ? "video/mp4,video/webm" : "image/*"}
              onChange={(e) => onUpload(e.target.files)}
            />
            <button type="button" className="btn" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? <span className="spinner" /> : <Upload />} Yükle
            </button>
          </div>
          {files === null ? (
            <p className="muted">Yükleniyor…</p>
          ) : shown.length === 0 ? (
            <p className="muted" style={{ padding: "32px 0", textAlign: "center" }}>
              {kind === "video" ? <Film /> : <ImageIcon />} Henüz dosya yok.
            </p>
          ) : (
            <div className="media-grid">
              {shown.map((f) => {
                const sel = multi ? picked.includes(f.url) : current === f.url;
                return (
                <button
                  type="button"
                  key={f.id}
                  className={`media-tile ${sel ? "is-selected" : ""}`}
                  onClick={() =>
                    multi
                      ? setPicked((p) => (p.includes(f.url) ? p.filter((u) => u !== f.url) : [...p, f.url]))
                      : onPick?.(f.url)
                  }
                  title={f.path}
                  aria-pressed={multi ? sel : undefined}
                >
                  <div className="media-tile__img">
                    <MediaThumb file={f} />
                  </div>
                  <div className="media-tile__meta ellipsis">
                    {sel && <Check style={{ width: 14, height: 14, color: "var(--accent)", marginRight: 4, verticalAlign: -2 }} />}
                    {f.path.split("/").pop()}
                  </div>
                </button>
                );
              })}
            </div>
          )}
        </div>
        {multi && (
          <div className="modal__foot">
            <span className="muted grow">{picked.length ? `${picked.length} görsel seçildi` : "Eklemek istediğiniz görselleri işaretleyin"}</span>
            <button type="button" className="btn" onClick={close}>Vazgeç</button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!picked.length}
              onClick={() => {
                onPickMany!(picked);
                close();
              }}
            >
              Ekle{picked.length ? ` (${picked.length})` : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
