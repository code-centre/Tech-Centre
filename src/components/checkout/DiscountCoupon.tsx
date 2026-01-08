'use client'

import { CheckCircle, XCircle, Loader2, Tag } from 'lucide-react'
import React, { useState } from 'react'
import { validateCoupon } from '@/lib/discounts/coupon-service'
import type { Program } from '@/types/programs'

interface Props {
  programId: number
  subtotal: number
  onDiscountChange: (discount: number) => void
  onCouponApplied?: (couponCode: string) => void
}

export default function DiscountCoupon({
  programId,
  subtotal,
  onDiscountChange,
  onCouponApplied,
}: Props) {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!couponCode.trim()) {
      setError('Por favor, ingresa un código de descuento')
      return
    }

    if (!subtotal || subtotal <= 0) {
      setError('Por favor, selecciona un método de pago primero')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await validateCoupon(couponCode.trim(), programId, subtotal)

      if (!result.valid || !result.coupon || result.discountAmount === undefined) {
        setError(result.error || 'Código de descuento no válido')
        setAppliedCoupon(null)
        onDiscountChange(0)
        return
      }

      // Cupón válido
      setSuccess(true)
      setAppliedCoupon(result.coupon.code)
      onDiscountChange(result.discountAmount)
      onCouponApplied?.(result.coupon.code)
    } catch (err) {
      console.error('Error al validar cupón:', err)
      setError('Error al validar el cupón. Por favor, intenta de nuevo.')
      setAppliedCoupon(null)
      onDiscountChange(0)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setAppliedCoupon(null)
    setSuccess(false)
    setError(null)
    onDiscountChange(0)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-blueApp" />
        <label className="text-sm font-semibold text-white">
          Código de descuento o cupón
        </label>
      </div>

      {appliedCoupon ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-emerald-400 font-semibold text-sm">
                  Cupón aplicado: {appliedCoupon}
                </p>
                <p className="text-emerald-300/80 text-xs mt-1">
                  Tu descuento ha sido aplicado correctamente
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="px-3 py-1.5 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 rounded-md transition-colors"
              aria-label="Remover cupón"
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 items-stretch">
          <div className="flex-1 relative">
            <input
              name="discount"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase())
                setError(null)
                setSuccess(false)
              }}
              placeholder="Ingresa tu código de descuento"
              className={`w-full py-3 px-4 border rounded-lg focus-visible:ring-2 focus-visible:ring-blueApp focus-visible:outline-none bg-zinc-800 text-white placeholder:text-gray-500 transition-all ${
                error
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : success
                  ? 'border-emerald-500 focus-visible:ring-emerald-500'
                  : 'border-zinc-700 focus-visible:border-blueApp'
              }`}
              type="text"
              disabled={loading}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-blueApp" />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !couponCode.trim()}
            className="px-6 py-3 bg-blueApp hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex-shrink-0"
          >
            {loading ? 'Aplicando...' : 'Aplicar'}
          </button>
        </form>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && !appliedCoupon && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-400 text-sm">Código de descuento aplicado correctamente</p>
        </div>
      )}
    </div>
  )
}

