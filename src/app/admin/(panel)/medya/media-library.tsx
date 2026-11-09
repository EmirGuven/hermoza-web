"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash2, Upload } from "lucide-react";
import { deleteMedia } from "@/app/admin/actions";
import { MediaThumb, uploadFiles, type MediaFile } from "@/components/admin/media-picker";
import { useToast } from "@/components/admin/toast";
import { formatBytes } from "@/components/admin/ui";

export function MediaLibrary({ initial }: { initial: MediaFile[] }) {
  const [files, setFiles] = useState(initial);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  async function upload(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    try {
      const up = await uploadFiles(list);
      setFiles((f) => [...up, ...f]);
      toast.success(`${up.length} dosya yüklendi`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove(f: MediaFile) {
    if (!confirm(`“${f.path}” silinsin mi?\nSitede kullanılıyorsa o alan boş görünür.`)) return;
    const res = await deleteMedia(f.id);
    if (res.ok) {
      setFiles((l) => l.filter((x) => x.id !== f.id));
      toast.success("Dosya silindi");
    } else toast.error(res.error ?? "Silinemedi");
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Adres kopyalandı");
    } catch {
      toast.error("Kopyalanamadı");
    }
  }

  const shown = files.filter((f) => filter === "all" || f.kind === filter);
  const counts = {
    all: files.length,
    image: files.filter((f) => f.kind === "image").length,
    video: files.filter((f) => f.kind === "video").length,
  };

  return (
    <>
      <div
        className={`dropzone ${over ? "is-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          upload(e.dataTransfer.files);
        }}
      >
        <input ref={input} type="file" hidden multiple accept="image/*,video/mp4,video/webm" onChange={(e) => upload(e.target.files)} />
        <p style={{ marginBottom: 10 }}>Dosyaları buraya sürükleyin ya da</p>
        <button type="button" className="btn btn--primary" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <span className="spinner" /> : <Upload />} Bilgisayardan seç
        </button>
      </div>

      <div className="row" style={{ gap: 4 }}>
        {(
          [
            ["all", "Tümü"],
            ["image", "Görseller"],
            ["video", "Videolar"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={`btn btn--sm ${filter === k ? "btn--primary" : ""}`}
            onClick={() => setFilter(k)}
          >
            {label} <span style={{ opacity: 0.7 }}>{counts[k]}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card"><div className="card__body muted" style={{ textAlign: "center", padding: 40 }}>Dosya yok.</div></div>
      ) : (
        <div className="media-grid">
          {shown.map((f) => (
            <div key={f.id} className="media-tile">
              <a href={f.url} target="_blank" rel="noopener" className="media-tile__img">
                <MediaThumb file={f} />
              </a>
              <div className="media-tile__meta">
                <div className="ellipsis strong" title={f.path}>{f.path.split("/").pop()}</div>
                <div className="muted">{f.kind === "video" ? "Video" : "Görsel"} · {formatBytes(f.size)}</div>
              </div>
              <div className="media-tile__acts">
                <button type="button" className="btn btn--icon btn--sm" onClick={() => copy(f.url)} title="Adresi kopyala">
                  <Copy />
                </button>
                <button type="button" className="btn btn--icon btn--sm btn--danger" onClick={() => remove(f)} title="Sil">
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
