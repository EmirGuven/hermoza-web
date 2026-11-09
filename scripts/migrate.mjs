// Container açılırken bekleyen veritabanı migration'larını uygular (drizzle/ klasörü).
// Uygulanmış olanları atlar; tekrar çalıştırmak güvenlidir.
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  console.log("✓ Veritabanı migration'ları güncel");
} catch (e) {
  console.error("✗ Migration hatası:", e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
