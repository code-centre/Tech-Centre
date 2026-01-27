'use client'

import { Minus, Plus } from 'lucide-react'
import React, { useEffect } from 'react'
import ProductSummary from './ProductSummary'
import { supabase } from '@/lib/supabase'
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
  className,
}: Props) {
  // Cargar automáticamente la primera cohorte disponible
  useEffect(() => {
    const fetchFirstCohort = async () => {
      if (!data?.id || selectedCohortId) return

      try {
        const { data: cohortData, error } = await (supabase as any)
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
  }, [data?.id, selectedCohortId, setSelectedCohortId])

  const styleButton =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zuccini disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 hover:border-zuccini'

  const styleInput =
    'flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zuccini w-22 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

  return (
    <div className={`w-full text-white flex flex-col gap-8 pb-14 px-6 ${className || ''}`}>
      {/* Resumen del producto */}
      <ProductSummary 
        data={data} 
        selectedCohortId={selectedCohortId}
        onMatriculaAmountChange={onMatriculaAmountChange}
        onMatriculaStatusChange={onMatriculaStatusChange}
      />

      {/* Cantidad (opcional, solo si showQuantity está activo) */}
      {quantity > 1 && (
        <div className="space-y-4 pt-4 border-t border-zinc-700/50">
          <div>
            <h3 className="text-xl font-bold mb-2">Cantidad</h3>
            <div className="h-0.5 bg-zinc-700/50"></div>
          </div>

          <div className="flex items-center gap-4">
            <button
              disabled={quantity <= 1}
              className={`${styleButton} disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Reducir cantidad"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10)
                if (!isNaN(value) && value > 0) {
                  setQuantity(value)
                } else if (e.target.value === '') {
                  setQuantity(1)
                }
              }}
              className={`${styleInput} w-24`}
              aria-label="Cantidad"
            />
            <button
              className={styleButton}
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="text-gray-400 text-sm">unidad{quantity !== 1 ? 'es' : ''}</span>
          </div>
        </div>
      )}
    </div>
  )
}
