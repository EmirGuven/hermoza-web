import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker imajı için bağımsız (standalone) çıktı: node server.js ile çalışır
  output: "standalone",
  images: {
    // Küçültülmüş görseller 7 gün önbellekte kalır (varsayılan 4 saat). Panelden yüklenen dosyalar
    // aynı adın üzerine yazılmaz (yeni ad alır), bu yüzden uzun süre güvenli.
    minimumCacheTTL: 604800,
    // 3840px gibi gereksiz büyük sürümler üretilmez: sunucu yükü ve ilk yükleme süresi düşer
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2560],
    imageSizes: [96, 256, 384],
    formats: ["image/webp"],
    // İzin verilen kaliteler (Next 16 varsayılanı yalnızca 75): posterler 65 ile daha hafif
    qualities: [65, 75],
  },
  cacheComponents: true,
  experimental: {
    // Tailwind CSS'i küçük (≈15 KB): ayrı dosya yerine HTML'e gömülür, ilk boyama beklemez
    inlineCss: true,
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
