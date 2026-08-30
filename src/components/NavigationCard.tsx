'use client'

import Link from 'next/link'
import { ArrowRight, CalendarDays, Clock3, MapPin } from 'lucide-react'
import type { Program } from '@/types/programs'
import type { Cohort } from '@/types/cohorts'
import ProgramCTAButtons from './tech-foundaments/ProgramCTAButtons'
import ProgramPriceBlock from './tech-foundaments/ProgramPriceBlock'
import { formatDate } from '@/utils/formatDate'
import { formatPrice } from '../../utils/formatCurrency'

interface NavigationCardProps {
  programData?: Program
  cohorts?: Cohort[]
  cohortId?: number | null
  onCohortSelect?: (cohortId: number) => void
  /** Cupos restantes de la cohorte seleccionada; null cuando no hay cupo máximo. */
  seatsLeft?: number | null
  /** En móvil la tarjeta se reduce a precio + botones dentro de la barra fija. */
  compact?: boolean
}

/** Días y horas de la cohorte, soportando las dos formas que hay guardadas. */
function getSchedule(cohort?: Cohort) {
  const schedule = (cohort as unknown as { schedule?: Record<string, unknown> })?.schedule
  if (!schedule) return { days: [] as string[], hours: [] as string[] }
  const clases = schedule.clases as { dias?: string[]; horas?: string[] } | undefined
  const days = (schedule.days as string[]) ?? clases?.dias ?? []
  const hours = (schedule.hours as string[]) ?? clases?.horas ?? []
  return {
    days: Array.isArray(days) ? days : [],
    hours: Array.isArray(hours) ? hours : [],
  }
}

export default function NavigationCard({
  programData,
  cohorts = [],
  cohortId,
  onCohortSelect,
  seatsLeft,
  compact = false,
}: NavigationCardProps) {
  const selectedCohort = cohorts.find((c) => c.id === cohortId) ?? cohorts[0]
  const { days, hours } = getSchedule(selectedCohort)
  const hasSeats = typeof seatsLeft === 'number' && seatsLeft > 0
  const programCode = programData?.code || programData?.slug

  // Barra fija de móvil: una sola fila, así que el diagnóstico queda como
  // botón de icono y el precio pierde el selector de cuotas.
  if (compact) {
    const price = programData?.discount || programData?.default_price || 0
    const enrollHref = (selectedCohort?.id ?? cohortId)
      ? `/checkout?cohortId=${selectedCohort?.id ?? cohortId}`
      : `/programas-academicos/${programCode ?? ''}/apartar-cupo`
    const diagnosticHref = programCode
      ? `/agendar-diagnostico?programa=${encodeURIComponent(programCode)}&origen=${encodeURIComponent(`programa-${programCode}-barra`)}`
      : '/agendar-diagnostico'

    return (
      <div className="flex items-center gap-3">
        {price > 0 && (
          <div className="flex flex-col shrink-0 leading-tight">
            <span className="text-[11px] card-text-muted">
              {programData?.discount ? 'En oferta' : 'Precio'}
            </span>
            <span className="text-lg font-bold tracking-tight card-text-primary">
              {formatPrice(price, programData?.currency || 'COP')}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 grow justify-end">
          <Link
            href={diagnosticHref}
            aria-label="Agendar diagnóstico"
            title="Agendar diagnóstico"
            className="inline-flex items-center justify-center px-3.5 py-3 rounded-xl border-2 border-secondary/50 card-text-primary hover:border-secondary hover:bg-secondary/10 transition-all duration-300"
          >
            <CalendarDays className="w-[19px] h-[19px]" aria-hidden="true" />
          </Link>
          <Link
            href={enrollHref}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-secondary text-[#0E1116] text-[15px] font-bold shadow-lg shadow-secondary/25 active:scale-[0.99] transition-all duration-300"
          >
            Inscribirme
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section className="w-full lg:max-w-sm h-fit rounded-2xl overflow-hidden bg-(--card-diplomado-bg) border [border-color:var(--card-diplomado-border)] dark:border-border-color shadow-xl">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        {hasSeats ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/10 dark:bg-secondary/15 border border-secondary/30">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0" aria-hidden="true" />
            <span className="text-[13px] font-semibold text-secondary">
              {seatsLeft === 1 ? 'Queda 1 cupo en esta cohorte' : `Quedan ${seatsLeft} cupos en esta cohorte`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/10 dark:bg-secondary/15 border border-secondary/30">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0" aria-hidden="true" />
            <span className="text-[13px] font-semibold text-secondary">Inscripciones abiertas</span>
          </div>
        )}

        {/* Selector de modalidad: solo cuando hay de dónde escoger */}
        {cohorts.length > 1 && (
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] card-text-muted">
              Elige tu modalidad
            </span>
            <div className="grid grid-cols-2 gap-2">
              {cohorts.map((cohort) => {
                const isSelected = cohort.id === selectedCohort?.id
                const { days: cohortDays } = getSchedule(cohort)
                return (
                  <button
                    key={cohort.id}
                    type="button"
                    onClick={() => onCohortSelect?.(cohort.id)}
                    aria-pressed={isSelected}
                    className={`flex flex-col gap-0.5 items-start text-left px-3.5 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-secondary/10 dark:bg-secondary/15 border-secondary text-secondary'
                        : 'bg-bg-secondary dark:bg-bg-primary/60 border-gray-300 dark:border-border-color card-text-muted hover:border-secondary/50'
                    }`}
                  >
                    <span className="text-sm font-semibold">{cohort.modality || cohort.name}</span>
                    {cohortDays.length > 0 && (
                      <span className="text-xs opacity-75">{cohortDays.join(' · ')}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Datos de la cohorte seleccionada */}
        {selectedCohort && (
          <dl className="flex flex-col gap-2.5 px-4 py-3.5 rounded-xl bg-bg-secondary dark:bg-bg-primary/60 border border-gray-300 dark:border-border-color">
            {selectedCohort.start_date && (
              <div className="flex items-center justify-between gap-3 text-sm">
                <dt className="flex items-center gap-2 card-text-muted">
                  <CalendarDays className="w-4 h-4" aria-hidden="true" />
                  Inicio
                </dt>
                <dd className="font-semibold card-text-primary text-right">
                  {formatDate(selectedCohort.start_date)}
                </dd>
              </div>
            )}
            {days.length > 0 && (
              <div className="flex items-center justify-between gap-3 text-sm">
                <dt className="flex items-center gap-2 card-text-muted">
                  <Clock3 className="w-4 h-4" aria-hidden="true" />
                  Horario
                </dt>
                <dd className="font-semibold card-text-primary text-right">
                  {days.join(', ')}
                  {hours.length > 0 && (
                    <span className="block text-xs font-normal card-text-muted">{hours.join(' - ')}</span>
                  )}
                </dd>
              </div>
            )}
            {selectedCohort.modality && (
              <div className="flex items-center justify-between gap-3 text-sm">
                <dt className="flex items-center gap-2 card-text-muted">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  Modalidad
                </dt>
                <dd className="font-semibold card-text-primary text-right">{selectedCohort.modality}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="pt-1 border-t border-gray-300 dark:border-border-color">
          <div className="pt-4">
            <ProgramPriceBlock
              defaultPrice={programData?.default_price}
              discount={programData?.discount}
              currency={programData?.currency || 'COP'}
              maximumPayments={selectedCohort?.maximum_payments}
            />
          </div>
        </div>

        <ProgramCTAButtons
          cohortId={selectedCohort?.id ?? cohortId}
          programCode={programCode}
          source={`programa-${programCode}-tarjeta`}
        />

        <p className="text-xs card-text-muted text-center leading-relaxed">
          El diagnóstico son 20 minutos, gratis y sin compromiso: revisamos tu nivel y te decimos si
          este programa es para ti.
        </p>
      </div>
    </section>
  )
}
