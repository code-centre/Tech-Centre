export type CohortLifecycle = 'por_iniciar' | 'en_curso' | 'terminada'

/** Estado de una cohorte según las fechas de inicio y fin (zona local). */
export function getCohortLifecycle(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): CohortLifecycle | null {
  if (!startDate || !endDate) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(`${startDate}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null

  if (today < start) return 'por_iniciar'
  if (today > end) return 'terminada'
  return 'en_curso'
}

/** Cohorte visible en el sitio que aún no terminó (por iniciar o en curso). */
export function isActiveOfferingCohort(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): boolean {
  const status = getCohortLifecycle(startDate, endDate)
  return status === 'por_iniciar' || status === 'en_curso'
}
