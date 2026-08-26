"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import {
  RUTAS,
  RUTAS_DIAGNOSTICO_URL,
  RUTAS_HERO,
  RUTAS_MODULOS_NOTE,
  type Ruta,
} from "../rutas/data";
import { trackAgentes } from "../agentes/track";

const TONE = {
  mint: {
    color: "var(--mint)",
    bg: "rgba(63,224,160,0.12)",
    border: "rgba(63,224,160,0.35)",
  },
  cyan: {
    color: "var(--cyan)",
    bg: "rgba(116,186,255,0.12)",
    border: "rgba(116,186,255,0.35)",
  },
} as const;

function RutaCard({ ruta, delay }: { ruta: Ruta; delay: number }) {
  const reduce = useReducedMotion();
  const tone = TONE[ruta.tone];

  return (
    <motion.article
      className="lv2-card flex h-full flex-col p-6 md:p-8"
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

      <ul className="mt-5 flex flex-wrap gap-2">
        {ruta.stackPills.map((pill) => (
          <li key={pill} className="lv2-chip">
            {pill}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm font-semibold" style={{ color: tone.color }}>
        {RUTAS_MODULOS_NOTE}
      </p>

      <ol className="mt-4 flex flex-1 flex-col gap-4">
        {ruta.modules.map((mod) => (
          <li
            key={mod.level}
            className="rounded-xl border border-[var(--line)] bg-[rgba(255,255,255,0.02)] p-5"
          >
            <p className="lv2-mono" style={{ color: tone.color }}>
              {mod.levelLabel.toUpperCase()}
            </p>
            <h4 className="mt-2 text-lg font-bold text-[var(--paper)]">{mod.title}</h4>
            <p className="lv2-mono mt-1 !normal-case !tracking-normal !text-[var(--mute)]">
              {mod.stack}
            </p>
            <p className="mt-3 text-sm font-semibold" style={{ color: tone.color }}>
              {mod.outcome}
            </p>
            <details className="group mt-3">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-[var(--paper)] [&::-webkit-details-marker]:hidden">
                Ver temario
                <ChevronDown
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <ul className="mt-3 space-y-2">
                {mod.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm leading-relaxed lv2-soft">
                    <span aria-hidden="true" style={{ color: tone.color }}>
                      ·
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ol>

      <footer className="mt-8">
        <a
          href={RUTAS_DIAGNOSTICO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="lv2-btn-secondary w-full"
          onClick={() =>
            trackAgentes("click_cta_diagnostico", {
              section: `home_rutas_${ruta.slug}`,
            })
          }
        >
          Empieza en esta ruta con un diagnóstico gratuito
        </a>
      </footer>
    </motion.article>
  );
}

/** Sección de rutas en home: Producto y Datos, de la base a la cumbre. */
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
            Elige desde dónde vas a{" "}
            <span className="lv2-mint">vivir la tecnología</span>
          </h2>
          <p className="mt-4 max-w-3xl text-lg lv2-soft">{RUTAS_HERO.manifesto}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {RUTAS.map((ruta, i) => (
            <RutaCard key={ruta.slug} ruta={ruta} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
