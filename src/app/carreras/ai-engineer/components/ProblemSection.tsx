"use client";

import { Bot, GraduationCap, Puzzle } from "lucide-react";

const problems = [
  {
    icon: Bot,
    title: "Tu trabajo puede automatizarse",
    description:
      "La IA está transformando cada industria. El World Economic Forum proyecta 78 millones de empleos netos creados por IA para 2030. ¿Estás del lado correcto de la transición?",
  },
  {
    icon: GraduationCap,
    title: "La universidad no te prepara",
    description:
      "Las universidades enseñan tecnologías de hace años. Los bootcamps tradicionales se enfocan en programación web general, no en inteligencia artificial aplicada.",
  },
  {
    icon: Puzzle,
    title: "Aprender solo no funciona",
    description:
      "Los tutoriales de YouTube dan fragmentos sin estructura. Sin un camino claro, la mayoría abandona antes de construir algo real.",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 px-4 bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            El mundo cambió. ¿Tu carrera ya cambió?
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            La inteligencia artificial está transformando cada industria. La
            mayoría de las personas no sabe cómo prepararse.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem) => (
            <article
              key={problem.title}
              className="relative p-8 rounded-2xl bg-[var(--card-background)] border border-border-color hover:border-[var(--primary)]/50 dark:hover:border-[var(--secondary)]/50 transition-all duration-300 group shadow-sm"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 dark:bg-[var(--secondary)]/12 border border-[var(--primary)]/25 dark:border-[var(--secondary)]/30 mb-6 group-hover:bg-[var(--primary)]/15 dark:group-hover:bg-[var(--secondary)]/20 transition-colors">
                <problem.icon className="w-7 h-7 text-[var(--primary)] dark:text-[var(--secondary)]" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                {problem.title}
              </h3>
              <p className="text-text-muted leading-relaxed">
                {problem.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
