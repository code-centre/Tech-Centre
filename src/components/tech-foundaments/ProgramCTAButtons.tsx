'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { checkoutHref, reservationCheckoutHref } from '@/lib/cohorts/checkout'
import { programSeatsUrgencyCopy } from '@/lib/programSeatsCopy'

interface Props {
  /** Cohorte a la que apunta "Inscribirme". Sin ella el botón lleva a apartar cupo. */
  cohortId?: number | null
  /** `programs.code` — fallback cuando no hay cohorte seleccionada. */
  programCode?: string
  /** De dónde salió el clic (tracking interno). */
  source?: string
  /** Cupos restantes en la cohorte seleccionada. */
  seatsLeft?: number | null
  size?: 'md' | 'lg'
  /** En móvil los botones siempre van apilados; esto controla el resto. */
  layout?: 'stacked' | 'inline'
  className?: string
}

const RESERVATION_LABEL = 'Aparta tu cupo con $100.000'

function enrollHref(cohortId: number | null | undefined, programCode: string | undefined): string {
  if (cohortId) return checkoutHref(cohortId)
  return `/programas-academicos/${programCode ?? ''}/apartar-cupo`
}

function reserveHref(cohortId: number | null | undefined, programCode: string | undefined): string {
  if (cohortId) return reservationCheckoutHref(cohortId)
  if (programCode) {
    return `/checkout?slug=${encodeURIComponent(programCode)}&mode=reservation`
  }
  return '/programas'
}

export default function ProgramCTAButtons({
  cohortId,
  programCode,
  seatsLeft,
  size = 'md',
  layout = 'stacked',
  className = '',
}: Props) {
  const padding = size === 'lg' ? 'px-8 py-4 text-[17px]' : 'px-6 py-3.5 text-base'
  const iconSize = size === 'lg' ? 'w-5 h-5' : 'w-[19px] h-[19px]'
  const direction = layout === 'inline' ? 'flex-col sm:flex-row' : 'flex-col'

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className={`flex ${direction} gap-3`}>
        <Link
          href={enrollHref(cohortId, programCode)}
          className={`group inline-flex items-center justify-center gap-2 ${padding} rounded-xl bg-secondary text-[#0E1116] font-bold tracking-tight shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/35 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300`}
        >
          <span>Inscribirme</span>
          <ArrowRight className={`${iconSize} group-hover:translate-x-0.5 transition-transform`} />
        </Link>

        <Link
          href={reserveHref(cohortId, programCode)}
          className={`group inline-flex items-center justify-center gap-2 ${padding} rounded-xl bg-transparent card-text-primary font-semibold border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/10 transition-all duration-300`}
        >
          <span>{RESERVATION_LABEL}</span>
          <ArrowRight className={`${iconSize} group-hover:translate-x-0.5 transition-transform`} />
        </Link>
      </div>

      <p className="text-sm card-text-muted text-center leading-relaxed">
        {programSeatsUrgencyCopy(seatsLeft)}
      </p>
    </div>
  )
}
