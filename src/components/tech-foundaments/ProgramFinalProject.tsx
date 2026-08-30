'use client'

import { Boxes } from 'lucide-react'
import type { FinalProject } from '@/types/programs'

interface Props {
  finalProject: FinalProject | null
}

export default function ProgramFinalProject({ finalProject }: Props) {
  if (!finalProject) return null

  const requirements = finalProject.requirements ?? []
  const examples = finalProject.examples ?? []

  return (
    <section className="flex flex-col gap-8" aria-labelledby="program-final-project-heading">
      <div className="flex flex-col gap-3 max-w-3xl">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
          Proyecto final
        </span>
        <h2
          id="program-final-project-heading"
          className="font-highlight text-3xl md:text-4xl font-extrabold tracking-tight card-text-primary text-balance"
        >
          {finalProject.title
            ? <>Sales con <span className="text-secondary">{finalProject.title}</span>.</>
            : 'Sales con un proyecto que puedes mostrar.'}
        </h2>
        {finalProject.summary && (
          <p className="text-lg card-text-muted text-pretty">{finalProject.summary}</p>
        )}
      </div>

      {(requirements.length > 0 || examples.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-5">
          {requirements.length > 0 && (
            <article className="flex flex-col gap-5 p-6 md:p-8 rounded-2xl bg-(--card-diplomado-bg) border border-secondary/40">
              <h3 className="text-lg font-bold card-text-primary">Qué tiene que cumplir tu entrega</h3>
              <ul className="flex flex-col gap-4">
                {requirements.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-secondary/15 text-secondary text-[13px] font-bold"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="text-[15px] card-text-primary">
                      <strong className="font-semibold">{item.title}</strong>
                      {item.description && <span className="card-text-muted"> {item.description}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          )}

          {examples.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] card-text-muted">
                Ejemplos de proyecto
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 grow">
                {examples.map((item, i) => (
                  <li
                    key={i}
                    className="flex flex-col gap-2 p-5 rounded-xl bg-(--card-diplomado-bg) border border-gray-300 dark:border-border-color hover:border-secondary/50 transition-colors duration-300"
                  >
                    <Boxes className="w-5 h-5 text-secondary" aria-hidden="true" />
                    <span className="text-[15px] font-semibold card-text-primary">{item.title}</span>
                    {item.description && (
                      <span className="text-[13.5px] leading-snug card-text-muted">{item.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
