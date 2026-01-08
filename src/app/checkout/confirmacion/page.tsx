'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { getPaymentProvider } from '@/lib/payments/payment-factory'

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
        <Loader2 className="w-12 h-12 animate-spin text-blueApp" />
        <p className="text-gray-400">Verificando estado del pago...</p>
      </div>
    </div>
  )
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [statusTransaction, setStatusTransaction] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const transactionId = searchParams.get('id')

  useEffect(() => {
    const getStatusTransaction = async () => {
      if (!transactionId) {
        setError('No se proporcionó un ID de transacción')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const paymentProvider = getPaymentProvider()
        const transactionStatus = await paymentProvider.getTransactionStatus(transactionId)

        setStatusTransaction(transactionStatus.status)
      } catch (err) {
        console.error('Error al obtener estado de transacción:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Error al verificar el estado del pago'
        )
      } finally {
        setLoading(false)
      }
    }

    getStatusTransaction()
  }, [transactionId])

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
              className="bg-blueApp hover:bg-blue-600 transition-all duration-300 text-white py-3 px-6 rounded-md font-semibold"
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
                  Tu orden con ID <span className="font-mono text-blueApp">{transactionId}</span> ha sido confirmada exitosamente.
                </p>
                <p className="text-sm text-gray-500">
                  Recibirás un correo electrónico con los detalles de tu compra y las instrucciones para acceder al programa.
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
                  Tu orden con ID <span className="font-mono text-blueApp">{transactionId}</span> está siendo procesada.
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
                  Tu orden con ID <span className="font-mono text-blueApp">{transactionId}</span> no pudo ser procesada.
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
                className="bg-blueApp hover:bg-blue-600 transition-all duration-300 text-white py-3 px-6 rounded-md font-semibold"
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
