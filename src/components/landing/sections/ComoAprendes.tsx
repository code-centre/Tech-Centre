"use client";

import Image from "next/image";
import {
  Users,
  Code,
  MessageSquare,
  Sparkles,
  UsersRound,
} from "lucide-react";
import type { ElementType } from "react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";

interface Pillar {
  icon: ElementType;
  title: string;
  description: string;
}

const pillars: Pillar[] = [
  {
    icon: Users,
    title: "Clases presenciales y guiadas",
    description:
      "Grupos reducidos y mentores que resuelven tus dudas en tiempo real.",
  },
  {
    icon: Code,
    title: "Proyectos desde el primer día",
    description: "Aprendes haciendo, con retos reales del mundo laboral.",
  },
  {
    icon: MessageSquare,
    title: "Feedback y seguimiento continuo",
    description:
      "Retroalimentación constante y guía personalizada en cada paso.",
  },
  {
    icon: Sparkles,
    title: "IA como herramienta de trabajo",
    description:
      "Integras inteligencia artificial en tu forma de construir, desde el inicio.",
  },
  {
    icon: UsersRound,
    title: "Comunidad y eventos",
    description:
      "Una red activa de estudiantes, mentores y profesionales del Caribe.",
  },
];

export default function ComoAprendes() {
  return (
    <section
      id="metodo"
      className="relative py-24 md:py-28"
      aria-labelledby="metodo-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>Cómo aprendes</SparkEyebrow>
          <h2
            id="metodo-title"
            className="lv2-display mt-5 max-w-2xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Una experiencia diseñada para la industria real
          </h2>
          <p className="mt-4 max-w-2xl text-lg lv2-soft">
            Metodología práctica, acompañamiento cercano y una comunidad que
            crece contigo.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <Reveal key={pillar.title} delay={i * 0.07}>
                <article className="lv2-card group h-full p-6 transition-transform duration-300 hover:-translate-y-1 md:p-8">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_18px_rgba(63,224,160,0.4)]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--paper)]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 leading-relaxed lv2-soft">
                    {pillar.description}
                  </p>
                </article>
              </Reveal>
            );
          })}

          {/* Foto de clase intercalada (6.ª celda en desktop) */}
          <Reveal delay={pillars.length * 0.07} className="hidden lg:block">
            <figure className="lv2-card relative h-full min-h-[220px] overflow-hidden">
              <Image
                src="/community/practica-laptops.webp"
                alt="Estudiantes practicando programación sobre laptops en clase"
                fill
                sizes="(max-width: 1024px) 0px, 380px"
                className="object-cover"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(7,16,13,0.85))]"
              />
              <figcaption className="lv2-mono absolute bottom-4 left-4 !text-[var(--paper)]">
                En el salón
              </figcaption>
            </figure>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="lv2-display mx-auto mt-16 max-w-3xl text-center text-2xl text-[var(--paper)] md:text-3xl">
            Aquí no solo estudias tecnología.{" "}
            <span className="lv2-mint">La vives.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
