import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker imajı için bağımsız (standalone) çıktı: node server.js ile çalışır
  output: "standalone",
  cacheComponents: true,
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
