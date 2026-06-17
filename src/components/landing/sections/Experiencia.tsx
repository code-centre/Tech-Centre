"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";

interface Photo {
  src: string;
  alt: string;
  caption: string;
  w: number;
  h: number;
}

const mosaic: Photo[] = [
  { src: "/community/sesion-fca.webp", alt: "Sesión presencial frente a la proyección", caption: "Sesión presencial", w: 1024, h: 768 },
  { src: "/community/manos-teclado.webp", alt: "Manos sobre el teclado escribiendo código", caption: "Manos que crean", w: 768, h: 1024 },
  { src: "/community/laboratorio-codigo.webp", alt: "Laboratorio de programación con proyección de código", caption: "Laboratorio", w: 1024, h: 768 },
  { src: "/community/equipo-selfie.webp", alt: "Estudiantes construyendo en equipo", caption: "Comunidad", w: 768, h: 1024 },
  { src: "/community/demo-herramientas.webp", alt: "Demostración en vivo de herramientas de IA", caption: "Demo day", w: 768, h: 1024 },
  { src: "/community/audiencia-clase.webp", alt: "Asistentes atentos durante una clase presencial", caption: "En clase", w: 768, h: 1024 },
  { src: "/community/practica-laptops.webp", alt: "Práctica en vivo programando sobre laptops", caption: "Práctica en vivo", w: 768, h: 1024 },
  { src: "/community/trabajo-datos.webp", alt: "Trabajando con datos reales en clase", caption: "Trabajo con datos", w: 768, h: 1024 },
];

const marquee: Photo[] = [
  { src: "/community/charla-noche.webp", alt: "Charla nocturna al aire libre", caption: "Charla nocturna", w: 768, h: 1024 },
  { src: "/community/evento-aire-libre.webp", alt: "Evento comunitario nocturno al aire libre", caption: "Evento", w: 768, h: 1024 },
  { src: "/community/sede-codigo-abierto.webp", alt: "Fachada de la sede en Barranquilla", caption: "Nuestra sede", w: 768, h: 1024 },
  { src: "/community/sesion-presencial.webp", alt: "Comunidad reunida en una sesión presencial", caption: "Sesión presencial", w: 768, h: 1024 },
  { src: "/community/comunidad-dos.webp", alt: "Miembros de la comunidad Tech Centre en clase", w: 768, h: 1024, caption: "Comunidad" },
];

function MarqueePhoto({ photo }: { photo: Photo }) {
  return (
    <figure className="group relative h-44 w-64 shrink-0 overflow-hidden rounded-2xl border border-[var(--line)] sm:h-56 sm:w-80">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="320px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(7,16,13,0.7))]" />
      <figcaption className="lv2-mono absolute bottom-3 left-3 !text-[var(--mint)]">
        {photo.caption}
      </figcaption>
    </figure>
  );
}

export default function Experiencia() {
  const reduce = useReducedMotion();
  const marqueeLoop = [...marquee, ...marquee];

  return (
    <section
      id="experiencia"
      className="relative overflow-hidden py-24 md:py-28"
      aria-labelledby="experiencia-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>La experiencia</SparkEyebrow>
          <h2
            id="experiencia-title"
            className="lv2-display mt-5 text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Así se vive Tech Centre
          </h2>
          <p className="mt-4 max-w-2xl text-lg lv2-soft">
            Personas reales, aprendiendo y construyendo en el mismo salón, con
            café de por medio.
          </p>
        </Reveal>

        {/* Mosaico masonry */}
        <div className="relative mt-12">
          {/* Mini-frase de marca flotante */}
          <span
            aria-hidden="true"
            className="lv2-display pointer-events-none absolute -top-4 right-2 z-20 hidden rotate-[-4deg] text-2xl text-[var(--mint)] md:block"
            style={{ textShadow: "0 0 20px rgba(63,224,160,0.5)" }}
          >
            Manos que crean.
          </span>

          <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
            {mosaic.map((photo, i) => (
              <motion.figure
                key={photo.src}
                className="group relative block break-inside-avoid overflow-hidden rounded-2xl border border-[var(--line)]"
                initial={{ opacity: 0, scale: reduce ? 1 : 1.05 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: (i % 4) * 0.08 }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.w}
                  height={photo.h}
                  sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
                  className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(7,16,13,0.8))] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <figcaption className="lv2-mono absolute bottom-3 left-3 translate-y-2 !text-[var(--mint)] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {photo.caption}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee inferior de fotos adicionales */}
      <div className="lv2-marquee mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_8%,white_92%,transparent)]">
        <ul className="lv2-marquee-track" style={{ ["--lv2-marquee-duration" as string]: "55s" }}>
          {marqueeLoop.map((photo, i) => (
            <li key={`${photo.src}-${i}`}>
              <MarqueePhoto photo={photo} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
