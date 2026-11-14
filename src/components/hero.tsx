"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { pickVideoSrc, playMuted } from "@/lib/video-src";
import type { VideoSet } from "@/lib/content-types";

/** Sadece döngüdeki video. Videolar panelden (Ana Sayfa) seçilir. */
export function Hero({ video, title }: { video: VideoSet; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  // Poster sayfanın en büyük öğesi (LCP): videonun arkasında gerçek bir görsel olarak, ekrana uygun boyutta
  // (telefonda küçük, masaüstünde büyük) ve en yüksek öncelikle yüklenir. Görsel değilse (ör. yanlışlıkla
  // video adresi girildiyse) kullanılmaz.
  const poster = /\.(jpe?g|png|webp|avif)$/i.test(video.poster) ? video.poster : "";

  // Video, sayfa tamamen yüklendikten sonra başlar (önce poster görünür, ilk açılış hızlı olur).
  // Kaynak ekrana göre seçilir: mobil yalnızca mobil dosyayı indirir. "Hareketi azalt" açıksa yalnızca poster.
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = () => {
      const src = pickVideoSrc(video);
      if (!src) return;
      if (v.getAttribute("src") !== src) v.src = src;
      playMuted(v);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, [video]);

  return (
    <section className="relative h-svh min-h-[560px] w-full overflow-hidden bg-forest-deep">
      {/* Sayfanın ana başlığı: görselde video var, arama motorları ve ekran okuyucular için metin */}
      <h1 className="sr-only">{title}</h1>
      {poster && (
        <Image src={poster} alt="" fill priority fetchPriority="high" sizes="100vw" quality={65} className="object-cover" />
      )}
      {video.desktop && (
        <video
          // Video değişince öğe yeniden oluşsun
          key={video.desktop + video.mobile}
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          aria-label="Hermoza tanıtım videosu"
        />
      )}
      {/* Şeffaf header'daki beyaz yazılar açık sahnelerde de okunsun diye çok hafif üst gölge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/35 to-transparent" />
    </section>
  );
}
