import { Suspense } from "react";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { getSetting } from "@/lib/content";
import { AdminShell } from "@/components/admin/admin-shell";

// Panel her istekte oturumu okur: anında (instant) gezinme hedefi yok, sunucuda beklemesi normal.
export const instant = false;

// Oturum ve okunmamış mesaj sayısı Suspense içinde akar.
async function Shell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [{ n }] = await db.select({ n: count() }).from(messages).where(eq(messages.read, false));
  const general = await getSetting("general");
  return (
    <AdminShell admin={admin} unread={n} logo={general.logo}>
      {children}
    </AdminShell>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="adm" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
