import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getIronSession, type SessionOptions } from "iron-session";
import { db } from "@/lib/db";
import { admins } from "@/db/schema";

export const SESSION_COOKIE = "hermoza_admin";

export type AdminSession = { adminId?: number };

const options: SessionOptions = {
  cookieName: SESSION_COOKIE,
  password: process.env.SESSION_SECRET ?? "",
  ttl: 60 * 60 * 24 * 7, // 7 gün
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
};

export async function getSession() {
  // Oturum her istekte okunur; iron-session süre kontrolünde Date.now() kullandığı için
  // bu kısmın ön-render'a girmeyeceğini Next'e açıkça bildiriyoruz.
  await connection();
  return getIronSession<AdminSession>(await cookies(), options);
}

export type CurrentAdmin = { id: number; email: string; name: string };

/** Oturumdaki yöneticiyi döndürür; yoksa null. */
export async function getAdmin(): Promise<CurrentAdmin | null> {
  const session = await getSession();
  if (!session.adminId) return null;
  const row = await db.query.admins.findFirst({
    where: eq(admins.id, session.adminId),
    columns: { id: true, email: true, name: true },
  });
  return row ?? null;
}

/** Panel sayfaları ve server action'lar için: oturum yoksa girişe yönlendirir. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/giris");
  return admin;
}
