"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Check } from "lucide-react";
import { submitContact, type ActionState } from "@/app/admin/actions";

import { hasConsent } from "@/components/cookie-consent";

type MetaPixel = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push?: MetaPixel;
  loaded: boolean;
  version: string;
};

function trackAppointment(pixelId: string) {
  const browser = window as Window & { fbq?: MetaPixel; _fbq?: MetaPixel };
  if (!browser.fbq) {
    const queue: unknown[][] = [];
    const pixel: MetaPixel = Object.assign(
      (...args: unknown[]) => {
        if (pixel.callMethod) pixel.callMethod(...args);
        else queue.push(args);
      },
      { queue, loaded: true, version: "2.0" },
    );
    pixel.push = pixel;
    browser.fbq = browser._fbq = pixel;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    pixel("set", "autoConfig", false, pixelId);
    pixel("init", pixelId);
  }
  browser.fbq("trackSingle", pixelId, "Lead");
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex items-center gap-3 bg-rust px-10 text-white py-4 text-xs uppercase tracking-[0.3em] transition-colors hover:bg-rust/85 disabled:opacity-60"
    >
      {pending ? "Gönderiliyor…" : "Gönder"}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

export function ContactForm({ metaPixelId }: { metaPixelId?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(submitContact, {});

  const tracked = useRef(false);
  useEffect(() => {
    if (!state.appointmentRecorded || tracked.current || !metaPixelId || !/^\d+$/.test(metaPixelId)) return;
    if (!hasConsent("pazarlama")) return;
    tracked.current = true;
    trackAppointment(metaPixelId);
  }, [state.appointmentRecorded, metaPixelId]);

  if (state.ok) {
    return (
      <div className="flex flex-col items-start justify-center gap-4 border border-forest/15 p-8">
        <Check className="size-8 text-clay" strokeWidth={1.25} />
        <p className="text-lg font-light text-forest">{state.message}</p>
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
          <span className="mb-2 block text-[10px] uppercase tracking-[0.35em] text-ink/60">{f.label}</span>
          <input
            name={f.name}
            type={f.type}
            autoComplete={f.auto}
            required={f.name === "name"}
            className="w-full border-b border-forest/20 bg-transparent py-3 font-light text-ink outline-none transition-colors focus:border-forest"
          />
        </label>
      ))}
      <label className="block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.35em] text-ink/60">Projeniz</span>
        <textarea
          name="message"
          rows={3}
          className="w-full resize-none border-b border-forest/20 bg-transparent py-3 font-light text-ink outline-none transition-colors focus:border-forest"
        />
      </label>
      {/* Bot tuzağı: gerçek kullanıcı görmez */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state.error && <p className="text-sm text-rust">{state.error}</p>}
      <Submit />
    </form>
  );
}
