"use client";

import { Hammer, Github, Wrench, Users } from "lucide-react";

const principles = [
  {
    icon: Hammer,
    title: "Aprender haciendo",
    description:
      "Cada sesión tiene componente práctico. Escribes código desde el día 1. Sin clases teóricas interminables.",
  },
  {
    icon: Github,
    title: "Construir en público",
    description:
      "Todo tu trabajo se sube a GitHub. Al final tienes un portafolio real con productos funcionales desplegados, no solo un certificado.",
  },
  {
    icon: Wrench,
    title: "Herramientas de hoy",
    description:
      "Python o JavaScript según tu ruta, Google ADK para agentes, FastAPI o Next.js para backend, Docker, GCP/AWS, GitHub Actions — lo que las empresas piden en 2025–2026.",
  },
  {
    icon: Users,
    title: "Comunidad y soporte",
    description:
      "Acceso a la comunidad de Costa Digital, sesiones semanales de Q&A, revisión de proyectos por profesionales y canal de Slack/Discord exclusivo.",
  },
];

export default function MethodologySection() {
  return (
    <section className="py-20 px-4 bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Metodología
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Un programa diseñado para personas comprometidas. La carga horaria
            es exigente pero realista para quienes trabajan a tiempo completo.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {principles.map((p, i) => (
            <article
              key={p.title}
              className="flex gap-5 p-6 rounded-2xl bg-[var(--card-background)] border border-border-color shadow-sm"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary)]/10 dark:bg-[var(--secondary)]/12 border border-[var(--primary)]/25 dark:border-[var(--secondary)]/30 shrink-0">
                <p.icon className="w-6 h-6 text-[var(--primary)] dark:text-[var(--secondary)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  <span className="text-[var(--primary)] dark:text-[var(--secondary)] font-mono mr-2">
                    {i + 1}.
                  </span>
                  {p.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {p.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Format table */}
        <div className="rounded-2xl border border-border-color bg-[var(--card-background)] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border-color bg-[var(--primary)]/8 dark:bg-[var(--secondary)]/10">
            <h3 className="font-bold text-text-primary">
              Formato y dedicación
            </h3>
          </div>
          <div className="divide-y divide-border-color">
            {[
              ["Duración total", "25 semanas (1 propedéutico + 4 módulos de 6 semanas)"],
              ["Clases en vivo", "4 horas/semana (2 sesiones de 2h o 1 bloque de 4h)"],
              ["Práctica autónoma", "5–8 horas/semana recomendadas"],
              ["Dedicación total semanal", "~9–12 horas/semana"],
              ["Total del programa", "~100 hrs clase + ~175 hrs práctica = ~275 hrs"],
              ["Requisitos", "Computador + internet + compromiso real"],
              ["Modalidad", "Presencial en Barranquilla (con grabaciones)"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 px-6 py-4"
              >
                <span className="text-sm font-semibold text-text-primary sm:w-56 shrink-0">
                  {label}
                </span>
                <span className="text-sm text-text-muted">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
