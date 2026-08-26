"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoItem {
  id: string;
  cover: string;
  name: string;
}

const videos: VideoItem[] = [
  { id: "1ngtV0IR9yc", cover: "/grupo-de-3-miniatura.jpg", name: "Historia de la comunidad" },
  { id: "jLWKe8vVYLo", cover: "/daniel-perez-miniatura.jpg", name: "Daniel Pérez" },
  { id: "Bwk1pghvf-k", cover: "/daniel-reyes-miniatura.jpg", name: "Daniel Reyes" },
  { id: "9BZgidnjQcU", cover: "/python-miniatura.jpg", name: "Ruta de Python" },
  { id: "ripgd4E7gRI", cover: "/alumnos-miniatura.png", name: "Nuestros alumnos" },
];

/**
 * Card grande de video: arranca como foto con botón de play y solo carga el
 * iframe de YouTube cuando el visitante decide verlo.
 */
export default function VideoDestacado() {
  const [active, setActive] = useState<VideoItem | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-[rgba(63,224,160,0.35)] shadow-[0_0_60px_-24px_rgba(63,224,160,0.45)] md:min-h-[420px]">
        {active ? (
          <iframe
            key={active.id}
            src={`https://www.youtube.com/embed/${active.id}?autoplay=1`}
            title={`Testimonio: ${active.name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full bg-black"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(videos[0])}
            className="group absolute inset-0 block w-full text-left"
            aria-label={`Reproducir: ${videos[0].name}`}
          >
            <Image
              src="/community/equipo-selfie.webp"
              alt="Estudiantes de Tech Centre construyendo en equipo"
              fill
              sizes="(max-width: 1024px) 100vw, 720px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,13,0.15)_30%,rgba(7,16,13,0.92)_100%)]"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[var(--mint)] text-[var(--ink)] transition-transform duration-300 group-hover:scale-110 md:h-[76px] md:w-[76px]">
                <Play className="h-7 w-7 translate-x-[2px]" aria-hidden="true" />
              </span>
            </span>
            <span className="absolute inset-x-6 bottom-6 block md:inset-x-7">
              <span className="lv2-mono block !text-[var(--mint)]">Video · 2 min</span>
              <span className="lv2-display mt-2 block text-2xl text-[var(--paper)] md:text-[1.7rem]">
                {videos[0].name}
              </span>
              <span className="mt-1.5 block text-[15px] lv2-soft">
                Cómo se ve una cohorte de principio a fin, contada por quienes la
                vivieron.
              </span>
            </span>
          </button>
        )}
      </div>

      <ul className="flex flex-wrap gap-3">
        {videos.map((video) => {
          const isActive = video.id === active?.id;
          return (
            <li key={video.id}>
              <button
                type="button"
                onClick={() => setActive(video)}
                aria-pressed={isActive}
                aria-label={`Reproducir testimonio: ${video.name}`}
                className={`group relative h-16 w-24 overflow-hidden rounded-lg border transition-all ${
                  isActive
                    ? "border-[var(--mint)] shadow-[0_0_16px_rgba(63,224,160,0.35)]"
                    : "border-[var(--line)] opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={video.cover}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-4 w-4 text-white" aria-hidden="true" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
