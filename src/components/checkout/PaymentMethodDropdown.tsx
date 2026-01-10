'use client'

import React, { useEffect, useState } from 'react'
import { useSupabaseClient } from '@/lib/supabase'
import type { Program } from '@/types/programs'
import { calculatePrice } from '@/lib/pricing/price-calculator'

interface Cohort {
  id: number
  maximum_payments: number
}

interface Props {
  data: Program
  selectedCohortId: number | null
  paymentMethod: 'full' | 'installments' | null
  setPaymentMethod: (value: 'full' | 'installments' | null) => void
  selectedInstallments: number
  setSelectedInstallments: (installments: number) => void
  onPriceChange: (price: number) => void
}

export default function PaymentMethodDropdown({
  data,
  selectedCohortId,
  paymentMethod,
  setPaymentMethod,
  selectedInstallments,
  setSelectedInstallments,
  onPriceChange,
}: Props) {
  const supabase = useSupabaseClient()
  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [loading, setLoading] = useState(false)
  const basePrice = data.default_price || 0

  useEffect(() => {
    const fetchCohort = async () => {
      if (!selectedCohortId) {
        setCohort(null)
        return
      }

      try {
        setLoading(true)
        const { data: cohortData, error } = await supabase
          .from('cohorts')
          .select('id, maximum_payments')
          .eq('id', selectedCohortId)
          .single()

        if (error) throw error
        setCohort(cohortData as Cohort)
      } catch (error) {
        console.error('Error al obtener cohorte:', error)
        setCohort(null)
      } finally {
        setLoading(false)
      }
    }

    fetchCohort()
  }, [selectedCohortId, supabase])

  // Calcular precio de contado con descuento
  const fullPaymentCalculation = calculatePrice({
    basePrice,
    paymentMethod: 'full',
  })

  // Calcular precio por cuota
  const getInstallmentAmount = (numInstallments: number) => {
    const calculation = calculatePrice({
      basePrice,
      paymentMethod: 'installments',
      installments: numInstallments,
    })
    return calculation.installmentAmount || 0
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value

    if (value === 'full') {
      setPaymentMethod('full')
      setSelectedInstallments(1)
      // Pasar el precio base, ResumenSection calculará el total con descuentos
      onPriceChange(basePrice)
    } else if (value.startsWith('installments-')) {
      const numInstallments = parseInt(value.replace('installments-', ''), 10)
      setPaymentMethod('installments')
      setSelectedInstallments(numInstallments)
      // Pasar el precio base, ResumenSection calculará el total
      onPriceChange(basePrice)
    } else {
      setPaymentMethod(null)
      setSelectedInstallments(1)
      onPriceChange(0)
    }
  }

  // Calcular el valor actual del select
  const getSelectValue = () => {
    if (!paymentMethod) return ''
    if (paymentMethod === 'full') return 'full'
    return `installments-${selectedInstallments}`
  }

  const maxInstallments = cohort?.maximum_payments || 1

  if (!selectedCohortId) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Método de pago
        </label>
        <p className="text-gray-400 text-sm">
          Por favor, selecciona un horario primero para ver las opciones de pago disponibles.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Método de pago
        </label>
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-4 border-blueApp border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label htmlFor="payment-method" className="block text-sm font-medium text-white">
        Método de pago
      </label>
      <select
        id="payment-method"
        value={getSelectValue()}
        onChange={handleSelectChange}
        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blueApp focus:border-transparent transition-colors"
      >
        <option value="">Selecciona un método de pago</option>
        <option value="full">
          Pago de contado (10% descuento) - ${fullPaymentCalculation.total.toLocaleString()} COP
        </option>
        {maxInstallments >= 2 &&
          Array.from({ length: maxInstallments - 1 }, (_, i) => {
            const numInstallments = i + 2 // Empezar desde 2 cuotas
            const installmentAmount = getInstallmentAmount(numInstallments)

            return (
              <option key={numInstallments} value={`installments-${numInstallments}`}>
                {numInstallments} cuotas - ${installmentAmount.toLocaleString()} COP/mes
              </option>
            )
          })}
      </select>
      {paymentMethod === 'full' && (
        <p className="text-emerald-400 text-sm mt-1">
          Ahorras ${fullPaymentCalculation.savings?.toLocaleString()} COP
        </p>
      )}
    </div>
  )
}

