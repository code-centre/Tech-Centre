'use client'

import Image from 'next/image'
import type { Program } from '@/types/programs'
import ProgramCTAButtons from './ProgramCTAButtons'

interface Props {
  programData: Program
  cohortId?: number | null
  /** Cupos restantes de la cohorte, si la cohorte tiene cupo máximo definido. */
  seatsLeft?: number | null
}

export default function ProgramFinalCTA({ programData, cohortId, seatsLeft }: Props) {
  const hasSeats = typeof seatsLeft === 'number' && seatsLeft > 0

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-secondary/40 bg-(--card-diplomado-bg) shadow-xl"
      aria-labelledby="program-final-cta-heading"
    >
      {/* Cierra con una foto de la sede: es la misma promesa de la página. */}
      <Image
        src="/community/manos-teclado.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-45"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/88 to-[var(--bg-primary)]/96"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--border-color)_1px,transparent_1px),linear-gradient(90deg,var(--border-color)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center gap-6 px-6 py-12 sm:px-10 sm:py-16 text-center">
        <div className="flex flex-col items-center gap-4 max-w-2xl">
          <h2
            id="program-final-cta-heading"
            className="font-highlight text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-tight tracking-tight card-text-primary text-balance"
          >
            Si llegaste hasta aquí, ya sabes si es para ti.
          </h2>
          <p className="text-lg card-text-muted text-pretty">
            {hasSeats ? (
              <>
                Y si todavía no, el diagnóstico son 20 minutos: revisamos tu nivel y te decimos de
                frente si entrar en esta cohorte — quedan {seatsLeft}{' '}
                {seatsLeft === 1 ? 'cupo' : 'cupos'} — o esperar la siguiente.
              </>
            ) : (
              <>
                Y si todavía no, el diagnóstico son 20 minutos: revisamos tu nivel y te decimos de
                frente si entrar ahora o esperar la siguiente cohorte.
              </>
            )}
          </p>
        </div>

        <ProgramCTAButtons
          cohortId={cohortId}
          programCode={programData.code || programData.slug}
          source={`programa-${programData.code || programData.slug}-cierre`}
          size="lg"
          layout="inline"
        />

        <p className="text-sm card-text-muted">
          Diagnóstico gratuito de 20 min · Sin compromiso · Te respondemos el mismo día
        </p>
      </div>
    </section>
  )
}
