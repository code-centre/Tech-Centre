"use client";

import { ArrowRight, Clock, BookOpen, Zap, Code2 } from "lucide-react";

interface HeroSectionProps {
  onEnroll: () => void;
}

const stats = [
  { value: "25", label: "semanas", icon: Clock },
  { value: "4h", label: "clase/semana", icon: BookOpen },
  { value: "~300h", label: "de formación total", icon: Zap },
  { value: "100%", label: "práctico", icon: Code2 },
];

export default function HeroSection({ onEnroll }: HeroSectionProps) {
  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/15 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--primary)]/5 dark:bg-[var(--secondary)]/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--primary)]/8 dark:bg-[var(--primary)]/12 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-6 font-mono">
            <span className="w-8 h-px bg-[var(--primary)] dark:bg-[var(--secondary)]" />
            Conviértete en
            <span className="w-8 h-px bg-[var(--primary)] dark:bg-[var(--secondary)]" />
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-text-primary mb-6 leading-[0.95] tracking-tight">
            AI Engineer
          </h1>

          <p className="text-lg md:text-xl text-text-muted mb-4 max-w-2xl mx-auto leading-relaxed">
            Prepárate para la nueva era de la tecnología.
          </p>
          <p className="text-base text-text-muted mb-10 max-w-xl mx-auto">
            La industria está cambiando. Este programa te pone del lado correcto
            de la transición: construyendo con IA, no siendo reemplazado por
            ella.
          </p>

          {/* Route badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[var(--primary)]/40 dark:border-[var(--secondary)]/40 bg-[var(--primary)]/8 dark:bg-[var(--secondary)]/10">
              <span className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] font-mono">
                Ruta Python
              </span>
              <span className="text-sm text-text-primary">
                AI Engineer &middot; Agentes, RAG, Google ADK
              </span>
            </div>
            <span className="text-text-muted font-bold text-sm">o</span>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[var(--primary)]/40 dark:border-[var(--secondary)]/40 bg-[var(--primary)]/8 dark:bg-[var(--secondary)]/10">
              <span className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] font-mono">
                Ruta JavaScript
              </span>
              <span className="text-sm text-text-primary">
                Full Stack AI Dev &middot; React, Next.js, IA
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={onEnroll}
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              Inscribirme ahora
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#programa"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-border-color text-text-primary font-medium rounded-xl hover:border-[var(--primary)] dark:hover:border-[var(--secondary)] hover:bg-[var(--primary)]/8 dark:hover:bg-[var(--secondary)]/10 transition-all duration-300"
            >
              Ver programa completo
            </a>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="flex flex-col items-center gap-2 p-5 rounded-xl bg-[var(--card-background)] border border-border-color shadow-sm"
              >
                <stat.icon className="w-5 h-5 text-[var(--primary)] dark:text-[var(--secondary)]" />
                <span className="text-2xl md:text-3xl font-extrabold text-text-primary font-mono leading-none">
                  {stat.value}
                </span>
                <span className="text-xs text-text-muted text-center">
                  {stat.label}
                </span>
              </article>
            ))}
          </div>

          <p className="mt-8 text-sm text-text-muted">
            Presencial en Barranquilla &middot; 5-8 horas de práctica semanal
            &middot; Portafolio real &middot; Comunidad de soporte
          </p>
        </div>
      </div>
    </section>
  );
}
