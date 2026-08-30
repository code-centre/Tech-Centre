'use client'

import { Check } from 'lucide-react'
import type { Program } from '@/types/programs'
import ProgramCTAButtons from './ProgramCTAButtons'
import ProgramPriceBlock from './ProgramPriceBlock'

interface Props {
  programData: Program
  cohortId?: number | null
  maximumPayments?: number | null
  includes: string[]
}

export default function ProgramPricing({ programData, cohortId, maximumPayments, includes }: Props) {
  const hasPrice = Boolean(programData.discount || programData.default_price)
  if (!hasPrice && includes.length === 0) return null

  return (
    <section
      className="relative overflow-hidden rounded-3xl border [border-color:var(--card-diplomado-border)] dark:border-border-color bg-(--card-diplomado-bg) shadow-xl"
      aria-labelledby="program-pricing-heading"
    >
      {/* Panel de marca, como el encabezado: es el bloque que cierra la venta,
          no una tarjeta más de la lista. */}
      <div
        className="absolute inset-0 opacity-90 dark:opacity-100"
        style={{
          backgroundImage:
            'linear-gradient(148deg, color-mix(in oklab, var(--brand-teal) 38%, transparent) 0%, color-mix(in oklab, var(--brand-teal) 10%, transparent) 38%, transparent 66%)',
        }}
        aria-hidden="true"
      />
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-10 p-6 sm:p-8 lg:p-12">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
              Inversión
            </span>
            <h2
              id="program-pricing-heading"
              className="font-highlight text-3xl md:text-4xl font-extrabold tracking-tight card-text-primary text-balance"
            >
              Todo lo que entra en el precio.
            </h2>
          </div>

          {includes.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {includes.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[15px] card-text-primary">
                  <Check className="w-[17px] h-[17px] mt-1 shrink-0 text-secondary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasPrice && (
          <div className="flex flex-col gap-5 p-6 rounded-2xl bg-bg-secondary dark:bg-bg-primary/60 border border-gray-300 dark:border-border-color h-fit">
            <ProgramPriceBlock
              defaultPrice={programData.default_price}
              discount={programData.discount}
              currency={programData.currency || 'COP'}
              maximumPayments={maximumPayments}
              size="lg"
            />
            <ProgramCTAButtons
              cohortId={cohortId}
              programCode={programData.code || programData.slug}
              source={`programa-${programData.code || programData.slug}-inversion`}
            />
          </div>
        )}
      </div>
    </section>
  )
}
