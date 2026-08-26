"use client";

import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import {
  RUTAS_COMO_ENTRAS,
  RUTAS_DIAGNOSTICO_URL,
  RUTAS_PRECIOS,
  RUTAS_COHORTE,
} from "../rutas/data";
import { trackAgentes } from "../agentes/track";

/**
 * Embudo explícito. Responde la objeción silenciosa del botón:
 * qué pasa exactamente cuando hago clic.
 */
export default function ComoEntras() {
  const steps = RUTAS_COMO_ENTRAS.steps;

  return (
    <section
      id="como-entras"
      className="relative py-24 md:py-28"
      aria-labelledby="como-entras-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>{RUTAS_COMO_ENTRAS.eyebrow}</SparkEyebrow>
          <h2
            id="como-entras-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Tres pasos, <span className="lv2-mint">sin letra pequeña</span>
          </h2>
          <p className="mt-4 max-w-3xl text-lg lv2-soft">
            {RUTAS_COMO_ENTRAS.intro}
          </p>
        </Reveal>

        <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <li key={step.title}>
                <Reveal delay={i * 0.08} className="h-full">
                  <article
                    className={`lv2-card relative h-full overflow-hidden p-6 md:p-8 ${
                      isLast ? "!border-[rgba(63,224,160,0.4)]" : ""
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`lv2-display pointer-events-none absolute -top-4 right-3 text-[5.5rem] ${
                        isLast
                          ? "text-[rgba(63,224,160,0.12)]"
                          : "text-[rgba(63,224,160,0.08)]"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <p className="lv2-mono relative !text-[var(--mint)]">
                      {step.when.toUpperCase()}
                    </p>
                    <h3 className="lv2-display relative mt-3 text-2xl text-[var(--paper)]">
                      {step.title}
                    </h3>
                    <p className="relative mt-3 leading-relaxed lv2-soft">
                      {isLast ? (
                        <>
                          Con{" "}
                          <strong className="font-semibold text-[var(--paper)]">
                            {RUTAS_PRECIOS.reserva}
                          </strong>{" "}
                          aseguras uno de los {RUTAS_COHORTE.seatsTotal} cupos de
                          la cohorte que arranca el{" "}
                          <strong className="font-semibold text-[var(--paper)]">
                            {RUTAS_COHORTE.startDate}
                          </strong>
                          . El resto lo pagas en {RUTAS_PRECIOS.cuotas} cuotas sin
                          interés.
                        </>
                      ) : (
                        step.body
                      )}
                    </p>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>

        <Reveal delay={0.12}>
          <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-2xl border border-[var(--line)] bg-white/[0.025] p-6 md:p-8 lg:flex-row lg:items-center">
            <p className="max-w-2xl text-lg leading-relaxed lv2-soft">
              <strong className="font-semibold text-[var(--paper)]">
                Cada módulo dura 8 semanas.
              </strong>{" "}
              La ruta completa son tres: unos seis meses en total, con
              compromisos cortos y avance visible cada dos meses.
            </p>
            <a
              href={RUTAS_DIAGNOSTICO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="lv2-btn shrink-0"
              onClick={() =>
                trackAgentes("click_cta_diagnostico", {
                  section: "home_como_entras",
                })
              }
            >
              {RUTAS_COMO_ENTRAS.cta}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
