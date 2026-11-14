import type { VideoSet } from "@/lib/content-types";

/**
 * Ekrana uygun video dosyasını tarayıcıda seçer: mobilde (≤767px) mobil sürüm, aksi halde masaüstü.
 * <source media="..."> bazı tarayıcılarda yok sayılıp büyük dosya indirildiği için seçim JS ile yapılır.
 */
export function pickVideoSrc(video: VideoSet): string {
  const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  return (mobile && video.mobile) || video.desktop || video.mobile;
}

/** Sessiz başlatma (iOS Safari yalnızca sessiz videoyu otomatik oynatır; React "muted"ı HTML'e yazmaz) */
export function playMuted(v: HTMLVideoElement) {
  v.muted = true;
  v.defaultMuted = true;
  v.play().catch(() => {});
}
