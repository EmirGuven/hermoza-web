// Panel kullanıcısı oluşturur ya da şifresini sıfırlar.
// Kullanım: npm run admin:create -- eposta@ornek.com [şifre] [Ad Soyad]
// Şifre verilmezse rastgele üretilip ekrana yazılır.
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import pg from "pg";

const [email, givenPassword, ...nameParts] = process.argv.slice(2);
if (!email) {
  console.error("Kullanım: npm run admin:create -- eposta@ornek.com [şifre] [Ad Soyad]");
  process.exit(1);
}
const password = givenPassword || randomBytes(9).toString("base64url");
const name = nameParts.join(" ");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `insert into admins (email, name, password_hash) values (lower($1), $2, $3)
     on conflict (email) do update set password_hash = excluded.password_hash,
       name = coalesce(nullif(excluded.name, ''), admins.name)
     returning (xmax = 0) as created`,
    [email, name, hash]
  );
  console.log(rows[0].created ? "✓ Yönetici oluşturuldu" : "✓ Şifre güncellendi");
  console.log(`  E-posta: ${email.toLowerCase()}`);
  if (!givenPassword) console.log(`  Şifre:   ${password}`);
} finally {
  await pool.end();
}
