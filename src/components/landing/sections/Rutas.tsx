"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import { RUTAS, moduloHref, type Ruta } from "../rutas/data";
import type { OfferingCohort } from "@/lib/cohorts/checkout";
import type { ProgramCatalogItem } from "@/data/programsHub";

export type OfferingCohortMap = Record<string, OfferingCohort>;

const TONE = {
  mint: {
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
    border: "rgba(5, 150, 105, 0.35)",
  },
  cyan: {
    color: "#0284C7",
    bg: "rgba(2, 132, 199, 0.1)",
    border: "rgba(2, 132, 199, 0.35)",
  },
} as const;

function moduleHref(slug: string, offering: OfferingCohortMap): string {
  const cohort = offering[slug];
  const base = moduloHref(slug);
  return cohort ? `${base}?cohortId=${cohort.cohortId}` : base;
}

function RutaPipeline({
  ruta,
  delay,
  offering,
  moduleCatalog = {},
}: {
  ruta: Ruta;
  delay: number;
  offering: OfferingCohortMap;
  moduleCatalog?: Record<string, ProgramCatalogItem>;
}) {
  const reduce = useReducedMotion();
  const tone = TONE[ruta.tone];

  return (
    <motion.article
      className="lv2-card flex h-full flex-col p-6 md:p-8"
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      aria-labelledby={`ruta-${ruta.slug}-title`}
    >
      <span
        className="lv2-mono inline-block w-fit rounded-full border px-3 py-1"
        style={{ color: tone.color, borderColor: tone.border, background: tone.bg }}
      >
        {ruta.label.toUpperCase()}
      </span>
      <h3
        id={`ruta-${ruta.slug}-title`}
        className="lv2-display mt-4 text-2xl text-[var(--paper)] sm:text-3xl"
      >
        {ruta.name}
      </h3>

      <ol className="mt-8 flex flex-col">
        {ruta.modules.map((mod, index) => {
          const title = moduleCatalog[mod.slug]?.name ?? mod.title;
          return (
            <li key={mod.slug} className="relative pl-10">
              {index < ruta.modules.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[11px] top-7 h-[calc(100%-8px)] w-px bg-[rgba(20,32,27,0.14)]"
                />
              ) : null}
              <span
                aria-hidden="true"
                className="lv2-mono absolute left-0 top-0 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px]"
                style={{
                  color: tone.color,
                  borderColor: tone.border,
                  background: tone.bg,
                }}
              >
                {index + 1}
              </span>
              <Link
                href={moduleHref(mod.slug, offering)}
                className="block pb-6 no-underline last:pb-0"
              >
                <p className="font-bold leading-snug text-[var(--paper)] transition-colors hover:text-[var(--cyan)]">
                  {title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--soft)]">
                  {mod.outcome.replace(/^Terminas con /, "").replace(/^./, (c) =>
                    c.toUpperCase(),
                  )}
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
    </motion.article>
  );
}

/** Arquitectura de las dos rutas técnicas, sin el Programa Ejecutivo. */
export default function Rutas({
  offering = {},
  moduleCatalog = {},
}: {
  offering?: OfferingCohortMap;
  moduleCatalog?: Record<string, ProgramCatalogItem>;
}) {
  return (
    <section
      id="rutas"
      className="lv2-light-band relative overflow-hidden border-y border-sky-300/50 bg-[#e8eef6] py-20 md:py-24"
      aria-labelledby="rutas-title"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow tone="cyan">Rutas técnicas</SparkEyebrow>
          <h2
            id="rutas-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Cómo avanzas si quieres
            <br />
            <span className="text-[var(--cyan)]">construir tecnología</span>
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-[var(--soft)]">
            Cada módulo dura 8 semanas y funciona de forma independiente. Si ya
            tienes experiencia, el diagnóstico puede ubicarte directamente en un
            nivel intermedio o avanzado.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {RUTAS.map((ruta, i) => (
            <RutaPipeline
              key={ruta.slug}
              ruta={ruta}
              delay={i * 0.08}
              offering={offering}
              moduleCatalog={moduleCatalog}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
