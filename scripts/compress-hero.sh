#!/usr/bin/env bash
# Hero videosunu web için sıkıştırır.
# Kullanım:  npm run video:hero -- /yol/ham-video.mp4
#
# Üretilen dosyalar (public/uploads/videos/):
#   hero-1080.webm  -> masaüstü, VP9 (Chrome/Firefox/Edge — en küçük dosya)
#   hero-1080.mp4   -> masaüstü, H.264 (Safari ve yedek)
#   hero-720.mp4    -> mobil, H.264
#   hero-poster.jpg -> video yüklenene kadar görünen ilk kare
#
# Ses kaldırılır (hero videosu zaten sessiz oynar), en fazla 20 sn alınır.
set -euo pipefail

IN="${1:?Kullanım: npm run video:hero -- /yol/video.mp4}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/uploads/videos"
MAX_SECONDS="${MAX_SECONDS:-20}"
mkdir -p "$OUT"

command -v ffmpeg >/dev/null || { echo "ffmpeg yok: brew install ffmpeg"; exit 1; }

echo "→ Masaüstü MP4 (H.264, 1080p)"
ffmpeg -y -hide_banner -loglevel error -i "$IN" -t "$MAX_SECONDS" -an \
  -vf "scale=-2:'min(1080,ih)',fps=30" \
  -c:v libx264 -preset slow -crf 26 -profile:v high -pix_fmt yuv420p \
  -movflags +faststart "$OUT/hero-1080.mp4"

echo "→ Masaüstü WebM (VP9, 1080p)"
ffmpeg -y -hide_banner -loglevel error -i "$IN" -t "$MAX_SECONDS" -an \
  -vf "scale=-2:'min(1080,ih)',fps=30" \
  -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
  "$OUT/hero-1080.webm"

echo "→ Mobil MP4 (H.264, 720p)"
ffmpeg -y -hide_banner -loglevel error -i "$IN" -t "$MAX_SECONDS" -an \
  -vf "scale=-2:'min(720,ih)',fps=30" \
  -c:v libx264 -preset slow -crf 28 -profile:v high -pix_fmt yuv420p \
  -movflags +faststart "$OUT/hero-720.mp4"

echo "→ Poster görseli"
ffmpeg -y -hide_banner -loglevel error -ss 0.5 -i "$IN" -frames:v 1 \
  -vf "scale=-2:'min(1080,ih)'" -q:v 4 "$OUT/hero-poster.jpg"

echo
echo "Bitti. Boyutlar:"
ls -lh "$OUT" | awk 'NR>1 {print "  " $5 "\t" $9}'
