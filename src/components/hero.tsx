"use client";

import { useEffect, useRef } from "react";
import type { VideoSet } from "@/lib/content-types";

/** Sadece döngüdeki video. Videolar panelden (Ana Sayfa) seçilir. */
export function Hero({ video, title }: { video: VideoSet; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  // "Hareketi azalt" açık kullanıcılarda video oynamaz, poster görünür.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
    } else {
      // React sunucu HTML'ine "muted" özelliğini yazmaz; iOS Safari sessiz olmayan videoyu
      // otomatik oynatmaz. Oynatmadan önce kesin olarak sessize al.
      v.muted = true;
      v.defaultMuted = true;
      v.play().catch(() => {});
    }
  }, [video.desktop, video.mobile]);

  return (
    <section className="relative h-svh min-h-[560px] w-full overflow-hidden bg-forest-deep">
      {/* Sayfanın ana başlığı: görselde video var, arama motorları ve ekran okuyucular için metin */}
      <h1 className="sr-only">{title}</h1>
      {video.desktop && (
        <video
          // Video değişince öğe yeniden oluşsun (source değişikliği tek başına yüklemez)
          key={video.desktop + video.mobile}
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          poster={video.poster || undefined}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          aria-label="Hermoza tanıtım videosu"
        >
          {video.mobile && <source src={video.mobile} type="video/mp4" media="(max-width: 767px)" />}
          <source src={video.desktop} type={video.desktop.endsWith(".webm") ? "video/webm" : "video/mp4"} />
        </video>
      )}
      {/* Şeffaf header'daki beyaz yazılar açık sahnelerde de okunsun diye çok hafif üst gölge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/35 to-transparent" />
    </section>
  );
}
