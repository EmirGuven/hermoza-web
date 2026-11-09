// Boş veritabanını sitenin mevcut içeriğiyle doldurur. Tekrar çalıştırmak güvenli:
// dolu tabloya dokunmaz, medya kütüphanesine sadece eksik dosyaları ekler.
// Kullanım: npm run db:seed
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { defaultCollections, defaultJournal } from "../src/lib/content-types.ts";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR ?? "uploads");

const MIME = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".webm": "video/webm",
};
const kindOf = (ext) => (MIME[ext]?.startsWith("image/") ? "image" : MIME[ext]?.startsWith("video/") ? "video" : "other");

async function seedTable(table, rows, cols) {
  const { rows: [{ n }] } = await pool.query(`select count(*)::int n from ${table}`);
  if (n > 0) return console.log(`• ${table}: zaten ${n} kayıt var, atlandı`);
  for (const r of rows) {
    const keys = Object.keys(cols);
    await pool.query(
      `insert into ${table} (${keys.map((k) => cols[k]).join(", ")}) values (${keys.map((_, i) => `$${i + 1}`).join(", ")})`,
      keys.map((k) => r[k])
    );
  }
  console.log(`✓ ${table}: ${rows.length} kayıt eklendi`);
}

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (!e.name.startsWith(".")) yield full;
  }
}

async function seedMedia() {
  let added = 0;
  try {
    for await (const full of walk(UPLOAD_ROOT)) {
      const rel = path.relative(UPLOAD_ROOT, full).split(path.sep).join("/");
      const ext = path.extname(full).toLowerCase();
      const { size } = await stat(full);
      const r = await pool.query(
        `insert into media (path, kind, mime, size, original_name) values ($1,$2,$3,$4,$5) on conflict (path) do nothing`,
        [rel, kindOf(ext), MIME[ext] ?? "application/octet-stream", size, path.basename(full)]
      );
      added += r.rowCount;
    }
    console.log(`✓ media: ${added} yeni dosya kütüphaneye eklendi`);
  } catch (e) {
    console.log(`• media: ${UPLOAD_ROOT} okunamadı (${e.message})`);
  }
}

try {
  await seedTable("collections", defaultCollections, {
    sort: "sort", title: "title", body: "body", image: "image",
    linkLabel: "link_label", linkHref: "link_href", active: "active",
  });
  await seedTable("journal_posts", defaultJournal, {
    sort: "sort", category: "category", title: "title", image: "image", href: "href", active: "active",
  });
  await seedMedia();
} finally {
  await pool.end();
}
