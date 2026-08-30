'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { SyllabusData } from '@/types/programs'

interface Props {
  syllabusData: SyllabusData
  programId?: number
  onSyllabusUpdate?: (updatedSyllabus: SyllabusData) => void
}

export default function ProgramSyllabus({ syllabusData }: Props) {
  const modules = syllabusData.modules || []
  // El primero abierto: se ve de una que el temario tiene contenido detrás.
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (modules.length === 0) return null

  const totalTopics = modules.reduce((acc, module) => acc + (module.topics?.length || 0), 0)

  return (
    <section className="flex flex-col gap-7" aria-labelledby="program-syllabus-heading">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-2xl">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
            Temario
          </span>
          <h2
            id="program-syllabus-heading"
            className="font-highlight text-3xl md:text-4xl font-extrabold tracking-tight card-text-primary text-balance"
          >
            {modules.length} módulos, cada uno con algo que funciona al final.
          </h2>
        </div>
        {totalTopics > 0 && (
          <span className="px-4 py-2 rounded-full bg-secondary/10 dark:bg-secondary/15 border border-secondary/30 text-secondary text-sm font-semibold">
            {modules.length} módulos · {totalTopics} temas
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {modules.map((module, i) => {
          const isOpen = openIndex === i
          const topics = module.topics || []
          const panelId = `syllabus-panel-${module.id ?? i}`

          return (
            <article
              key={module.id ?? `module-${i}`}
              className={`rounded-2xl overflow-hidden bg-(--card-diplomado-bg) border transition-colors duration-300 ${
                isOpen ? 'border-secondary/50' : 'border-gray-300 dark:border-border-color'
              }`}
            >
              <h3>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex items-center gap-4 sm:gap-5 w-full px-5 sm:px-6 py-4 text-left cursor-pointer"
                >
                  <span
                    className={`shrink-0 w-10 py-1.5 rounded-lg text-center text-[13px] font-bold transition-colors duration-300 ${
                      isOpen
                        ? 'bg-secondary/15 text-secondary'
                        : 'bg-bg-secondary dark:bg-bg-primary/60 card-text-muted'
                    }`}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="grow text-base sm:text-lg font-semibold tracking-tight card-text-primary">
                    {module.title}
                  </span>
                  {topics.length > 0 && (
                    <span className="hidden sm:inline text-[13.5px] card-text-muted whitespace-nowrap">
                      {topics.length} {topics.length === 1 ? 'tema' : 'temas'}
                    </span>
                  )}
                  <ChevronDown
                    className={`shrink-0 w-5 h-5 card-text-muted transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </h3>

              {isOpen && topics.length > 0 && (
                <div id={panelId} className="flex flex-col gap-3 px-5 sm:pl-[76px] sm:pr-6 pb-5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] card-text-muted">
                    Lo que vas a ver
                  </span>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-2">
                    {topics.map((topic, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-[15px] card-text-muted leading-snug">
                        <Check className="w-3.5 h-3.5 mt-1.5 shrink-0 text-secondary" aria-hidden="true" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
