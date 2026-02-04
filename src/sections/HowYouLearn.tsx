'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Users, 
  Code, 
  Sparkles, 
  MessageSquare, 
  UsersRound,
  ArrowRight
} from 'lucide-react'

interface LearningPillar {
  icon: React.ElementType
  title: string
  description: string
}

const learningPillars: LearningPillar[] = [
  {
    icon: Users,
    title: 'Clases presenciales y guiadas',
    description: 'Aprende en un entorno colaborativo con grupos reducidos. Recibe acompañamiento directo de mentores que resuelven tus dudas en tiempo real.'
  },
  {
    icon: Code,
    title: 'Proyectos desde el primer día',
    description: 'Aprende haciendo. Desde el inicio trabajarás en proyectos reales que reflejan los desafíos del mundo laboral actual.'
  },
  {
    icon: MessageSquare,
    title: 'Feedback y seguimiento continuo',
    description: 'Recibe retroalimentación constante sobre tu progreso. Ajusta tu aprendizaje con guía personalizada en cada paso.'
  },
  {
    icon: Sparkles,
    title: 'IA como herramienta de trabajo',
    description: 'Integra inteligencia artificial en tu forma de trabajar, usando herramientas actuales para construir y automatizar soluciones reales.'
  },
  {
    icon: UsersRound,
    title: 'Comunidad y eventos',
    description: 'Conéctate con una red activa de estudiantes, mentores y profesionales. Participa en eventos, workshops y espacios donde la tecnología se vive en comunidad.'
  }
]

export function HowYouLearn() {
  return (
    <section 
      className="relative py-16 md:py-12 bg-bg-primary transition-colors duration-300"
      aria-labelledby="how-you-learn-heading"
    >
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Title */}
        <h2 
          id="how-you-learn-heading"
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-text-primary mb-6 md:mb-8 max-w-3xl mx-auto"
        >
          ¿Cómo aprendes en Tech Centre?
        </h2>

        {/* Intro paragraph */}
        <p className="text-lg md:text-xl text-center text-text-muted mb-12 md:mb-16 max-w-2xl mx-auto leading-relaxed">
          Una experiencia de aprendizaje diseñada para prepararte para la industria real. 
          Metodología práctica, acompañamiento cercano y una comunidad que crece contigo.
        </p>

        {/* Grid of pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {learningPillars.map((pillar, index) => {
            const IconComponent = pillar.icon
            return (
              <article
                key={index}
                className="group relative p-6 md:p-8 rounded-2xl bg-bg-card border border-border-color hover:border-secondary/30 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/5 hover:-translate-y-1"
              >
                {/* Icon container */}
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
                  <IconComponent className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" />
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-semibold text-text-primary mb-3 group-hover:text-secondary transition-colors duration-300">
                  {pillar.title}
                </h3>

                {/* Description */}
                <p className="text-base md:text-lg text-text-muted leading-relaxed">
                  {pillar.description}
                </p>
              </article>
            )
          })}
        </div>

        {/* Closing statement */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-primary max-w-3xl mx-auto leading-tight">
            Aquí no solo estudias tecnología. La vives.
          </p>
        </div>

        {/* CTA */}
        <nav className="flex justify-center" aria-label="Navegación a programas">
          <Link
            href="/programas-academicos"
            className="group inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold text-secondary hover:text-primary border-2 border-secondary/30 hover:border-secondary rounded-xl transition-all duration-300 hover:bg-secondary/5 hover:shadow-md hover:shadow-secondary/10"
          >
            <span>Explorar programas</span>
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </section>
  )
}

export default HowYouLearn
