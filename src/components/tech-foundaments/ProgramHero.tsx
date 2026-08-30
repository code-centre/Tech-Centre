'use client'

import type { ReactNode } from 'react'
import { Sparkles, Check } from 'lucide-react'
import type { Program } from '@/types/programs'
import ProgramCTAButtons from './ProgramCTAButtons'

interface Props {
  programData: Program
  cohortId?: number | null
  stack?: string[]
  /** Modalidad de la cohorte seleccionada, para la píldora de la derecha. */
  modality?: string
  /** Tarjeta de oferta. Va dentro del encabezado, no en una columna aparte. */
  aside?: ReactNode
}

const KIND_LABEL: Record<string, string> = {
  curso: 'Curso',
  diplomado: 'Diplomado',
  certificación: 'Certificación',
  certificacion: 'Certificación',
}

export function ProgramHero({ programData, cohortId, stack = [], modality, aside }: Props) {
  const kind = programData.kind ? (KIND_LABEL[programData.kind.toLowerCase()] ?? programData.kind) : null

  // Píldoras de contexto: solo las que tienen dato.
  const pills = [
    programData.duration,
    programData.total_hours ? `${programData.total_hours} horas` : null,
    modality,
    programData.difficulty,
  ].filter((value): value is string => Boolean(value))

  return (
    <section className="relative overflow-hidden border-b [border-color:var(--card-diplomado-border)] dark:border-border-color">
      {/* Banda de color de la marca. Se pinta siempre: sin ella, un programa
          sin imagen de portada deja el encabezado plano y vacío. */}
      {/* Va en `style` y no en una clase: el valor arbitrario con función de
          color no lo emite Tailwind y la banda quedaba invisible. */}
      <div
        className="absolute inset-0 opacity-90 dark:opacity-100"
        style={{
          backgroundImage:
            'linear-gradient(148deg, color-mix(in oklab, var(--brand-teal) 42%, transparent) 0%, color-mix(in oklab, var(--brand-teal) 12%, transparent) 34%, transparent 62%)',
        }}
        aria-hidden="true"
      />
      {programData.image && (
        <>
          <div
            className="absolute inset-y-0 right-0 w-full lg:w-3/5 bg-cover bg-center bg-no-repeat opacity-45"
            style={{ backgroundImage: `url(${programData.image})` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent"
            aria-hidden="true"
          />
        </>
      )}
      <div
        className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--border-color)_1px,transparent_1px),linear-gradient(90deg,var(--border-color)_1px,transparent_1px)] [background-size:64px_64px]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_370px] gap-10 xl:gap-14 lg:items-center px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-8 lg:py-2">
          {/* Etiquetas */}
          <div className="flex flex-wrap items-center gap-2">
            {kind && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/10 dark:bg-secondary/15 border border-secondary/30 text-secondary text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                {kind}
              </span>
            )}
            {pills.map((pill) => (
              <span
                key={pill}
                className="px-3.5 py-1.5 rounded-full border border-gray-300 dark:border-border-color card-text-muted text-xs font-medium"
              >
                {pill}
              </span>
            ))}
          </div>

          {/* Título y subtítulo */}
          <div className="flex flex-col gap-5">
            <h1 className="font-highlight text-[2.75rem] sm:text-6xl xl:text-[4.25rem] font-extrabold leading-[1.02] tracking-tight card-text-primary text-balance">
              {programData.name}
            </h1>
            {programData.subtitle && (
              <p className="text-lg sm:text-xl leading-relaxed card-text-muted text-pretty max-w-2xl">
                {programData.subtitle}
              </p>
            )}
          </div>

          {/* Para quién es, cuando el programa lo tiene escrito */}
          {programData.audience && (
            <p className="flex items-start gap-2.5 max-w-2xl text-[15px] card-text-primary">
              <Check className="w-[18px] h-[18px] mt-1 shrink-0 text-secondary" aria-hidden="true" />
              <span>{programData.audience}</span>
            </p>
          )}

          {/* Stack */}
          {stack.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] card-text-muted">
                El stack que vas a manejar
              </span>
              <ul className="flex flex-wrap gap-2">
                {stack.map((tech) => (
                  <li
                    key={tech}
                    className="px-3 py-1.5 rounded-lg bg-bg-card/70 dark:bg-bg-primary/60 border border-gray-300 dark:border-border-color text-[13px] font-medium card-text-primary"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ProgramCTAButtons
            cohortId={cohortId}
            programCode={programData.code || programData.slug}
            source={`programa-${programData.code || programData.slug}-hero`}
            size="lg"
            layout="inline"
            className="pt-1"
          />
        </div>

        {/* En móvil manda la barra fija de abajo, así que la tarjeta se oculta */}
        {aside && <div className="hidden lg:block">{aside}</div>}
      </div>
    </section>
  )
}
