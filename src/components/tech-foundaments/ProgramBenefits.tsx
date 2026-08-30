'use client'

import React from 'react'
import { Wrench, FolderGit2, UserRoundCheck, Globe2 } from 'lucide-react'

/**
 * Cómo se enseña en Tech Centre. Es igual para todos los programas a
 * propósito: describe el método de la escuela, no el contenido del curso.
 * Lo específico de cada programa vive en el temario y el proyecto final.
 *
 * Los "beneficios adicionales" que antes vivían aquí se movieron al bloque de
 * inversión, donde se llenan por programa desde `programs.includes`.
 */
const FEATURES = [
  {
    Icon: Wrench,
    title: 'Metodología práctica y actual',
    description:
      'Aprendes haciendo, usando herramientas modernas y resolviendo problemas similares a los del mundo laboral real.',
  },
  {
    Icon: FolderGit2,
    title: 'Proyectos reales para tu portafolio',
    description:
      'Construyes soluciones útiles que podrás mostrar como experiencia práctica en procesos laborales o freelance.',
  },
  {
    Icon: UserRoundCheck,
    title: 'Mentores activos en la industria',
    description:
      'Aprendes con profesionales que aplican estos conocimientos hoy en empresas reales, no solo desde la teoría.',
  },
  {
    Icon: Globe2,
    title: 'Comunidad tech activa',
    description:
      'Formas parte de una red de estudiantes, mentores y eventos que continúan incluso después del curso.',
  },
]

export default function ProgramBenefits() {
  return (
    <section className="flex flex-col gap-7" aria-labelledby="program-benefits-heading">
      <div className="flex flex-col gap-3 max-w-2xl">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
          Cómo se enseña
        </span>
        <h2
          id="program-benefits-heading"
          className="font-highlight text-3xl md:text-4xl font-extrabold tracking-tight card-text-primary text-balance"
        >
          Se aprende escribiendo código, con alguien al lado.
        </h2>
        <p className="text-lg card-text-muted text-pretty">
          Somos pioneros en inteligencia artificial y tecnologías de vanguardia en la Costa.
        </p>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURES.map(({ Icon, title, description }) => (
          <li
            key={title}
            className="flex flex-col gap-3 p-6 md:p-7 rounded-2xl bg-(--card-diplomado-bg) border border-gray-300 dark:border-border-color hover:border-secondary/50 hover:shadow-md transition-all duration-300"
          >
            <Icon className="w-[26px] h-[26px] text-secondary" strokeWidth={1.9} aria-hidden="true" />
            <h3 className="text-lg font-bold card-text-primary">{title}</h3>
            <p className="text-[15px] leading-relaxed card-text-muted">{description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
