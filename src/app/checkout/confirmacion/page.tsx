'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useSupabaseClient } from '@/lib/supabase'
import { ProfessorWelcome } from '@/components/checkout/ProfessorWelcome'

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
  const [statusTransaction, setStatusTransaction] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [program, setProgram] = useState<{ name?: string } | null>(null)
  const [cohortId, setCohortId] = useState<number | null>(null)
  const [isInvoicePayment, setIsInvoicePayment] = useState(false)
  const [invoiceLabel, setInvoiceLabel] = useState<string | null>(null)
  const [invoicePaid, setInvoicePaid] = useState(false)
  const enrollmentId = searchParams.get('id')
  const invoiceIdParam = searchParams.get('invoiceId')

  const resolveTransactionStatus = useCallback(
    async (paymentId: string | null | undefined) => {
      if (!paymentId) {
        return { status: 'PENDING' }
      }

      try {
        const res = await fetch(
          `/api/payments/transaction-status?paymentId=${encodeURIComponent(paymentId)}`
        )
        const data = await res.json()
        if (res.ok && data.status) {
          return { status: data.status as string }
        }
      } catch (paymentErr) {
        console.warn('No se pudo verificar estado del pago:', paymentErr)
      }

      return { status: 'PENDING' }
    },
    []
  )

  const processInvoicePaymentConfirmation = useCallback(async () => {
    const invoiceId = invoiceIdParam ? parseInt(invoiceIdParam, 10) : NaN
    if (isNaN(invoiceId)) {
      setError('ID de factura inválido')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setIsInvoicePayment(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Debes iniciar sesión para verificar el pago')
        setLoading(false)
        return
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, enrollment_id, label, status, meta, paid_at')
        .eq('id', invoiceId)
        .single()

      if (invoiceError || !invoice) {
        setError('Factura no encontrada')
        setLoading(false)
        return
      }

      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('id', invoice.enrollment_id)
        .single()

      if (enrollmentError || !enrollment || enrollment.student_id !== user.id) {
        setError('No tienes permiso para ver esta factura')
        setLoading(false)
        return
      }

      setInvoiceLabel(invoice.label)
      setInvoicePaid(invoice.status === 'paid')

      const paymentId =
        invoice.meta?.payment_id ||
        searchParams.get('reference') ||
        searchParams.get('id')

      const transactionStatus = await resolveTransactionStatus(
        typeof paymentId === 'string' ? paymentId : null
      )

      if (invoice.status === 'paid') {
        setStatusTransaction('APPROVED')
      } else {
        setStatusTransaction(transactionStatus.status)
      }
    } catch (err) {
      console.error('Error al procesar confirmación de pago de factura:', err)
      setError(err instanceof Error ? err.message : 'Error al verificar el pago')
    } finally {
      setLoading(false)
    }
  }, [invoiceIdParam, supabase, searchParams, resolveTransactionStatus])

  useEffect(() => {
    const processPaymentConfirmation = async () => {
      if (invoiceIdParam) {
        await processInvoicePaymentConfirmation()
        return
      }

      if (!enrollmentId) {
        setError('No se proporcionó un ID de inscripción')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

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

        const cohort = Array.isArray(enrollment.cohorts)
          ? enrollment.cohorts[0]
          : enrollment.cohorts
        const programData = cohort?.programs
          ? Array.isArray(cohort.programs)
            ? cohort.programs[0]
            : cohort.programs
          : null

        if (programData) {
          setProgram(programData)
        }
        if (cohort?.id) {
          setCohortId(cohort.id)
        }

        const { data: invoices } = await supabase
          .from('invoices')
          .select('meta, status')
          .eq('enrollment_id', enrollmentId)
          .order('id', { ascending: true })

        const firstInvoice = invoices?.[0]
        const paymentId =
          firstInvoice?.meta?.payment_id || searchParams.get('id') || enrollmentId

        if (enrollment.status === 'enrolled' || firstInvoice?.status === 'paid') {
          setStatusTransaction('APPROVED')
        } else {
          const transactionStatus = await resolveTransactionStatus(
            typeof paymentId === 'string' ? paymentId : null
          )
          setStatusTransaction(transactionStatus.status)
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
  }, [
    enrollmentId,
    invoiceIdParam,
    supabase,
    processInvoicePaymentConfirmation,
    resolveTransactionStatus,
    searchParams,
  ])

  const isApproved =
    statusTransaction === 'APPROVED' || invoicePaid
  const isPending = statusTransaction === 'PENDING' && !invoicePaid
  const isDeclined = statusTransaction === 'DECLINED' || statusTransaction === 'ERROR'

  return (
    <section>
      <div
        className="fixed inset-0 -z-10 background-image-confirmation"
        aria-hidden="true"
      />
      <div className="fixed inset-0 bg-black/40 -z-10" />

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
                  {isInvoicePayment
                    ? `Tu pago de la factura "${invoiceLabel || ''}" ha sido confirmado exitosamente.`
                    : `Tu inscripción al programa ${program?.name || ''} ha sido confirmada exitosamente.`}
                </p>

                {!isInvoicePayment && cohortId && (
                  <ProfessorWelcome cohortId={cohortId} programName={program?.name} />
                )}
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
                  {isInvoicePayment
                    ? 'Tu pago está siendo procesado.'
                    : `Tu inscripción al programa ${program?.name || ''} está siendo procesada.`}
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
                  {isInvoicePayment
                    ? 'El pago de la factura no pudo ser procesado.'
                    : `Tu inscripción${program?.name ? ` al programa ${program.name}` : ''} no pudo ser procesada.`}
                </p>
                <p className="text-sm text-gray-500">
                  Por favor, verifica los datos de tu tarjeta o intenta con otro método de pago.
                </p>
              </>
            )}

            <div className="flex flex-col gap-4 pt-4">
              {isApproved && (
                <>
                  {isInvoicePayment ? (
                    <Link href="/perfil/facturas" className="btn-primary group">
                      Ver mis facturas
                    </Link>
                  ) : (
                    <Link href="/perfil/cursos" className="btn-primary group">
                      Ver mis cursos
                    </Link>
                  )}
                </>
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

      <style jsx>{`
        .background-image-confirmation {
          background-image: url('/background-texture.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          animation: background-pan-confirmation 30s ease-in-out infinite;
          filter: blur(12px) brightness(0.5) saturate(1);
          transform: scale(1.1);
        }

        @keyframes background-pan-confirmation {
          0%,
          100% {
            background-position: center center;
            transform: scale(1.1);
          }
          50% {
            background-position: 60% 40%;
            transform: scale(1.15);
          }
        }
      `}</style>
    </section>
  )
}
