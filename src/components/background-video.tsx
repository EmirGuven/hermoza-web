"use client";

import { useEffect, useRef } from "react";
import type { VideoSet } from "@/lib/content-types";

/**
 * Arka plan videosu: ekrana yaklaşınca yüklenip oynar, ekrandan çıkınca durur.
 * "Hareketi azalt" açık kullanıcılarda sadece poster görünür.
 */
export function BackgroundVideo({ video, className = "" }: { video: VideoSet; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // iOS Safari yalnızca sessiz videoyu otomatik oynatır (React "muted" özelliğini HTML'e yazmaz)
          v.muted = true;
          v.defaultMuted = true;
          if (v.preload === "none") {
            v.preload = "auto";
            v.load();
          }
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [video.desktop, video.mobile]);

  if (!video.desktop) {
    // Video yoksa sadece poster (varsa) arka plan olur
    return video.poster ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={video.poster} alt="" className={`absolute inset-0 h-full w-full object-cover ${className}`} />
    ) : null;
  }

  return (
    <video
      key={video.desktop + video.mobile}
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      poster={video.poster || undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
    >
      {video.mobile && <source src={video.mobile} type="video/mp4" media="(max-width: 767px)" />}
      <source src={video.desktop} type={video.desktop.endsWith(".webm") ? "video/webm" : "video/mp4"} />
    </video>
  );
}
