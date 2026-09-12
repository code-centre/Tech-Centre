'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSupabaseClient } from '@/lib/supabase'
import {
  buildReservationBalancePlan,
  reservationBalanceInstallmentOptions,
  type ReservationBalanceInstallment,
} from '@/lib/pricing/reservation-schedule'
import { formatDateRange } from '@/utils/formatDate'

interface Props {
  selectedCohortId: number | null
  balanceAmount: number
  selectedInstallments: number
  setSelectedInstallments: (value: number) => void
}

interface CohortSchedule {
  startDate: string
  endDate: string
  maximumPayments: number
}

export default function ReservationBalancePlan({
  selectedCohortId,
  balanceAmount,
  selectedInstallments,
  setSelectedInstallments,
}: Props) {
  const supabase = useSupabaseClient()
  const [schedule, setSchedule] = useState<CohortSchedule | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedCohortId) {
        setSchedule(null)
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('cohorts')
          .select('start_date, end_date, maximum_payments')
          .eq('id', selectedCohortId)
          .single()

        if (error) throw error

        const row = data as {
          start_date: string | null
          end_date: string | null
          maximum_payments: number | null
        }

        if (!row?.start_date) {
          setSchedule(null)
          return
        }

        setSchedule({
          startDate: row.start_date,
          endDate: row.end_date ?? row.start_date,
          maximumPayments: row.maximum_payments ?? 3,
        })
      } catch (err) {
        console.error('Error al cargar fechas de la cohorte:', err)
        setSchedule(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [selectedCohortId, supabase])

  const installmentOptions = useMemo(
    () => reservationBalanceInstallmentOptions(schedule?.maximumPayments),
    [schedule?.maximumPayments]
  )

  useEffect(() => {
    if (installmentOptions.length === 0) return
    if (!installmentOptions.includes(selectedInstallments)) {
      setSelectedInstallments(installmentOptions[installmentOptions.length - 1] ?? 1)
    }
  }, [installmentOptions, selectedInstallments, setSelectedInstallments])

  const plan: ReservationBalanceInstallment[] = useMemo(() => {
    if (!schedule || balanceAmount <= 0) return []
    return buildReservationBalancePlan(
      balanceAmount,
      schedule.startDate,
      schedule.endDate,
      selectedInstallments
    )
  }, [schedule, balanceAmount, selectedInstallments])

  if (!selectedCohortId) {
    return (
      <p className="text-sm text-text-muted">
        Selecciona un horario para ver las cuotas del saldo y sus fechas.
      </p>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    )
  }

  if (!schedule) {
    return (
      <p className="text-sm text-text-muted">
        Esta cohorte aún no tiene fechas de inicio. Escríbenos y te ayudamos a apartar tu cupo.
      </p>
    )
  }

  if (balanceAmount <= 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label htmlFor="reservation-balance-installments" className="block text-sm font-medium text-text-primary">
          ¿En cuántas cuotas pagas el saldo?
        </label>
        <p className="text-xs text-text-muted">
          Cohorte {formatDateRange(schedule.startDate, schedule.endDate)} · sin interés
        </p>
        <select
          id="reservation-balance-installments"
          value={selectedInstallments}
          onChange={(e) => setSelectedInstallments(parseInt(e.target.value, 10))}
          className="w-full rounded-lg border border-border-color bg-bg-card px-4 py-3 text-text-primary transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          {installmentOptions.map((count) => {
            const preview = buildReservationBalancePlan(
              balanceAmount,
              schedule.startDate,
              schedule.endDate,
              count
            )
            const perInstallment = preview[0]?.amount ?? 0
            return (
              <option key={count} value={count}>
                {count === 1
                  ? `1 cuota · ${perInstallment.toLocaleString('es-CO')} COP (todo el saldo)`
                  : `${count} cuotas · ${perInstallment.toLocaleString('es-CO')} COP c/u aprox.`}
              </option>
            )
          })}
        </select>
      </div>

      <ul className="space-y-2 rounded-lg border border-border-color bg-bg-secondary/40 p-3">
        {plan.map((installment) => (
          <li
            key={installment.number}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <span className="text-text-muted">{installment.dueLabel}</span>
            <span className="shrink-0 font-semibold tabular-nums text-text-primary">
              ${installment.amount.toLocaleString('es-CO')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
