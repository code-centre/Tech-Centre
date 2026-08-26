import { Check } from "lucide-react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";
import { RUTAS_DIAGNOSTICO_URL, RUTAS_PRECIOS } from "../rutas/data";

/**
 * Inversión: la palanca de conversión que faltaba en la home.
 * Precio a la vista, qué incluye, cuotas, becas y reversión de riesgo.
 */
export default function Inversion() {
  const p = RUTAS_PRECIOS;

  return (
    <section
      id="inversion"
      className="relative py-24 md:py-28"
      aria-labelledby="inversion-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow>Inversión</SparkEyebrow>
          <h2
            id="inversion-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            Lo que cuesta y <span className="lv2-mint">qué te llevas</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg lv2-soft">
            Sin cotizaciones por WhatsApp ni precios escondidos. Este es el valor
            de un módulo de 8 semanas.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <Reveal glow className="h-full">
            <article className="h-full rounded-2xl border border-[rgba(63,224,160,0.4)] bg-[linear-gradient(180deg,rgba(63,224,160,0.07)_0%,var(--panel)_55%)] p-7 md:p-8">
              <p className="lv2-mono !text-[var(--mint)]">
                Un módulo · 8 semanas · 64 horas
              </p>

              <p className="mt-5 flex items-baseline gap-3">
                <span className="lv2-display text-[2.75rem] text-[var(--paper)]">
                  {p.modulo}
                </span>
                <span className="text-[15px] lv2-mute">/ módulo</span>
              </p>
              <p className="mt-1.5 lv2-soft">{p.moduloLabel}</p>

              <div className="mt-5 flex items-baseline justify-between gap-4 rounded-xl border border-[var(--line)] bg-white/[0.03] px-4 py-3.5">
                <span className="lv2-soft">{p.moduloAvanzadoLabel}</span>
                <span className="lv2-display text-2xl text-[var(--paper)]">
                  {p.moduloAvanzado}
                </span>
              </div>

              <dl className="mt-6 flex flex-col gap-3 border-t border-[var(--line)] pt-6">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="lv2-soft">Reserva de cupo</dt>
                  <dd className="font-bold text-[var(--paper)]">{p.reserva}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="lv2-soft">Cuotas sin interés</dt>
                  <dd className="font-bold text-[var(--paper)]">
                    Hasta {p.cuotas}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="lv2-soft">Egresados de otro módulo</dt>
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
                      <span className="text-[15px] leading-snug lv2-soft">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Reveal delay={0.12} className="h-full">
                <article className="h-full rounded-2xl border border-[rgba(63,224,160,0.28)] bg-[rgba(63,224,160,0.05)] p-6">
                  <h3 className="font-bold text-[var(--paper)]">
                    Si no es tu momento, no hay cobro
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed lv2-soft">
                    {p.sinRiesgo}
                  </p>
                </article>
              </Reveal>
              <Reveal delay={0.16} className="h-full">
                <article className="h-full rounded-2xl border border-[rgba(116,186,255,0.28)] bg-[rgba(116,186,255,0.05)] p-6">
                  <h3 className="font-bold text-[var(--paper)]">
                    Becas y convenios abiertos
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed lv2-soft">
                    {p.becas}
                  </p>
                </article>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
