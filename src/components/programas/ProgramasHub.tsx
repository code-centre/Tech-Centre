'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, SearchX } from 'lucide-react'
import type { ProgramsHub } from '@/data/programsHub'
import {
  formatOfferStart,
  LooseProgramCard,
  RouteModuleCard,
} from '@/components/programas/ProgramOfferCards'

interface Props {
  hub: ProgramsHub
}

/** Fotos de la sede cuando la ruta no tiene imagen propia cargada. */
const ROUTE_FALLBACK_PHOTOS = [
  '/community/manos-teclado.webp',
  '/community/sesion-presencial.webp',
  '/community/practica-laptops.webp',
]

const HERO_PHOTO = '/community/sede-codigo-abierto.webp'
const CTA_PHOTO = '/community/manos-teclado.webp'
const DIAGNOSTICO_URL = '/agendar-diagnostico'

const COMO_FUNCIONA = [
  { valor: '8 semanas', detalle: 'por módulo. Compromisos cortos, avance visible.' },
  { valor: '8 horas', detalle: 'a la semana: 4 presenciales en Casa Tech y 4 de práctica guiada.' },
  { valor: '12 personas', detalle: 'máximo por curso. Guía cercana, no auditorios.' },
  { valor: '1 proyecto', detalle: 'real al cierre, presentado en demo day.' },
]

function MonoLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`font-[family-name:var(--mono)] text-[10px] uppercase tracking-[0.14em] ${className}`}
    >
      {children}
    </span>
  )
}

export default function ProgramasHub({ hub }: Props) {
  const [view, setView] = useState<string>('todo')

  const filters = useMemo(
    () => [
      { id: 'todo', label: 'Todo' },
      ...hub.routes.map((route) => ({ id: route.slug, label: route.name })),
      ...(hub.loose.length > 0 ? [{ id: 'sueltos', label: 'Programas' }] : []),
    ],
    [hub.routes, hub.loose.length]
  )

  const visibleRoutes = hub.routes.filter((route) => view === 'todo' || view === route.slug)
  const visibleLoose = view === 'todo' || view === 'sueltos' ? hub.loose : []
  const visibleCount =
    visibleRoutes.reduce((total, route) => total + route.programs.length, 0) + visibleLoose.length

  const nextStart = formatOfferStart(hub.nextStart)
  const cohortLine = nextStart
    ? `Cohorte abierta · inicia ${nextStart} · 12 cupos por grupo`
    : 'Cohortes abiertas · 12 cupos por grupo'

  return (
    <div className="landing-v2 rutas-hub">
      {/* ============ ENCABEZADO ============ */}
      <section className="relative flex min-h-[420px] items-start overflow-hidden pt-16 lg:min-h-[560px] lg:items-end lg:pt-0">
        <Image
          src={HERO_PHOTO}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_38%]"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,13,0.62)_0%,rgba(7,16,13,0.80)_46%,#07100D_96%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(70%_60%_at_82%_18%,rgba(63,224,160,0.20)_0%,transparent_68%)]"
          aria-hidden
        />

        <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 items-end gap-10 px-5 pb-8 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-14 lg:px-24 lg:pb-13 lg:pt-22">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="lv2-spark" aria-hidden />
              <MonoLabel className="text-[11.5px] tracking-[0.2em] text-[var(--soft)]">
                Casa Tech · El Prado · Barranquilla
              </MonoLabel>
            </div>
            <h1 className="lv2-display text-balance text-[38px] leading-[1.02] text-[var(--paper)] [text-shadow:0_2px_30px_rgba(7,16,13,0.6)] sm:text-5xl lg:text-[62px]">
              Elige tu ruta, o toma el curso que <span className="lv2-mint">necesitas ahora</span>
            </h1>
            <p className="max-w-[620px] text-pretty text-[16px] leading-[1.6] text-[var(--soft)] lg:text-[18.5px]">
              Dos rutas de seis meses y cursos cortos sueltos. Aquí solo aparece lo que tiene cohorte
              abierta: hoy son {hub.openCount} programas, todos presenciales en Casa Tech.
            </p>
          </div>

          <div className="flex flex-col gap-3.5 rounded-2xl border border-[rgba(63,224,160,0.22)] bg-[rgba(13,26,22,0.82)] p-6 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span
                className="h-[7px] w-[7px] rounded-full bg-[var(--mint)] shadow-[0_0_0_4px_rgba(63,224,160,0.18)]"
                aria-hidden
              />
              <MonoLabel className="text-[11px] tracking-[0.12em] text-[var(--mint)]">
                {cohortLine}
              </MonoLabel>
            </div>
            <p className="text-[15px] leading-[1.55] text-[var(--soft)]">
              El diagnóstico es gratis y dura 20 minutos. Te dice dónde deberías empezar, sin que
              pagues ni repitas lo que ya sabes.
            </p>
            <Link href={DIAGNOSTICO_URL} className="lv2-btn text-[15.5px]">
              Agenda tu diagnóstico gratuito
              <ArrowRight className="h-[17px] w-[17px]" aria-hidden />
            </Link>
            <MonoLabel className="text-center text-[10.5px] tracking-[0.1em] text-[var(--mute)]">
              Gratis · sin examen · sin pago
            </MonoLabel>
          </div>
        </div>
      </section>

      {/* El encabezado cierra en tinta y el fondo de la página es verdoso: sin
          este desvanecido queda una línea dura entre los dos. */}
      <div
        className="h-16 bg-[linear-gradient(180deg,#07100D_0%,transparent_100%)]"
        aria-hidden
      />

      {/* ============ FILTROS ============ */}
      {filters.length > 2 && (
        <section className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-24">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--line)] bg-[rgba(13,26,22,0.72)] px-4 py-3.5">
            <MonoLabel className="mr-1 text-[10.5px] tracking-[0.16em] text-[var(--mute)]">Ver</MonoLabel>
            {filters.map((filter) => {
              const isActive = view === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setView(filter.id)}
                  aria-pressed={isActive}
                  className={`cursor-pointer rounded-full px-3.5 py-[7px] text-[13px] transition-all ${
                    isActive
                      ? 'border border-[rgba(63,224,160,0.4)] bg-[rgba(63,224,160,0.14)] font-semibold text-[var(--mint)]'
                      : 'border border-[var(--line)] font-medium text-[var(--soft)] hover:border-[var(--mint)] hover:text-[var(--mint)]'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
            <MonoLabel className="ml-auto text-[11.5px] tracking-[0.08em] text-[var(--mute)]">
              {visibleCount === hub.openCount
                ? `Los ${hub.openCount} abiertos`
                : `${visibleCount} de ${hub.openCount} abiertos`}
            </MonoLabel>
          </div>
        </section>
      )}

      {/* ============ RUTAS ============ */}
      {visibleRoutes.map((route, routeIndex) => {
        const tone = routeIndex % 2 === 0 ? '#3FE0A0' : '#74BAFF'
        const photo = route.image || ROUTE_FALLBACK_PHOTOS[routeIndex % ROUTE_FALLBACK_PHOTOS.length]
        const meta = [
          { key: 'Nivel', value: route.level },
          { key: 'Modalidad', value: route.modality },
          { key: 'Duración', value: route.duration },
          { key: 'Próximo inicio', value: formatOfferStart(route.programs[0]?.startDate ?? null) },
        ].filter((item) => Boolean(item.value))

        return (
          <section
            key={route.id}
            className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 pt-9 sm:px-8 lg:px-24 lg:pt-14"
          >
            <div className="relative flex min-h-[216px] items-center overflow-hidden rounded-[20px] border border-[var(--line)]">
              <Image src={photo} alt="" fill sizes="100vw" className="object-cover object-[center_35%] opacity-[0.62]" />
              <div
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,13,0.78)_0%,rgba(7,16,13,0.93)_72%)] lg:bg-[linear-gradient(90deg,rgba(7,16,13,0.95)_0%,rgba(7,16,13,0.80)_44%,rgba(7,16,13,0.46)_100%)]"
                aria-hidden
              />
              <div className="relative grid w-full grid-cols-1 items-center gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10 lg:px-9 lg:py-8">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: tone, boxShadow: `0 0 10px ${tone}` }}
                      aria-hidden
                    />
                    <MonoLabel className="text-[11.5px] tracking-[0.2em]">
                      <span style={{ color: tone }}>Ruta de formación</span>
                    </MonoLabel>
                  </div>
                  <h2 className="lv2-display text-[29px] leading-[1.06] text-[var(--paper)] lg:text-[38px]">
                    {route.name}
                  </h2>
                  {route.description && (
                    <p className="max-w-[620px] text-pretty text-[15px] leading-[1.6] text-[var(--soft)] lg:text-[16.5px]">
                      {route.description}
                    </p>
                  )}
                </div>

                {meta.length > 0 && (
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-2 lg:flex lg:flex-col lg:gap-2.5">
                    {meta.map((item) => (
                      <li
                        key={item.key}
                        className="flex flex-col gap-px lg:flex-row lg:items-baseline lg:justify-between lg:gap-3.5 lg:border-b lg:border-[var(--line)] lg:pb-2"
                      >
                        <MonoLabel className="text-[9px] tracking-[0.14em] text-[var(--mute)] lg:text-[10px]">
                          {item.key}
                        </MonoLabel>
                        <span className="text-[13px] font-medium text-[var(--paper)] lg:text-right lg:text-[14px]">
                          {item.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <ol className="flex flex-col gap-4">
              {route.programs.map((program, index) => (
                <li key={program.code}>
                  <RouteModuleCard program={program} position={index + 1} tone={tone} />
                </li>
              ))}
            </ol>
          </section>
        )
      })}

      {/* ============ PROGRAMAS (sin ruta) ============ */}
      {visibleLoose.length > 0 && (
        <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 pt-10 sm:px-8 lg:px-24 lg:pt-16">
          <div className="flex max-w-[700px] flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[var(--soft)]" aria-hidden />
              <MonoLabel className="text-[11.5px] tracking-[0.2em] text-[var(--soft)]">
                Programas
              </MonoLabel>
            </div>
            <h2 className="lv2-display text-[27px] leading-[1.08] text-[var(--paper)] lg:text-[34px]">
              Cursos que puedes tomar sin la ruta completa
            </h2>
            <p className="text-pretty text-[15px] leading-[1.6] text-[var(--soft)] lg:text-[16px]">
              Programas con cohorte abierta que no pertenecen a ninguna ruta de seis meses.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleLoose.map((program) => (
              <LooseProgramCard key={program.code} program={program} />
            ))}
          </div>
        </section>
      )}

      {/* ============ SIN RESULTADOS ============ */}
      {visibleCount === 0 && (
        <section className="mx-auto w-full max-w-[1440px] px-5 pt-9 sm:px-8 lg:px-24 lg:pt-14">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-[var(--panel)] px-6 py-16 text-center">
            <SearchX className="h-7 w-7 text-[var(--mute)]" aria-hidden />
            <span className="text-[16px] font-semibold text-[var(--paper)]">
              Nada abierto por ahora
            </span>
            <span className="text-[14px] text-[var(--mute)]">
              Agenda el diagnóstico y te avisamos cuándo abre la próxima cohorte.
            </span>
          </div>
        </section>
      )}

      {/* ============ CÓMO FUNCIONA ============ */}
      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 pt-12 sm:px-8 lg:px-24 lg:pt-18">
        <div className="flex items-center gap-3">
          <span className="lv2-spark" aria-hidden />
          <MonoLabel className="text-[11.5px] tracking-[0.2em] text-[var(--mute)]">
            Cómo funciona un módulo de ruta
          </MonoLabel>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {COMO_FUNCIONA.map((item) => (
            <div
              key={item.valor}
              className="flex flex-col gap-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 lg:p-6"
            >
              <span className="text-[19px] font-bold tracking-[-0.015em] text-[var(--mint)] lg:text-[24px]">
                {item.valor}
              </span>
              <span className="text-[12.5px] leading-[1.5] text-[var(--soft)] lg:text-[14px] lg:leading-[1.55]">
                {item.detalle}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CIERRE ============ */}
      <section className="mx-auto w-full max-w-[1440px] px-5 pb-12 pt-12 sm:px-8 lg:px-24 lg:pb-22 lg:pt-18">
        <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-[20px] border border-[rgba(63,224,160,0.28)] lg:min-h-[320px]">
          <Image src={CTA_PHOTO} alt="" fill sizes="100vw" className="object-cover" />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,13,0.82)_0%,rgba(16,36,30,0.95)_100%)]"
            aria-hidden
          />
          <div
            className="absolute -inset-x-[10%] -inset-y-[30%] bg-[radial-gradient(40%_40%_at_50%_50%,rgba(63,224,160,0.20)_0%,transparent_70%)]"
            aria-hidden
          />
          <div className="relative flex flex-col items-center gap-5 px-6 py-10 text-center sm:px-12 lg:py-14">
            <div className="flex max-w-[680px] flex-col items-center gap-3.5">
              <h2 className="lv2-display text-balance text-[27px] leading-[1.08] text-[var(--paper)] lg:text-[38px]">
                ¿No sabes por dónde empezar?
              </h2>
              <p className="text-pretty text-[14.5px] leading-[1.6] text-[var(--soft)] lg:text-[17px]">
                Para eso está el diagnóstico. Veinte minutos, sin examen y sin pago: te ubicamos en la
                ruta o en el curso que te corresponde.
              </p>
            </div>
            <Link href={DIAGNOSTICO_URL} className="lv2-btn w-full text-[15.5px] sm:w-auto lg:text-[16px]">
              Agenda tu diagnóstico gratuito
              <ArrowRight className="h-[17px] w-[17px]" aria-hidden />
            </Link>
            <MonoLabel className="text-[11px] tracking-[0.12em] text-[var(--mute)]">
              {cohortLine}
            </MonoLabel>
          </div>
        </div>
      </section>
    </div>
  )
}
