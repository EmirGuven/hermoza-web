import { Pool } from "pg";

// Dev'de hot-reload sırasında yeni pool açılmasın diye global'de tutulur.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const db =
  globalForDb.pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

if (process.env.NODE_ENV !== "production") globalForDb.pgPool = db;
