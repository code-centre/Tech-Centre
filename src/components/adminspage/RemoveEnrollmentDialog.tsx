'use client'

import { useState } from 'react'
import { Loader2, TriangleAlert, X } from 'lucide-react'
import { removeEnrollmentFromCohort } from '@/app/admin/cohortes/actions'

export interface RemoveEnrollmentTarget {
  enrollmentId: number
  studentName: string
  cohortName?: string
  invoiceCount?: number
  paidInvoiceCount?: number
}

interface Props {
  target: RemoveEnrollmentTarget | null
  onClose: () => void
  onRemoved: () => void
}

export default function RemoveEnrollmentDialog({ target, onClose, onRemoved }: Props) {
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!target) return null

  const handleRemove = async () => {
    setRemoving(true)
    setError(null)
    try {
      const result = await removeEnrollmentFromCohort(target.enrollmentId)
      if (!result.success) {
        setError(result.error ?? 'No se pudo sacar a la persona de la cohorte.')
        return
      }
      onRemoved()
      onClose()
    } catch (err) {
      console.error('Error al sacar de la cohorte:', err)
      setError('Ocurrió un error inesperado. Intenta de nuevo.')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-enrollment-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-border-color bg-[var(--card-background)] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-red-500/10 text-red-600 dark:text-red-400">
              <TriangleAlert className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="remove-enrollment-title" className="text-lg font-semibold text-text-primary">
                ¿Sacar de la cohorte?
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {target.studentName}
                {target.cohortName ? ` · ${target.cohortName}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={removing}
            className="p-1 text-text-muted transition-colors hover:text-text-primary disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-5 text-[14.5px] leading-relaxed text-text-muted">
          Se quitará la matrícula de esta cohorte. También se eliminan las facturas pendientes
          {target.paidInvoiceCount && target.paidInvoiceCount > 0
            ? ` (${target.paidInvoiceCount} ya ${target.paidInvoiceCount === 1 ? 'pagada' : 'pagadas'} — el historial de pago se pierde en la plataforma)`
            : ''}
          , la asistencia y las notas asociadas a esta inscripción.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={removing}
            className="inline-flex h-11 items-center rounded-lg border border-border-color px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {removing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Sacando...
              </>
            ) : (
              'Sacar de la cohorte'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
