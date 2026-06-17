"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, MapPin, Wifi } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import Counter from "../Counter";

interface Ruta {
  label: string;
  name: string;
  tagline: string;
  forWhom: string;
  stack: string[];
  profile: string;
  cta: string;
  tone: "mint" | "cyan";
}

const rutas: Ruta[] = [
  {
    label: "Ruta Web",
    name: "Construye",
    tagline: "Construye lo que se ve.",
    forWhom:
      "Quieres construir productos con IA que la gente usa todos los días.",
    stack: ["TypeScript", "React", "Next.js", "Vercel AI SDK", "SQL", "Docker", "agentes", "RAG", "evals"],
    profile: "AI Product / Full-Stack Engineer",
    cta: "Ver ruta Construye",
    tone: "mint",
  },
  {
    label: "Ruta de Datos",
    name: "Revela",
    tagline: "Revela el patrón.",
    forWhom:
      "Te atrae entender los datos y construir sistemas que razonan sobre información.",
    stack: ["Python", "FastAPI", "PostgreSQL", "pandas", "RAG", "pgvector", "Pydantic AI", "LangGraph", "MLflow"],
    profile: "AI Application Engineer · datos",
    cta: "Ver ruta Revela",
    tone: "cyan",
  },
];

const modules = [
  { n: 1, title: "Fundamentos", detail: "Construye: JavaScript → TypeScript · Revela: Python" },
  { n: 2, title: "Especialidad", detail: "Construye: Desarrollo web · Revela: Ingeniería de datos" },
  { n: 3, title: "IA aplicada", detail: "Agentes, RAG y evals", entry: true },
  { n: 4, title: "Servidores y despliegue seguro", detail: "Deploy del agente, modelos locales, nube vs. servidor propio" },
];

const intensity = [
  { icon: Clock, value: 6, suffix: " meses", label: "Duración" },
  { icon: MapPin, value: 6, suffix: " h/semana", label: "Presenciales" },
  { icon: Wifi, value: 12, suffix: " h/semana", label: "Virtuales" },
];

function RutaCard({ ruta, fromLeft }: { ruta: Ruta; fromLeft: boolean }) {
  const reduce = useReducedMotion();
  const accent = ruta.tone === "mint" ? "var(--mint)" : "var(--cyan)";

  return (
    <motion.article
      className="lv2-card relative flex h-full flex-col overflow-hidden p-7 md:p-9"
      style={{ borderTopColor: accent, borderTopWidth: 3 }}
      initial={{ opacity: 0, x: reduce ? 0 : fromLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <span
        aria-hidden="true"
        className="absolute right-0 top-0 h-32 w-32 rounded-full opacity-20 blur-3xl"
        style={{ background: accent }}
      />
      <span className="lv2-mono" style={{ color: accent, letterSpacing: "0.28em" }}>
        {ruta.label}
      </span>
      <h3 className="lv2-display mt-3 text-4xl" style={{ color: accent }}>
        {ruta.name}
      </h3>
      <p className="mt-1 text-lg font-medium text-[var(--paper)]">{ruta.tagline}</p>
      <p className="mt-4 lv2-soft">{ruta.forWhom}</p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {ruta.stack.map((tech) => (
          <li key={tech} className="lv2-chip">
            {tech}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <p className="lv2-mono mb-3">Perfil al egresar</p>
        <p className="mb-6 font-semibold text-[var(--paper)]">{ruta.profile}</p>
        <Link
          href="/carreras/ai-engineer"
          className="lv2-btn-secondary w-full"
          style={{ borderColor: accent, color: accent }}
        >
          {ruta.cta}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  );
}

export default function Rutas() {
  return (
    <section
      id="rutas"
      className="relative overflow-hidden py-24 md:py-28"
      aria-labelledby="rutas-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>Las rutas</SparkEyebrow>
          <h2
            id="rutas-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Dos rutas paralelas.{" "}
            <span className="lv2-mint">Un mismo destino.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg lv2-soft">
            Eliges por dónde entrar: por lo que se ve, o por lo que esconden los
            datos. Cada ruta es independiente y completa por sí sola.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RutaCard ruta={rutas[0]} fromLeft />
          <RutaCard ruta={rutas[1]} fromLeft={false} />
        </div>

        {/* Timeline de 4 módulos */}
        <Reveal className="mt-16">
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((m, i) => (
              <li
                key={m.n}
                className="lv2-card relative p-6"
                style={m.entry ? { borderColor: "rgba(63,224,160,0.4)" } : undefined}
              >
                <span
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold ${
                    m.entry
                      ? "lv2-ring bg-[var(--mint)] text-[var(--ink)]"
                      : "border border-[var(--line)] text-[var(--mint)]"
                  }`}
                  aria-hidden="true"
                >
                  {m.n}
                </span>
                <h4 className="font-bold text-[var(--paper)]">{m.title}</h4>
                <p className="mt-1 text-sm lv2-mute">{m.detail}</p>
                {m.entry && (
                  <span className="lv2-mono mt-3 block !text-[var(--mint)]">
                    Punto de entrada
                  </span>
                )}
                {i < modules.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute right-[-12px] top-1/2 hidden h-px w-6 bg-[var(--line)] lg:block"
                  />
                )}
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Callout de entrada */}
        <Reveal className="mt-6">
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-[rgba(63,224,160,0.3)] bg-[rgba(63,224,160,0.06)] p-5 sm:flex-row sm:items-center">
            <span className="lv2-mono shrink-0 rounded-full border border-[var(--mint)] px-3 py-1 !text-[var(--mint)]">
              ¿Ya programas?
            </span>
            <p className="lv2-soft">
              Si tienes experiencia en web o datos, puedes unirte directamente en
              el Módulo 3 (IA aplicada), tras una breve validación de nivel.
            </p>
          </div>
        </Reveal>

        {/* Datos de intensidad */}
        <Reveal className="mt-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {intensity.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="lv2-card flex items-center gap-4 p-5">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="lv2-display text-2xl text-[var(--paper)]">
                      <Counter to={item.value} suffix={item.suffix} />
                    </p>
                    <p className="lv2-mono">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-sm lv2-mute">
            18 h/semana en total · cada ruta se cursa por separado.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
