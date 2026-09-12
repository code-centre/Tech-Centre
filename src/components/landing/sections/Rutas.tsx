"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Shuffle } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import {
  RUTAS,
  RUTAS_MODULOS_NOTE,
  moduloHref,
  type Ruta,
  type RutaModule,
} from "../rutas/data";
import { COMO_FUNCIONA } from "../rutas/data";
import type { OfferingCohort } from "@/lib/cohorts/checkout";
import type { ProgramCatalogItem } from "@/data/programsHub";
import { PROGRAM_FALLBACK_IMAGE } from "@/components/programas/ProgramOfferCards";

/** Mapa de code de programa (= slug del módulo) -> cohorte abierta. */
export type OfferingCohortMap = Record<string, OfferingCohort>;

const TONE = {
  mint: {
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
    border: "rgba(5, 150, 105, 0.35)",
    soft: "rgba(5, 150, 105, 0.06)",
    softBorder: "rgba(5, 150, 105, 0.22)",
    dim: "rgba(5, 150, 105, 0.55)",
  },
  cyan: {
    color: "#0284C7",
    bg: "rgba(2, 132, 199, 0.1)",
    border: "rgba(2, 132, 199, 0.35)",
    soft: "rgba(2, 132, 199, 0.06)",
    softBorder: "rgba(2, 132, 199, 0.22)",
    dim: "rgba(2, 132, 199, 0.55)",
  },
} as const;

function moduleBlurb(mod: RutaModule, catalog?: ProgramCatalogItem): string {
  return catalog?.blurb ?? catalog?.subtitle ?? mod.outcome;
}

function moduleProgramHref(mod: RutaModule, cohort?: OfferingCohort): string {
  const base = moduloHref(mod.slug);
  return cohort ? `${base}?cohortId=${cohort.cohortId}` : base;
}

function LandingModuleCard({
  mod,
  index,
  tone,
  catalog,
  cohort,
}: {
  mod: RutaModule;
  index: number;
  tone: (typeof TONE)[keyof typeof TONE];
  catalog?: ProgramCatalogItem;
  cohort?: OfferingCohort;
}) {
  const title = catalog?.name ?? mod.title;
  const blurb = moduleBlurb(mod, catalog);
  const image = catalog?.image || PROGRAM_FALLBACK_IMAGE;
  const meta = [catalog?.hours ? `${catalog.hours} h` : null, catalog?.level ?? mod.levelLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={moduleProgramHref(mod, cohort)}
      className="group flex overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(2,132,199,0.35)] hover:shadow-[0_0_0_1px_rgba(2,132,199,0.12),0_16px_40px_-16px_rgba(2,132,199,0.2)]"
      aria-label={`Ver más sobre el módulo ${index + 1}: ${title}`}
    >
      <div className="relative size-28 shrink-0 overflow-hidden bg-slate-100 sm:size-36 md:size-44">
        <Image
          src={image}
          alt=""
          fill
          sizes="176px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <div className="flex flex-col gap-1.5">
          <span
            className="lv2-mono w-fit text-[11px] !normal-case !tracking-normal"
            style={{ color: tone.color }}
          >
            Módulo {index + 1}
          </span>
          <h4 className="text-[16px] font-bold leading-snug text-[var(--paper)] transition-colors group-hover:text-[var(--cyan)] sm:text-[17px]">
            {title}
          </h4>
          <p className="line-clamp-2 text-sm leading-relaxed text-[var(--soft)] sm:line-clamp-3">{blurb}</p>
          {meta ? (
            <p className="lv2-mono !normal-case !tracking-normal text-xs text-[var(--mute)]">{meta}</p>
          ) : null}
        </div>

        <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-[var(--mint-cta)] transition-colors group-hover:text-[var(--mint-dim)]">
          Ver más
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

function RutaCard({
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

      <ol className="flex flex-col gap-3">
        {ruta.modules.map((mod, i) => (
          <li key={mod.slug}>
            <LandingModuleCard
              mod={mod}
              index={i}
              tone={tone}
              catalog={moduleCatalog[mod.slug]}
              cohort={offering[mod.slug]}
            />
          </li>
        ))}
      </ol>

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

      <footer className="flex flex-col gap-3">
        <p className="lv2-mono !normal-case !tracking-normal !text-[var(--mute)]">
          {RUTAS_MODULOS_NOTE} Entra a cada uno para ver su temario y su precio.
        </p>
      </footer>
    </motion.article>
  );
}

/** Las dos rutas, en versión de decisión: qué construyes, con qué, con qué sales. */
export default function Rutas({
  offering = {},
  moduleCatalog = {},
}: {
  offering?: OfferingCohortMap;
  moduleCatalog?: Record<string, ProgramCatalogItem>;
}) {
  const cruce = COMO_FUNCIONA.callouts[1];

  return (
    <section
      id="rutas"
      className="lv2-light-band relative overflow-hidden border-y border-sky-300/50 bg-[#e8eef6] py-24 md:py-28"
      aria-labelledby="rutas-title"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow tone="cyan">Las rutas</SparkEyebrow>
          <h2
            id="rutas-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Dos rutas.{" "}
            <span className="text-[var(--cyan)]">Elige por lo que quieres construir.</span>
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-[var(--soft)]">
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
              moduleCatalog={moduleCatalog}
            />
          ))}
        </div>

        <Reveal delay={0.1}>
          <aside className="mt-6 flex items-start gap-5 rounded-2xl border border-slate-900/20 bg-[#0f172a] p-6 shadow-lg md:p-8">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(116,186,255,0.16)] text-[#74BAFF]">
              <Shuffle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">{cruce.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-300">{cruce.body}</p>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
