"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight, Shuffle } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import {
  RUTAS,
  RUTAS_MODULOS_NOTE,
  moduloHref,
  type Ruta,
} from "../rutas/data";
import { COMO_FUNCIONA } from "../rutas/data";
import { checkoutHref, type OfferingCohort } from "@/lib/cohorts/checkout";

/** Mapa de code de programa (= slug del módulo) -> cohorte abierta. */
export type OfferingCohortMap = Record<string, OfferingCohort>;

const TONE = {
  mint: {
    color: "var(--mint)",
    bg: "rgba(63,224,160,0.12)",
    border: "rgba(63,224,160,0.35)",
    soft: "rgba(63,224,160,0.05)",
    softBorder: "rgba(63,224,160,0.28)",
    dim: "rgba(63,224,160,0.45)",
  },
  cyan: {
    color: "var(--cyan)",
    bg: "rgba(116,186,255,0.12)",
    border: "rgba(116,186,255,0.35)",
    soft: "rgba(116,186,255,0.05)",
    softBorder: "rgba(116,186,255,0.28)",
    dim: "rgba(116,186,255,0.45)",
  },
} as const;

function RutaCard({
  ruta,
  delay,
  offering,
}: {
  ruta: Ruta;
  delay: number;
  offering: OfferingCohortMap;
}) {
  const reduce = useReducedMotion();
  const tone = TONE[ruta.tone];
  const cumbre = ruta.modules[ruta.modules.length - 1];

  return (
    <motion.article
      className="lv2-card flex h-full flex-col gap-6 p-6 md:p-8"
      initial={{ opacity: 0, y: reduce ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      aria-labelledby={`ruta-${ruta.slug}-title`}
    >
      <header>
        <span
          className="lv2-mono inline-block rounded-full border px-3 py-1"
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
        <p className="mt-3 leading-relaxed lv2-soft">{ruta.description}</p>
      </header>

      <ul className="flex flex-wrap gap-2">
        {ruta.stackPills.map((pill) => (
          <li key={pill} className="lv2-chip">
            {pill}
          </li>
        ))}
      </ul>

      <div
        className="rounded-xl border p-5"
        style={{ borderColor: tone.softBorder, background: tone.soft }}
      >
        <p className="lv2-mono" style={{ color: tone.color }}>
          Al terminar la ruta
        </p>
        <p className="mt-2 font-semibold leading-relaxed text-[var(--paper)]">
          {cumbre.outcome.replace(/^Terminas con /, "").replace(/^./, (c) => c.toUpperCase())}
        </p>
      </div>

      <ol className="flex flex-1 flex-col gap-3">
        {ruta.modules.map((mod, i) => {
          const isCumbre = i === ruta.modules.length - 1;
          // El slug del módulo coincide con el `code` del programa, así que la
          // cohorte abierta se busca directamente por slug.
          const cohort = offering[mod.slug];
          return (
            <li key={mod.slug}>
              <div
                className="flex flex-col gap-4 rounded-xl border p-4 transition-all duration-300 md:p-5"
                style={{
                  borderColor: isCumbre ? tone.border : "var(--line)",
                  background: isCumbre ? tone.soft : "rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex gap-4">
                  <span
                    className="lv2-display shrink-0 text-xl"
                    style={{ color: isCumbre ? tone.color : tone.dim }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[var(--paper)]">{mod.title}</p>
                    <p className="lv2-mono mt-1 !normal-case !tracking-normal !text-[var(--mute)]">
                      {mod.stack}
                    </p>
                    <p
                      className="mt-2 text-sm font-semibold"
                      style={{ color: tone.color }}
                    >
                      {mod.outcome}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[var(--line)] pt-3.5">
                  {cohort ? (
                    <Link
                      href={checkoutHref(cohort.cohortId)}
                      className="lv2-btn px-4 py-2 text-sm"
                      aria-label={`Inscríbete al módulo ${i + 1}: ${mod.title}`}
                    >
                      Inscríbete
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                  <Link
                    href={moduloHref(mod.slug)}
                    className="group/mod lv2-mono inline-flex items-center gap-1 !normal-case !tracking-normal"
                    style={{ color: tone.color }}
                    aria-label={`Ver el módulo ${i + 1}: ${mod.title}`}
                  >
                    Ver el módulo
                    <ChevronRight
                      className="h-4 w-4 transition-transform duration-300 group-hover/mod:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <footer className="flex flex-col gap-3">
        <p className="lv2-mono !normal-case !tracking-normal !text-[var(--mute)]">
          {RUTAS_MODULOS_NOTE} Entra a cada uno para ver su temario y su precio.
        </p>
        <Link
          href={ruta.detailHref}
          className="inline-flex items-center gap-2 font-semibold"
          style={{ color: tone.color }}
        >
          Ver la ruta completa
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </footer>
    </motion.article>
  );
}

/** Las dos rutas, en versión de decisión: qué construyes, con qué, con qué sales. */
export default function Rutas({
  offering = {},
}: {
  offering?: OfferingCohortMap;
}) {
  const cruce = COMO_FUNCIONA.callouts[1];

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
            Dos rutas.{" "}
            <span className="lv2-mint">Elige por lo que quieres construir.</span>
          </h2>
          <p className="mt-4 max-w-3xl text-lg lv2-soft">
            Cada ruta son tres módulos independientes de 8 semanas. Puedes tomar
            uno solo, y no tienes que empezar por el primero: el diagnóstico te
            ubica donde estás.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {RUTAS.map((ruta, i) => (
            <RutaCard
              key={ruta.slug}
              ruta={ruta}
              delay={i * 0.08}
              offering={offering}
            />
          ))}
        </div>

        <Reveal delay={0.1}>
          <aside className="mt-6 flex items-start gap-4 rounded-2xl border border-[rgba(63,224,160,0.28)] bg-[rgba(63,224,160,0.05)] p-6 md:p-7">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)]">
              <Shuffle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-[var(--paper)]">{cruce.title}</h3>
              <p className="mt-2 leading-relaxed lv2-soft">{cruce.body}</p>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
