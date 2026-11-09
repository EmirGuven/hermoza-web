"use client";

import { useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from "lucide-react";
import { useToast } from "@/components/admin/toast";

/** Tablo satırı işlemleri: yukarı/aşağı, yayında/gizli, sil (onaylı). */
export function RowActions({
  first,
  last,
  active,
  onMove,
  onToggle,
  onDelete,
  deleteLabel = "Bu kayıt silinsin mi?",
}: {
  first: boolean;
  last: boolean;
  active?: boolean;
  onMove?: (dir: -1 | 1) => Promise<void>;
  onToggle?: () => Promise<void>;
  onDelete: () => Promise<unknown>;
  deleteLabel?: string;
}) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const run = (fn: () => Promise<unknown>, msg?: string) =>
    start(async () => {
      try {
        await fn();
        if (msg) toast.success(msg);
      } catch {
        toast.error("İşlem yapılamadı");
      }
    });

  return (
    <span className="acts" style={{ opacity: pending ? 0.5 : 1 }}>
      {onMove && (
        <>
          <button type="button" className="btn btn--icon btn--sm btn--text" disabled={first || pending} onClick={() => run(() => onMove(-1))} title="Yukarı taşı">
            <ArrowUp />
          </button>
          <button type="button" className="btn btn--icon btn--sm btn--text" disabled={last || pending} onClick={() => run(() => onMove(1))} title="Aşağı taşı">
            <ArrowDown />
          </button>
        </>
      )}
      {onToggle && (
        <button
          type="button"
          className="btn btn--icon btn--sm btn--text"
          disabled={pending}
          onClick={() => run(onToggle, active ? "Gizlendi" : "Yayına alındı")}
          title={active ? "Gizle" : "Yayına al"}
        >
          {active ? <EyeOff /> : <Eye />}
        </button>
      )}
      <button
        type="button"
        className="btn btn--icon btn--sm btn--text btn--danger"
        disabled={pending}
        onClick={() => confirm(deleteLabel) && run(onDelete, "Silindi")}
        title="Sil"
      >
        <Trash2 />
      </button>
    </span>
  );
}
