"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AGENTES_COHORT, AGENTES_PATH } from "./data";

/** Tarjeta del hub para el programa avanzado. */
export default function AdvancedRouteCard() {
  const reduce = useReducedMotion();

  return (
    <motion.article
      className="agentes-hub-card"
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
      <h3 className="agentes-hub-title">Ingeniería de agentes</h3>
      <p className="mt-2 text-lg font-medium text-[var(--paper)]">
        Ya programas. Ahora construyes sistemas con IA.
      </p>
      <p className="mt-4 lv2-soft">
        Ocho semanas presenciales para developers. Inicia el {AGENTES_COHORT.startLabel}.
        Primero diagnóstico. Si aún dudas, hay clase demo el 15 de agosto.
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {["LangGraph", "MCP", "pgvector", "Langfuse", "Docker"].map((t) => (
          <li key={t} className="agentes-stack-chip">
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-7">
        <Link href={AGENTES_PATH} className="agentes-btn-amber w-full">
          Ver programa
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  );
}
