"use client";

import { Compass, Shuffle } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import { COMO_FUNCIONA, RUTAS_DIAGNOSTICO_URL } from "../rutas/data";
import { trackAgentes } from "../agentes/track";

const CALLOUT_ICONS = [Compass, Shuffle];

/** Cómo funciona: tres módulos de 8 semanas, de la base a la cumbre. */
export default function ComoFunciona() {
  return (
    <section
      id="como-funciona"
      className="relative py-24 md:py-28"
      aria-labelledby="como-funciona-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>{COMO_FUNCIONA.eyebrow}</SparkEyebrow>
          <h2
            id="como-funciona-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Tres módulos, <span className="lv2-mint">un mismo viaje</span>
          </h2>
          <p className="mt-4 max-w-3xl text-lg lv2-soft">{COMO_FUNCIONA.intro}</p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COMO_FUNCIONA.stats.map((stat, i) => (
            <li key={stat.value}>
              <Reveal delay={i * 0.06} className="h-full">
                <div className="lv2-card h-full p-6">
                  <p className="lv2-display text-2xl text-[var(--mint)] sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed lv2-soft">{stat.detail}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {COMO_FUNCIONA.levels.map((level, i) => (
            <li key={level.name}>
              <Reveal delay={i * 0.08} className="h-full">
                <article className="lv2-card relative h-full overflow-hidden p-6 md:p-8">
                  <span
                    aria-hidden="true"
                    className="lv2-display pointer-events-none absolute -right-2 -top-5 text-7xl text-[rgba(63,224,160,0.08)]"
                  >
                    {i + 1}
                  </span>
                  <p className="lv2-mono !text-[var(--mint)]">
                    {level.label.toUpperCase()}
                  </p>
                  <h3 className="lv2-display mt-3 text-2xl text-[var(--paper)]">
                    {level.name}
                  </h3>
                  <p className="mt-3 leading-relaxed lv2-soft">{level.description}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {COMO_FUNCIONA.callouts.map((callout, i) => {
            const Icon = CALLOUT_ICONS[i] ?? Compass;
            return (
              <Reveal key={callout.title} delay={i * 0.08}>
                <aside className="flex h-full items-start gap-4 rounded-2xl border border-[rgba(63,224,160,0.3)] bg-[rgba(63,224,160,0.05)] p-6 md:p-8">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--paper)]">
                      {callout.title}
                    </h3>
                    <p className="mt-2 leading-relaxed lv2-soft">{callout.body}</p>
                  </div>
                </aside>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10">
          <div className="flex flex-col items-start gap-3">
            <a
              href={RUTAS_DIAGNOSTICO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="lv2-btn"
              onClick={() =>
                trackAgentes("click_cta_diagnostico", { section: "home_como_funciona" })
              }
            >
              Descubre en qué módulo empiezas
            </a>
            <p className="lv2-mono !normal-case !tracking-normal !text-[var(--mute)]">
              Diagnóstico gratuito · sin pagar ni repetir lo que ya sabes
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
