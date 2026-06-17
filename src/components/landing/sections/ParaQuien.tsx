"use client";

import { Compass, RefreshCw, Hammer } from "lucide-react";
import type { ElementType } from "react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";

interface Perfil {
  icon: ElementType;
  title: string;
  range: string;
  description: string;
}

const perfiles: Perfil[] = [
  {
    icon: Compass,
    title: "El Curioso",
    range: "18 a 24",
    description:
      'Sientes que la tecnología "no es para gente como yo". Aquí encuentras ruta y comunidad.',
  },
  {
    icon: RefreshCw,
    title: "El Reinventor",
    range: "25 a 35",
    description:
      "Quieres migrar a tech con un camino serio, presencial y acompañado.",
  },
  {
    icon: Hammer,
    title: "El Constructor",
    range: "dev con experiencia",
    description:
      "Ya programas y quieres pasar de usar IA a construir agentes y productos. Entra directo al Módulo 3.",
  },
];

export default function ParaQuien() {
  return (
    <section
      id="para-quien"
      className="relative py-24 md:py-28"
      aria-labelledby="para-quien-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>¿Es para ti?</SparkEyebrow>
          <h2
            id="para-quien-title"
            className="lv2-display mt-5 text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Un mensaje, tres puertas
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {perfiles.map((perfil, i) => {
            const Icon = perfil.icon;
            return (
              <Reveal key={perfil.title} delay={i * 0.09}>
                <article className="lv2-card group h-full p-7 transition-transform duration-300 hover:-translate-y-1">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)] transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <h3 className="lv2-display text-2xl text-[var(--paper)]">
                      {perfil.title}
                    </h3>
                    <span className="lv2-mono">{perfil.range}</span>
                  </div>
                  <p className="mt-3 leading-relaxed lv2-soft">
                    {perfil.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
