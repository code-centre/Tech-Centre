'use client'

import { useState } from 'react'
import { formatPrice } from '../../../utils/formatCurrency'

interface Props {
  defaultPrice?: number | null
  discount?: number | null
  currency?: string
  /** `cohorts.maximum_payments` — sin al menos 2, no se muestra el selector. */
  maximumPayments?: number | null
  size?: 'md' | 'lg'
}

/**
 * Precio del programa con el selector pago único / cuotas.
 * El número de cuotas sale de la cohorte seleccionada, así que el bloque se
 * re-renderiza solo cuando el usuario cambia de modalidad.
 */
export default function ProgramPriceBlock({
  defaultPrice,
  discount,
  currency = 'COP',
  maximumPayments,
  size = 'md',
}: Props) {
  const [mode, setMode] = useState<'once' | 'installments'>('once')

  const basePrice = discount || defaultPrice || 0
  const hasInstallments = Boolean(maximumPayments && maximumPayments >= 2)
  const showInstallments = hasInstallments && mode === 'installments'

  if (!basePrice) return null

  const amountClass = size === 'lg' ? 'text-4xl' : 'text-3xl'
  const tabClass = (active: boolean) =>
    `px-3 py-2 rounded-lg text-sm text-center transition-all duration-200 cursor-pointer ${
      active
        ? 'bg-bg-card dark:bg-bg-card border [border-color:var(--card-diplomado-border)] dark:border-border-color card-text-primary font-semibold'
        : 'bg-transparent border border-transparent card-text-muted font-medium hover:card-text-primary'
    }`

  return (
    <div className="flex flex-col gap-3">
      {hasInstallments && (
        <div
          className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-bg-secondary dark:bg-bg-primary/60 border border-gray-300 dark:border-border-color"
          role="tablist"
          aria-label="Forma de pago"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'once'}
            onClick={() => setMode('once')}
            className={tabClass(mode === 'once')}
          >
            Pago único
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'installments'}
            onClick={() => setMode('installments')}
            className={tabClass(mode === 'installments')}
          >
            {maximumPayments} cuotas
          </button>
        </div>
      )}

      <div className="flex flex-col gap-0.5">
        {showInstallments ? (
          <>
            <span className="text-[13px] card-text-muted">Hasta {maximumPayments} cuotas de</span>
            <span className={`${amountClass} font-bold tracking-tight card-text-primary leading-tight`}>
              {formatPrice(Math.round(basePrice / (maximumPayments as number)), currency)}
            </span>
            <span className="text-[13px] card-text-muted">
              Total {formatPrice(basePrice, currency)} · sin intereses
            </span>
          </>
        ) : (
          <>
            <span className="text-[13px] card-text-muted">
              {discount ? '¡Precio en oferta!' : 'Precio del programa'}
            </span>
            <span className={`${amountClass} font-bold tracking-tight card-text-primary leading-tight`}>
              {formatPrice(basePrice, currency)}
            </span>
            {discount && defaultPrice && discount < defaultPrice ? (
              <span className="text-[13px] card-text-muted line-through">
                {formatPrice(defaultPrice, currency)}
              </span>
            ) : (
              <span className="text-[13px] card-text-muted">Un solo pago, todo incluido</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
