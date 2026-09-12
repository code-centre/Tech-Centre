'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSupabaseClient } from '@/lib/supabase'
import {
  buildCohortInstallmentPlan,
  cohortInstallmentOptions,
  type CohortInstallmentMode,
} from '@/lib/pricing/cohort-installment-schedule'
import { formatDateRange } from '@/utils/formatDate'

interface Props {
  selectedCohortId: number | null
  /** Monto total a dividir en cuotas (programa completo o saldo del apartado). */
  amount: number
  installmentCount: number
  setInstallmentCount?: (value: number) => void
  mode: CohortInstallmentMode
  /** Si true, solo muestra la lista (sin selector). */
  readOnly?: boolean
  selectLabel?: string
  /** Suma a la primera cuota (p. ej. matrícula). */
  firstPaymentExtra?: number
}

interface CohortSchedule {
  startDate: string
  endDate: string
  maximumPayments: number
}

export default function CohortInstallmentPlanPreview({
  selectedCohortId,
  amount,
  installmentCount,
  setInstallmentCount,
  mode,
  readOnly = false,
  selectLabel,
  firstPaymentExtra = 0,
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
    () => cohortInstallmentOptions(schedule?.maximumPayments),
    [schedule?.maximumPayments]
  )

  useEffect(() => {
    if (readOnly || !setInstallmentCount) return
    if (installmentOptions.length === 0) return
    if (!installmentOptions.includes(installmentCount)) {
      setInstallmentCount(installmentOptions[installmentOptions.length - 1] ?? 1)
    }
  }, [readOnly, installmentOptions, installmentCount, setInstallmentCount])

  const plan = useMemo(() => {
    if (!schedule || amount <= 0) return []
    return buildCohortInstallmentPlan(
      amount,
      schedule.startDate,
      schedule.endDate,
      installmentCount,
      mode
    )
  }, [schedule, amount, installmentCount, mode])

  if (!selectedCohortId) {
    return (
      <p className="text-sm text-text-muted">
        Selecciona un horario para ver las cuotas y sus fechas.
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
        Esta cohorte aún no tiene fechas de inicio definidas.
      </p>
    )
  }

  if (amount <= 0) return null

  const label =
    selectLabel ??
    (mode === 'reservation_balance'
      ? '¿En cuántas cuotas pagas el saldo?'
      : '¿En cuántas cuotas pagas el programa?')

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="space-y-2">
          <label
            htmlFor="cohort-installment-count"
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
          <p className="text-xs text-text-muted">
            Cohorte {formatDateRange(schedule.startDate, schedule.endDate)} · sin interés
          </p>
          <select
            id="cohort-installment-count"
            value={installmentCount}
            onChange={(e) => setInstallmentCount?.(parseInt(e.target.value, 10))}
            className="w-full rounded-lg border border-border-color bg-bg-card px-4 py-3 text-text-primary transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            {installmentOptions.map((count) => {
              const preview = buildCohortInstallmentPlan(
                amount,
                schedule.startDate,
                schedule.endDate,
                count,
                mode
              )
              const perInstallment = preview[0]?.amount ?? 0
              return (
                <option key={count} value={count}>
                  {count === 1
                    ? `1 cuota · ${perInstallment.toLocaleString('es-CO')} COP`
                    : `${count} cuotas · ${perInstallment.toLocaleString('es-CO')} COP c/u aprox.`}
                </option>
              )
            })}
          </select>
        </div>
      )}

      <ul className="space-y-2 rounded-lg border border-border-color bg-bg-secondary/40 p-3">
        {plan.map((installment) => {
          const extra = installment.number === 1 ? firstPaymentExtra : 0
          const displayAmount = installment.amount + extra
          return (
            <li
              key={installment.number}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-text-primary">
                  Cuota {installment.number} de {installmentCount}
                </p>
                <p className="text-text-muted">{installment.dueLabel}</p>
                {extra > 0 && (
                  <p className="text-xs text-text-muted">Incluye matrícula en esta cuota</p>
                )}
              </div>
              <span className="shrink-0 font-semibold tabular-nums text-text-primary">
                ${displayAmount.toLocaleString('es-CO')}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
