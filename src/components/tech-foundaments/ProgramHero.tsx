'use client'

import { Sparkles, Check } from 'lucide-react'
import type { Program } from '@/types/programs'
import ProgramCTAButtons from './ProgramCTAButtons'

interface Props {
  programData: Program
  cohortId?: number | null
  stack?: string[]
  /** Modalidad de la cohorte seleccionada, para la píldora de la derecha. */
  modality?: string
}

const KIND_LABEL: Record<string, string> = {
  curso: 'Curso',
  diplomado: 'Diplomado',
  certificación: 'Certificación',
  certificacion: 'Certificación',
}

export function ProgramHero({ programData, cohortId, stack = [], modality }: Props) {
  const kind = programData.kind ? (KIND_LABEL[programData.kind.toLowerCase()] ?? programData.kind) : null

  // Píldoras de contexto: solo las que tienen dato.
  const pills = [
    programData.duration,
    programData.total_hours ? `${programData.total_hours} horas` : null,
    modality,
    programData.difficulty,
  ].filter((value): value is string => Boolean(value))

  return (
    <section className="relative overflow-hidden rounded-2xl border [border-color:var(--card-diplomado-border)] dark:border-border-color shadow-xl">
      {/* Imagen del programa, atenuada detrás del texto */}
      {programData.image && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${programData.image})` }}
          aria-hidden="true"
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/95 to-[var(--bg-primary)]/45"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--border-color)_1px,transparent_1px),linear-gradient(90deg,var(--border-color)_1px,transparent_1px)] [background-size:64px_64px]"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-7 p-6 sm:p-8 lg:p-12">
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
        <div className="flex flex-col gap-4 max-w-3xl">
          <h1 className="font-highlight text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.03] tracking-tight card-text-primary text-balance">
            {programData.name}
          </h1>
          {programData.subtitle && (
            <p className="text-lg sm:text-xl leading-snug card-text-muted text-pretty">
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
    </section>
  )
}
