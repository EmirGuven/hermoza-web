"use client";

import { useActionState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { subscribeNewsletter, type ActionState } from "@/app/admin/actions";

/** Bülten kayıt formu (footer ve açılır pencere). Açık rıza kutusu zorunlu (KVKK / İYS). */
export function NewsletterForm({
  source = "footer",
  onDone,
}: {
  source?: "footer" | "popup";
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, f) => {
    const r = await subscribeNewsletter(prev, f);
    if (r.ok) onDone?.();
    return r;
  }, {});

  if (state.ok) {
    return (
      <p className="flex items-center gap-3 border-b border-white/25 py-3 text-sm font-light text-white/80">
        <Check className="size-4 shrink-0 text-clay" /> {state.message}
      </p>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="source" value={source} />
      <div className="flex border-b border-white/25 focus-within:border-clay">
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
      </div>
      <label className="mt-3 flex cursor-pointer items-start gap-2 text-[11px] font-light leading-relaxed text-white/50">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-[#b34a25]" />
        <span>
          Kampanya ve yeniliklerden e-posta ile haberdar olmak istiyorum.{" "}
          <a href="/cerez-politikasi" className="underline hover:text-white">
            Aydınlatma metni
          </a>
        </span>
      </label>
      {state.error && <p className="mt-2 text-xs text-clay">{state.error}</p>}
    </form>
  );
}
