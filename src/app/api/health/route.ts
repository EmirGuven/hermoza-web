import { connection } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  await connection();
  try {
    const { rows } = await pool.query(
      "select current_database() as db, current_user as user, version() as version"
    );
    return Response.json({ ok: true, ...rows[0] });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
