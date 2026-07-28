"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import {
  AGENTES_COHORT,
  AGENTES_DIAGNOSTICO_URL,
  AGENTES_PATH,
} from "../agentes/data";
import { trackAgentes } from "../agentes/track";

const highlights = [
  { icon: Calendar, label: "Inicia", value: AGENTES_COHORT.startLabel },
  { icon: Users, label: "Formato", value: "Cohorte pequeña" },
  { icon: MapPin, label: "Modalidad", value: "Presencial · El Prado" },
];

const stack = ["LangGraph", "MCP", "pgvector", "Langfuse", "Docker", "Pydantic AI"];

/** Sección de programas en home: el avanzado es el protagonista. */
export default function Rutas() {
  const reduce = useReducedMotion();

  return (
    <section
      id="rutas"
      className="relative overflow-hidden py-24 md:py-28"
      aria-labelledby="rutas-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>Programa abierto</SparkEyebrow>
          <h2
            id="rutas-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Ingeniería de agentes.{" "}
            <span style={{ color: "#FFB454" }}>Nivel avanzado.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg lv2-soft">
            Para developers que ya programan y quieren construir sistemas con IA,
            no solo usarlas. Inicia el {AGENTES_COHORT.startLabel}. Primero
            diagnóstico, después inscripción.
          </p>
        </Reveal>

        <motion.article
          className="agentes-hub-card mt-12 max-w-4xl"
          initial={{ opacity: 0, y: reduce ? 0 : 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="agentes-badge agentes-badge-compact">AVANZADO</span>
            <span className="agentes-req-chip">requiere saber programar</span>
            <span className="agentes-req-chip">inicia {AGENTES_COHORT.startLabel}</span>
          </div>
          <h3 className="agentes-hub-title">
            Ocho semanas. Un sistema tuyo funcionando.
          </h3>
          <p className="mt-4 max-w-2xl lv2-soft">
            Sábados en la sede. Sales con agentes, MCP, RAG, evaluación y
            observabilidad desplegados. No con apuntes.
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[rgba(255,255,255,0.02)] p-4"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(255,180,84,0.12)] text-[#FFB454]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="lv2-mono !text-[#FFB454]">{item.label}</p>
                    <p className="font-semibold text-[var(--paper)]">{item.value}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <ul className="mt-6 flex flex-wrap gap-2">
            {stack.map((tech) => (
              <li key={tech} className="agentes-stack-chip">
                {tech}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-start gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={AGENTES_DIAGNOSTICO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="agentes-btn-amber"
                onClick={() =>
                  trackAgentes("click_cta_diagnostico", { section: "home_rutas" })
                }
              >
                Agendar sesión de diagnóstico
              </a>
              <Link href={AGENTES_PATH} className="lv2-btn-secondary">
                Ver el programa
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="agentes-cta-note">20 min · sin examen · sin pago</p>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
