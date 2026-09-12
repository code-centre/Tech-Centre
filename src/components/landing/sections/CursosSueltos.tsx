'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SparkEyebrow from '../SparkEyebrow'
import Reveal from '../Reveal'
import { LooseProgramCard } from '@/components/programas/ProgramOfferCards'
import type { HubProgram } from '@/data/programsHub'

/** Programas con cohorte activa que no pertenecen a ninguna ruta de seis meses. */
export default function CursosSueltos({ programs }: { programs: HubProgram[] }) {
  const visible = programs.filter((program) => program.cohortId != null)
  const reduce = useReducedMotion()

  if (visible.length === 0) return null

  return (
    <section
      id="programas"
      className="relative overflow-hidden border-y border-[var(--line)] bg-[#07100D] py-20 md:py-24"
      aria-labelledby="programas-title"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_0%,rgba(63,224,160,0.12)_0%,transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SparkEyebrow tone="mint">Programas</SparkEyebrow>
          <h2
            id="programas-title"
            className="lv2-display mt-5 max-w-3xl text-3xl text-[var(--paper)] sm:text-4xl"
          >
            Cursos que puedes tomar{' '}
            <span className="text-[var(--mint)]">sin la ruta completa</span>
          </h2>
          <p className="mt-3 max-w-2xl text-base text-[var(--soft)] sm:text-lg">
            Programas con cohorte activa hoy. Presencial en Casa Tech.
          </p>
        </Reveal>

        <motion.ul
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-8%' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {visible.map((program) => (
            <motion.li
              key={program.code}
              variants={{
                hidden: { opacity: 0, y: reduce ? 0 : 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
              }}
            >
              <LooseProgramCard program={program} />
            </motion.li>
          ))}
        </motion.ul>

        <Reveal delay={0.12} className="mt-8">
          <Link
            href="/programas"
            className="lv2-mono inline-flex items-center gap-1.5 !normal-case !tracking-normal text-[var(--mint)] transition-opacity hover:opacity-80"
          >
            Ver todos los programas abiertos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
