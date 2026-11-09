"use client";

import { useActionState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { subscribeNewsletter, type ActionState } from "@/app/admin/actions";

/** Footer bülten kutusu: kayıtlar panelde Mesajlar'a "Bülten aboneliği" olarak düşer. */
export function NewsletterForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(subscribeNewsletter, {});

  if (state.ok) {
    return (
      <p className="flex items-center gap-3 border-b border-white/25 py-3 text-sm font-light text-white/80">
        <Check className="size-4 text-clay" /> {state.message}
      </p>
    );
  }

  return (
    <>
      <form action={action} className="flex border-b border-white/25 focus-within:border-clay">
        <input
          type="email"
          name="newsletter"
          required
          placeholder="E-posta adresiniz"
          aria-label="E-posta adresiniz"
          className="w-full bg-transparent py-3 text-sm font-light outline-none placeholder:text-white/35"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Bültene kaydol"
          className="px-2 text-white/60 hover:text-clay disabled:opacity-50"
        >
          <ArrowRight className="size-4" />
        </button>
      </form>
      {state.error && <p className="mt-2 text-xs text-clay">{state.error}</p>}
    </>
  );
}
