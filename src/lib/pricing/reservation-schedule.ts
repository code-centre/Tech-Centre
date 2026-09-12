import { calculateInstallments } from '@/lib/pricing/price-calculator'
import { formatDateCompact, parseDateBogota } from '@/utils/formatDate'

export interface ReservationBalanceInstallment {
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

/** No dejamos fechas de vencimiento en el pasado si la cohorte ya empezó. */
function clampDueDateNotBeforeToday(dueDateStr: string): string {
  const today = toDateStringBogota(new Date())
  return dueDateStr < today ? today : dueDateStr
}

/**
 * Fechas de vencimiento del saldo (después del apartado):
 * - 1 cuota → antes del inicio
 * - 2 cuotas → antes del inicio, antes de la mitad
 * - 3 cuotas → antes del inicio, mitad, final
 */
export function reservationBalanceDueDates(
  startDate: string,
  endDate: string,
  installmentCount: number
): string[] {
  if (!startDate || installmentCount <= 0) return []

  const beforeStart = clampDueDateNotBeforeToday(subtractDays(startDate, 1))
  const beforeMid = endDate
    ? clampDueDateNotBeforeToday(subtractDays(midDateBogota(startDate, endDate), 1))
    : beforeStart
  const beforeEnd = endDate
    ? clampDueDateNotBeforeToday(subtractDays(endDate, 1))
    : beforeMid

  if (installmentCount === 1) return [beforeStart]
  if (installmentCount === 2) return [beforeStart, beforeMid]
  if (installmentCount === 3) return [beforeStart, beforeMid, beforeEnd]

  const startMs = parseDateBogota(beforeStart).getTime()
  const endMs = parseDateBogota(beforeEnd).getTime()
  const dates: string[] = []

  for (let i = 0; i < installmentCount; i++) {
    const ratio = installmentCount === 1 ? 0 : i / (installmentCount - 1)
    const dueMs = startMs + ratio * (endMs - startMs)
    dates.push(toDateStringBogota(new Date(dueMs)))
  }

  return dates
}

export function reservationDueDateLabel(
  installmentIndex: number,
  totalInstallments: number,
  dueDate: string
): string {
  const formatted = formatDateCompact(dueDate)

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

/** Divide el saldo en cuotas con montos y fechas según el calendario de la cohorte. */
export function buildReservationBalancePlan(
  balanceAmount: number,
  startDate: string,
  endDate: string,
  installmentCount: number
): ReservationBalanceInstallment[] {
  if (balanceAmount <= 0 || installmentCount <= 0) return []

  const amounts = calculateInstallments(balanceAmount, installmentCount)
  const dueDates = reservationBalanceDueDates(startDate, endDate, installmentCount)

  return amounts.map((row, index) => {
    const dueDate = dueDates[index] ?? row.dueDate
    return {
      number: row.number,
      amount: row.amount,
      dueDate,
      dueLabel: reservationDueDateLabel(index, installmentCount, dueDate),
    }
  })
}

/** Cuotas del saldo permitidas (1–3 o lo que diga la cohorte). */
export function reservationBalanceInstallmentOptions(maximumPayments: number | null | undefined): number[] {
  const max = Math.max(1, Math.min(3, maximumPayments ?? 3))
  return Array.from({ length: max }, (_, i) => i + 1)
}
