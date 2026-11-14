"use client";

import { useEffect, useRef } from "react";
import type { VideoSet } from "@/lib/content-types";
import { optimizedImage } from "@/lib/image-url";
import { loadVideo } from "@/lib/video-src";

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
          // Ekrana yaklaşınca ekrana uygun dosya yüklenir (mobilde mobil sürüm, destekliyorsa AV1)
          loadVideo(v, video);
        } else {
          v.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [video]);

  if (!video.desktop) {
    // Video yoksa sadece poster (varsa) arka plan olur
    return video.poster ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={optimizedImage(video.poster)} alt="" loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover ${className}`} />
    ) : null;
  }

  return (
    <video
      key={video.desktop + video.mobile}
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      poster={video.poster ? optimizedImage(video.poster, 1280, 65) : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
    >
    </video>
  );
}
