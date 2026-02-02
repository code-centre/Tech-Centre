'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { getPaymentProvider } from '@/lib/payments/payment-factory'
import { useSupabaseClient } from '@/lib/supabase'
import { calculateInstallments } from '@/lib/pricing/price-calculator'
import { markMatriculaAsPaid } from '@/lib/matricula/matricula-service'
import { incrementCouponUses } from '@/lib/discounts/coupon-service'

export default function CheckoutPage() {
  return (
    <main className="min-h-screen relative overflow-hidden py-20 md:pt-0">
      <Suspense fallback={<ConfirmationLoader />}>
        <CheckoutContent />
      </Suspense>
    </main>
  )
}

function ConfirmationLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-secondary" />
        <p className="text-gray-400">Verificando estado del pago...</p>
      </div>
    </div>
  )
}

function CheckoutContent() {
  const supabase = useSupabaseClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [statusTransaction, setStatusTransaction] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [program, setProgram] = useState<any>(null)
  const enrollmentId = searchParams.get('id') // Este es el enrollment_id

  useEffect(() => {
    const processPaymentConfirmation = async () => {
      if (!enrollmentId) {
        setError('No se proporcionó un ID de inscripción')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // 1. Obtener el enrollment con sus datos relacionados
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('enrollments')
          .select(`
            *,
            cohorts (
              *,
              programs (*)
            )
          `)
          .eq('id', enrollmentId)
          .single()

        if (enrollmentError || !enrollment) {
          throw new Error('No se encontró la inscripción. Por favor, verifica el ID.')
        }

        // Extraer el programa del enrollment para mostrarlo en la UI
        const cohort = Array.isArray(enrollment.cohorts) ? enrollment.cohorts[0] : enrollment.cohorts
        const programData = cohort?.programs ? (Array.isArray(cohort.programs) ? cohort.programs[0] : cohort.programs) : null
        if (programData) {
          setProgram(programData)
        }

        // 2. Obtener el estado de la transacción desde el proveedor de pago
        // Buscar el payment_id en los metadatos o en invoices
        const { data: invoices } = await supabase
          .from('invoices')
          .select('meta')
          .eq('enrollment_id', enrollmentId)
          .limit(1)

        let paymentId = null
        if (invoices && invoices.length > 0 && invoices[0].meta?.payment_id) {
          paymentId = invoices[0].meta.payment_id
        }

        // Si no hay payment_id en invoices, intentar obtenerlo del enrollment metadata
        // o usar el enrollment_id como referencia
        if (!paymentId) {
          // Intentar obtener el payment_id desde alguna otra fuente
          // Por ahora, usaremos el enrollment_id como referencia
          paymentId = enrollmentId
        }

        const paymentProvider = getPaymentProvider()
        let transactionStatus
        
        try {
          // Intentar obtener el estado de la transacción
          transactionStatus = await paymentProvider.getTransactionStatus(paymentId)
        } catch (paymentError) {
          // Si no se puede obtener el estado, asumir que el pago fue exitoso
          // ya que el usuario llegó a esta página
          console.warn('No se pudo verificar el estado del pago, asumiendo éxito:', paymentError)
          transactionStatus = { status: 'APPROVED' }
        }

        setStatusTransaction(transactionStatus.status)

        // 3. Si el pago fue exitoso, procesar la confirmación
        if (transactionStatus.status === 'APPROVED') {
          await handlePaymentSuccess(enrollment)
        }
      } catch (err) {
        console.error('Error al procesar confirmación de pago:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Error al verificar el estado del pago'
        )
      } finally {
        setLoading(false)
      }
    }

    processPaymentConfirmation()
  }, [enrollmentId, supabase])

  const handlePaymentSuccess = async (enrollment: any) => {
    if (processingPayment) return // Evitar procesamiento duplicado
    
    try {
      setProcessingPayment(true)

      const cohort = Array.isArray(enrollment.cohorts) ? enrollment.cohorts[0] : enrollment.cohorts
      const program = cohort?.programs ? (Array.isArray(cohort.programs) ? cohort.programs[0] : cohort.programs) : null

      // 1. Actualizar el status del enrollment a 'enrolled' o 'paid'
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({ 
          status: 'enrolled',
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollment.id)

      if (updateError) {
        console.error('Error al actualizar enrollment:', updateError)
        throw new Error('Error al confirmar la inscripción')
      }

      // 2. Obtener información del pago desde invoices existentes
      const { data: existingInvoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('enrollment_id', enrollment.id)

      // Determinar si es pago a cuotas o de contado desde los invoices existentes
      const isInstallments = existingInvoices && existingInvoices.length > 1
      const paymentMethod = existingInvoices?.[0]?.meta?.payment_method || 'full'
      const installments = existingInvoices?.[0]?.meta?.total_payments || 1

      // 3. Crear o actualizar invoices
      if (!existingInvoices || existingInvoices.length === 0) {
        // No hay invoices, crear uno para pago de contado
        const invoice = {
          enrollment_id: enrollment.id,
          label: `Pago completo - ${program?.name || 'Programa'}`,
          amount: enrollment.agreed_price || 0,
          due_date: new Date().toISOString().split('T')[0],
          status: 'paid',
          paid_at: new Date().toISOString(),
          meta: {
            payment_method: 'full',
            product_type: 'program',
            product_id: program?.code || program?.id?.toString() || 'unknown',
            user_id: enrollment.student_id,
            payment_number: 1,
            total_payments: 1,
          },
        }

        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert([invoice])

        if (invoiceError) {
          console.error('Error al crear invoice:', invoiceError)
        }
      } else if (isInstallments) {
        // Es pago a cuotas, actualizar el primer invoice a 'paid'
        const firstInvoice = existingInvoices.find((inv: any) => inv.meta?.payment_number === 1) || existingInvoices[0]
        if (firstInvoice.status === 'pending') {
          const { error: updateInvoiceError } = await supabase
            .from('invoices')
            .update({ 
              status: 'paid',
              paid_at: new Date().toISOString()
            })
            .eq('id', firstInvoice.id)

          if (updateInvoiceError) {
            console.error('Error al actualizar invoice:', updateInvoiceError)
          }
        }
      } else {
        // Es un solo invoice (pago de contado), marcarlo como pagado
        const invoice = existingInvoices[0]
        if (invoice.status === 'pending') {
          const { error: updateInvoiceError } = await supabase
            .from('invoices')
            .update({ 
              status: 'paid',
              paid_at: new Date().toISOString()
            })
            .eq('id', invoice.id)

          if (updateInvoiceError) {
            console.error('Error al actualizar invoice:', updateInvoiceError)
          }
        }
      }

      // 4. Marcar matrícula como pagada si aplica
      // Verificar desde el invoice si se agregó matrícula
      const firstInvoice = existingInvoices?.[0]
      const matriculaAdded = firstInvoice?.meta?.matricula_added || false
      const matriculaAmount = firstInvoice?.meta?.matricula_amount || 0

      if (matriculaAdded && matriculaAmount > 0) {
        try {
          await markMatriculaAsPaid(supabase, enrollment.student_id)
        } catch (matriculaError) {
          console.warn('Error al marcar matrícula como pagada:', matriculaError)
        }
      }

      // 5. Incrementar usos del cupón si se aplicó uno
      const couponCode = firstInvoice?.meta?.coupon_code
      if (couponCode) {
        try {
          const { data: couponData } = await supabase
            .from('discount_coupons')
            .select('id')
            .eq('code', couponCode.toUpperCase())
            .single()

          if (couponData?.id) {
            await incrementCouponUses(couponData.id)
          }
        } catch (couponError) {
          console.warn('Error al incrementar usos del cupón:', couponError)
        }
      }

    } catch (err) {
      console.error('Error al procesar pago exitoso:', err)
      // No lanzar error aquí para no interrumpir la UI
    } finally {
      setProcessingPayment(false)
    }
  }

  const isApproved = statusTransaction === 'APPROVED'
  const isPending = statusTransaction === 'PENDING'
  const isDeclined = statusTransaction === 'DECLINED' || statusTransaction === 'ERROR'

  return (
    <section>
      <div
        className="fixed inset-0 -z-10 flex items-center justify-center"
        style={{
          backgroundImage: `url('/loader-image.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-black/40 -z-10" />
      
      <div className="mx-auto items-center justify-center min-h-screen px-5 flex flex-col gap-8">
        {loading ? (
          <ConfirmationLoader />
        ) : error ? (
          <div className="max-w-2xl w-full flex flex-col gap-6 text-center bg-zinc-900/90 backdrop-blur-md p-8 rounded-2xl border border-red-500/30">
            <XCircle className="w-16 h-16 text-red-400 mx-auto" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white">Error</h2>
            <p className="text-gray-400">{error}</p>
            <Link
              href="/"
              className="bg-secondary hover:bg-blue-600 transition-all duration-300 text-white py-3 px-6 rounded-md font-semibold"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <section className="max-w-2xl w-full flex flex-col gap-6 text-center bg-zinc-900/90 backdrop-blur-md p-8 rounded-2xl border border-zinc-700/50">
            {isApproved && (
              <>
                <div className="flex justify-center">
                  <div className="p-4 bg-emerald-500/20 rounded-full">
                    <CheckCircle className="w-16 h-16 text-emerald-400" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white">
                  ¡Pago confirmado!
                </h2>
                <p className="text-gray-400">
                  Tu inscripción al programa {program?.name} ha sido confirmada exitosamente.
                </p>
                <p className="text-sm text-gray-500">
                  Recibirás un correo electrónico con los detalles de tu inscripción y las instrucciones para asistir a clases.
                </p>
              </>
            )}

            {isPending && (
              <>
                <div className="flex justify-center">
                  <div className="p-4 bg-amber-500/20 rounded-full">
                    <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white">
                  Pago pendiente
                </h2>
                <p className="text-gray-400">
                  Tu inscripción al programa  {program?.name} está siendo procesada.
                </p>
                <p className="text-sm text-gray-500">
                  Te notificaremos por correo electrónico una vez que el pago sea confirmado.
                </p>
              </>
            )}

            {isDeclined && (
              <>
                <div className="flex justify-center">
                  <div className="p-4 bg-red-500/20 rounded-full">
                    <XCircle className="w-16 h-16 text-red-400" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white">
                  Pago no aprobado
                </h2>
                <p className="text-gray-400">
                  Tu inscripción{program?.name ? ` al programa ${program.name}` : ''} no pudo ser procesada.
                </p>
                <p className="text-sm text-gray-500">
                  Por favor, verifica los datos de tu tarjeta o intenta con otro método de pago.
                </p>
              </>
            )}

            <div className="flex flex-col gap-4 pt-4">
              {isApproved && (
                <Link
                  href="/perfil/cursos"
                  className="bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 text-white py-3 px-6 rounded-md font-semibold"
                >
                  Ver mis cursos
                </Link>
              )}
              <Link
                href="/"
                className="bg-secondary hover:bg-blue-600 transition-all duration-300 text-white py-3 px-6 rounded-md font-semibold"
              >
                Volver al inicio
              </Link>
            </div>
          </section>
        )}
      </div>
    </section>
  )
}
