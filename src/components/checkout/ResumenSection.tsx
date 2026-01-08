'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import DiscountCoupon from './DiscountCoupon'
import QuickSignUp from './QuickSignUp'
import PaymentMethodDropdown from './PaymentMethodDropdown'
import { supabase } from '@/lib/supabase'
import { getPaymentProvider } from '@/lib/payments/payment-factory'
import { calculatePrice, calculateInstallments } from '@/lib/pricing/price-calculator'
import { incrementCouponUses } from '@/lib/discounts/coupon-service'
import { useUser } from '@/lib/supabase'
import { markMatriculaAsPaid } from '@/lib/matricula/matricula-service'
import type { Program } from '@/types/programs'

interface Props {
  data: Program
  slugProgram: string | null
  subtotal: number | null
  quantity: number
  paymentMethod: 'full' | 'installments' | null
  setPaymentMethod: (value: 'full' | 'installments' | null) => void
  selectedCohortId: number | null
  selectedInstallments: number
  setSelectedInstallments: (installments: number) => void
  setSubtotal: (value: number | null) => void
  matriculaAdded: boolean
  matriculaAmount?: number
  couponCode?: string | null
  className?: string
}

export default function ResumenSection({
  data,
  slugProgram,
  subtotal,
  quantity,
  paymentMethod,
  setPaymentMethod,
  selectedCohortId,
  selectedInstallments,
  setSelectedInstallments,
  setSubtotal,
  matriculaAdded,
  matriculaAmount = 0,
  className,
}: Props) {
  const router = useRouter()
  const { user, refreshUser } = useUser()
  const [discount, setDiscount] = useState<number>(0)
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null)
  const [showQuickSignUp, setShowQuickSignUp] = useState<boolean>(false)
  const [disableButton, setDisableButton] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handlePriceChange = (price: number) => {
    setSubtotal(price)
  }

  // Calcular precio final usando la calculadora
  const priceCalculation = subtotal && paymentMethod
    ? calculatePrice({
        basePrice: subtotal,
        paymentMethod,
        installments: paymentMethod === 'installments' ? selectedInstallments : undefined,
        couponDiscount: discount,
        quantity,
      })
    : null

  // Calcular total incluyendo matrícula si está agregada
  const totalAmount = (priceCalculation?.total || 0) + (matriculaAdded ? matriculaAmount : 0)

  const handleCouponApplied = (couponCode: string) => {
    setAppliedCouponCode(couponCode)
  }

  const handleGetLinkToPay = async () => {
    setDisableButton(true)
    setError(null)

    try {
      if (!user) {
        throw new Error('Debes iniciar sesión para continuar con la inscripción.')
      }

      if (!subtotal || subtotal <= 0) {
        throw new Error('El precio del programa no está disponible. Por favor, intenta nuevamente.')
      }

      if (!selectedCohortId) {
        throw new Error('Por favor, selecciona un horario para continuar.')
      }

      if (!paymentMethod) {
        throw new Error('Por favor, selecciona un método de pago para continuar.')
      }

      if (!data) {
        throw new Error('No se encontraron datos del programa. Por favor, intenta nuevamente.')
      }

      const requiredFields = ['name', 'subtitle', 'kind']
      const missingFields = requiredFields.filter((field) => !data[field as keyof Program])

      if (missingFields.length > 0) {
        throw new Error('La información del programa está incompleta. Por favor, intenta nuevamente.')
      }

      // 1. Crear enrollment o usar uno existente con pending_payment
      let enrollment
      const { data: newEnrollment, error: enrollmentError } = await (supabase as any)
        .from('enrollments')
        .insert({
          cohort_id: selectedCohortId,
          student_id: user.id,
          status: 'pending_payment',
          agreed_price: totalAmount,
        })
        .select()
        .single()

      if (enrollmentError) {
        console.error('Error al crear matrícula:', enrollmentError)
        
        // Manejar errores específicos con mensajes amigables
        if (enrollmentError.code === '23505') {
          // Violación de constraint único (duplicado)
          if (enrollmentError.message?.includes('enrollments_cohort_id_student_id_key')) {
            // Verificar si existe un enrollment con estado pending_payment
            const { data: existingEnrollment, error: fetchError } = await (supabase as any)
              .from('enrollments')
              .select('*')
              .eq('cohort_id', selectedCohortId)
              .eq('student_id', user.id)
              .single()

            if (!fetchError && existingEnrollment) {
              if (existingEnrollment.status === 'pending_payment') {
                // Usar el enrollment existente y actualizar el precio acordado
                enrollment = existingEnrollment
                
                // Actualizar el precio acordado por si cambió
                const { error: updateError } = await (supabase as any)
                  .from('enrollments')
                  .update({ agreed_price: totalAmount })
                  .eq('id', enrollment.id)

                if (updateError) {
                  console.warn('No se pudo actualizar el precio del enrollment:', updateError)
                }
              } else {
                // El enrollment existe pero no está en pending_payment
                throw new Error('Ya estás inscrito en este programa. Si necesitas ayuda, por favor contacta con nuestro equipo de soporte.')
              }
            } else {
              throw new Error('Ya existe una inscripción para este programa. Por favor, verifica tus inscripciones activas.')
            }
          } else {
            throw new Error('Ya existe una inscripción para este programa. Por favor, verifica tus inscripciones activas.')
          }
        } else if (enrollmentError.code === '23503') {
          // Violación de foreign key
          throw new Error('El programa o cohorte seleccionado no está disponible. Por favor, intenta con otro programa.')
        } else if (enrollmentError.code === '23514') {
          // Violación de check constraint
          throw new Error('Los datos proporcionados no son válidos. Por favor, verifica la información e intenta nuevamente.')
        } else {
          // Error genérico con mensaje más amigable
          throw new Error('No pudimos procesar tu inscripción en este momento. Por favor, intenta nuevamente o contacta con soporte si el problema persiste.')
        }
      } else {
        enrollment = newEnrollment
      }

      // Si no hay enrollment al final, lanzar error
      if (!enrollment) {
        throw new Error('No se pudo crear o recuperar la inscripción. Por favor, intenta nuevamente.')
      }

      // 2. Crear link de pago usando PaymentProvider
      const paymentProvider = getPaymentProvider()
      
      // Calcular el monto del primer pago: si es a cuotas, solo el primer pago; si es de contado, el total
      let paymentAmount = totalAmount
      if (paymentMethod === 'installments' && selectedInstallments > 1 && priceCalculation?.installmentAmount) {
        // Si hay matrícula agregada, dividirla también entre las cuotas
        const matriculaPerInstallment = matriculaAdded ? matriculaAmount / selectedInstallments : 0
        paymentAmount = priceCalculation.installmentAmount + matriculaPerInstallment
      }
      
      let paymentLink
      try {
        paymentLink = await paymentProvider.createPaymentLink({
          amount: Math.round(paymentAmount), // Redondear para evitar decimales
          name: `${data.name} - ${data.subtitle}`,
          description: `Inscripción para ${data.kind || 'programa'}`,
          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/confirmacion?id=${enrollment.id}`,
          metadata: {
            enrollment_id: enrollment.id,
            program_id: data.id,
            cohort_id: selectedCohortId,
            payment_method: paymentMethod,
            installments: selectedInstallments,
          },
        })
      } catch (paymentError) {
        console.error('Error al crear link de pago:', paymentError)
        // Si falla la creación del link de pago, eliminar el enrollment creado
        try {
          await (supabase as any)
            .from('enrollments')
            .delete()
            .eq('id', enrollment.id)
        } catch (deleteError) {
          console.error('Error al eliminar enrollment:', deleteError)
        }
        
        throw new Error('No pudimos generar el link de pago. Por favor, intenta nuevamente o contacta con soporte.')
      }

      // 3. Crear facturas si es pago a cuotas (se crearán como 'pending', se marcarán como 'paid' en la confirmación)
      if (paymentMethod === 'installments' && selectedInstallments > 1) {
        const installments = calculateInstallments(totalAmount, selectedInstallments)

        const invoices = installments.map((installment) => ({
          enrollment_id: enrollment.id,
          label: `Pago ${installment.number} de ${selectedInstallments} - ${data.name}`,
          amount: installment.amount,
          due_date: installment.dueDate,
          status: 'pending', // Se marcará como 'paid' en la página de confirmación cuando el pago sea exitoso
          meta: {
            payment_id: paymentLink.id,
            product_type: 'program',
            product_id: slugProgram || data.code?.toString() || 'unknown',
            user_id: user.id,
            payment_number: installment.number,
            total_payments: selectedInstallments,
            payment_method: paymentMethod,
            coupon_code: appliedCouponCode || null,
            matricula_added: matriculaAdded,
            matricula_amount: matriculaAmount || 0,
          },
        }))

        const { error: invoiceError } = await (supabase as any)
          .from('invoices')
          .insert(invoices)

        if (invoiceError) {
          console.error('Error al crear facturas:', invoiceError)
          // No lanzamos error aquí porque el enrollment ya se creó
        }
      } else {
        // Pago de contado: crear un invoice pendiente que se marcará como pagado en la confirmación
        const invoice = {
          enrollment_id: enrollment.id,
          label: `Pago completo - ${data.name}`,
          amount: totalAmount,
          due_date: new Date().toISOString().split('T')[0],
          status: 'pending', // Se marcará como 'paid' en la página de confirmación
          meta: {
            payment_id: paymentLink.id,
            product_type: 'program',
            product_id: slugProgram || data.code?.toString() || 'unknown',
            user_id: user.id,
            payment_number: 1,
            total_payments: 1,
            payment_method: paymentMethod,
            coupon_code: appliedCouponCode || null,
            matricula_added: matriculaAdded,
            matricula_amount: matriculaAmount || 0,
          },
        }

        const { error: invoiceError } = await (supabase as any)
          .from('invoices')
          .insert([invoice])

        if (invoiceError) {
          console.error('Error al crear invoice:', invoiceError)
        }
      }

      // 4. Redirigir al checkout del proveedor
      router.push(paymentLink.url)
    } catch (err) {
      console.error('Error en handleGetLinkToPay:', err)
      
      // Mensaje de error más amigable
      let errorMessage = 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.'
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      
      setError(errorMessage)
    } finally {
      setDisableButton(false)
    }
  }

  const isFormValid = subtotal && paymentMethod && selectedCohortId

  // Calcular subtotal antes de cupón (subtotal + matrícula - descuento por contado)
  const subtotalBeforeCoupon = (subtotal || 0) + 
    (matriculaAdded ? matriculaAmount : 0) - 
    (priceCalculation?.paymentMethodDiscount || 0)

  return (
    <div className={`bg-bgCard/80 backdrop-blur-md w-full flex flex-col gap-5 p-6 rounded-2xl shadow-2xl border border-blue-100/20 max-w-xl ${className || ''}`}>
      <h2 className="text-4xl font-bold font-mono text-blueApp">Resumen de pago</h2>
      <div className="border-b border-blueApp/20 h-1"></div>

      {/* Listado de conceptos */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-3">Conceptos</h3>
        
        {/* Subtotal del programa */}
        <div className="flex justify-between items-center">
          <p className="text-gray-300 text-sm">Subtotal del programa</p>
          <p className="text-white font-semibold">
            {subtotal ? `$${subtotal.toLocaleString()}` : 'Sin elegir'}
          </p>
        </div>

        {/* Matrícula anual */}
        {matriculaAdded && matriculaAmount > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-gray-300 text-sm">Matrícula anual</p>
            <p className="text-white font-semibold">
              ${matriculaAmount.toLocaleString()}
            </p>
          </div>
        )}

        {/* Descuento por pago de contado */}
        {priceCalculation && priceCalculation.paymentMethodDiscount > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-gray-300 text-sm">Descuento por pago de contado</p>
            <p className="text-emerald-400 font-semibold">
              -${priceCalculation.paymentMethodDiscount.toLocaleString()}
            </p>
          </div>
        )}

        {/* Subtotal antes de cupón */}
        {subtotal && (
          <div className="flex justify-between items-center pt-2 border-t border-zinc-700/50">
            <p className="text-gray-300 text-sm font-medium">Subtotal</p>
            <p className="text-white font-semibold">
              ${subtotalBeforeCoupon.toLocaleString()}
            </p>
          </div>
        )}

        {/* Descuento por cupón */}
        {discount > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-gray-300 text-sm">Descuento por cupón</p>
            <p className="text-emerald-400 font-semibold">
              -${discount.toLocaleString()}
            </p>
          </div>
        )}

        {/* Ahorro total */}
        {priceCalculation && priceCalculation.savings && priceCalculation.savings > 0 && (
          <div className="flex justify-between items-center pt-2 border-t border-zinc-700/50">
            <p className="text-emerald-400 text-sm font-semibold">Ahorro total</p>
            <p className="text-emerald-400 font-bold">
              ${priceCalculation.savings.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="border-b border-blueApp/20 h-1"></div>

      {/* Código de descuento */}
      {data.id && (
        <DiscountCoupon
          programId={data.id}
          subtotal={subtotal || 0}
          onDiscountChange={setDiscount}
          onCouponApplied={handleCouponApplied}
        />
      )}

      <div className="border-b border-blueApp/20 h-1"></div>

      {/* Método de pago */}
      <PaymentMethodDropdown
        data={data}
        selectedCohortId={selectedCohortId}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        selectedInstallments={selectedInstallments}
        setSelectedInstallments={setSelectedInstallments}
        onPriceChange={handlePriceChange}
      />

      <div className="border-b border-blueApp/20 h-1"></div>

      {/* Mensaje de error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-red-400 font-medium mb-1">Error al procesar la inscripción</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="shrink-0 text-red-400 hover:text-red-300 transition-colors"
              aria-label="Cerrar mensaje de error"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Botón de pago */}
      <button
        onClick={() => {
          if (!user) {
            setShowQuickSignUp(true)
            return
          }
          handleGetLinkToPay()
        }}
        disabled={!isFormValid || disableButton}
        className="bg-blueApp py-3 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xl font-semibold my-5 rounded-md shadow-lg hover:bg-blueApp/90 transition-colors"
      >
        {disableButton 
          ? 'Procesando...' 
          : (() => {
              // Calcular el monto a mostrar: primera cuota si es a cuotas, total si es de contado
              // Incluir matrícula en el cálculo si está agregada
              let amountToShow = 0
              if (priceCalculation) {
                if (paymentMethod === 'installments' && selectedInstallments > 1 && priceCalculation.installmentAmount) {
                  // Si hay matrícula agregada, dividirla también entre las cuotas
                  const matriculaPerInstallment = matriculaAdded ? matriculaAmount / selectedInstallments : 0
                  amountToShow = priceCalculation.installmentAmount + matriculaPerInstallment
                } else {
                  amountToShow = totalAmount
                }
              } else {
                amountToShow = totalAmount
              }
              return `Pagar ${amountToShow > 0 ? `$${Math.round(amountToShow).toLocaleString()}` : '$0'}`
            })()}
      </button>

      <p className="text-blueApp/70 text-xs">
        Tus datos personales se utilizarán para procesar tu pedido, respaldar tu experiencia en este sitio web y para otros fines descritos en nuestra política de privacidad.
      </p>

      {/* QuickSignUp Modal */}
      {showQuickSignUp && (
        <QuickSignUp
          onSuccess={() => {
            setShowQuickSignUp(false)
            // Refrescar para obtener el usuario actualizado
            router.refresh()
            // El usuario ahora está autenticado, proceder con el pago después de un breve delay
            setTimeout(() => {
              handleGetLinkToPay()
            }, 1000)
          }}
          onCancel={() => setShowQuickSignUp(false)}
        />
      )}
    </div>
  )
}
