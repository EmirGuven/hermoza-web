#!/usr/bin/env bash
# Hero videosunu 4K hamdan yüksek kalitede, üç biçimde üretir (oynatıcı sırayla dener: AV1 → HEVC → H.264).
#   Masaüstü (yatay 1920x1080): hero-hq.av1.webm, hero-hq.hevc.mp4, hero-hq.mp4
#   Mobil (dikey 1080x1920, 4K'nın ortasından kesit): hero-dikey.av1.webm, hero-dikey.hevc.mp4, hero-dikey.mp4
#   Poster: hero-hq-poster.jpg
# Kullanım: bash scripts/encode-hero-hq.sh "/yol/hero-ham.mp4"
set -euo pipefail
IN="${1:?Kullanım: bash scripts/encode-hero-hq.sh /yol/hero-ham.mp4}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/uploads/videos"
mkdir -p "$OUT"
DESK="scale=1920:1080:flags=lanczos,fps=30"
MOB="crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos,fps=30"
common=(-y -hide_banner -loglevel error -i "$IN" -an)

enc() { # $1 ad, $2 filtre
  echo "→ $1: AV1";   ffmpeg "${common[@]}" -vf "$2" -c:v libsvtav1 -preset 5 -crf 30 -pix_fmt yuv420p10le -svtav1-params tune=0 "$OUT/$1.av1.webm"
  echo "→ $1: HEVC";  ffmpeg "${common[@]}" -vf "$2" -c:v libx265 -preset medium -crf 25 -tag:v hvc1 -pix_fmt yuv420p -x265-params log-level=error -movflags +faststart "$OUT/$1.hevc.mp4"
  echo "→ $1: H.264"; ffmpeg "${common[@]}" -vf "$2" -c:v libx264 -preset slow -crf 24 -maxrate 6M -bufsize 12M -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/$1.mp4"
}
enc hero-hq "$DESK"
enc hero-dikey "$MOB"
ffmpeg -y -hide_banner -loglevel error -ss 2 -i "$IN" -frames:v 1 -vf "$DESK" -q:v 3 "$OUT/hero-hq-poster.jpg"
ls -la "$OUT"/hero-hq* "$OUT"/hero-dikey*
