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
    title: "Máximo 12 personas por curso",
    description:
      "Mentores que resuelven tus dudas en el momento. Guía cercana, no auditorios.",
  },
  {
    icon: Code,
    title: "Proyectos desde el primer día",
    description:
      "Aprendes haciendo. Cada módulo cierra con un proyecto real presentado en demo day.",
  },
  {
    icon: MessageSquare,
    title: "Feedback y seguimiento continuo",
    description:
      "Retroalimentación constante sobre tu código y guía personalizada en cada paso.",
  },
  {
    icon: Sparkles,
    title: "IA como herramienta de trabajo",
    description:
      "Desarrollo asistido por IA desde el día uno, con criterio sobre qué delegar y qué entender.",
  },
  {
    icon: UsersRound,
    title: "Comunidad y eventos",
    description:
      "Tech Nights, hackatones y una red activa de estudiantes, mentores y profesionales del Caribe.",
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
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-14">
          <div>
            <Reveal>
              <SparkEyebrow>Cómo aprendes</SparkEyebrow>
              <h2
                id="metodo-title"
                className="lv2-display mt-5 text-4xl text-[var(--paper)] sm:text-[2.75rem]"
              >
                Presencial, con{" "}
                <span className="lv2-mint">code review cara a cara</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed lv2-soft">
                4 horas presenciales en Casa Tech, sábados o entre semana, y 4
                horas de práctica guiada en casa. Grupos de máximo 12 personas y
                feedback real, no foros anónimos.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <figure className="relative m-0 mt-8 h-56 overflow-hidden rounded-2xl border border-[var(--line)] md:h-64">
                <Image
                  src="/community/practica-laptops.webp"
                  alt="Estudiantes practicando programación sobre laptops en clase"
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(7,16,13,0.88))]"
                />
                <figcaption className="lv2-mono absolute bottom-5 left-6 !text-[var(--paper)]">
                  Práctica guiada en el salón
                </figcaption>
              </figure>
            </Reveal>
          </div>

          <ul className="flex flex-col gap-4">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <li key={pillar.title}>
                  <Reveal delay={i * 0.06}>
                    <article className="lv2-card flex gap-4 p-5 transition-transform duration-300 hover:-translate-y-0.5 md:p-6">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-[17px] font-bold text-[var(--paper)]">
                          {pillar.title}
                        </h3>
                        <p className="mt-1.5 text-[15px] leading-relaxed lv2-soft">
                          {pillar.description}
                        </p>
                      </div>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ul>
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
