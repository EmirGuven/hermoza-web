"use client";

import { useEffect, useRef } from "react";

/**
 * Arka plan videosu: ekrana yaklaşınca yüklenip oynar, ekrandan çıkınca durur.
 * "Hareketi azalt" açık kullanıcılarda sadece poster görünür.
 */
export function BackgroundVideo({
  name,
  className = "",
}: {
  /** public/uploads/videos/{name}-1080.mp4, -720.mp4, -poster.jpg */
  name: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
  }, []);

  const base = `/uploads/videos/${name}`;
  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      poster={`${base}-poster.jpg`}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
    >
      <source src={`${base}-720.mp4`} type="video/mp4" media="(max-width: 767px)" />
      <source src={`${base}-1080.mp4`} type="video/mp4" />
    </video>
  );
}
