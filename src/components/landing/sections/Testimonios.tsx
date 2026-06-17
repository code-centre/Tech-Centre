"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";

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

export default function Testimonios() {
  const [active, setActive] = useState<VideoItem>(videos[0]);

  return (
    <section
      id="testimonios"
      className="relative py-24 md:py-28"
      aria-labelledby="testimonios-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <div className="flex justify-center">
            <SparkEyebrow>Genios de aquí</SparkEyebrow>
          </div>
          <h2
            id="testimonios-title"
            className="lv2-display mx-auto mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Historias de personas que se atrevieron
          </h2>
          <p className="mt-4 lv2-soft">
            Despierta el genio tech que llevas dentro.
          </p>
        </Reveal>

        <Reveal className="mt-12" glow>
          <div className="overflow-hidden rounded-2xl border border-[rgba(63,224,160,0.35)] shadow-[0_0_60px_-20px_rgba(63,224,160,0.5)]">
            <div className="relative aspect-video w-full bg-black">
              <iframe
                key={active.id}
                src={`https://www.youtube.com/embed/${active.id}`}
                title={`Testimonio: ${active.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-6">
          <ul className="flex flex-wrap justify-center gap-4">
            {videos.map((video) => {
              const isActive = video.id === active.id;
              return (
                <li key={video.id}>
                  <button
                    type="button"
                    onClick={() => setActive(video)}
                    aria-pressed={isActive}
                    aria-label={`Reproducir testimonio: ${video.name}`}
                    className={`group relative h-20 w-32 overflow-hidden rounded-xl border transition-all ${
                      isActive
                        ? "border-[var(--mint)] shadow-[0_0_18px_rgba(63,224,160,0.4)]"
                        : "border-[var(--line)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={video.cover}
                      alt=""
                      fill
                      sizes="128px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-5 w-5 text-white" aria-hidden="true" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
