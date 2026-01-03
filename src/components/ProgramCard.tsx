import React from 'react'
import { ClockIcon, User, Award, BookOpen, TrendingUp, Sparkles, Calendar, Clock} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import HTMLReactParser from 'html-react-parser/lib/index'
import { formatDate } from '../../utils/formatDate'
import type { ProgramCardProps } from '@/types/programs'

export function ProgramCard({
  title: propTitle,
  subtitle: propSubtitle,
  kind: propKind,
  description: propDescription,
  image: propImage,
  level: propLevel,
  duration: propDuration,
  schedule: propSchedule,
  heroImage: propHeroImage,
  instructor: propInstructor,
  date: propDate,
  slug: propSlug,
  eventData,
  isActive: propIsActive,
}: ProgramCardProps) {
  const title = eventData?.title || eventData?.name || propTitle || '';
  const subtitle = eventData?.subtitle || propSubtitle || '';
  const kind = eventData?.kind || propKind || '';
  const description = eventData?.description || propDescription || '';
  const image = eventData?.image || propImage || '';
  const level = eventData?.level || propLevel || 'BÁSICO';
  const duration = eventData?.duration || propDuration || '';
  const schedule = eventData?.schedule || propSchedule || '';
  const instructor = eventData?.instructor || propInstructor || '';
  const heroImage = eventData?.heroImage || propHeroImage || '';
  const date = eventData?.date || propDate || '';
  const slug = eventData?.slug || propSlug || '';
  

  const isActiveStatus = propIsActive || 
                        eventData?.isActive || 
                        eventData?.status === 'draft' || 
                        eventData?.status === 'Borrador';

  
  // Truncar descripción para mantener consistencia (solo para preview, el HTML se renderiza completo)
  const truncatedDescription = description || '';

  // Si no hay slug, no renderizar el link
  if (!slug) {
    return null;
  }

  return (
    <Link 
      href={`/programas-academicos/${slug}`}
      className="block group h-full cursor-pointer"
    >
      <div className="bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300 h-full flex flex-col relative border border-zinc-700/50 hover:border-blueApp/50 hover:shadow-xl hover:shadow-blueApp/20 hover:-translate-y-1 active:scale-[0.98]">
        {/* Image Section - Limpia sin elementos encima */}
        <div className="relative h-48 overflow-hidden bg-zinc-800">
          <Image
            src={image || '/placeholder-course.jpg'} 
            width={500}
            height={300}
            alt={title || 'Curso'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
          {/* Gradient Overlay sutil */}
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900/60 via-transparent to-transparent"></div>
        </div>

        {/* Content Section - Más compacta */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title Section */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-blueApp transition-colors duration-300 leading-tight">
              {title}
            </h3>
            {subtitle && (
              <h4 className="text-sm font-medium text-gray-400 line-clamp-1 group-hover:text-gray-300 transition-colors duration-300">
                {subtitle}
              </h4>
            )}
          </div>

          {/* Description compacta */}
          {truncatedDescription && (
            <div className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">
              {typeof truncatedDescription === 'string' 
                ? truncatedDescription.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                : truncatedDescription.substring(0, 100) + '...'
              }
            </div>
          )}

          {/* Badges de nivel, tipo y estado */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Nivel badge */}
            <div className={`text-xs font-bold px-2 py-1 rounded-md border ${
              level === 'BÁSICO'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : level === 'INTERMEDIO'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : level === 'AVANZADO'
                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                    : 'bg-blueApp/20 text-blueApp border-blueApp/30'
            }`}>
              {level}
            </div>
            {/* Tipo badge */}
            {kind && (
              <div className="bg-blueApp/20 text-blueApp text-xs font-semibold px-2 py-1 rounded-md border border-blueApp/30">
                {typeof kind === 'string' ? kind.replace(/<[^>]*>/g, '').substring(0, 15) : kind}
              </div>
            )}
            {/* Estado Borrador */}
            {isActiveStatus && (
              <div className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2 py-1 rounded-md border border-amber-500/30">
                BORRADOR
              </div>
            )}
          </div>

          {/* Metadata compacta en una línea horizontal */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Duración */}
            {duration && (
              <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-md px-2 py-1 border border-zinc-700/50">
                <ClockIcon className="h-3.5 w-3.5 text-blueApp" />
                <span className="text-xs text-gray-300 font-medium">{duration}</span>
              </div>
            )}
            
            {/* Horario */}
            {schedule && (
              <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-md px-2 py-1 border border-zinc-700/50">
                <Clock className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-xs text-gray-300 font-medium">{schedule}</span>
              </div>
            )}
            
            {/* Fecha de inicio */}
            {date && (
              <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-md px-2 py-1 border border-zinc-700/50">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-gray-300 font-medium">{formatDate(date)}</span>
              </div>
            )}
          </div>

          {/* Footer con certificación e indicador */}
          <div className="mt-auto pt-3 border-t border-zinc-700/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-gray-400">Certificación incluida</span>
            </div>
            <div className="flex items-center gap-1 text-blueApp opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-semibold">Ver más</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
