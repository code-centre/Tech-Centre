'use client'

import Link from 'next/link'
import { ArrowRight, CalendarDays } from 'lucide-react'

interface Props {
  /** Cohorte a la que apunta "Inscribirme". Sin ella el botón lleva a apartar cupo. */
  cohortId?: number | null
  /** `programs.code` — arma el enlace de apartar cupo y prellena el diagnóstico. */
  programCode?: string
  /** De dónde salió el clic, para el campo `origen` del diagnóstico. */
  source?: string
  size?: 'md' | 'lg'
  /** En móvil los botones siempre van apilados; esto controla el resto. */
  layout?: 'stacked' | 'inline'
  className?: string
}

export default function ProgramCTAButtons({
  cohortId,
  programCode,
  source = 'programa',
  size = 'md',
  layout = 'stacked',
  className = '',
}: Props) {
  const enrollHref = cohortId
    ? `/checkout?cohortId=${cohortId}`
    : `/programas-academicos/${programCode ?? ''}/apartar-cupo`

  const diagnosticHref = programCode
    ? `/agendar-diagnostico?programa=${encodeURIComponent(programCode)}&origen=${encodeURIComponent(source)}`
    : '/agendar-diagnostico'

  const padding = size === 'lg' ? 'px-8 py-4 text-[17px]' : 'px-6 py-3.5 text-base'
  const iconSize = size === 'lg' ? 'w-5 h-5' : 'w-[19px] h-[19px]'
  const direction = layout === 'inline' ? 'flex-col sm:flex-row' : 'flex-col'

  return (
    <div className={`flex ${direction} gap-3 ${className}`}>
      <Link
        href={enrollHref}
        className={`group inline-flex items-center justify-center gap-2 ${padding} rounded-xl bg-secondary text-[#0E1116] font-bold tracking-tight shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/35 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300`}
      >
        <span>Inscribirme</span>
        <ArrowRight className={`${iconSize} group-hover:translate-x-0.5 transition-transform`} />
      </Link>

      <Link
        href={diagnosticHref}
        className={`group inline-flex items-center justify-center gap-2 ${padding} rounded-xl bg-transparent card-text-primary font-semibold border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/10 transition-all duration-300`}
      >
        <CalendarDays className={`${iconSize} group-hover:scale-110 transition-transform`} />
        <span>Agendar diagnóstico</span>
      </Link>
    </div>
  )
}
