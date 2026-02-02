'use client'

import { Suspense } from 'react'
import ConfigurationSection from '@/components/checkout/ConfigurationSection'
import ResumenSection from '@/components/checkout/ResumenSection'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@/lib/supabase'
import type { Program } from '@/types/programs'
import { Loader2 } from 'lucide-react'

export default function ViewCheckoutPage() {
  return (
    <main className="relative">
      <Suspense fallback={<CheckoutLoader />}>
        <ViewCheckoutContent />
      </Suspense>
    </main>
  )
}

function CheckoutLoader() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-secondary" />
        <p className="text-gray-400">Cargando información del programa...</p>
      </div>
    </div>
  )
}

function ViewCheckoutContent() {
  const supabase = useSupabaseClient()
  const searchParams = useSearchParams()
  const { user } = useUser()
  
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Program | null>(null)
  
  // Estado del checkout
  const [subtotal, setSubtotal] = useState<number | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'installments' | null>(null)
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null)
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1)
  const [matriculaAmount, setMatriculaAmount] = useState<number>(0)
  const [matriculaShouldShow, setMatriculaShouldShow] = useState<boolean>(false)

  const cohortIdParam = searchParams.get('cohortId')
  const slugProgram = searchParams.get('slug') // Mantener compatibilidad con el método anterior

  // Cargar datos desde la cohorte o desde el slug (fallback)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Prioridad: usar cohortId si está disponible
        if (cohortIdParam) {
          const cohortId = parseInt(cohortIdParam, 10)
          
          if (isNaN(cohortId)) {
            throw new Error('ID de cohorte inválido')
          }

          // Obtener la cohorte con su programa
          const { data: cohortData, error: cohortError } = await supabase
            .from('cohorts')
            .select(`
              *,
              programs (*)
            `)
            .eq('id', cohortId)
            .single()

          if (cohortError) {
            throw cohortError
          }

          if (!cohortData || !cohortData.programs) {
            throw new Error('No se encontró la cohorte o el programa asociado')
          }

          // Obtener el programa (puede ser un array o un objeto)
          const programData = Array.isArray(cohortData.programs) 
            ? cohortData.programs[0] 
            : cohortData.programs

          const typedProgramData = programData as Program
          setData(typedProgramData)
          setSelectedCohortId(cohortId)

          // Establecer precio inicial
          if (typedProgramData.default_price) {
            setSubtotal(typedProgramData.default_price)
          }
        } else if (slugProgram) {
          // Fallback: usar slug si no hay cohortId
          const { data: programData, error: fetchError } = await supabase
            .from('programs')
            .select('*')
            .eq('code', slugProgram)
            .single()

          if (fetchError) {
            throw fetchError
          }

          if (!programData) {
            throw new Error('No se encontró el programa')
          }

          const typedProgramData = programData as Program
          setData(typedProgramData)

          // Establecer precio inicial
          if (typedProgramData.default_price) {
            setSubtotal(typedProgramData.default_price)
          }
        } else {
          throw new Error('No se proporcionó un ID de cohorte ni un slug de programa')
        }
      } catch (err) {
        console.error('Error al cargar los datos:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Error al cargar la información'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [cohortIdParam, slugProgram, supabase])

  if (loading) {
    return <CheckoutLoader />
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-screen px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-400">{error || 'No se pudo cargar la información del programa'}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="mt-26 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-8">
      <ConfigurationSection
        data={data}
        slugProgram={cohortIdParam || slugProgram}
        subtotal={subtotal}
        quantity={quantity}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        setSubtotal={setSubtotal}
        setQuantity={setQuantity}
        selectedCohortId={selectedCohortId}
        setSelectedCohortId={setSelectedCohortId}
        selectedInstallments={selectedInstallments}
        setSelectedInstallments={setSelectedInstallments}
        onMatriculaAmountChange={(amount) => {
          setMatriculaAmount(amount)
        }}
        onMatriculaStatusChange={(shouldShow) => {
          setMatriculaShouldShow(shouldShow)
        }}
        className="lg:col-span-2"
      />
      
      <div className="lg:sticky lg:top-24 lg:h-fit lg:col-span-1">
        <ResumenSection
          data={data}
          slugProgram={cohortIdParam || slugProgram}
          subtotal={subtotal}
          quantity={quantity}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          selectedCohortId={selectedCohortId}
          selectedInstallments={selectedInstallments}
          setSelectedInstallments={setSelectedInstallments}
          setSubtotal={setSubtotal}
          matriculaAdded={matriculaShouldShow}
          matriculaAmount={matriculaAmount}
        />
      </div>
    </main>
  )
}
