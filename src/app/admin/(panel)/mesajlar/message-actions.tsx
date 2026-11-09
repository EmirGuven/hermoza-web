"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MailCheck, MailOpen, Trash2 } from "lucide-react";
import { deleteMessage, setMessageRead } from "@/app/admin/actions";

export function MessageActions({ id, read }: { id: number; read: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<void>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  return (
    <span className="acts" style={{ opacity: pending ? 0.5 : 1 }}>
      <button
        type="button"
        className="btn btn--icon btn--sm btn--text"
        disabled={pending}
        onClick={() => run(() => setMessageRead(id, !read))}
        title={read ? "Okunmadı işaretle" : "Okundu işaretle"}
      >
        {read ? <MailOpen /> : <MailCheck />}
      </button>
      <button
        type="button"
        className="btn btn--icon btn--sm btn--text btn--danger"
        disabled={pending}
        onClick={() => confirm("Mesaj silinsin mi?") && run(() => deleteMessage(id))}
        title="Sil"
      >
        <Trash2 />
      </button>
    </span>
  );
}
