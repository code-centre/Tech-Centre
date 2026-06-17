"use client";

import { MapPin, Wrench, Hammer, Target } from "lucide-react";

const reasons = [
  {
    icon: MapPin,
    title: "Presencial, en el Caribe",
    description:
      "Un lugar físico en Barranquilla donde despertar el genio, con comunidad y guía humana.",
  },
  {
    icon: Wrench,
    title: "El oficio, no el lenguaje",
    description:
      "No formamos “programadores de un lenguaje”: formamos gente que construye sistemas de IA confiables.",
  },
  {
    icon: Hammer,
    title: "Construyes desde el día 1",
    description:
      "Aprender haciendo, con errores incluidos. Sales con un portafolio de productos reales.",
  },
  {
    icon: Target,
    title: "Alineado al mercado",
    description:
      "Currículo construido sobre demanda real de contratación, no sobre teoría desactualizada.",
  },
];

const journey = [
  { phase: "Antes · duda", quote: "“¿Y si sí puedo?”" },
  { phase: "Durante · esfuerzo", quote: "“Vas bien.”" },
  { phase: "Después · orgullo", quote: "“Lo lograste.”" },
];

export default function VisionSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-4 font-mono">
            Por qué Tech Centre
          </p>
          <h2 className="font-highlight text-3xl md:text-5xl font-extrabold text-text-primary">
            Un oficio,{" "}
            <span className="text-[var(--primary)] dark:text-[var(--secondary)]">
              no una moda.
            </span>
          </h2>
        </header>

        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {reasons.map((reason) => (
            <article
              key={reason.title}
              className="flex gap-5 p-6 rounded-2xl bg-[var(--card-background)] border border-border-color shadow-sm"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary)]/10 dark:bg-[var(--secondary)]/12 border border-[var(--primary)]/25 dark:border-[var(--secondary)]/30 shrink-0">
                <reason.icon className="w-6 h-6 text-[var(--primary)] dark:text-[var(--secondary)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {reason.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Emotional journey */}
        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4">
            {journey.map((step) => (
              <article
                key={step.phase}
                className="text-center p-6 rounded-xl bg-[var(--card-background)] border border-border-color shadow-sm"
              >
                <span className="block text-[10px] font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-3 font-mono">
                  {step.phase}
                </span>
                <p className="text-xl font-bold text-text-primary">
                  {step.quote}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
