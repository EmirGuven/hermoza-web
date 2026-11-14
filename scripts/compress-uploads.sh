#!/usr/bin/env bash
# Sunucudaki büyük görselleri (1,5 MB üstü) aynı adla küçültür: uzun kenar en fazla 2560px.
# Adresler değişmez. Önce orijinaller uploads-yedek/ klasörüne kopyalanır (üzerine yazılmaz).
# Sunucuda çalıştırılır:  bash scripts/compress-uploads.sh   (proje klasöründe: /srv/docker/apps/hermoza)
# Yeni yüklenen görseller zaten yüklenirken küçültülüyor; bu betik eskiler için bir kerelik.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p uploads-yedek/images
for f in uploads/images/*; do
  [ -f "$f" ] || continue
  if [ "$(stat -c %s "$f")" -gt 1500000 ]; then cp -n "$f" uploads-yedek/images/; fi
done
echo "Yedeklenenler: uploads-yedek/images/"
ls -la uploads-yedek/images

docker exec hermoza-web node -e '
const sharp = require("/app/node_modules/sharp");
const fs = require("fs");
const path = require("path");
(async () => {
  const dir = "/app/uploads/images";
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const ext = path.extname(f).toLowerCase();
    const size = fs.statSync(p).size;
    if (size <= 1500000 || ![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;
    let pipe = sharp(p, { failOn: "none" }).rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true });
    pipe = ext === ".png" ? pipe.png({ compressionLevel: 9, palette: true, quality: 90 })
      : ext === ".webp" ? pipe.webp({ quality: 82 })
      : pipe.jpeg({ quality: 84, mozjpeg: true });
    const out = await pipe.toBuffer();
    if (out.length < size) {
      fs.writeFileSync(p, out);
      console.log(f, (size / 1048576).toFixed(1) + " MB ->", (out.length / 1048576).toFixed(2) + " MB");
    } else console.log(f, "zaten küçük, değişmedi");
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
'
echo "Bitti. Geri almak için: cp uploads-yedek/images/* uploads/images/"
