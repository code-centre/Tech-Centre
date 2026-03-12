"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Code2,
  Globe,
  BrainCircuit,
  Cloud,
  ArrowRight,
} from "lucide-react";

interface CurriculumSectionProps {
  learningPoints: Array<{ title: string; url?: string }>;
  onEnrollCareer: () => void;
  onEnrollModule: (moduleName: string) => void;
}

type Route = "python" | "javascript";

const sharedFoundation = {
  icon: Terminal,
  badge: "Compartido",
  title: "Fundamentos Tech",
  duration: "1 semana",
  price: "$200,000",
  topics: ["Terminal", "Git", "GitHub", "Entorno de desarrollo"],
};

const routeModules: Record<
  Route,
  { mod1: typeof sharedFoundation; mod2: typeof sharedFoundation }
> = {
  python: {
    mod1: {
      icon: Code2,
      badge: "Ruta Python",
      title: "1A · Python & Programación",
      duration: "6 semanas",
      price: "$600,000",
      topics: [
        "Variables, funciones, datos",
        "Pandas, Matplotlib, Jupyter",
        "Consumo de APIs públicas",
      ],
    },
    mod2: {
      icon: Globe,
      badge: "Ruta Python",
      title: "2A · APIs, Backend & Datos",
      duration: "6 semanas",
      price: "$600,000",
      topics: [
        "APIs REST con FastAPI y Pydantic",
        "SQLite/SQLAlchemy, Docker",
        "Primera integración con LLM",
      ],
    },
  },
  javascript: {
    mod1: {
      icon: Code2,
      badge: "Ruta JavaScript",
      title: "1B · JavaScript & Programación",
      duration: "6 semanas",
      price: "$600,000",
      topics: [
        "Variables, funciones, async/await",
        "Node.js, npm, intro TypeScript",
        "Consumo de APIs públicas",
      ],
    },
    mod2: {
      icon: Globe,
      badge: "Ruta JavaScript",
      title: "2B · React & Full Stack",
      duration: "6 semanas",
      price: "$600,000",
      topics: [
        "React, Tailwind CSS, Next.js",
        "Node.js backend, Prisma ORM",
        "App full stack desplegada",
      ],
    },
  },
};

const sharedAdvanced = [
  {
    icon: BrainCircuit,
    badge: "Ambas rutas",
    title: "3 · IA Aplicada: Agentes con Google ADK",
    duration: "6 semanas",
    price: "$800,000",
    topics: [
      "Prompt engineering, function calling",
      "RAG (Retrieval Augmented Generation)",
      "Google Agent Development Kit",
      "Agentes multi-step, guardrails",
    ],
  },
  {
    icon: Cloud,
    badge: "Ambas rutas",
    title: "4 · Cloud & Despliegue",
    duration: "6 semanas",
    price: "$800,000",
    topics: [
      "Docker, GCP/AWS o Vercel",
      "CI/CD con GitHub Actions",
      "Proyecto integrador",
      "Demo Day",
    ],
  },
];

function ModuleCard({
  mod,
  onEnroll,
  learningUrl,
}: {
  mod: typeof sharedFoundation;
  onEnroll: () => void;
  learningUrl?: string;
}) {
  return (
    <article className="flex flex-col p-6 rounded-xl bg-background border border-border-color hover:border-[var(--secondary)]/40 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--secondary)]/10">
          <mod.icon className="w-5 h-5 text-[var(--secondary)]" />
        </div>
        <span className="text-xs font-bold tracking-widest uppercase text-[var(--secondary)] font-mono">
          {mod.badge}
        </span>
      </div>

      <h4 className="text-lg font-bold text-text-primary mb-1">{mod.title}</h4>
      <div className="flex items-center gap-3 text-sm text-text-muted mb-4">
        <span>{mod.duration}</span>
        <span className="text-text-muted/40">&middot;</span>
        <span className="font-semibold text-[var(--secondary)]">
          {mod.price}
        </span>
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        {mod.topics.map((topic, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-text-muted"
          >
            <span className="text-[var(--secondary)] mt-0.5">•</span>
            {topic}
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row gap-2 mt-auto">
        <button
          onClick={onEnroll}
          className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer"
        >
          Inscribirme
          <ArrowRight className="w-4 h-4" />
        </button>
        {learningUrl && (
          <Link
            href={`/programas-academicos/${learningUrl}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-border-color rounded-lg hover:border-[var(--secondary)]/50 hover:bg-[var(--secondary)]/10 text-text-primary transition-all"
          >
            Ver curso
          </Link>
        )}
      </div>
    </article>
  );
}

export default function CurriculumSection({
  learningPoints,
  onEnrollCareer,
  onEnrollModule,
}: CurriculumSectionProps) {
  const [activeRoute, setActiveRoute] = useState<Route>("python");

  const currentModules = routeModules[activeRoute];

  const getUrlForModule = (title: string): string | undefined => {
    const point = learningPoints.find((lp) =>
      lp.title.toLowerCase().includes(title.toLowerCase()),
    );
    return point?.url;
  };

  return (
    <section id="programa" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            ¿Qué vas a aprender?
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Elige tu ruta según tu objetivo profesional. Los módulos 1 y 2 se
            ofrecen en dos versiones. Los módulos 3 y 4 cubren los mismos
            conceptos de IA, adaptados a tu ruta.
          </p>
        </header>

        {/* Route toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-xl bg-[var(--card-background)] border border-border-color">
            <button
              onClick={() => setActiveRoute("python")}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeRoute === "python"
                  ? "bg-[var(--secondary)]/15 text-[var(--secondary)]"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Ruta Python
            </button>
            <button
              onClick={() => setActiveRoute("javascript")}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeRoute === "javascript"
                  ? "bg-[var(--secondary)]/15 text-[var(--secondary)]"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Ruta JavaScript
            </button>
          </div>
        </div>

        {/* Foundation */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest uppercase text-text-muted mb-4 font-mono">
            Punto de entrada
          </p>
          <div className="max-w-md">
            <ModuleCard
              mod={sharedFoundation}
              onEnroll={() => onEnrollModule(sharedFoundation.title)}
              learningUrl={getUrlForModule("Fundamentos")}
            />
          </div>
        </div>

        {/* Route-specific modules */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest uppercase text-text-muted mb-4 font-mono">
            Módulos de ruta &middot;{" "}
            {activeRoute === "python" ? "Python" : "JavaScript"}
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <ModuleCard
              mod={currentModules.mod1}
              onEnroll={() => onEnrollModule(currentModules.mod1.title)}
              learningUrl={getUrlForModule(
                activeRoute === "python" ? "Python" : "JavaScript",
              )}
            />
            <ModuleCard
              mod={currentModules.mod2}
              onEnroll={() => onEnrollModule(currentModules.mod2.title)}
              learningUrl={getUrlForModule(
                activeRoute === "python" ? "Backend" : "web",
              )}
            />
          </div>
        </div>

        {/* Shared advanced */}
        <div className="mb-10">
          <p className="text-xs font-bold tracking-widest uppercase text-text-muted mb-4 font-mono">
            Módulos avanzados &middot; Ambas rutas
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {sharedAdvanced.map((mod) => (
              <ModuleCard
                key={mod.title}
                mod={mod}
                onEnroll={() => onEnrollModule(mod.title)}
                learningUrl={getUrlForModule(
                  mod.title.includes("IA") ? "Agentes" : "Cloud",
                )}
              />
            ))}
          </div>
        </div>

        {/* Career CTA */}
        <div className="text-center p-8 rounded-2xl bg-[var(--secondary)]/5 border border-[var(--secondary)]/20">
          <p className="text-lg font-bold text-text-primary mb-2">
            Toma la carrera completa o solo los módulos que necesitas
          </p>
          <p className="text-sm text-text-muted mb-6">
            Cada módulo funciona como un curso independiente con su propio
            proyecto y certificado.
          </p>
          <button
            onClick={onEnrollCareer}
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-xl cursor-pointer"
          >
            Inscribirme en la carrera completa
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
