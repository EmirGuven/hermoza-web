import { defineConfig } from "drizzle-kit";

// drizzle-kit .env.local'i kendiliğinden okumaz
try {
  process.loadEnvFile(".env.local");
} catch {
  /* ortam değişkenleri dışarıdan geliyorsa sorun değil */
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
