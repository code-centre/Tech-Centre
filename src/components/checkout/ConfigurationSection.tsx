'use client'

import { Minus, Plus } from 'lucide-react'
import React, { useEffect } from 'react'
import ProductSummary from './ProductSummary'
import { useSupabaseClient } from '@/lib/supabase'
import type { Program } from '@/types/programs'

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
  matriculaAdded = false,
  matriculaAmount = 0,
  className,
}: Props) {
  const supabase = useSupabaseClient()
  
  // Cargar automáticamente la primera cohorte disponible
  useEffect(() => {
    const fetchFirstCohort = async () => {
      if (!data?.id || selectedCohortId) return

      try {
        const { data: cohortData, error } = await supabase
          .from('cohorts')
          .select('id')
          .eq('program_id', (data as any).id)
          .limit(1)
          .single()

        if (!error && cohortData) {
          setSelectedCohortId(cohortData.id)
        }
      } catch (error) {
        console.error('Error al cargar cohorte:', error)
      }
    }

    fetchFirstCohort()
  }, [data?.id, selectedCohortId, setSelectedCohortId, supabase])

  const handleDecreaseQuantity = () => {
    setQuantity(Math.max(1, quantity - 1))
  }

  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value > 0) {
      setQuantity(value)
    } else if (e.target.value === '') {
      setQuantity(1)
    }
  }

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
    </section>
  )
}
