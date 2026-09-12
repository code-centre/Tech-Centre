'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Lock, Mail, Check, ChevronDown } from 'lucide-react'
import DiscountCoupon from './DiscountCoupon'
import QuickSignUp from './QuickSignUp'
import PaymentMethodDropdown from './PaymentMethodDropdown'
import ReservationBalancePlan from './ReservationBalancePlan'
import CohortInstallmentPlanPreview from './CohortInstallmentPlanPreview'
import { useSupabaseClient, useUser } from '@/lib/supabase'
import { calculatePrice } from '@/lib/pricing/price-calculator'
import { buildCohortInstallmentPlan } from '@/lib/pricing/cohort-installment-schedule'
import {
  RESERVATION_DEPOSIT_COP,
  formatReservationDepositCop,
  reservationAgreedPrice,
  reservationBalanceAmount,
  reservationCheckoutButtonLabel,
} from '@/lib/pricing/reservation'
import { buildReservationBalancePlan } from '@/lib/pricing/reservation-schedule'
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
  hasMultipleCohorts?: boolean
  matriculaAdded: boolean
  matriculaAmount?: number
  couponCode?: string | null
  checkoutMode?: 'standard' | 'reservation'
  selectedReservationInstallments?: number
  setSelectedReservationInstallments?: (installments: number) => void
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
  selectedCohortId,
  matriculaAdded,
  matriculaAmount,
  isReservation,
  balanceAmount,
  couponDiscount,
  reservationTotal,
}: {
  programName: string
  totalAmount: number
  subtotal: number | null
  priceCalculation: ReturnType<typeof calculatePrice> | null
  paymentMethod: 'full' | 'installments' | null
  selectedInstallments: number
  selectedCohortId: number | null
  matriculaAdded: boolean
  matriculaAmount: number
  isReservation: boolean
  balanceAmount: number
  couponDiscount: number
  reservationTotal: number
}) {
  // IMPORTANTE: priceCalculation.total ya incluye descuentos del programa
  // La matrícula NO tiene descuentos, se suma directamente
  const programAmount = priceCalculation?.total || subtotal || 0
  const matriculaExtra = matriculaAdded && matriculaAmount > 0 ? matriculaAmount : 0
  const isInstallmentCheckout =
    paymentMethod === 'installments' && selectedInstallments > 1 && Boolean(priceCalculation?.installmentAmount)
  const firstInstallmentToday =
    isInstallmentCheckout && priceCalculation?.installmentAmount
      ? priceCalculation.installmentAmount + matriculaExtra
      : null
  // Si hay matrícula pero no hay método de pago, incluirla en el total mostrado
  const displayAmount = firstInstallmentToday ?? (paymentMethod
    ? totalAmount
    : (subtotal || 0) + matriculaExtra)
  
  // Mostrar desglose si hay método de pago O si hay matrícula que se debe cobrar
  const shouldShowBreakdown = paymentMethod && priceCalculation || (matriculaAdded && matriculaAmount > 0)
  
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-text-primary">
        {isReservation ? 'Apartado de cupo' : 'Resumen de pago'}
      </h2>
      
      <div className="space-y-2">
        <p className="text-sm text-text-muted">{programName}</p>

        {isReservation && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Precio del programa</span>
              <span className="text-text-primary font-medium">
                ${Math.round(subtotal || 0).toLocaleString('es-CO')} COP
              </span>
            </div>
            {couponDiscount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Descuento (cupón)</span>
                  <span className="font-medium text-emerald-400">
                    -${Math.round(couponDiscount).toLocaleString('es-CO')} COP
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Total del programa</span>
                  <span className="text-text-primary font-medium">
                    ${Math.round(reservationTotal).toLocaleString('es-CO')} COP
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400">Pagas hoy (apartado fijo)</span>
              <span className="font-medium text-emerald-400">
                {formatReservationDepositCop()} COP
              </span>
            </div>
            {balanceAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Saldo pendiente</span>
                <span className="text-text-primary font-medium">
                  ${Math.round(balanceAmount).toLocaleString('es-CO')} COP
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Desglose cuando hay método de pago o cuando hay matrícula */}
        {!isReservation && shouldShowBreakdown && (
          <div className="space-y-2 pt-2">
            {priceCalculation?.paymentMethodDiscount && priceCalculation.paymentMethodDiscount > 0 ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Programa</span>
                  <span className="text-text-primary font-medium">
                    ${Math.round(priceCalculation.subtotal).toLocaleString()} COP
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Descuento pago de contado (10%)</span>
                  <span className="font-medium text-emerald-400">
                    -${Math.round(priceCalculation.paymentMethodDiscount).toLocaleString()} COP
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Programa</span>
                <span className="text-text-primary font-medium">
                  ${Math.round(programAmount).toLocaleString()} COP
                </span>
              </div>
            )}
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
            {isReservation
              ? `${formatReservationDepositCop()} COP`
              : `$${Math.round(displayAmount).toLocaleString('es-CO')} COP`}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {isReservation
              ? 'Apartado para reservar tu cupo · El saldo queda pendiente en tu perfil'
              : isInstallmentCheckout
                ? matriculaExtra > 0
                  ? 'Pagas hoy la cuota 1 (incluye matrícula)'
                  : 'Pagas hoy la cuota 1'
                : paymentMethod
                  ? matriculaExtra > 0
                    ? 'Total a pagar (programa + matrícula)'
                    : 'Precio final · Sin costos ocultos'
                  : matriculaExtra > 0
                    ? 'Precio del programa + matrícula'
                    : 'Precio del programa'}
          </p>
          {isInstallmentCheckout && priceCalculation && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-text-primary">
                {selectedInstallments} cuotas · sin interés
              </p>
              <CohortInstallmentPlanPreview
                selectedCohortId={selectedCohortId}
                amount={priceCalculation.total}
                installmentCount={selectedInstallments}
                mode="full_checkout"
                readOnly
                firstPaymentExtra={matriculaExtra}
              />
            </div>
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
  hasMultipleCohorts,
  totalAmount,
  priceCalculation,
  matriculaAdded,
  matriculaAmount,
  onPayClick,
  isReservation,
  balanceAmount,
  selectedReservationInstallments,
  setSelectedReservationInstallments,
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
  hasMultipleCohorts: boolean
  totalAmount: number
  priceCalculation: ReturnType<typeof calculatePrice> | null
  matriculaAdded: boolean
  matriculaAmount: number
  onPayClick: () => void
  isReservation: boolean
  balanceAmount: number
  selectedReservationInstallments: number
  setSelectedReservationInstallments: (installments: number) => void
}) {
  const getButtonText = () => {
    if (disableButton) return 'Procesando...'
    if (hasMultipleCohorts && !selectedCohortId) return 'Selecciona un horario para continuar'
    if (isReservation) {
      return reservationCheckoutButtonLabel()
    }
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
      {!isReservation && (
        <>
          <PaymentMethodDropdown
            data={data}
            selectedCohortId={selectedCohortId}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            selectedInstallments={selectedInstallments}
            setSelectedInstallments={setSelectedInstallments}
            onPriceChange={onPriceChange}
          />
        </>
      )}

      {isReservation && balanceAmount > 0 && (
        <ReservationBalancePlan
          selectedCohortId={selectedCohortId}
          balanceAmount={balanceAmount}
          selectedInstallments={selectedReservationInstallments}
          setSelectedInstallments={setSelectedReservationInstallments}
        />
      )}

      {isReservation && (
        <p className="text-sm text-text-muted leading-relaxed">
          {reservationCheckoutButtonLabel()} para asegurar tu lugar. Las cuotas del saldo quedan
          programadas en tu perfil con las fechas de la cohorte.
        </p>
      )}
      
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
  hasMultipleCohorts = false,
  matriculaAdded,
  matriculaAmount = 0,
  checkoutMode = 'standard',
  selectedReservationInstallments = 3,
  setSelectedReservationInstallments,
  className,
}: Props) {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { user } = useUser()
  const isReservation = checkoutMode === 'reservation'
  const [discount, setDiscount] = useState<number>(0)
  const reservationTotal = isReservation
    ? reservationAgreedPrice(subtotal || 0, discount)
    : 0
  const balanceAmount = isReservation
    ? reservationBalanceAmount(subtotal || 0, discount)
    : 0
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
  const matriculaExtra = matriculaAdded && matriculaAmount > 0 ? matriculaAmount : 0
  const totalAmount = (priceCalculation?.total || 0) + matriculaExtra

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

      if (!isReservation && !paymentMethod) {
        throw new Error('Por favor, selecciona un método de pago para continuar.')
      }

      if (!data) {
        throw new Error('No se encontraron datos del programa. Por favor, intenta nuevamente.')
      }

      const requiredFields = ['name', 'kind']
      const missingFields = requiredFields.filter((field) => !data[field as keyof Program])

      if (missingFields.length > 0) {
        throw new Error('La información del programa está incompleta. Por favor, intenta nuevamente.')
      }

      const agreedPrice = isReservation
        ? reservationAgreedPrice(subtotal || 0, discount)
        : totalAmount

      // 1. Crear enrollment o usar uno existente con pending_payment
      let enrollment
      const { data: newEnrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          cohort_id: selectedCohortId,
          student_id: user.id,
          status: 'pending_payment',
          agreed_price: agreedPrice,
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
                  .update({ agreed_price: agreedPrice })
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

      // 2. Crear facturas antes del link de pago (el link se genera en el servidor)
      let firstInvoiceId: number | null = null

      if (isReservation) {
        const today = new Date().toISOString().split('T')[0]

        const { data: cohortRow, error: cohortScheduleError } = await supabase
          .from('cohorts')
          .select('start_date, end_date')
          .eq('id', selectedCohortId)
          .single()

        if (cohortScheduleError || !cohortRow?.start_date) {
          throw new Error(
            'Esta cohorte no tiene fechas definidas. Escríbenos para apartar tu cupo con un plan de pagos.'
          )
        }

        const balancePlan =
          balanceAmount > 0
            ? buildReservationBalancePlan(
                balanceAmount,
                cohortRow.start_date,
                cohortRow.end_date ?? cohortRow.start_date,
                selectedReservationInstallments
              )
            : []

        const totalPayments = 1 + balancePlan.length

        const reservationInvoices = [
          {
            enrollment_id: enrollment.id,
            label: `Apartado de cupo - ${data.name}`,
            amount: RESERVATION_DEPOSIT_COP,
            due_date: today,
            status: 'pending',
            meta: {
              product_type: 'program',
              product_id: slugProgram || data.code?.toString() || 'unknown',
              user_id: user.id,
              payment_type: 'reservation_deposit',
              payment_number: 1,
              total_payments: totalPayments,
              checkout_mode: 'reservation',
              balance_installments: balancePlan.length,
              coupon_code: appliedCouponCode || null,
              coupon_discount: discount > 0 ? discount : null,
            },
          },
          ...balancePlan.map((installment) => ({
            enrollment_id: enrollment.id,
            label: `Saldo cuota ${installment.number} de ${balancePlan.length} - ${data.name}`,
            amount: installment.amount,
            due_date: installment.dueDate,
            status: 'pending',
            meta: {
              product_type: 'program',
              product_id: slugProgram || data.code?.toString() || 'unknown',
              user_id: user.id,
              payment_type: 'program_balance',
              payment_number: 1 + installment.number,
              total_payments: totalPayments,
              checkout_mode: 'reservation',
              due_milestone: installment.dueLabel,
              balance_installment: installment.number,
              balance_installments: balancePlan.length,
              coupon_code: appliedCouponCode || null,
              coupon_discount: discount > 0 ? discount : null,
            },
          })),
        ]

        const { data: insertedInvoices, error: invoiceError } = await supabase
          .from('invoices')
          .insert(reservationInvoices)
          .select('id, meta')

        if (invoiceError) {
          console.error('Error al crear facturas de apartado:', invoiceError)
        } else {
          const first = (insertedInvoices ?? []).find(
            (inv: { meta?: { payment_number?: number } }) => inv.meta?.payment_number === 1
          ) ?? insertedInvoices?.[0]
          firstInvoiceId = first?.id ?? null
        }
      } else if (paymentMethod === 'installments' && selectedInstallments > 1) {
        const { data: cohortRow, error: cohortScheduleError } = await supabase
          .from('cohorts')
          .select('start_date, end_date')
          .eq('id', selectedCohortId)
          .single()

        if (cohortScheduleError || !cohortRow?.start_date) {
          throw new Error(
            'Esta cohorte no tiene fechas definidas. Escríbenos para armar tu plan de pagos.'
          )
        }

        const programTotal = priceCalculation?.total ?? totalAmount - matriculaExtra
        const installmentPlan = buildCohortInstallmentPlan(
          programTotal,
          cohortRow.start_date,
          cohortRow.end_date ?? cohortRow.start_date,
          selectedInstallments,
          'full_checkout'
        )

        const invoices = installmentPlan.map((installment) => ({
          enrollment_id: enrollment.id,
          label: `Pago ${installment.number} de ${selectedInstallments} - ${data.name}`,
          amount:
            installment.number === 1
              ? installment.amount + matriculaExtra
              : installment.amount,
          due_date: installment.dueDate,
          status: 'pending',
          meta: {
            product_type: 'program',
            product_id: slugProgram || data.code?.toString() || 'unknown',
            user_id: user.id,
            payment_number: installment.number,
            total_payments: selectedInstallments,
            payment_method: paymentMethod,
            coupon_code: appliedCouponCode || null,
            matricula_added: matriculaAdded,
            matricula_amount: matriculaAmount || 0,
            due_milestone: installment.dueLabel,
            checkout_mode: 'installments',
          },
        }))

        const { data: insertedInvoices, error: invoiceError } = await supabase
          .from('invoices')
          .insert(invoices)
          .select('id, meta')

        if (invoiceError) {
          console.error('Error al crear facturas:', invoiceError)
        } else {
          const first = (insertedInvoices ?? []).find(
            (inv: { meta?: { payment_number?: number } }) => inv.meta?.payment_number === 1
          ) ?? insertedInvoices?.[0]
          firstInvoiceId = first?.id ?? null
        }
      } else {
        const invoice = {
          enrollment_id: enrollment.id,
          label: `Pago completo - ${data.name}`,
          amount: totalAmount,
          due_date: new Date().toISOString().split('T')[0],
          status: 'pending',
          meta: {
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

        const { data: insertedInvoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert([invoice])
          .select('id')
          .single()

        if (invoiceError) {
          console.error('Error al crear invoice:', invoiceError)
        } else {
          firstInvoiceId = insertedInvoice?.id ?? null
        }
      }

      if (!firstInvoiceId) {
        throw new Error('No se pudo crear la factura de pago. Por favor, intenta nuevamente.')
      }

      const paymentLinkResponse = await fetch(`/api/invoices/${firstInvoiceId}/payment-link`, {
        method: 'POST',
      })

      const paymentLinkData = await paymentLinkResponse.json()

      if (!paymentLinkResponse.ok || !paymentLinkData.url) {
        if (!isReservation) {
          try {
            await supabase.from('enrollments').delete().eq('id', enrollment.id)
          } catch (deleteError) {
            console.error('Error al eliminar enrollment:', deleteError)
          }
        }
        throw new Error(
          paymentLinkData.error || 'No pudimos generar el link de pago. Por favor, intenta nuevamente.'
        )
      }

      router.push(paymentLinkData.url)
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

  const isFormValid = subtotal && selectedCohortId && (isReservation || paymentMethod)

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
        selectedCohortId={selectedCohortId}
        matriculaAdded={matriculaAdded}
        matriculaAmount={matriculaAmount}
        isReservation={isReservation}
        balanceAmount={balanceAmount}
        couponDiscount={discount}
        reservationTotal={reservationTotal}
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
              requirePaymentMethod={!isReservation}
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
          hasMultipleCohorts={hasMultipleCohorts}
          totalAmount={totalAmount}
          priceCalculation={priceCalculation}
          matriculaAdded={matriculaAdded}
          matriculaAmount={matriculaAmount}
          onPayClick={handlePayClick}
          isReservation={isReservation}
          balanceAmount={balanceAmount}
          selectedReservationInstallments={selectedReservationInstallments}
          setSelectedReservationInstallments={
            setSelectedReservationInstallments ?? (() => {})
          }
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
          <a href="/aviso-de-privacidad" className="underline hover:text-secondary transition-colors">
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
