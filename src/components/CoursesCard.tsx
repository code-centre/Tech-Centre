import React from 'react'
import { ClockIcon, Award, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '../../utils/formatDate'

interface CourseCardProps {
  title: string
  description?: string
  image?: string
  heroImage?: string
  level?: string
  duration?: string
  instructor?: string
  date?: string
  slug: string
  isShort?: boolean
}

export function CourseCard({
  title,
  description,
  image,
  heroImage,
  level = 'BÁSICO',
  duration,
  instructor,
  date,
  slug,
  isShort = false,
}: CourseCardProps) {
  const displayImage = image || heroImage || '/placeholder-course.jpg'
  const truncatedDescription = description 
    ? (typeof description === 'string' 
        ? description.replace(/<[^>]*>/g, '').substring(0, isShort ? 100 : 200) + '...'
        : '')
    : ''

  return (
    <Link 
      href={`/programas-academicos/${slug}`}
      className="block group h-full cursor-pointer"
    >
      <div className="bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300 h-full flex flex-col relative border border-zinc-700/50 hover:border-zuccini/50 hover:shadow-xl hover:shadow-zuccini/20 hover:-translate-y-1 active:scale-[0.98]">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-zinc-800">
          <Image
            src={displayImage}
            width={500}
            height={300}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900/60 via-transparent to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title Section */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-zuccini transition-colors duration-300 leading-tight">
              {title}
            </h3>
          </div>

          {/* Description */}
          {truncatedDescription && (
            <div className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-4">
              {truncatedDescription}
            </div>
          )}

          {/* Level badge */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className={`text-xs font-bold px-2 py-1 rounded-md border ${
              level === 'BÁSICO'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : level === 'INTERMEDIO'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : level === 'AVANZADO'
                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                    : 'bg-zuccini/20 text-zuccini border-zuccini/30'
            }`}>
              {level}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {duration && (
              <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-md px-2 py-1 border border-zinc-700/50">
                <ClockIcon className="h-3.5 w-3.5 text-zuccini" />
                <span className="text-xs text-gray-300 font-medium">{duration}</span>
              </div>
            )}
            
            {date && (
              <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-md px-2 py-1 border border-zinc-700/50">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-gray-300 font-medium">{formatDate(date)}</span>
              </div>
            )}

            {instructor && (
              <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded-md px-2 py-1 border border-zinc-700/50">
                <span className="text-xs text-gray-300 font-medium">{instructor}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-zinc-700/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-gray-400">Certificación incluida</span>
            </div>
            <div className="flex items-center gap-1 text-zuccini opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
