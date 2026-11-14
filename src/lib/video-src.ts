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

/**
 * Videoyu yükleyip oynatır. "x.mp4" için sırayla denenir:
 *   1. x.av1.webm  — AV1: aynı kalitede en küçük dosya (Chrome, Edge, Firefox, Android, iPhone 15 Pro+)
 *   2. x.hevc.mp4  — HEVC/H.265: Apple cihazlarının çoğu (Safari) ve donanımı destekleyen diğerleri
 *   3. x.mp4       — H.264: her yerde oynar (yedek)
 * Tarayıcının oynatamadığı biçim atlanır; dosya yoksa ya da hata olursa bir sonrakine geçilir.
 */
export function loadVideo(v: HTMLVideoElement, video: VideoSet) {
  const mp4 = pickVideoSrc(video);
  if (!mp4) return;
  const base = /\.mp4$/i.test(mp4) ? mp4.replace(/\.mp4$/i, "") : "";
  const can = (type: string) => v.canPlayType(type) !== "";
  const list = [
    ...(base && can('video/webm; codecs="av01.0.08M.10"') ? [`${base}.av1.webm`] : []),
    ...(base && can('video/mp4; codecs="hvc1.1.6.L120.90"') ? [`${base}.hevc.mp4`] : []),
    mp4,
  ];
  if (v.dataset.src && list.includes(v.dataset.src)) {
    playMuted(v);
    return;
  }
  let i = 0;
  const tryNext = () => {
    const src = list[i++];
    if (!src) return;
    v.dataset.src = src;
    if (i < list.length) v.addEventListener("error", tryNext, { once: true });
    v.src = src;
    playMuted(v);
  };
  tryNext();
}
