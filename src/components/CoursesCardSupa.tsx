import React from 'react'
import { ClockIcon, User, Award, BookOpen, TrendingUp, Sparkles, Calendar, Clock} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import HTMLReactParser from 'html-react-parser/lib/index'
import { formatDate } from '../../utils/formatDate'
import type { CourseCardProps } from '@/types/programs'

export function CourseCardSupa({
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
}: CourseCardProps) {
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
      <div className="bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl shadow-xl overflow-hidden transition-all duration-500 h-full flex flex-col relative border border-zinc-700/50 hover:border-blueApp/70 hover:shadow-2xl hover:shadow-blueApp/40 hover:-translate-y-3 hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:rounded-2xl before:bg-linear-to-br before:from-blueApp/0 before:via-blueApp/0 before:to-blueApp/0 hover:before:from-blueApp/10 hover:before:via-blueApp/5 hover:before:to-blueApp/10 before:transition-all before:duration-500 before:pointer-events-none">
        {/* Image Section - Optimizada sin elementos encima */}
        <div className="relative h-64 overflow-hidden bg-zinc-800">
          <Image
            src={image || '/placeholder-course.jpg'} 
            width={500}
            height={400}
            alt={title || 'Curso'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
            priority={false}
          />
          {/* Gradient Overlay sutil solo en la parte inferior */}
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900/80 via-transparent to-transparent group-hover:from-zinc-900/90 transition-all duration-500"></div>
          {/* Hover glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br from-blueApp/10 via-transparent to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Title Section */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blueApp transition-all duration-300 leading-tight group-hover:translate-x-1">
              {title}
            </h3>
            {subtitle && (
              <h4 className="text-lg font-semibold text-gray-300 mb-3 line-clamp-2 leading-snug group-hover:text-gray-200 transition-colors duration-300">
                {subtitle}
              </h4>
            )}
          </div>

          {/* Description */}
          {truncatedDescription && (
            <div className="text-gray-400 text-sm leading-relaxed mb-4 flex-1 overflow-hidden">
              <div className="line-clamp-3 prose prose-invert prose-sm max-w-none prose-p:text-gray-400 prose-p:text-sm prose-p:my-0 prose-p:leading-relaxed prose-strong:text-white prose-strong:font-semibold prose-ul:text-gray-400 prose-li:text-gray-400 prose-a:text-blueApp prose-a:no-underline hover:prose-a:underline">
                {typeof truncatedDescription === 'string' && truncatedDescription.includes('<') 
                  ? HTMLReactParser(truncatedDescription)
                  : <p>{truncatedDescription}</p>
                }
              </div>
            </div>
          )}

          {/* Metadata Grid - Incluye nivel, tipo, duración, horario y fecha */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Nivel */}
            <div className={`bg-zinc-800/60 backdrop-blur-sm rounded-lg p-3 border border-zinc-700/50 hover:border-blueApp/30 transition-colors ${
              level === 'BÁSICO'
                ? 'border-emerald-500/30'
                : level === 'INTERMEDIO'
                  ? 'border-amber-500/30'
                  : level === 'AVANZADO'
                    ? 'border-red-500/30'
                    : ''
            }`}>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  level === 'BÁSICO'
                    ? 'bg-emerald-500/20'
                    : level === 'INTERMEDIO'
                      ? 'bg-amber-500/20'
                      : level === 'AVANZADO'
                        ? 'bg-red-500/20'
                        : 'bg-blueApp/20'
                }`}>
                  <TrendingUp className={`h-4 w-4 ${
                    level === 'BÁSICO'
                      ? 'text-emerald-400'
                      : level === 'INTERMEDIO'
                        ? 'text-amber-400'
                        : level === 'AVANZADO'
                          ? 'text-red-400'
                          : 'text-blueApp'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400">Nivel</div>
                  <div className="text-sm font-semibold text-white truncate">{level}</div>
                </div>
              </div>
            </div>

            {/* Tipo */}
            {kind && (
              <div className="bg-zinc-800/60 backdrop-blur-sm rounded-lg p-3 border border-zinc-700/50 hover:border-blueApp/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="bg-blueApp/20 p-1.5 rounded-lg">
                    <BookOpen className="h-4 w-4 text-blueApp" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400">Tipo</div>
                    <div className="text-sm font-semibold text-white truncate">
                      {typeof kind === 'string' ? kind.replace(/<[^>]*>/g, '').substring(0, 15) : kind}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Duración */}
            {duration && (
              <div className="bg-zinc-800/60 backdrop-blur-sm rounded-lg p-3 border border-zinc-700/50 hover:border-blueApp/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="bg-blueApp/20 p-1.5 rounded-lg">
                    <ClockIcon className="h-4 w-4 text-blueApp" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400">Duración</div>
                    <div className="text-sm font-semibold text-white truncate">{duration}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Horario */}
            {schedule && (
              <div className="bg-zinc-800/60 backdrop-blur-sm rounded-lg p-3 border border-zinc-700/50 hover:border-blueApp/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-500/20 p-1.5 rounded-lg">
                    <Clock className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400">Horario</div>
                    <div className="text-sm font-semibold text-white truncate">{schedule}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Fecha de inicio */}
            {date && (
              <div className="bg-zinc-800/60 backdrop-blur-sm rounded-lg p-3 border border-zinc-700/50 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400">Inicio</div>
                    <div className="text-sm font-semibold text-white truncate">{formatDate(date)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Estado Borrador */}
            {isActiveStatus && (
              <div className="bg-zinc-800/60 backdrop-blur-sm rounded-lg p-3 border border-amber-500/30 hover:border-amber-500/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-500/20 p-1.5 rounded-lg">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400">Estado</div>
                    <div className="text-sm font-semibold text-amber-300">Borrador</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructor Section */}
          {instructor && (
            <div className="bg-zinc-800/40 rounded-lg p-3 mb-4 border border-zinc-700/30">
              <div className="flex items-center gap-3">
                <div className="bg-blueApp/20 p-2 rounded-lg">
                  <User className="h-5 w-5 text-blueApp" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-0.5">Instructor</div>
                  <div className="text-sm font-semibold text-white truncate">{instructor}</div>
                </div>
              </div>
            </div>
          )}

          {/* Certification Badge */}
          <div className="bg-linear-to-r from-purple-500/20 to-blueApp/20 rounded-lg p-3 mb-4 border border-purple-500/30 group-hover:border-purple-400/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/30 p-2 rounded-lg group-hover:bg-purple-500/40 transition-colors">
                <Award className="h-5 w-5 text-purple-300 group-hover:text-purple-200 transition-colors" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-purple-300 font-semibold mb-0.5 group-hover:text-purple-200 transition-colors">Certificación incluida</div>
                <div className="text-sm text-white">Proyecto final requerido</div>
              </div>
            </div>
          </div>

          {/* Hover Indicator - Arrow */}
          <div className="mt-auto pt-4 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 text-blueApp font-semibold text-sm">
              <span>Ver detalles</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
