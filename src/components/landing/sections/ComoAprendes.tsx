"use client";

import Image from "next/image";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";

const STEPS = [
  {
    n: "01",
    title: "Aprende",
    body: "4 horas presenciales con un mentor, en grupos de máximo 12 personas.",
  },
  {
    n: "02",
    title: "Construye",
    body: "4 horas de práctica guiada sobre tu proyecto, compatible con tu trabajo.",
  },
  {
    n: "03",
    title: "Recibe feedback",
    body: "Code review, revisión y acompañamiento durante el proceso, no al final.",
  },
  {
    n: "04",
    title: "Presenta",
    body: "Cada módulo termina con un proyecto real y Demo Day.",
  },
] as const;

export default function ComoAprendes() {
  return (
    <section
      id="metodo"
      className="relative py-20 md:py-24"
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
                Aquí no vienes a ver clases.
                <br />
                <span className="lv2-mint">Vienes a construir.</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed lv2-soft">
                8 horas a la semana: 4 presenciales en Casa Tech, sábados o
                entre semana, y 4 de práctica guiada. Feedback real, no foros
                anónimos.
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

          <ol className="flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <li key={step.n}>
                <Reveal delay={i * 0.06}>
                  <article className="lv2-card flex gap-4 p-5 md:p-6">
                    <p className="lv2-mono shrink-0 !text-[var(--mint)]">
                      {step.n}
                    </p>
                    <div>
                      <h3 className="text-[17px] font-bold text-[var(--paper)]">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-[15px] leading-relaxed lv2-soft">
                        {step.body}
                      </p>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
