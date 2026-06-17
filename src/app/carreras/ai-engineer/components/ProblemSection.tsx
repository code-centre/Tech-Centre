"use client";

import { Bot, GraduationCap, Puzzle } from "lucide-react";

const problems = [
  {
    icon: Bot,
    title: "Ya no basta con escribir código",
    description:
      "La forma de programar cambió. El oficio ahora es construir sistemas confiables alrededor de la IA: agentes que deciden, sistemas que razonan sobre datos, productos en los que se puede confiar.",
  },
  {
    icon: GraduationCap,
    title: "No vendemos cursos de un lenguaje",
    description:
      "Las universidades y los bootcamps enseñan tecnologías de hace años. Aquí te llevamos de cero al oficio que el mercado contrata, no a memorizar la sintaxis de un lenguaje.",
  },
  {
    icon: Puzzle,
    title: "Aprender solo no funciona",
    description:
      "Los tutoriales dan fragmentos sin estructura. Sin un camino claro y acompañamiento humano, la mayoría abandona antes de construir algo real.",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 px-4 bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-3 font-mono">
            El método
          </p>
          <h2 className="font-highlight text-3xl md:text-5xl font-extrabold text-text-primary mb-4">
            El genio no se enseña.{" "}
            <span className="text-[var(--primary)] dark:text-[var(--secondary)]">
              Se revela.
            </span>
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            No vendemos cursos de un lenguaje: te llevamos de cero al oficio que
            el mercado contrata, aquí en el Caribe, construyendo de verdad desde
            el primer día.
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
