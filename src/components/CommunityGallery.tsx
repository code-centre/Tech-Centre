"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { InfiniteMovingCards } from "./InfiniteMovingCards";

interface Photo {
  src: string;
  alt: string;
  w: number;
  h: number;
}

const rowOne: Photo[] = [
  { src: "/community/sesion-fca.webp", alt: "Sesión presencial en el centro frente a la proyección", w: 1024, h: 768 },
  { src: "/community/charla-noche.webp", alt: "Charla nocturna al aire libre bajo el banner 'Despierta el genio tech'", w: 768, h: 1024 },
  { src: "/community/equipo-selfie.webp", alt: "Estudiantes construyendo en equipo con sus laptops", w: 768, h: 1024 },
  { src: "/community/practica-laptops.webp", alt: "Práctica en vivo programando sobre laptops", w: 768, h: 1024 },
  { src: "/community/audiencia-clase.webp", alt: "Asistentes atentos durante una clase presencial", w: 768, h: 1024 },
  { src: "/community/laboratorio-codigo.webp", alt: "Laboratorio de programación con proyección de código", w: 1024, h: 768 },
  { src: "/community/manos-teclado.webp", alt: "Manos sobre el teclado escribiendo código", w: 768, h: 1024 },
];

const rowTwo: Photo[] = [
  { src: "/community/evento-aire-libre.webp", alt: "Evento comunitario nocturno al aire libre", w: 768, h: 1024 },
  { src: "/community/demo-herramientas.webp", alt: "Demostración en vivo de herramientas de IA", w: 768, h: 1024 },
  { src: "/community/sede-codigo-abierto.webp", alt: "Fachada de la sede Código Abierto en Barranquilla", w: 768, h: 1024 },
  { src: "/community/sesion-presencial.webp", alt: "Comunidad reunida en una sesión presencial", w: 768, h: 1024 },
  { src: "/community/trabajo-datos.webp", alt: "Trabajando con datos reales en clase", w: 768, h: 1024 },
  { src: "/community/comunidad-dos.webp", alt: "Miembros de la comunidad Tech Centre en clase", w: 768, h: 1024 },
];

function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <li className="shrink-0">
      <figure className="group relative h-52 sm:h-64 overflow-hidden rounded-2xl border border-border-color shadow-sm">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.w}
          height={photo.h}
          sizes="(max-width: 640px) 60vw, 340px"
          className="h-52 sm:h-64 w-auto object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--brand-graphite)]/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
        <figcaption className="pointer-events-none absolute bottom-0 left-0 right-0 px-4 py-3 text-xs font-medium text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          {photo.alt}
        </figcaption>
      </figure>
    </li>
  );
}

export default function CommunityGallery() {
  return (
    <section
      aria-labelledby="comunidad-heading"
      className="py-20 overflow-hidden bg-[var(--bg-secondary)]"
    >
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-12">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-3 font-mono">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            Comunidad presencial · Barranquilla
          </p>
          <h2
            id="comunidad-heading"
            className="font-highlight text-3xl md:text-5xl font-extrabold text-text-primary mb-4"
          >
            Esto pasa en el centro
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Aprender no es estar solo frente a un video. Es construir, equivocarse
            y avanzar acompañado, en un lugar físico y con una comunidad que no te
            suelta.
          </p>
        </header>
      </div>

      <div className="flex flex-col gap-5">
        <InfiniteMovingCards direction="left" speed="slow" pauseOnHover>
          {rowOne.map((photo) => (
            <PhotoCard key={photo.src} photo={photo} />
          ))}
        </InfiniteMovingCards>
        <InfiniteMovingCards direction="right" speed="slow" pauseOnHover>
          {rowTwo.map((photo) => (
            <PhotoCard key={photo.src} photo={photo} />
          ))}
        </InfiniteMovingCards>
      </div>
    </section>
  );
}
