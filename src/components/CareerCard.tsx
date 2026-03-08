'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Users, ArrowRight, CheckCircle2, BrainCircuit, Clock, Award } from 'lucide-react'

interface CareerCardProps {
  career: {
    name: string
    slug: string
    duration: string
    level: string
    modality: string
    description: string
    image?: string
    learningPoints: string[]
    targetAudience: string
    nextStartDate?: string
  }
}

// Estilos de card para carreras
const getCareerCardStyles = () => {
  const baseStyles = 'rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full'
  
  return {
    card: `${baseStyles} [background-color:var(--card-career-bg)] [border-color:var(--card-career-border)] hover:border-secondary/60 hover:shadow-secondary/25`,
    badge: 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border-purple-500/40 dark:from-purple-600/20 dark:to-blue-600/20 dark:text-purple-300 dark:border-purple-500/40',
    imageOverlay: 'bg-linear-to-t from-transparent via-transparent to-[var(--card-career-bg)]/40'
  }
}

export default function CareerCard({ career }: CareerCardProps) {
  const styles = getCareerCardStyles()
  
  return (
    <div className={styles.card}>
      {/* Imagen de la carrera con badge */}
      <div className="relative h-48 overflow-hidden bg-bg-secondary">
        <Image
          src={`/courses/iaengineerpics.png`}
          alt={career.name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className={`absolute inset-0 ${styles.imageOverlay}`} />
        
        {/* Badge de carrera */}
        <div className="absolute top-3 right-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${styles.badge}`}>
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>Carrera</span>
          </div>
        </div>
      </div>

      {/* Contenido de la card */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Nombre de la carrera */}
        <h3 className="text-xl font-bold card-text-primary mb-2 line-clamp-2 leading-tight">
          {career.name}
        </h3>

        {/* Para quién es */}
        <p className="text-sm card-text-secondary font-medium mb-4">
          {career.targetAudience}
        </p>

        {/* Bullets de aprendizaje */}
        <ul className="space-y-2 mb-5 flex-1">
          {career.learningPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
              <span className="text-sm card-text-muted leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>

        {/* Info rápida */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 pb-4 border-b card-border-subtle text-xs card-text-muted">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-secondary" />
            <span className="font-medium">{career.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-secondary" />
            <span className="font-medium">{career.level}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-secondary" />
            <span className="font-medium">{career.modality}</span>
          </div>
        </div>

        {/* Micro-copy de urgencia */}
        <div className="mb-4">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                {career.nextStartDate ? `Inicio: ${career.nextStartDate}` : 'Próximo inicio próximamente'}
              </span>
            </div>
            <p className="text-xs card-text-muted">Cupos limitados</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 mt-auto">
          <Link
            href={`/programas-academicos/carreras/${career.slug}`}
            className="group flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 dark:shadow-purple-500/40 dark:hover:shadow-purple-500/50 transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span>Explorar carrera</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
