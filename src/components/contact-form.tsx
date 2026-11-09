"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Check } from "lucide-react";
import { submitContact, type ActionState } from "@/app/admin/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex items-center gap-3 bg-rust px-10 py-4 text-xs uppercase tracking-[0.3em] transition-colors hover:bg-rust/85 disabled:opacity-60"
    >
      {pending ? "Gönderiliyor…" : "Gönder"}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

export function ContactForm() {
  const [state, action] = useActionState<ActionState, FormData>(submitContact, {});

  if (state.ok) {
    return (
      <div className="flex flex-col items-start justify-center gap-4 border border-white/15 p-8">
        <Check className="size-8 text-clay" strokeWidth={1.25} />
        <p className="text-lg font-light">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-8">
      {[
        { name: "name", label: "Ad soyad", type: "text", auto: "name" },
        { name: "email", label: "E-posta", type: "email", auto: "email" },
        { name: "phone", label: "Telefon", type: "tel", auto: "tel" },
      ].map((f) => (
        <label key={f.name} className="block">
          <span className="mb-2 block text-[10px] uppercase tracking-[0.35em] text-white/50">{f.label}</span>
          <input
            name={f.name}
            type={f.type}
            autoComplete={f.auto}
            required={f.name === "name"}
            className="w-full border-b border-white/25 bg-transparent py-3 font-light outline-none transition-colors focus:border-clay"
          />
        </label>
      ))}
      <label className="block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.35em] text-white/50">Projeniz</span>
        <textarea
          name="message"
          rows={3}
          className="w-full resize-none border-b border-white/25 bg-transparent py-3 font-light outline-none transition-colors focus:border-clay"
        />
      </label>
      {/* Bot tuzağı: gerçek kullanıcı görmez */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state.error && <p className="text-sm text-clay">{state.error}</p>}
      <Submit />
    </form>
  );
}
