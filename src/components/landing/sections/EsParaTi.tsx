"use client";

import { Check, Minus } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import { RUTAS_FIT } from "../rutas/data";

/**
 * Calificador de audiencia: decir a quién no le sirve sube la confianza
 * y filtra diagnósticos que no van a cerrar.
 */
export default function EsParaTi() {
  return (
    <section
      id="para-quien"
      className="relative py-24 md:py-28"
      aria-labelledby="para-quien-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>{RUTAS_FIT.eyebrow}</SparkEyebrow>
          <h2
            id="para-quien-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Esto funciona si vienes a <span className="lv2-mint">construir</span>,
            no a mirar clases
          </h2>
          <p className="mt-4 max-w-2xl text-lg lv2-soft">{RUTAS_FIT.intro}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal className="h-full">
            <article className="h-full rounded-2xl border border-[rgba(63,224,160,0.3)] bg-[rgba(63,224,160,0.045)] p-7 md:p-8">
              <p className="lv2-mono !text-[var(--mint)]">Sí, es para ti</p>
              <ul className="mt-6 flex flex-col gap-4">
                {RUTAS_FIT.yes.map((item) => (
                  <li key={item.lead} className="flex items-start gap-3.5">
                    <Check
                      className="mt-0.5 h-5 w-5 shrink-0 text-[var(--mint)]"
                      aria-hidden="true"
                    />
                    <p className="leading-relaxed lv2-soft">
                      <strong className="font-semibold text-[var(--paper)]">
                        {item.lead}
                      </strong>{" "}
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>

          <Reveal delay={0.06} className="h-full">
            <article className="lv2-card h-full p-7 md:p-8">
              <p className="lv2-mono">Todavía no es tu momento</p>
              <ul className="mt-6 flex flex-col gap-4">
                {RUTAS_FIT.no.map((item) => (
                  <li key={item.lead} className="flex items-start gap-3.5">
                    <Minus
                      className="mt-0.5 h-5 w-5 shrink-0 text-[var(--mute)]"
                      aria-hidden="true"
                    />
                    <p className="leading-relaxed lv2-mute">
                      Buscas{" "}
                      <strong className="font-semibold text-[var(--soft)]">
                        {item.lead}
                      </strong>
                      . {item.body}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-7 border-t border-[var(--line)] pt-5 text-sm leading-relaxed lv2-mute">
                {RUTAS_FIT.noClosing}
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
