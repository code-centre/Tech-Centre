import { calculateInstallments } from '@/lib/pricing/price-calculator'
import { formatDateCompact, parseDateBogota } from '@/utils/formatDate'

export type CohortInstallmentMode = 'full_checkout' | 'reservation_balance'

export interface CohortInstallmentRow {
  number: number
  amount: number
  dueDate: string
  dueLabel: string
}

function toDateStringBogota(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
}

function subtractDays(dateStr: string, days: number): string {
  const date = parseDateBogota(dateStr)
  date.setDate(date.getDate() - days)
  return toDateStringBogota(date)
}

function midDateBogota(startStr: string, endStr: string): string {
  const start = parseDateBogota(startStr).getTime()
  const end = parseDateBogota(endStr).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return startStr
  }
  return toDateStringBogota(new Date((start + end) / 2))
}

function clampDueDateNotBeforeToday(dueDateStr: string): string {
  const today = toDateStringBogota(new Date())
  return dueDateStr < today ? today : dueDateStr
}

function milestoneDates(startDate: string, endDate: string) {
  return {
    beforeStart: clampDueDateNotBeforeToday(subtractDays(startDate, 1)),
    beforeMid: endDate
      ? clampDueDateNotBeforeToday(subtractDays(midDateBogota(startDate, endDate), 1))
      : clampDueDateNotBeforeToday(subtractDays(startDate, 1)),
    beforeEnd: endDate
      ? clampDueDateNotBeforeToday(subtractDays(endDate, 1))
      : clampDueDateNotBeforeToday(subtractDays(startDate, 1)),
  }
}

/** Fechas de vencimiento alineadas al calendario de la cohorte. */
export function cohortInstallmentDueDates(
  startDate: string,
  endDate: string,
  installmentCount: number,
  mode: CohortInstallmentMode
): string[] {
  if (!startDate || installmentCount <= 0) return []

  const { beforeStart, beforeMid, beforeEnd } = milestoneDates(startDate, endDate)

  if (mode === 'full_checkout') {
    const today = clampDueDateNotBeforeToday(toDateStringBogota(new Date()))
    if (installmentCount === 1) return [today]
    if (installmentCount === 2) return [today, beforeMid]
    if (installmentCount === 3) return [today, beforeMid, beforeEnd]

    const dates = [today]
    const startMs = parseDateBogota(beforeMid).getTime()
    const endMs = parseDateBogota(beforeEnd).getTime()
    for (let i = 1; i < installmentCount; i++) {
      const ratio = i / (installmentCount - 1)
      dates.push(toDateStringBogota(new Date(startMs + ratio * (endMs - startMs))))
    }
    return dates
  }

  // reservation_balance — todo el saldo después del apartado
  if (installmentCount === 1) return [beforeStart]
  if (installmentCount === 2) return [beforeStart, beforeMid]
  if (installmentCount === 3) return [beforeStart, beforeMid, beforeEnd]

  const startMs = parseDateBogota(beforeStart).getTime()
  const endMs = parseDateBogota(beforeEnd).getTime()
  const dates: string[] = []
  for (let i = 0; i < installmentCount; i++) {
    const ratio = installmentCount === 1 ? 0 : i / (installmentCount - 1)
    dates.push(toDateStringBogota(new Date(startMs + ratio * (endMs - startMs))))
  }
  return dates
}

export function cohortInstallmentDueLabel(
  installmentIndex: number,
  totalInstallments: number,
  dueDate: string,
  mode: CohortInstallmentMode
): string {
  const formatted = formatDateCompact(dueDate)

  if (mode === 'full_checkout' && installmentIndex === 0) {
    return `Pagas hoy · ${formatted}`
  }

  if (mode === 'full_checkout') {
    if (totalInstallments === 2) {
      return `Antes de la mitad · ${formatted}`
    }
    if (totalInstallments === 3) {
      return installmentIndex === 1
        ? `Antes de la mitad · ${formatted}`
        : `Antes del final · ${formatted}`
    }
    return `Cuota ${installmentIndex + 1} · vence ${formatted}`
  }

  if (totalInstallments === 1) {
    return `Antes del inicio · ${formatted}`
  }
  if (totalInstallments === 2) {
    return installmentIndex === 0
      ? `Antes del inicio · ${formatted}`
      : `Antes de la mitad · ${formatted}`
  }
  if (totalInstallments === 3) {
    const labels = ['Antes del inicio', 'Antes de la mitad', 'Antes del final']
    return `${labels[installmentIndex] ?? 'Vence'} · ${formatted}`
  }

  return `Cuota ${installmentIndex + 1} · vence ${formatted}`
}

/** Montos + fechas de cuotas según cohorte (checkout completo o saldo de apartado). */
export function buildCohortInstallmentPlan(
  amount: number,
  startDate: string,
  endDate: string,
  installmentCount: number,
  mode: CohortInstallmentMode
): CohortInstallmentRow[] {
  if (amount <= 0 || installmentCount <= 0) return []

  const amounts = calculateInstallments(amount, installmentCount)
  const dueDates = cohortInstallmentDueDates(startDate, endDate, installmentCount, mode)

  return amounts.map((row, index) => {
    const dueDate = dueDates[index] ?? row.dueDate
    return {
      number: row.number,
      amount: row.amount,
      dueDate,
      dueLabel: cohortInstallmentDueLabel(index, installmentCount, dueDate, mode),
    }
  })
}

/** Cuotas permitidas (1–3 o lo que diga la cohorte). */
export function cohortInstallmentOptions(maximumPayments: number | null | undefined): number[] {
  const max = Math.max(1, Math.min(3, maximumPayments ?? 3))
  return Array.from({ length: max }, (_, i) => i + 1)
}
