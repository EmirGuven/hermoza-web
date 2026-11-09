import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscribers } from "@/db/schema";
import { getAdmin } from "@/lib/session";

// Aboneleri CSV olarak indirir (Excel'de Türkçe karakterler için BOM eklenir)
export async function GET() {
  if (!(await getAdmin())) return new Response("Oturum gerekli", { status: 401 });
  const rows = await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    ["E-posta", "Kaynak", "Durum", "Kayıt tarihi", "Çıkış tarihi"].map(q).join(";"),
    ...rows.map((r) =>
      [
        r.email,
        r.source,
        r.unsubscribedAt ? "Çıktı" : "Aktif",
        r.createdAt.toISOString(),
        r.unsubscribedAt?.toISOString() ?? "",
      ]
        .map(q)
        .join(";")
    ),
  ];
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hermoza-aboneler.csv"`,
    },
  });
}
