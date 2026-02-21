'use client'

import React, { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import ProductSummary from './ProductSummary'
import { useSupabaseClient } from '@/lib/supabase'
import type { Program } from '@/types/programs'
import type { Cohort } from '@/types/cohorts'
import { formatDateShort } from '@/utils/formatDate'

// Helper para obtener días/horas del horario (soporta schedule.days y schedule.clases.dias)
const getScheduleDisplay = (cohort: Cohort | undefined) => {
  if (!cohort) return { days: [] as string[], hours: [] as string[] }
  const s = (cohort as any).schedule
  if (!s) return { days: [] as string[], hours: [] as string[] }
  const days = s.days ?? s.clases?.dias ?? []
  const hours = s.hours ?? s.clases?.horas ?? []
  return { days: Array.isArray(days) ? days : [], hours: Array.isArray(hours) ? hours : [] }
}

interface Props {
  data: Program
  slugProgram: string | null
  subtotal: number | null
  quantity: number
  paymentMethod: 'full' | 'installments' | null
  setPaymentMethod: (value: 'full' | 'installments' | null) => void
  setSubtotal: (value: number | null) => void
  setQuantity: (value: number) => void
  selectedCohortId: number | null
  setSelectedCohortId: (id: number) => void
  selectedInstallments: number
  setSelectedInstallments: (installments: number) => void
  onMatriculaAmountChange?: (amount: number) => void
  onMatriculaStatusChange?: (shouldShow: boolean) => void
  onHasMultipleCohortsChange?: (value: boolean) => void
  matriculaAdded?: boolean
  matriculaAmount?: number
  className?: string
}

export default function ConfigurationSection({
  slugProgram,
  data,
  subtotal,
  quantity,
  paymentMethod,
  setPaymentMethod,
  setSubtotal,
  setQuantity,
  selectedCohortId,
  setSelectedCohortId,
  selectedInstallments,
  setSelectedInstallments,
  onMatriculaAmountChange,
  onMatriculaStatusChange,
  onHasMultipleCohortsChange,
  matriculaAdded = false,
  matriculaAmount = 0,
  className,
}: Props) {
  const supabase = useSupabaseClient()
  const [cohorts, setCohorts] = useState<Cohort[]>([])

  // Cargar todas las cohortes activas del programa
  useEffect(() => {
    const fetchCohorts = async () => {
      if (!data?.id) {
        setCohorts([])
        return
      }

      try {
        const { data: cohortData, error } = await supabase
          .from('cohorts')
          .select('*')
          .eq('program_id', (data as any).id)
          .eq('offering', true)
          .order('start_date', { ascending: true })

        if (error) throw error
        setCohorts((cohortData as Cohort[]) || [])
      } catch (error) {
        console.error('Error al cargar cohortes:', error)
        setCohorts([])
      }
    }

    fetchCohorts()
  }, [data?.id, supabase])

  // Auto-seleccionar solo cuando hay una única cohorte; con múltiples, el usuario debe elegir
  useEffect(() => {
    if (cohorts.length === 1 && selectedCohortId === null) {
      setSelectedCohortId(cohorts[0].id)
    }
  }, [cohorts, selectedCohortId, setSelectedCohortId])

  const hasMultipleCohorts = cohorts.length > 1

  useEffect(() => {
    onHasMultipleCohortsChange?.(hasMultipleCohorts)
  }, [hasMultipleCohorts, onHasMultipleCohortsChange])

  return (
    <section className={`w-full flex flex-col gap-8 pb-14 ${className || ''}`}>
      {/* Resumen del producto */}
      <ProductSummary 
        data={data} 
        selectedCohortId={selectedCohortId}
        onMatriculaAmountChange={onMatriculaAmountChange}
        onMatriculaStatusChange={onMatriculaStatusChange}
        matriculaAdded={matriculaAdded}
        matriculaAmount={matriculaAmount}
      />

      {/* Selector de horario cuando hay múltiples cohortes activas */}
      {hasMultipleCohorts && (
        <article className="rounded-xl border border-border-color bg-bg-card p-6" aria-labelledby="schedule-selector-heading">
          <h2 id="schedule-selector-heading" className="text-lg font-semibold text-text-primary mb-2">
            Elige tu horario
          </h2>
          <p className="text-sm text-text-muted mb-4">
            {selectedCohortId
              ? 'Horario seleccionado. Puedes cambiarlo si lo prefieres.'
              : 'Debes seleccionar un horario para continuar con el pago.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cohorts.map((c) => {
              const { days, hours } = getScheduleDisplay(c)
              const daysStr = days.join(', ') || 'Por definir'
              const hoursStr = hours.join(' - ') || ''
              const isSelected = c.id === selectedCohortId
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCohortId(c.id)}
                  className={`relative flex flex-col items-start p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/20 dark:bg-primary/30 ring-2 ring-primary/50 shadow-lg shadow-primary/20'
                      : 'border-border-color hover:border-primary/50 hover:bg-bg-secondary/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 border-2 border-primary">
                      <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                    </div>
                  )}
                  {isSelected && (
                    <span className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
                      Seleccionado
                    </span>
                  )}
                  <span className="text-sm font-bold text-text-primary">{daysStr}</span>
                  {hoursStr && <span className="text-xs text-text-muted">{hoursStr}</span>}
                  <span className="text-xs text-text-muted mt-1">
                    Inicio: {c.start_date ? formatDateShort(c.start_date) : ''}
                  </span>
                </button>
              )
            })}
          </div>
        </article>
      )}
    </section>
  )
}
