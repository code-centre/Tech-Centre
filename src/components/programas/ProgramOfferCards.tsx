'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { formatPrice } from '../../../utils/formatCurrency'
import type { HubProgram } from '@/data/programsHub'

export const PROGRAM_FALLBACK_IMAGE = '/community/sesion-presencial.webp'

/** "2026-09-28" -> "28 de septiembre". */
export function formatOfferStart(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(`${iso}T12:00:00`)
  if (isNaN(date.getTime())) return null
  const day = date.getDate()
  const month = date.toLocaleDateString('es-CO', { month: 'long' })
  const year = date.getFullYear()
  const currentYear = new Date().getFullYear()
  return year === currentYear ? `${day} de ${month}` : `${day} de ${month} de ${year}`
}

export function programOfferHref(program: Pick<HubProgram, 'code' | 'cohortId'>): string {
  const base = `/programas-academicos/${program.code}`
  return program.cohortId ? `${base}?cohortId=${program.cohortId}` : base
}

export function OfferOpenChip({ start }: { start: string | null }) {
  const label = formatOfferStart(start)
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(63,224,160,0.3)] bg-[rgba(63,224,160,0.10)] px-2.5 py-[3px] text-[11px] text-[var(--mint)]">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--mint)]" aria-hidden />
      {label ? `Abierta · ${label}` : 'Cohorte abierta'}
    </span>
  )
}

function MonoLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`font-[family-name:var(--mono)] text-[10px] uppercase tracking-[0.14em] ${className}`}
    >
      {children}
    </span>
  )
}

/** Tarjeta completa para programas sueltos (hub y landing). */
export function LooseProgramCard({ program }: { program: HubProgram }) {
  const blurb = program.blurb ?? program.subtitle

  return (
    <article className="flex min-h-[280px] flex-col overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--panel)]">
      <div className="relative aspect-square w-full shrink-0 bg-[#0D1A16]">
        <Image
          src={program.image || PROGRAM_FALLBACK_IMAGE}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(7,16,13,0.72)_100%)]"
          aria-hidden
        />
        <div className="absolute bottom-3 left-3">
          <OfferOpenChip start={program.startDate} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-2">
          <MonoLabel className="text-[9.5px] tracking-[0.12em] text-[var(--mute)]">
            {['Programa', program.hours ? `${program.hours} h` : null].filter(Boolean).join(' · ')}
          </MonoLabel>
          <h3 className="text-[16px] font-semibold leading-tight text-[var(--paper)] lg:text-[17.5px]">
            {program.name}
          </h3>
          {blurb ? (
            <p className="line-clamp-3 text-[13px] leading-[1.55] text-[var(--soft)]">{blurb}</p>
          ) : null}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2.5 border-t border-[var(--line)] pt-3.5">
          <span className="text-[16px] font-bold text-[var(--paper)]">
            {program.price ? formatPrice(program.price, program.currency) : 'Consultar'}
          </span>
          <Link href={programOfferHref(program)} className="lv2-btn px-3.5 py-2 text-[13px]">
            Ver
            <ArrowRight className="h-[15px] w-[15px]" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  )
}

/** Tarjeta horizontal de módulo dentro de una ruta (hub /programas). */
export function RouteModuleCard({
  program,
  position,
  tone,
}: {
  program: HubProgram
  position: number
  tone: string
}) {
  const blurb = program.blurb ?? program.subtitle

  return (
    <article className="flex overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="relative size-28 shrink-0 bg-[#0D1A16] sm:size-36 md:size-44">
        <Image
          src={program.image || PROGRAM_FALLBACK_IMAGE}
          alt=""
          fill
          sizes="176px"
          className="object-cover"
        />
        <span
          className="font-[family-name:var(--mono)] absolute left-2 top-2 inline-flex rounded-md bg-black/50 px-2 py-0.5 text-[10px] tracking-[0.1em] text-white backdrop-blur-sm"
          style={{ color: tone }}
        >
          {String(position).padStart(2, '0')}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h3 className="text-[17px] font-semibold leading-tight tracking-[-0.012em] text-[var(--paper)] sm:text-[19px]">
              {program.name}
            </h3>
            {blurb ? (
              <p className="line-clamp-2 text-[13px] leading-[1.55] text-[var(--soft)] sm:line-clamp-3 sm:text-[14px]">
                {blurb}
              </p>
            ) : null}
          </div>
          <OfferOpenChip start={program.startDate} />
        </div>

        <p className="font-[family-name:var(--mono)] text-[10px] tracking-[0.06em] text-[var(--mute)] sm:text-[10.5px]">
          {[program.hours ? `${program.hours} horas` : null, program.level].filter(Boolean).join(' · ')}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[17px] font-bold text-[var(--paper)] sm:text-[18px]">
              {program.price ? formatPrice(program.price, program.currency) : 'Consultar'}
            </span>
            <MonoLabel className="text-[var(--mute)] tracking-[0.08em]">Reservas con $100.000</MonoLabel>
          </div>
          <Link href={programOfferHref(program)} className="lv2-btn shrink-0 px-4 py-2.5 text-[13px] sm:text-[14.5px]">
            Ver el programa
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  )
}
