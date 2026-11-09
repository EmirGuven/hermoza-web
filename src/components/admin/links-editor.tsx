"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { NavLink } from "@/lib/content-types";

/** Menü/footer bağlantı listesi. Değer JSON olarak gizli input'ta gönderilir. */
export function LinksEditor({
  name,
  label,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  defaultValue: NavLink[];
  hint?: string;
}) {
  const [rows, setRows] = useState<NavLink[]>(defaultValue);
  const set = (i: number, k: keyof NavLink, v: string) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const move = (i: number, d: number) =>
    setRows((r) => {
      const j = i + d;
      if (j < 0 || j >= r.length) return r;
      const c = [...r];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  return (
    <div className="field">
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <div className="col" style={{ gap: 6 }}>
        {rows.map((r, i) => (
          <div key={i} className="links-row">
            <input className="input" placeholder="Başlık" value={r.label} onChange={(e) => set(i, "label", e.target.value)} />
            <input className="input" placeholder="#bolum veya https://…" value={r.href} onChange={(e) => set(i, "href", e.target.value)} />
            <div className="acts">
              <button type="button" className="btn btn--icon btn--sm btn--text" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Yukarı">
                <ArrowUp />
              </button>
              <button type="button" className="btn btn--icon btn--sm btn--text" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Aşağı">
                <ArrowDown />
              </button>
              <button type="button" className="btn btn--icon btn--sm btn--text btn--danger" onClick={() => setRows((rr) => rr.filter((_, j) => j !== i))} aria-label="Sil">
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
        <div>
          <button type="button" className="btn btn--sm" onClick={() => setRows((r) => [...r, { label: "", href: "" }])}>
            <Plus /> Bağlantı ekle
          </button>
        </div>
      </div>
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
