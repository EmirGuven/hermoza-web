import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hermoza Kitchen & Atelier",
    short_name: "Hermoza",
    description: "Ölçüye özel mutfak, yaşam alanı ve giyinme odası mobilyaları.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4ede6",
    theme_color: "#153a34",
    lang: "tr",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
