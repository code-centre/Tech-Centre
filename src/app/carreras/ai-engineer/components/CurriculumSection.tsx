"use client";

import { useState } from "react";
import {
  Terminal,
  Globe,
  Database,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CurriculumSectionProps {
  learningPoints: Array<{ title: string; url?: string }>;
  onEnrollCareer: () => void;
  onEnrollModule: (moduleName: string) => void;
}

type Route = "web" | "datos";

interface ModuleData {
  icon: LucideIcon;
  stage: string;
  title: string;
  summary: string;
  topics: string[];
}

interface RouteData {
  label: string;
  tagline: string;
  perfil: string;
  forWho: string;
  build: string;
  stack: string[];
  modules: ModuleData[];
}

const routeData: Record<Route, RouteData> = {
  web: {
    label: "Ruta Web · Construye",
    tagline: "Construye lo que se ve.",
    perfil: "AI Product / Full-Stack Engineer",
    forWho:
      "Quieres construir productos con IA que la gente usa todos los días. Vienes del mundo web, o quieres entrar por esa puerta.",
    build:
      "Aplicaciones web modernas con agentes de IA embebidos: interfaces que conversan, asisten y deciden, desplegadas y reales.",
    stack: [
      "TypeScript",
      "React",
      "Next.js",
      "Vercel AI SDK",
      "SQL",
      "Docker",
      "structured outputs",
      "function calling",
      "agentes",
      "RAG",
      "guardrails",
      "evals · observabilidad",
    ],
    modules: [
      {
        icon: Terminal,
        stage: "Etapa 1",
        title: "Fundamentos",
        summary: "Programar desde cero.",
        topics: [
          "Pensamiento computacional y lógica",
          "Terminal y línea de comandos",
          "Git y GitHub",
          "JavaScript: variables, flujo, funciones, estructuras",
          "Debugging y buenas prácticas",
          "IA como copiloto desde el día 1",
        ],
      },
      {
        icon: Globe,
        stage: "Etapa 2",
        title: "Desarrollo web",
        summary: "React, Next.js, APIs y bases de datos.",
        topics: [
          "HTML, CSS y diseño responsivo",
          "JavaScript a profundidad → TypeScript",
          "React y Next.js",
          "SQL y bases de datos (Prisma)",
          "APIs REST: consumir y construir",
          "Autenticación, Docker y despliegue (Vercel)",
          "CI con GitHub Actions",
        ],
      },
      {
        icon: BrainCircuit,
        stage: "Etapa 3",
        title: "IA aplicada",
        summary: "Agentes user-facing, RAG y evals.",
        topics: [
          "Harness y context engineering",
          "LLMs en la app + streaming UX (Vercel AI SDK)",
          "Structured outputs y validación (Zod)",
          "Function/tool calling e idempotencia",
          "Agentes: guardrails, límites y terminación",
          "RAG embebido y model routing",
          "Evals, observabilidad (Langfuse) y prompt injection",
        ],
      },
      {
        icon: ShieldCheck,
        stage: "Etapa 4",
        title: "Despliegue seguro",
        summary: "Servidores, nube vs. local y seguridad.",
        topics: [
          "Del local a producción: cómo desplegar tu app con IA",
          "Servicios gestionados vs. nube vs. servidor propio",
          "Modelos por API vs. modelos locales (Ollama, vLLM)",
          "Cuándo usar cada uno: costo, latencia y privacidad",
          "Contenedores en producción (Docker) y CI/CD",
          "Seguridad: secrets, variables de entorno, HTTPS y permisos",
          "Monitoreo, logs y control de costos",
        ],
      },
    ],
  },
  datos: {
    label: "Ruta de Datos · Revela",
    tagline: "Revela el patrón.",
    perfil: "AI Application Engineer · datos",
    forWho:
      "Te atrae entender los datos, automatizar y construir sistemas que razonan sobre información. Entras por la puerta de los datos.",
    build:
      "Agentes que razonan sobre datos y bases de conocimiento: pipelines, RAG y sistemas que convierten información en respuestas confiables.",
    stack: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "pandas",
      "Airflow",
      "Docker",
      "RAG · pgvector",
      "Qdrant",
      "Pydantic AI",
      "LangGraph",
      "retrieval evals",
      "MLflow",
    ],
    modules: [
      {
        icon: Terminal,
        stage: "Etapa 1",
        title: "Fundamentos",
        summary: "Programar desde cero.",
        topics: [
          "Pensamiento computacional y lógica",
          "Terminal y línea de comandos",
          "Git y GitHub",
          "Python: variables, flujo, funciones, estructuras",
          "Debugging y buenas prácticas",
          "IA como copiloto desde el día 1",
        ],
      },
      {
        icon: Database,
        stage: "Etapa 2",
        title: "Ingeniería de datos",
        summary: "SQL, FastAPI, pipelines y análisis.",
        topics: [
          "Python sólido",
          "SQL y PostgreSQL (antes que APIs)",
          "Docker desde temprano",
          "APIs con FastAPI y Pydantic",
          "Pipelines: Airflow, dbt, DuckDB/BigQuery",
          "Estadística (antes que visualización)",
          "EDA y visualización con Streamlit",
        ],
      },
      {
        icon: BrainCircuit,
        stage: "Etapa 3",
        title: "IA aplicada",
        summary: "Agentes sobre conocimiento, RAG y evals.",
        topics: [
          "Harness y context engineering",
          "LLMs y RAG primero: chunking, embeddings, hybrid search, reranking",
          "Vector DB: pgvector y Qdrant",
          "Agentes sobre datos: Pydantic AI, LangGraph, MCP",
          "Retrieval evals: recall, grounding y citación",
          "Evals (LLM-as-judge), observabilidad y costo (Langfuse)",
          "ML clásico después: scikit-learn, XGBoost, MLflow",
        ],
      },
      {
        icon: ShieldCheck,
        stage: "Etapa 4",
        title: "Despliegue seguro",
        summary: "Servidores, nube vs. local y seguridad.",
        topics: [
          "Del local a producción: cómo desplegar tu agente de datos",
          "Servicios gestionados vs. nube vs. servidor propio",
          "Modelos por API vs. modelos locales (Ollama, vLLM)",
          "Cuándo usar cada uno: costo, latencia y privacidad",
          "Contenedores en producción (Docker) y CI/CD",
          "Seguridad: secrets, variables de entorno, HTTPS y permisos",
          "Monitoreo, logs y control de costos",
        ],
      },
    ],
  },
};

function ModuleCard({
  mod,
  onEnroll,
}: {
  mod: ModuleData;
  onEnroll: () => void;
}) {
  const [topicsOpen, setTopicsOpen] = useState(false);

  return (
    <article className="flex flex-col p-6 rounded-xl bg-[var(--card-background)] border border-border-color hover:border-[var(--primary)]/50 dark:hover:border-[var(--secondary)]/50 transition-colors shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--primary)]/10 dark:bg-[var(--secondary)]/12">
          <mod.icon className="w-5 h-5 text-[var(--primary)] dark:text-[var(--secondary)]" />
        </div>
        <span className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] font-mono">
          {mod.stage}
        </span>
      </div>

      <h4 className="text-lg font-bold text-text-primary mb-1">{mod.title}</h4>
      <p className="text-sm text-text-muted mb-4">{mod.summary}</p>

      {/* Acordeón de temas */}
      <div className="mb-6 flex-1">
        <button
          type="button"
          onClick={() => setTopicsOpen(!topicsOpen)}
          className="w-full flex items-center justify-between py-2 text-left rounded-lg hover:bg-[var(--primary)]/5 dark:hover:bg-[var(--secondary)]/5 transition-colors cursor-pointer"
          aria-expanded={topicsOpen}
        >
          <span className="text-sm font-semibold text-text-primary">
            Qué vas a aprender
          </span>
          {topicsOpen ? (
            <ChevronUp className="w-4 h-4 text-[var(--primary)] dark:text-[var(--secondary)] shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
          )}
        </button>
        {topicsOpen && (
          <ul className="space-y-2 pt-2 pl-1">
            {mod.topics.map((topic, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-text-muted"
              >
                <span className="text-[var(--primary)] dark:text-[var(--secondary)] mt-0.5">
                  •
                </span>
                {topic}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto">
        <button
          onClick={onEnroll}
          className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer w-full sm:w-auto"
        >
          Inscribirme
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}

export default function CurriculumSection({
  onEnrollCareer,
  onEnrollModule,
}: CurriculumSectionProps) {
  const [activeRoute, setActiveRoute] = useState<Route>("web");
  const current = routeData[activeRoute];

  return (
    <section id="programa" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-3 font-mono">
            De 0 a la industria
          </p>
          <h2 className="font-highlight text-3xl md:text-5xl font-extrabold text-text-primary mb-4">
            Dos rutas paralelas.{" "}
            <span className="text-[var(--primary)] dark:text-[var(--secondary)]">
              Un mismo destino.
            </span>
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Mismo viaje, dos mundos. Eliges por dónde entrar: por lo que se ve,
            o por lo que esconden los datos. Cada ruta es independiente y
            completa por sí sola.
          </p>
        </header>

        {/* Route toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-xl bg-[var(--card-background)] border border-border-color shadow-sm">
            <button
              onClick={() => setActiveRoute("web")}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeRoute === "web"
                  ? "bg-[var(--primary)]/12 dark:bg-[var(--secondary)]/15 text-[var(--primary)] dark:text-[var(--secondary)] shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Ruta Web · Construye
            </button>
            <button
              onClick={() => setActiveRoute("datos")}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeRoute === "datos"
                  ? "bg-[var(--primary)]/12 dark:bg-[var(--secondary)]/15 text-[var(--primary)] dark:text-[var(--secondary)] shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Ruta de Datos · Revela
            </button>
          </div>
        </div>

        {/* Route overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 rounded-2xl bg-[var(--card-background)] border border-border-color shadow-sm">
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-2 font-mono">
              Para quién
            </p>
            <p className="text-sm text-text-muted leading-relaxed mb-5">
              {current.forWho}
            </p>
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-2 font-mono">
              Qué vas a construir
            </p>
            <p className="text-sm text-text-muted leading-relaxed">
              {current.build}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--primary)]/8 dark:bg-[var(--secondary)]/10 border border-[var(--primary)]/25 dark:border-[var(--secondary)]/30 shadow-sm">
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-3 font-mono">
              El stack del oficio
            </p>
            <ul className="flex flex-wrap gap-2 mb-6">
              {current.stack.map((tech) => (
                <li
                  key={tech}
                  className="text-xs font-medium text-text-primary bg-[var(--card-background)] border border-border-color px-2.5 py-1 rounded-full"
                >
                  {tech}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 pt-4 border-t border-[var(--primary)]/20 dark:border-[var(--secondary)]/25">
              <Sparkles className="w-4 h-4 text-[var(--primary)] dark:text-[var(--secondary)] shrink-0" />
              <p className="text-sm text-text-primary">
                Perfil al egresar:{" "}
                <strong className="font-semibold">{current.perfil}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Stages */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest uppercase text-text-muted mb-4 font-mono">
            Cuatro etapas · {current.label} · 6 meses · 18 h/sem
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {current.modules.map((mod) => (
              <ModuleCard
                key={mod.title}
                mod={mod}
                onEnroll={() =>
                  onEnrollModule(`${current.label} · ${mod.title}`)
                }
              />
            ))}
          </div>
        </div>

        {/* Already coding note */}
        <div className="mb-10 flex items-start gap-3 p-5 rounded-xl bg-[var(--card-background)] border border-border-color shadow-sm">
          <Sparkles className="w-5 h-5 text-[var(--primary)] dark:text-[var(--secondary)] mt-0.5 shrink-0" />
          <p className="text-sm text-text-muted leading-relaxed">
            <strong className="text-text-primary">¿Ya programas?</strong> Si
            tienes experiencia en web o datos, puedes unirte directamente en la{" "}
            <strong className="text-text-primary">Etapa 3 · IA aplicada</strong>
            , tras una breve validación de nivel.
          </p>
        </div>

        {/* Career CTA */}
        <div className="text-center p-8 rounded-2xl bg-[var(--primary)]/8 dark:bg-[var(--secondary)]/10 border border-[var(--primary)]/25 dark:border-[var(--secondary)]/30">
          <p className="text-lg font-bold text-text-primary mb-2">
            Toma la ruta completa o solo la etapa que necesitas
          </p>
          <p className="text-sm text-text-muted mb-6">
            Cada etapa entrega algo real y desplegado. Terminas con portafolio,
            no con apuntes.
          </p>
          <button
            onClick={onEnrollCareer}
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-xl cursor-pointer"
          >
            Inscribirme en la ruta completa
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
