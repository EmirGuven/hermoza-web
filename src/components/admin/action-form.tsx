"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import type { ActionState } from "@/app/admin/actions";
import { useToast } from "@/components/admin/toast";

type Action = (state: ActionState, form: FormData) => Promise<ActionState>;

/** Server action'a bağlı form: sonucu bildirim olarak gösterir. */
export function ActionForm({
  action,
  children,
  className,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const toast = useToast();

  useEffect(() => {
    if (!state.at) return;
    if (state.error) toast.error(state.error);
    else if (state.message) toast.success(state.message);
    // state.at her gönderimde değişir; aynı sonuç tekrar gelse de bildirim çıkar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.at]);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}

export function SubmitButton({
  children = "Kaydet",
  className = "btn btn--primary",
  icon = true,
}: {
  children?: React.ReactNode;
  className?: string;
  icon?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? <span className="spinner" /> : icon ? <Save /> : null}
      {children}
    </button>
  );
}

/** Kaydet butonu olan, ekranın altında sabit duran form alt çubuğu */
export function FormFooter({ children }: { children?: React.ReactNode }) {
  return (
    <div className="card__foot">
      {children}
      <SubmitButton />
    </div>
  );
}
