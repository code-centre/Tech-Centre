"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import { RUTAS_DIAGNOSTICO_URL, RUTAS_PRECIOS } from "../rutas/data";
import { trackAgentes } from "../agentes/track";
import { EJECUTIVO_PROGRAM_FALLBACK } from "@/lib/programs/entryPaths";

/**
 * Inversión de las rutas técnicas. El Programa Ejecutivo no se mezcla aquí:
 * su precio vive en su landing.
 */
export default function Inversion({
  ejecutivoHref = EJECUTIVO_PROGRAM_FALLBACK,
}: {
  ejecutivoHref?: string;
}) {
  const p = RUTAS_PRECIOS;

  return (
    <section
      id="inversion"
      className="lv2-light-band relative overflow-hidden border-y border-sky-300/50 bg-[#e8eef6] py-20 md:py-24"
      aria-labelledby="inversion-title"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow tone="cyan">Inversión · Rutas técnicas</SparkEyebrow>
          <h2
            id="inversion-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Empieza por un módulo.
            <br />
            <span className="text-[var(--cyan)]">Continúa cuando estés listo.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-[var(--soft)]">
            Un módulo son 8 semanas y 64 horas. Reservar no es pagar el programa
            completo.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <Reveal className="h-full">
            <article className="h-full rounded-2xl border-2 border-emerald-600/25 bg-white p-7 shadow-md md:p-8">
              <p className="lv2-mono !text-[var(--mint)]">
                Un módulo · 8 semanas · 64 horas
              </p>

              <p className="mt-5 flex items-baseline gap-3">
                <span className="lv2-display text-[2.75rem] text-[var(--paper)]">
                  {p.modulo}
                </span>
                <span className="text-[15px] text-[var(--mute)]">/ módulo</span>
              </p>
              <p className="mt-1.5 text-[var(--soft)]">{p.moduloLabel}</p>

              <div className="mt-5 flex items-baseline justify-between gap-4 rounded-xl border border-[var(--line)] bg-slate-50 px-4 py-3.5">
                <span className="text-[var(--soft)]">{p.moduloAvanzadoLabel}</span>
                <span className="lv2-display text-2xl text-[var(--paper)]">
                  {p.moduloAvanzado}
                </span>
              </div>

              <dl className="mt-6 flex flex-col gap-3 border-t border-[var(--line)] pt-6">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[var(--soft)]">Reserva de cupo</dt>
                  <dd className="font-bold text-[var(--paper)]">{p.reserva}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[var(--soft)]">Cuotas sin interés</dt>
                  <dd className="font-bold text-[var(--paper)]">
                    Hasta {p.cuotas}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[var(--soft)]">Pago de contado</dt>
                  <dd className="font-bold text-[var(--mint)]">
                    {p.descuentoContado} dto. · {p.moduloContado}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[var(--soft)]">Egresados de otro módulo</dt>
                  <dd className="font-bold text-[var(--mint)]">
                    {p.descuentoEgresados} menos · {p.moduloEgresados}
                  </dd>
                </div>
              </dl>

              <a
                href={RUTAS_DIAGNOSTICO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="lv2-btn mt-7 w-full"
                onClick={() =>
                  trackAgentes("click_cta_diagnostico", {
                    section: "home_inversion",
                  })
                }
              >
                Agenda tu diagnóstico gratuito
              </a>
              <p className="lv2-mono mt-3 text-center !normal-case !tracking-normal !text-[var(--mute)]">
                Primero el diagnóstico. El pago viene después.
              </p>
            </article>
          </Reveal>

          <div className="flex flex-col gap-5">
            <Reveal delay={0.06}>
              <article className="lv2-card p-7 md:p-8">
                <p className="lv2-mono">Qué incluye</p>
                <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {p.incluye.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check
                        className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[var(--mint)]"
                        aria-hidden="true"
                      />
                      <span className="text-[15px] leading-snug text-[var(--soft)]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Reveal delay={0.12} className="h-full">
                <article className="h-full rounded-2xl border border-emerald-600/20 bg-emerald-50/90 p-6">
                  <h3 className="font-bold text-[var(--paper)]">
                    Si no es tu momento, no hay cobro
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--soft)]">
                    {p.sinRiesgo}
                  </p>
                </article>
              </Reveal>
              <Reveal delay={0.16} className="h-full">
                <article className="h-full rounded-2xl border border-sky-600/20 bg-sky-50/90 p-6">
                  <h3 className="font-bold text-[var(--paper)]">
                    Becas y convenios abiertos
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--soft)]">
                    {p.becas}
                  </p>
                </article>
              </Reveal>
            </div>

            <Reveal delay={0.2}>
              <aside className="rounded-2xl border border-[rgba(20,32,27,0.12)] bg-white/80 p-6 md:p-7">
                <p className="lv2-mono">Programa ejecutivo</p>
                <h3 className="lv2-display mt-3 text-2xl text-[var(--paper)]">
                  ¿Buscas IA para tu trabajo o empresa?
                </h3>
                <p className="mt-2 leading-relaxed text-[var(--soft)]">
                  Programa Ejecutivo de IA Aplicada. 6 semanas, presencial, sin
                  necesidad de programar. La inversión y la próxima cohorte
                  están en su página.
                </p>
                <Link
                  href={ejecutivoHref}
                  className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--mint-cta)] transition-colors hover:text-[var(--mint)]"
                >
                  Ver programa, inversión y próxima cohorte
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </aside>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
