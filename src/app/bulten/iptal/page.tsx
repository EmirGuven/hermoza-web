import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { subscribers } from "@/db/schema";

export const metadata: Metadata = { title: "Bülten aboneliği", robots: { index: false } };

async function unsubscribe(f: FormData) {
  "use server";
  const token = String(f.get("t") ?? "");
  if (token) {
    await db.update(subscribers).set({ unsubscribedAt: new Date() }).where(eq(subscribers.token, token));
  }
  redirect("/bulten/iptal?tamam=1");
}

async function Content({ searchParams }: { searchParams: Promise<{ t?: string; tamam?: string }> }) {
  const { t, tamam } = await searchParams;
  if (tamam) {
    return (
      <>
        <h1 className="mb-4 text-3xl font-extralight uppercase tracking-[0.15em]">Abonelikten çıktınız</h1>
        <p className="font-light text-white/70">Artık bülten e-postası almayacaksınız.</p>
      </>
    );
  }
  const sub = t ? await db.query.subscribers.findFirst({ where: eq(subscribers.token, t) }) : null;
  if (!sub) {
    return <p className="font-light text-white/70">Bağlantı geçersiz ya da süresi dolmuş.</p>;
  }
  return (
    <>
      <h1 className="mb-4 text-3xl font-extralight uppercase tracking-[0.15em]">Bülten aboneliği</h1>
      <p className="mb-10 font-light text-white/70">
        <strong className="font-normal text-white">{sub.email}</strong> adresi bülten listemizden çıkarılsın mı?
      </p>
      <form action={unsubscribe}>
        <input type="hidden" name="t" value={t} />
        <button className="border border-white/40 px-9 py-4 text-xs uppercase tracking-[0.3em] transition-colors hover:bg-white hover:text-forest">
          Abonelikten çık
        </button>
      </form>
    </>
  );
}

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; tamam?: string }>;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-forest px-6 text-center text-white">
      <div className="max-w-lg">
        <Suspense fallback={null}>
          <Content searchParams={searchParams} />
        </Suspense>
        <Link href="/" className="mt-12 inline-block text-[11px] uppercase tracking-[0.3em] text-clay hover:text-white">
          Siteye dön
        </Link>
      </div>
    </main>
  );
}
