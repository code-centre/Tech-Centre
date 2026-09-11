'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SparkEyebrow from '../SparkEyebrow'
import Reveal from '../Reveal'
import { checkoutHref, type OfferingCohort } from '@/lib/cohorts/checkout'
import type { HubProgram } from '@/data/programsHub'
import { formatPrice } from '../../../../utils/formatCurrency'

type OfferingCohortMap = Record<string, OfferingCohort>

function formatStart(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(`${iso}T12:00:00`)
  if (isNaN(date.getTime())) return null
  const day = date.getDate()
  const month = date.toLocaleDateString('es-CO', { month: 'long' })
  const year = date.getFullYear()
  const currentYear = new Date().getFullYear()
  return year === currentYear ? `${day} de ${month}` : `${day} de ${month} de ${year}`
}

function ProgramCard({
  program,
  cohort,
  delay,
}: {
  program: HubProgram
  cohort: OfferingCohort | undefined
  delay: number
}) {
  const reduce = useReducedMotion()
  const start = formatStart(program.startDate)
  const meta = [program.hours ? `${program.hours} horas` : null, program.level]
    .filter(Boolean)
    .join(' · ')

  return (
    <motion.article
      className="flex min-h-[420px] flex-col justify-between gap-6 rounded-2xl border border-[var(--line)] bg-white p-7 shadow-md md:min-h-[460px] md:p-9"
      initial={{ opacity: 0, y: reduce ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="lv2-mono rounded-full border border-emerald-600/30 bg-emerald-600/10 px-3 py-1 !text-[var(--mint)]">
            Curso suelto
          </span>
          {start ? (
            <span className="lv2-mono inline-flex items-center gap-1.5 rounded-full border border-emerald-600/25 bg-emerald-600/8 px-3 py-1 !normal-case !tracking-normal !text-[var(--mint)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--mint)]" aria-hidden="true" />
              Abierta · {start}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="lv2-display text-[1.65rem] leading-tight text-[var(--paper)] sm:text-3xl">
            {program.name}
          </h3>
          {program.subtitle ? (
            <p className="text-base leading-relaxed text-[var(--soft)] sm:text-lg">{program.subtitle}</p>
          ) : null}
          {meta ? <p className="lv2-mono !normal-case !tracking-normal !text-[var(--mute)]">{meta}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-[var(--line)] pt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="lv2-mono !text-[var(--mute)]">Inversión</span>
            <span className="lv2-display text-[2rem] text-[var(--paper)] sm:text-[2.35rem]">
              {program.price ? formatPrice(program.price, program.currency) : 'Consultar'}
            </span>
          </div>
          <span className="text-sm text-[var(--soft)]">Reservas con $100.000</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {cohort ? (
            <Link
              href={checkoutHref(cohort.cohortId)}
              className="lv2-btn px-5 py-2.5 text-sm"
              aria-label={`Inscribirte en ${program.name}`}
            >
              Inscríbete
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null}
          <Link
            href={`/programas-academicos/${program.code}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--paper)] transition-colors hover:border-[var(--mint)] hover:text-[var(--mint)]"
          >
            Ver el programa
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

/** Cursos con cohorte abierta que no pertenecen a ninguna ruta de seis meses. */
export default function CursosSueltos({
  programs,
  offering = {},
}: {
  programs: HubProgram[]
  offering?: OfferingCohortMap
}) {
  if (programs.length === 0) return null

  const gridClass =
    programs.length === 1
      ? 'grid grid-cols-1'
      : 'grid grid-cols-1 gap-6 lg:grid-cols-2'

  return (
    <section
      id="cursos-sueltos"
      className="relative overflow-hidden border-y border-[var(--line)] bg-[#07100D] py-24 md:py-28"
      aria-labelledby="cursos-sueltos-title"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_0%,rgba(63,224,160,0.12)_0%,transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow tone="mint">Cursos sueltos</SparkEyebrow>
          <h2
            id="cursos-sueltos-title"
            className="lv2-display mt-5 max-w-3xl text-4xl text-[var(--paper)] sm:text-5xl"
          >
            También hay cursos que{' '}
            <span className="text-[var(--mint)]">no son una ruta completa</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-[var(--soft)]">
            Programas cortos con cohorte abierta hoy. Entras, aprendes algo concreto y sales
            con un entregable claro, presencial en Casa Tech.
          </p>
        </Reveal>

        <div className={`mt-12 ${gridClass}`}>
          {programs.map((program, index) => (
            <ProgramCard
              key={program.code}
              program={program}
              cohort={offering[program.code]}
              delay={index * 0.08}
            />
          ))}
        </div>

        <Reveal delay={0.12} className="mt-8">
          <Link
            href="/programas"
            className="lv2-mono inline-flex items-center gap-1.5 !normal-case !tracking-normal text-[var(--mint)] transition-opacity hover:opacity-80"
          >
            Ver toda la oferta abierta
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
