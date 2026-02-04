'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Lock, Mail, Check, ChevronDown } from 'lucide-react'
import DiscountCoupon from './DiscountCoupon'
import QuickSignUp from './QuickSignUp'
import PaymentMethodDropdown from './PaymentMethodDropdown'
import { useSupabaseClient, useUser } from '@/lib/supabase'
import { getPaymentProvider } from '@/lib/payments/payment-factory'
import { calculatePrice, calculateInstallments } from '@/lib/pricing/price-calculator'
import { incrementCouponUses } from '@/lib/discounts/coupon-service'
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

// Subcomponente: Bloque Total
function PaymentTotal({
  programName,
  totalAmount,
  subtotal,
  priceCalculation,
  paymentMethod,
  selectedInstallments,
  matriculaAdded,
  matriculaAmount,
}: {
  programName: string
  totalAmount: number
  subtotal: number | null
  priceCalculation: ReturnType<typeof calculatePrice> | null
  paymentMethod: 'full' | 'installments' | null
  selectedInstallments: number
  matriculaAdded: boolean
  matriculaAmount: number
}) {
  // IMPORTANTE: priceCalculation.total ya incluye descuentos del programa
  // La matrícula NO tiene descuentos, se suma directamente
  const programAmount = priceCalculation?.total || subtotal || 0
  // Si hay matrícula pero no hay método de pago, incluirla en el total mostrado
  const displayAmount = paymentMethod 
    ? totalAmount 
    : (subtotal || 0) + (matriculaAdded && matriculaAmount > 0 ? matriculaAmount : 0)
  
  // Mostrar desglose si hay método de pago O si hay matrícula que se debe cobrar
  const shouldShowBreakdown = paymentMethod && priceCalculation || (matriculaAdded && matriculaAmount > 0)
  
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-text-primary">Resumen de pago</h2>
      
      <div className="space-y-2">
        <p className="text-sm text-text-muted">{programName}</p>
        
        {/* Desglose cuando hay método de pago o cuando hay matrícula */}
        {shouldShowBreakdown && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">
                Programa{priceCalculation?.paymentMethodDiscount && priceCalculation.paymentMethodDiscount > 0 ? ' (con descuento)' : ''}
              </span>
              <span className="text-text-primary font-medium">
                ${Math.round(programAmount).toLocaleString()} COP
              </span>
            </div>
            {matriculaAdded && matriculaAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Matrícula anual Tech Centre</span>
                <span className="text-text-primary font-medium">
                  ${Math.round(matriculaAmount).toLocaleString()} COP
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Total */}
        <div className="pt-2">
          <p className="text-4xl font-bold text-text-primary">
            ${Math.round(displayAmount).toLocaleString()} COP
          </p>
          <p className="text-xs text-text-muted mt-1">
            {paymentMethod 
              ? (matriculaAdded && matriculaAmount > 0 
                  ? (paymentMethod === 'installments' && selectedInstallments > 1
                      ? 'Total a pagar hoy (primera cuota + matrícula)'
                      : 'Total a pagar (programa + matrícula)')
                  : 'Precio final · Sin costos ocultos')
              : (matriculaAdded && matriculaAmount > 0
                  ? 'Precio del programa + matrícula'
                  : 'Precio del programa')}
          </p>
          {paymentMethod === 'installments' && selectedInstallments > 1 && priceCalculation?.installmentAmount && (
            <p className="text-xs text-emerald-400 mt-1">
              {selectedInstallments} cuotas sin interés
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Subcomponente: Bloque Acción (CTA)
function PaymentAction({
  paymentMethod,
  setPaymentMethod,
  selectedCohortId,
  selectedInstallments,
  setSelectedInstallments,
  data,
  onPriceChange,
  isFormValid,
  disableButton,
  totalAmount,
  priceCalculation,
  matriculaAdded,
  matriculaAmount,
  onPayClick,
}: {
  paymentMethod: 'full' | 'installments' | null
  setPaymentMethod: (value: 'full' | 'installments' | null) => void
  selectedCohortId: number | null
  selectedInstallments: number
  setSelectedInstallments: (installments: number) => void
  data: Program
  onPriceChange: (price: number) => void
  isFormValid: boolean
  disableButton: boolean
  totalAmount: number
  priceCalculation: ReturnType<typeof calculatePrice> | null
  matriculaAdded: boolean
  matriculaAmount: number
  onPayClick: () => void
}) {
  const getButtonText = () => {
    if (disableButton) return 'Procesando...'
    if (!paymentMethod) return 'Selecciona un método de pago'
    
    let amountToShow = 0
    if (priceCalculation) {
      if (paymentMethod === 'installments' && selectedInstallments > 1 && priceCalculation.installmentAmount) {
        // IMPORTANTE: La matrícula NO se difiere, siempre se paga completa en el primer pago
        const matriculaInFirstPayment = matriculaAdded ? matriculaAmount : 0
        amountToShow = priceCalculation.installmentAmount + matriculaInFirstPayment
        return matriculaAdded && matriculaAmount > 0
          ? `Pagar primera cuota $${Math.round(amountToShow).toLocaleString()} y reservar mi cupo`
          : `Pagar primera cuota $${Math.round(amountToShow).toLocaleString()}`
      } else {
        amountToShow = totalAmount
        return matriculaAdded && matriculaAmount > 0
          ? `Pagar $${Math.round(amountToShow).toLocaleString()} y reservar mi cupo`
          : `Pagar $${Math.round(amountToShow).toLocaleString()}`
      }
    }
    return 'Selecciona un método de pago'
  }

  return (
    <div className="space-y-4">
      <PaymentMethodDropdown
        data={data}
        selectedCohortId={selectedCohortId}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        selectedInstallments={selectedInstallments}
        setSelectedInstallments={setSelectedInstallments}
        onPriceChange={onPriceChange}
      />
      
      <button
        onClick={onPayClick}
        disabled={!isFormValid || disableButton}
        className="btn-primary w-full py-4 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none disabled:opacity-60"
      >
        {getButtonText()}
      </button>
    </div>
  )
}

// Subcomponente: Bloque Confianza
function PaymentTrust() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Iconos de confianza */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Lock className="w-4 h-4 text-secondary shrink-0" />
          <span>Pago seguro procesado por Wompi</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Mail className="w-4 h-4 text-secondary shrink-0" />
          <span>Recibirás confirmación por correo</span>
        </div>
      </div>

      {/* Acordeón: ¿Qué sigue después de pagar? */}
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full cursor-pointer list-none flex items-center justify-between text-sm font-medium text-text-primary hover:text-secondary transition-colors"
        >
          <span>¿Qué sigue después de pagar?</span>
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <ul className="mt-3 space-y-2 text-sm text-text-muted pl-6">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
              <span>Confirmación inmediata por correo</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
              <span>Acceso a la comunidad Tech Centre</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
              <span>Información de inicio y materiales previos</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  )
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
  const supabase = useSupabaseClient()
  const { user } = useUser()
  const [discount, setDiscount] = useState<number>(0)
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null)
  const [showQuickSignUp, setShowQuickSignUp] = useState<boolean>(false)
  const [disableButton, setDisableButton] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showCoupon, setShowCoupon] = useState<boolean>(false)

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
        setShowQuickSignUp(true)
        return
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
      const { data: newEnrollment, error: enrollmentError } = await supabase
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
            const { data: existingEnrollment, error: fetchError } = await supabase
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
                const { error: updateError } = await supabase
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
        // IMPORTANTE: La matrícula NO se difiere, siempre se paga completa en el primer pago
        const matriculaInFirstPayment = matriculaAdded ? matriculaAmount : 0
        paymentAmount = priceCalculation.installmentAmount + matriculaInFirstPayment
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
          await supabase
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

        const { error: invoiceError } = await supabase
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

        const { error: invoiceError } = await supabase
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

  const handlePayClick = () => {
    if (!user) {
      setShowQuickSignUp(true)
      return
    }
    handleGetLinkToPay()
  }

  const isFormValid = subtotal && paymentMethod && selectedCohortId

  return (
    <div className={`bg-bg-card w-full flex flex-col gap-6 lg:gap-8 p-6 lg:p-8 rounded-2xl shadow-xl border border-border-color max-w-xl ${className || ''}`}>
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

      {/* A. Bloque Total */}
      <PaymentTotal
        programName={data.name}
        totalAmount={totalAmount}
        subtotal={subtotal}
        priceCalculation={priceCalculation}
        paymentMethod={paymentMethod}
        selectedInstallments={selectedInstallments}
        matriculaAdded={matriculaAdded}
        matriculaAmount={matriculaAmount}
      />

      {/* Cupón (opcional, colapsado por defecto) */}
      {data.id && (
        <>
          {!showCoupon && discount === 0 ? (
            <button
              onClick={() => setShowCoupon(true)}
              className="text-sm text-secondary hover:text-secondary/80 text-left w-full"
            >
              ¿Tienes un código de descuento?
            </button>
          ) : (
            <DiscountCoupon
              programId={data.id}
              subtotal={subtotal || 0}
              onDiscountChange={setDiscount}
              onCouponApplied={handleCouponApplied}
            />
          )}
        </>
      )}

      {/* B. Bloque Acción (CTA) - Más prominente */}
      <div className="pt-2">
        <PaymentAction
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          selectedCohortId={selectedCohortId}
          selectedInstallments={selectedInstallments}
          setSelectedInstallments={setSelectedInstallments}
          data={data}
          onPriceChange={handlePriceChange}
          isFormValid={!!isFormValid}
          disableButton={disableButton}
          totalAmount={totalAmount}
          priceCalculation={priceCalculation}
          matriculaAdded={matriculaAdded}
          matriculaAmount={matriculaAmount}
          onPayClick={handlePayClick}
        />
      </div>

      {/* C. Bloque Confianza */}
      <PaymentTrust />

      {/* Copy legal (muted, pequeño, al final) */}
      <div className="text-text-muted/70 text-xs space-y-1 pt-4 border-t border-border-color">
        <p>
          Tus datos personales se utilizarán únicamente para procesar tu inscripción y mejorar tu experiencia.
        </p>
        <p>
          Consulta nuestra{' '}
          <a href="/politica-privacidad" className="underline hover:text-secondary transition-colors">
            política de privacidad
          </a>
          .
        </p>
      </div>

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
