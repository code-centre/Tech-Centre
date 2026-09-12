import {
  buildCohortInstallmentPlan,
  cohortInstallmentDueDates,
  cohortInstallmentDueLabel,
  cohortInstallmentOptions,
  type CohortInstallmentRow,
} from '@/lib/pricing/cohort-installment-schedule'

export type ReservationBalanceInstallment = CohortInstallmentRow

export const reservationBalanceDueDates = (
  startDate: string,
  endDate: string,
  installmentCount: number
) => cohortInstallmentDueDates(startDate, endDate, installmentCount, 'reservation_balance')

export const reservationDueDateLabel = (
  installmentIndex: number,
  totalInstallments: number,
  dueDate: string
) => cohortInstallmentDueLabel(installmentIndex, totalInstallments, dueDate, 'reservation_balance')

export const reservationBalanceInstallmentOptions = cohortInstallmentOptions

export function buildReservationBalancePlan(
  balanceAmount: number,
  startDate: string,
  endDate: string,
  installmentCount: number
) {
  return buildCohortInstallmentPlan(
    balanceAmount,
    startDate,
    endDate,
    installmentCount,
    'reservation_balance'
  )
}
