'use client'

import { Check, Percent, CreditCard, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useSupabaseClient } from '@/lib/supabase'
import type { Program } from '@/types/programs'
import { calculatePrice } from '@/lib/pricing/price-calculator'

interface Props {
  data: Program
  paymentMethod: 'full' | 'installments' | null
  setPaymentMethod: (value: 'full' | 'installments' | null) => void
  selectedCohortId: number | null
  selectedInstallments: number
  setSelectedInstallments: (installments: number) => void
  onPriceChange: (price: number) => void
}

interface Cohort {
  id: number
  maximum_payments: number
}

export default function PaymentOptions({
  data,
  paymentMethod,
  setPaymentMethod,
  selectedCohortId,
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

  // Calcular precios cuando cambia el método de pago
  useEffect(() => {
    if (!paymentMethod || !basePrice) {
      onPriceChange(0)
      return
    }

    const calculation = calculatePrice({
      basePrice,
      paymentMethod,
      installments: paymentMethod === 'installments' ? selectedInstallments : undefined,
    })

    onPriceChange(calculation.total)
  }, [paymentMethod, selectedInstallments, basePrice, onPriceChange])

  const maxInstallments = cohort?.maximum_payments || 1

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

  const handleSelectFull = () => {
    setPaymentMethod('full')
    setSelectedInstallments(1)
  }

  const handleSelectInstallments = (numInstallments: number) => {
    setPaymentMethod('installments')
    setSelectedInstallments(numInstallments)
  }

  const handleClearSelection = () => {
    setPaymentMethod(null)
    setSelectedInstallments(1)
    onPriceChange(0)
  }

  if (!selectedCohortId) {
    return (
      <section className="flex flex-col gap-5">
        <h2 className="text-4xl font-bold mt-4">Opciones de pago</h2>
        <div className="h-1 border-b"></div>
        <p className="text-gray-400">
          Por favor, selecciona un horario primero para ver las opciones de pago disponibles.
        </p>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="flex flex-col gap-5">
        <h2 className="text-4xl font-bold mt-4">Opciones de pago</h2>
        <div className="h-1 border-b"></div>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blueApp border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold mt-4">Opciones de pago</h2>
          <div className="h-1 border-b mt-2"></div>
        </div>
        {paymentMethod && (
          <button
            onClick={handleClearSelection}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-colors"
            aria-label="Limpiar selección"
          >
            <X className="w-4 h-4" />
            <span>Cambiar</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        <p className="font-semibold text-lg">Financiación del curso</p>
        <p className="text-gray-400">
          Queremos que formes parte de esta experiencia. Elige entre pagar de contado con un 10% de descuento o dividirlo en cuotas cómodas.
        </p>
      </div>

      {paymentMethod && (
        <div className="bg-blueApp/10 border border-blueApp/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blueApp font-semibold">
            <Check className="w-5 h-5" />
            <span>
              {paymentMethod === 'full'
                ? 'Pago de contado seleccionado'
                : `Pago en ${selectedInstallments} cuotas seleccionado`}
            </span>
          </div>
        </div>
      )}

      {!paymentMethod && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Opción de Pago de Contado */}
          <div
            onClick={handleSelectFull}
            className="group relative p-6 bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border-2 border-zinc-700 hover:border-blueApp/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blueApp/20 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Percent className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                10% OFF
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Pago de contado</h3>
            <p className="text-gray-400 text-sm mb-4">
              Ahorra un 10% pagando todo de una vez
            </p>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Precio original:</span>
                <span className="text-gray-500 line-through">
                  ${basePrice.toLocaleString()} COP
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Descuento:</span>
                <span className="text-emerald-400 font-semibold">
                  -${fullPaymentCalculation.paymentMethodDiscount.toLocaleString()} COP
                </span>
              </div>
              <div className="border-t border-zinc-700 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total a pagar:</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    ${fullPaymentCalculation.total.toLocaleString()} COP
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-700">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <Check className="w-4 h-4" />
                <span>Ahorras ${fullPaymentCalculation.savings?.toLocaleString()} COP</span>
              </div>
            </div>
          </div>

          {/* Opción de Cuotas */}
          <div className="p-6 bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border-2 border-zinc-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blueApp/20 rounded-lg">
                <CreditCard className="w-6 h-6 text-blueApp" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Pago en cuotas</h3>
            <p className="text-gray-400 text-sm mb-4">
              Divide tu pago en hasta {maxInstallments} cuotas mensuales
            </p>

            <div className="space-y-3">
              {maxInstallments >= 2 ? (
                Array.from({ length: maxInstallments - 1 }, (_, i) => {
                  const numInstallments = i + 2 // Empezar desde 2 cuotas
                  const installmentAmount = getInstallmentAmount(numInstallments)
                  const totalAmount = installmentAmount * numInstallments

                  return (
                    <button
                      key={numInstallments}
                      onClick={() => handleSelectInstallments(numInstallments)}
                      className="w-full p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-blueApp/50 rounded-lg transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold">
                              {numInstallments} cuotas
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-white">
                            ${installmentAmount.toLocaleString()} COP
                          </div>
                          <div className="text-xs text-gray-400 mt-1">/ mes</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Total</div>
                          <div className="text-sm text-gray-400">
                            ${totalAmount.toLocaleString()} COP
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="p-4 bg-zinc-800/30 rounded-lg text-center text-gray-400 text-sm">
                  No hay opciones de cuotas disponibles para esta cohorte
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

