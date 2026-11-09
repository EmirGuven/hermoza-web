"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteSubscriber } from "@/app/admin/actions";

export function SubscriberDelete({ id, email }: { id: number; email: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn--icon btn--sm btn--text btn--danger"
      disabled={pending}
      title="Sil"
      onClick={() =>
        confirm(`${email} listeden tamamen silinsin mi?`) &&
        start(async () => {
          await deleteSubscriber(id);
          router.refresh();
        })
      }
    >
      <Trash2 />
    </button>
  );
}
