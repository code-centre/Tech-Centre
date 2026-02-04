'use client'
import React from 'react'
import { Check, LightbulbIcon, BrainCircuit } from 'lucide-react'

interface Props {
}

export default function ProgramBenefits() {
  const mainFeatures = [
    {
      emoji: '🧠',
      title: 'Metodología práctica y actual',
      description: 'Aprendes haciendo, usando herramientas modernas y resolviendo problemas similares a los del mundo laboral real.'
    },
    {
      emoji: '🛠️',
      title: 'Proyectos reales para tu portafolio',
      description: 'Construyes soluciones útiles que podrás mostrar como experiencia práctica en procesos laborales o freelance.'
    },
    {
      emoji: '👨‍🏫',
      title: 'Mentores activos en la industria',
      description: 'Aprendes con profesionales que aplican estos conocimientos hoy en empresas reales, no solo desde la teoría.'
    },
    {
      emoji: '🌎',
      title: 'Comunidad tech activa',
      description: 'Formas parte de una red de estudiantes, mentores y eventos que continúan incluso después del curso.'
    }
  ]

  const additionalBenefits = [
    'Materiales y recursos de aprendizaje incluidos',
    'Acceso permanente a la comunidad Tech Centre',
    'Certificado de participación (Tech Centre)',
    'Asesoría personalizada durante el curso'
  ]

  return (
    <section 
      className="max-w-full bg-(--card-diplomado-bg) rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border [border-color:var(--card-diplomado-border)] dark:border-border-color"
      aria-labelledby="program-benefits-heading"
    >
      <article className="p-6 md:p-8 flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <BrainCircuit 
              className="card-text-primary" 
              size={32} 
              aria-hidden="true"
            />
            <h2 
              id="program-benefits-heading"
              className="text-xl md:text-2xl font-bold card-text-primary text-balance"
            >
              Características del programa
            </h2>
          </div>
          <p className="text-base md:text-lg font-semibold card-text-primary">
            Somos pioneros en inteligencia artificial y tecnologías de vanguardia en la Costa.
          </p>
        </header>

        {/* Main Features List */}
        <section aria-labelledby="main-features-heading">
          <h3 id="main-features-heading" className="sr-only">
            Características principales del programa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-2">
            {mainFeatures.map((feature, index) => (
              <article
                key={index}
                className="flex items-start gap-4 p-4 md:p-5 rounded-xl border border-gray-200 dark:border-border-color hover:border-secondary/50 dark:hover:border-secondary/50 hover:shadow-md transition-all duration-300"
              >
                <div 
                  className="text-3xl md:text-4xl shrink-0"
                  aria-hidden="true"
                  role="img"
                >
                  {feature.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base md:text-lg font-bold card-text-primary mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm md:text-base card-text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Additional Benefits Section */}
        <section 
          className="mt-4 pt-6 border-t border-gray-300 dark:border-border-color"
          aria-labelledby="additional-benefits-heading"
        >
          <header className="mb-4">
            <h3 
              id="additional-benefits-heading"
              className="text-base md:text-lg font-semibold card-text-primary flex items-center gap-2"
            >
              <LightbulbIcon 
                size={18} 
                className="card-text-primary"
                aria-hidden="true"
              />
              Beneficios adicionales
            </h3>
          </header>
          <ul 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            role="list"
          >
            {additionalBenefits.map((benefit, index) => (
              <li 
                key={index}
                className="flex items-start gap-3"
              >
                <div 
                  className="mt-1 bg-gray-200 dark:bg-bg-primary rounded-full p-1.5 shrink-0"
                  aria-hidden="true"
                >
                  <Check 
                    size={16} 
                    className="text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-sm md:text-base card-text-muted leading-relaxed">
                  {benefit}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </section>
  )
}
