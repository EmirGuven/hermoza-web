"use client";

import { useEffect, useRef } from "react";

/**
 * Sadece döngüdeki video. Dosyalar `npm run video:hero -- ham-video.mp4`
 * ile public/uploads/videos/ altına üretilir.
 */
export function Hero() {
  const video = useRef<HTMLVideoElement>(null);

  // "Hareketi azalt" açık kullanıcılarda video oynamaz, poster görünür.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
    } else {
      v.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative h-svh min-h-[560px] w-full overflow-hidden bg-forest-deep">
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover"
        poster="/uploads/videos/hero-poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Hermoza tanıtım videosu"
      >
        <source src="/uploads/videos/hero-720.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/uploads/videos/hero-1080.webm" type="video/webm" />
        <source src="/uploads/videos/hero-1080.mp4" type="video/mp4" />
      </video>
      {/* Şeffaf header'daki beyaz yazılar açık sahnelerde de okunsun diye çok hafif üst gölge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/35 to-transparent" />
    </section>
  );
}
