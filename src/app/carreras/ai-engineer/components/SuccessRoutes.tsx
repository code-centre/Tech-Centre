"use client";

import { useState } from "react";
import {
  RefreshCw,
  BookOpen,
  Rocket,
  Code2,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

const routes = [
  {
    id: "career-change",
    icon: RefreshCw,
    title: "Cambio de carrera",
    audience:
      "Profesionales de cualquier área que quieren dar el salto a tech. Docentes, administrativos, profesionales de salud, marketing, finanzas o retail.",
    goals: [
      "Junior developer o analista de datos con IA en empresas locales o regionales",
      "Primer empleo tech con salario de $3–5M COP/mes ($8K–$15K USD/año)",
      "Base sólida para escalar a roles remotos internacionales en 6–12 meses",
    ],
  },
  {
    id: "students",
    icon: BookOpen,
    title: "Estudiantes universitarios",
    audience:
      "Complementa tu formación académica con skills que las universidades aún no enseñan. La contratación de juniors 22–25 años cayó 20% desde 2022.",
    goals: [
      "Portafolio de proyectos reales en GitHub que te diferencie de tus pares",
      "Ventaja competitiva real para tu primer empleo en tech",
      "Skills para lanzar tu propio proyecto con IA",
    ],
  },
  {
    id: "entrepreneurs",
    icon: Rocket,
    title: "Emprendedores y fundadores",
    audience:
      "Deja de depender de desarrolladores para construir tu producto. Aprende a ir de la idea al MVP con IA.",
    goals: [
      "Capacidad de prototipar y construir tu propio MVP funcional con inteligencia artificial",
      "Autonomía técnica para evaluar proveedores y supervisar equipos dev",
      "Tomar decisiones informadas sobre tecnología con criterio propio",
    ],
  },
  {
    id: "tech-pros",
    icon: Code2,
    title: "Profesionales tech",
    audience:
      "Ya trabajas en tech (desarrollo, QA, DevOps, data) pero quieres especializarte en IA. Pasa de \"usar ChatGPT\" a construir sistemas completos.",
    goals: [
      "Dominar arquitecturas de agentes, RAG y despliegue de IA en producción",
      "Acceder a roles remotos de AI/ML Engineer ($36K–$112K USD/año)",
      "Premium salarial del 30–56% sobre tu salario actual por tener skills de IA",
    ],
  },
];

export default function SuccessRoutes() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="py-20 px-4 bg-[var(--card-background)]/50">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Rutas de éxito: ¿Para quién es este programa?
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            No todos llegan con el mismo background ni persiguen la misma meta.
            Por eso diseñamos rutas diferenciadas para cada perfil.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {routes.map((route) => {
            const isExpanded = expandedId === route.id;
            return (
              <article
                key={route.id}
                className="rounded-2xl border border-border-color bg-background overflow-hidden transition-all duration-300 hover:border-[var(--secondary)]/40"
              >
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : route.id)
                  }
                  className="w-full flex items-start gap-4 p-6 text-left cursor-pointer"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 shrink-0">
                    <route.icon className="w-6 h-6 text-[var(--secondary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-text-primary mb-1">
                      {route.title}
                    </h3>
                    <p className="text-sm text-text-muted line-clamp-2">
                      {route.audience}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted shrink-0 mt-1 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-xs font-bold tracking-widest uppercase text-[var(--secondary)] mb-3 font-mono">
                      Tu meta realista al terminar
                    </p>
                    <ul className="space-y-3">
                      {route.goals.map((goal, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <ArrowRight className="w-4 h-4 text-[var(--secondary)] mt-0.5 shrink-0" />
                          <span className="text-sm text-text-muted leading-relaxed">
                            {goal}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
