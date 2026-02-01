'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Users, ArrowRight, CheckCircle2, GraduationCap, Zap } from 'lucide-react'
import type { Program } from '@/types/programs'
import type { Cohort } from '@/types/cohorts'

interface ProgramCardProps {
  program: Program
  cohort: Cohort
}

// Tipos de programa para diferenciación visual
type ProgramType = 'diplomado' | 'curso-corto'

// Función para determinar el tipo de programa
const getProgramType = (program: Program): ProgramType => {
  const kind = program.kind?.toLowerCase() || ''
  if (kind.includes('diplomado')) return 'diplomado'
  return 'curso-corto'
}

// Función para obtener el badge del programa
const getProgramBadge = (program: Program): { label: string; icon: React.ReactNode } => {
  const kind = program.kind?.toLowerCase() || ''
  const duration = program.duration || ''
  
  if (kind.includes('diplomado')) {
    return {
      label: `Diplomado · ${duration || '3 meses'}`,
      icon: <GraduationCap className="h-3.5 w-3.5" />
    }
  }
  
  return {
    label: `Curso corto · ${duration || '6 semanas'}`,
    icon: <Zap className="h-3.5 w-3.5" />
  }
}

// Estilos de card según tipo de programa
const getCardStyles = (type: ProgramType) => {
  const baseStyles = 'rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full'
  
  if (type === 'diplomado') {
    // Diplomado: mayor peso visual, se adapta al tema
    return {
      card: `${baseStyles} [background-color:var(--card-diplomado-bg)] [border-color:var(--card-diplomado-border)] hover:border-secondary/60 hover:shadow-secondary/25`,
      inner: '',
      badge: 'bg-secondary/20 text-white border-secondary/40 dark:bg-secondary/20 dark:text-secondary dark:border-secondary/40',
      imageOverlay: 'bg-linear-to-t from-transparent via-transparent to-[var(--card-diplomado-bg)]/40'
    }
  }
  
  // Curso corto: sensación de accesibilidad, se adapta al tema
  return {
    card: `${baseStyles} [background-color:var(--card-curso-bg)] [border-color:var(--card-curso-border)] hover:border-secondary/50 hover:shadow-secondary/20`,
    inner: '',
    badge: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40',
    imageOverlay: 'bg-linear-to-t from-transparent via-transparent to-[var(--card-curso-bg)]/40'
  }
}

// Función helper para extraer bullets de aprendizaje desde la descripción
const extractLearningPoints = (description: string, programName: string): string[] => {
  if (!description) return []
  
  // Limpiar HTML tags
  const cleanText = description.replace(/<[^>]*>/g, '').trim()
  
  // Intentar extraer puntos de lista si existen
  const bulletMatches = cleanText.match(/(?:^|\n)[•\-\*]\s*(.+?)(?=\n|$)/g)
  if (bulletMatches && bulletMatches.length >= 2) {
    return bulletMatches.slice(0, 3).map(b => b.replace(/^[•\-\*\s\n]+/, '').trim())
  }
  
  // Si no hay bullets, generar puntos genéricos basados en el nombre del programa
  const nameLower = programName.toLowerCase()
  if (nameLower.includes('python')) {
    return [
      'Fundamentos de programación',
      'Automatización y lógica aplicada',
      'Introducción al uso de datos y IA'
    ]
  }
  if (nameLower.includes('datos')) {
    return [
      'Análisis y visualización de datos con Power BI',
      'Modelado de datos y dashboards',
      'Toma de decisiones basada en datos'
    ]
  }
  if (nameLower.includes('javascript') || nameLower.includes('react') || nameLower.includes('web')) {
    return [
      'Lógica de programación',
      'Frameworks de frontend y backend',
      'Integración con Inteligencia Artificial'
    ]
  }
  if (nameLower.includes('diseño') || nameLower.includes('ui') || nameLower.includes('ux')) {
    return [
      'Diseño de interfaces y experiencia de usuario',
      'Herramientas profesionales del mercado',
      'Proyectos prácticos para tu portafolio'
    ]
  }
  if (nameLower.includes('inteligencia artificial') || nameLower.includes('ia') || nameLower.includes('ai')) {
    return [
      'Fundamentos de IA y Machine Learning',
      'Implementación de modelos prácticos',
      'Proyectos reales con datos del mundo real'
    ]
  }
  
  // Default genérico
  return [
    'Aprendizaje práctico y experiencial',
    'Proyectos reales desde el primer día',
    'Metodología orientada a resultados'
  ]
}

// Función helper para determinar "Para quién es"
const getTargetAudience = (program: Program): string => {
  const difficulty = program.difficulty?.toLowerCase() || ''
  
  if (difficulty.includes('beginner') || difficulty.includes('básico')) {
    return 'Para quienes quieren empezar desde cero'
  }
  if (difficulty.includes('intermediate') || difficulty.includes('intermedio')) {
    return 'Para quienes ya tienen bases y quieren profundizar'
  }
  if (difficulty.includes('advanced') || difficulty.includes('avanzado')) {
    return 'Para profesionales que buscan especializarse'
  }
  
  return 'Para quienes buscan formación práctica y actualizada'
}

// Componente de Card individual optimizado para conversión
export default function ProgramCardOptimized({ program, cohort }: ProgramCardProps) {
  const learningPoints = extractLearningPoints(program.description || '', program.name || '')
  // Usar audience del programa si existe, sino generar dinámicamente
  const targetAudience = program.audience || getTargetAudience(program)
  
  // Determinar tipo de programa y obtener estilos
  const programType = getProgramType(program)
  const styles = getCardStyles(programType)
  const badge = getProgramBadge(program)
  
  // Obtener slug o usar code como fallback
  const slug = program.slug || program.code?.toString() || ''
  
  if (!slug) return null
  
  return (
    <div className={styles.card}>
      {/* Imagen del programa con badge */}
      <div className="relative h-48 overflow-hidden bg-bg-secondary">
        <Image
          src={program.image || '/placeholder-course.jpg'}
          alt={program.name || 'Programa'}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className={`absolute inset-0 ${styles.imageOverlay}`} />
        
        {/* Badge del tipo de programa */}
        <div className="absolute top-3 right-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${styles.badge}`}>
            {badge.icon}
            <span>{badge.label}</span>
          </div>
        </div>
      </div>

      {/* Contenido de la card con fondo sutil según tipo */}
      <div className={`p-5 flex-1 flex flex-col ${styles.inner}`}>
        {/* Nombre del programa */}
        <h3 className="text-xl font-bold card-text-primary mb-2 line-clamp-2 leading-tight">
          {program.name}
        </h3>

        {/* Para quién es */}
        <p className="text-sm card-text-secondary font-medium mb-4">
          {targetAudience}
        </p>

        {/* Bullets de aprendizaje */}
        <ul className="space-y-2 mb-5 flex-1">
          {learningPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
              <span className="text-sm card-text-muted leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>

        {/* Info rápida */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 pb-4 border-b card-border-subtle text-xs card-text-muted">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-secondary" />
            <span className="font-medium">{cohort.modality || 'Presencial'}</span>
          </div>
          {cohort.schedule?.days && cohort.schedule.days.length > 0 && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-secondary" />
              <span className="font-medium">{cohort.schedule.days.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Micro-copy de urgencia */}
        <div className="mb-4">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Inicio: {cohort.start_date && new Date(cohort.start_date).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</span>
            </div>
            <p className="text-xs card-text-muted">Cupos limitados</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 mt-auto">
          <Link
            href={`/checkout?slug=${slug}&cohortId=${cohort.id}`}
            className="group flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 dark:bg-[#1E9FAE] dark:hover:bg-[#1A8F9D] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-secondary/30 dark:shadow-secondary/40 dark:hover:shadow-secondary/50 transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span>Pre-inscribirme</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          {/* Micro-copy de reducción de fricción */}
          <p className="text-[11px] card-text-muted opacity-70 text-center">
            Sin compromiso. Te contactamos para orientarte.
          </p>
          <Link
            href={`/programas-academicos/${slug}`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 card-text-primary font-medium rounded-lg border card-border-subtle hover:border-secondary/50 hover:bg-white/5 dark:hover:bg-white/5 transition-all duration-300"
          >
            <span>Ver detalles</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
