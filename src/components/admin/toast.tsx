"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

type Toast = { id: number; kind: "success" | "error"; text: string };
type Api = { success: (t: string) => void; error: (t: string) => void };

const Ctx = createContext<Api>({ success: () => {}, error: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l, { id, kind, text }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), kind === "error" ? 6000 : 3200);
  }, []);
  const api = useMemo(
    () => ({ success: (t: string) => push("success", t), error: (t: string) => push("error", t) }),
    [push]
  );
  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.kind === "error" ? "toast--error" : ""}`}>
            {t.kind === "error" ? (
              <CircleAlert style={{ color: "var(--danger)" }} />
            ) : (
              <CircleCheck style={{ color: "var(--success)" }} />
            )}
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
