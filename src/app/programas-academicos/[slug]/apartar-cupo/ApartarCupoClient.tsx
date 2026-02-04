'use client'

import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import LeadForm from './LeadForm'
import Accordion from './Accordion'
import { formatDate } from '@/utils/formatDate'
import type { Program } from '@/types/programs'

interface Cohort {
  id: number
  start_date: string
  modality: string
  schedule?: {
    clases?: {
      horas?: string[]
      dias?: string[]
    }
    hours?: string[]
    days?: string[]
  }
}

interface Instructor {
  first_name: string
  last_name: string
}

interface ApartarCupoClientProps {
  program: Program
  cohort: Cohort | null
  instructor: Instructor | null
  slug: string
}

export default function ApartarCupoClient({
  program,
  cohort,
  instructor,
  slug
}: ApartarCupoClientProps) {

  return (
    <div className="min-h-screen bg-background py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Link
          href={`/programas-academicos/${slug}`}
          className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al programa</span>
        </Link>

        {/* Layout: Mobile primero muestra form, desktop muestra 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Columna izquierda: Copy y contenido (desktop) / Acordeones (mobile después del form) */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Header - contenido mínimo visible */}
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3">
                Aparta tu cupo en el {program.name}
              </h1>
              <p className="text-base md:text-lg text-text-muted mb-5">
                Sin pago inmediato. Déjanos tus datos y te ayudamos a decidir con claridad.
              </p>

              {/* Chips informativos */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                  Cupos limitados
                </span>
                {cohort?.start_date && (
                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                    Inicio: {formatDate(cohort.start_date)}
                  </span>
                )}
                {cohort?.modality && (
                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                    Modalidad: {cohort.modality === 'presencial' ? 'Presencial (Barranquilla)' : cohort.modality}
                  </span>
                )}
                {program.duration && (
                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                    Duración: {program.duration}
                  </span>
                )}
              </div>

              {/* 2 bullets de valor máximo */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                  <span className="text-text-primary">
                    Aprendizaje práctico con proyectos reales y acompañamiento cercano.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                  <span className="text-text-primary">
                    Sin compromiso. Apartar tu cupo te da prioridad y acceso a toda la información.
                  </span>
                </div>
              </div>
            </div>

            {/* Acordeones colapsados por defecto */}
            <div className="mt-8">
              <Accordion title="¿Para quién es este programa?">
                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                    <span className="text-text-primary">
                      Si quieres aprender de forma práctica y construir algo real (no solo teoría).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                    <span className="text-text-primary">
                      Si te sirve una ruta guiada con acompañamiento cercano y grupos pequeños.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                    <span className="text-text-primary">
                      Si quieres portafolio: proyectos que puedas mostrar en entrevistas o a clientes.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                    <span className="text-text-primary">
                      Si todavía tienes dudas y prefieres hablar con alguien antes de pagar.
                    </span>
                  </li>
                </ul>
                <p className="mt-4 text-sm text-text-muted italic">
                  Nota: Apartar tu cupo no te obliga a pagar. Solo te da prioridad y acompañamiento.
                </p>
              </Accordion>

              <Accordion title="¿Qué pasa después de apartar tu cupo?">
                <ol className="space-y-3 pt-2">
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 bg-secondary/20 text-secondary rounded-full flex items-center justify-center font-semibold text-sm">
                      1
                    </span>
                    <span className="text-text-primary pt-0.5">
                      Dejas tus datos (WhatsApp y correo).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 bg-secondary/20 text-secondary rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </span>
                    <span className="text-text-primary pt-0.5">
                      Te enviamos temario + detalles del programa y respondemos tus preguntas.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 bg-secondary/20 text-secondary rounded-full flex items-center justify-center font-semibold text-sm">
                      3
                    </span>
                    <span className="text-text-primary pt-0.5">
                      Te explicamos opciones de pago (incluye cuotas si aplica).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 bg-secondary/20 text-secondary rounded-full flex items-center justify-center font-semibold text-sm">
                      4
                    </span>
                    <span className="text-text-primary pt-0.5">
                      Si te hace sentido, completas tu inscripción y aseguras tu lugar.
                    </span>
                  </li>
                </ol>
              </Accordion>

              {(instructor || !instructor) && (
                <Accordion title={instructor ? `Mensaje de ${instructor.first_name} ${instructor.last_name}` : 'Mensaje del equipo'}>
                  <div className="pt-2">
                    <p className="text-text-primary leading-relaxed mb-3">
                      ¡Qué gusto tenerte por aquí! 👋
                    </p>
                    <p className="text-text-primary leading-relaxed mb-3">
                      Si estás considerando este programa pero aún tienes dudas, es normal. Aquí no vienes 
                      solo a 'ver tecnología': vienes a vivirla, construir y crecer en comunidad.
                    </p>
                    <p className="text-text-primary leading-relaxed">
                      Déjanos tus datos y te compartimos todo lo necesario para que tomes una decisión con 
                      claridad. Nos vemos pronto.
                    </p>
                    <p className="text-text-muted mt-4 italic">
                      — {instructor ? `${instructor.first_name} ${instructor.last_name}, Profesor del programa` : 'Equipo Tech Centre'}
                    </p>
                  </div>
                </Accordion>
              )}
            </div>
          </div>

          {/* Columna derecha: Formulario sticky (desktop) / Primero en mobile */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <LeadForm programId={program.id} programSlug={slug} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
