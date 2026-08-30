'use client'

import Link from 'next/link'
import { CircleCheck, CircleAlert, ArrowRight } from 'lucide-react'
import type { AudienceFit, Prerequisite } from '@/types/programs'

interface Props {
  audienceFit: AudienceFit | null
  prerequisites: Prerequisite[]
  programCode?: string
}

export default function ProgramAudienceFit({ audienceFit, prerequisites, programCode }: Props) {
  const hasFit = Boolean(audienceFit && (audienceFit.yes.length > 0 || audienceFit.not_yet.length > 0))
  if (!hasFit && prerequisites.length === 0) return null

  const diagnosticHref = programCode
    ? `/agendar-diagnostico?programa=${encodeURIComponent(programCode)}&origen=${encodeURIComponent(`programa-${programCode}-requisitos`)}`
    : '/agendar-diagnostico'

  return (
    <section className="flex flex-col gap-8" aria-labelledby="program-fit-heading">
      <div className="flex flex-col gap-3 max-w-2xl">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
          Antes de que pagues
        </span>
        <h2
          id="program-fit-heading"
          className="font-highlight text-3xl md:text-4xl font-extrabold tracking-tight card-text-primary text-balance"
        >
          Te decimos con franqueza si es para ti.
        </h2>
      </div>

      {hasFit && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {audienceFit!.yes.length > 0 && (
            <article className="flex flex-col gap-4 p-6 md:p-7 rounded-2xl bg-(--card-diplomado-bg) border border-secondary/40">
              <header className="flex items-center gap-2.5">
                <CircleCheck className="w-[22px] h-[22px] text-secondary" aria-hidden="true" />
                <h3 className="text-lg font-bold card-text-primary">Entra si…</h3>
              </header>
              <ul className="flex flex-col gap-3">
                {audienceFit!.yes.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] card-text-muted">
                    <span className="text-secondary font-bold" aria-hidden="true">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          )}

          {audienceFit!.not_yet.length > 0 && (
            <article className="flex flex-col gap-4 p-6 md:p-7 rounded-2xl bg-bg-secondary dark:bg-bg-primary/60 border border-gray-300 dark:border-border-color">
              <header className="flex items-center gap-2.5">
                <CircleAlert className="w-[22px] h-[22px] card-text-muted" aria-hidden="true" />
                <h3 className="text-lg font-bold card-text-primary">Todavía no, si…</h3>
              </header>
              <ul className="flex flex-col gap-3">
                {audienceFit!.not_yet.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] card-text-muted">
                    <span className="font-bold" aria-hidden="true">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>
      )}

      {prerequisites.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 p-5 md:p-6 rounded-2xl bg-(--card-diplomado-bg) border border-dashed border-gray-400 dark:border-border-color">
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] card-text-muted">
            Prerrequisitos
          </span>
          <ul className="flex flex-wrap gap-2.5 grow">
            {prerequisites.map((item, i) => (
              <li
                key={i}
                className="px-3.5 py-2 rounded-full bg-bg-secondary dark:bg-bg-primary/60 border border-gray-300 dark:border-border-color text-sm card-text-primary"
              >
                <strong className="font-semibold">{item.name}</strong>
                {item.detail && <span className="card-text-muted"> · {item.detail}</span>}
              </li>
            ))}
          </ul>
          <Link
            href={diagnosticHref}
            className="group shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline underline-offset-4"
          >
            ¿No estás seguro? Agenda el diagnóstico
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  )
}
