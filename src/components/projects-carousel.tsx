"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

export type Project = { title: string; tag: string; img: string };

export function ProjectsCarousel({ projects }: { projects: Project[] }) {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("figure");
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-6 [scrollbar-width:none] md:px-12 [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((p) => (
          <figure key={p.title} className="group w-[80vw] shrink-0 snap-start md:w-[42vw]">
            <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-clay/30 md:aspect-[4/3]">
              <Image
                src={p.img}
                alt={`${p.title} projesi`}
                fill
                sizes="(min-width: 768px) 42vw, 80vw"
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
            </div>
            <figcaption className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-forest">{p.title}</p>
                <p className="mt-1 text-xs font-light tracking-wide text-ink/50">{p.tag}</p>
              </div>
              <ArrowUpRight className="size-4 text-forest/50 transition-colors group-hover:text-rust" />
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-3 px-6 md:px-12">
        {([-1, 1] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => scroll(d)}
            aria-label={d === -1 ? "Önceki proje" : "Sonraki proje"}
            className="flex size-12 items-center justify-center border border-forest/25 text-forest transition-colors hover:border-forest hover:bg-forest hover:text-white"
          >
            {d === -1 ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}
