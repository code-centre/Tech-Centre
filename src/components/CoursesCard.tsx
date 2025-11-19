import React from 'react'
import { ClockIcon, User, Award, Calendar, ArrowRight } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '../../utils/formatDate'
import { useEffect, useState } from 'react'

interface EventFCA {
  id: string
  title?: string
  name?: string
  description?: string
  image?: string
  level?: string
  duration?: string
  instructor?: string
  heroImage?: string
  date?: string
  slug?: string
  status?: string
  type?: string
  [key: string]: any
}

interface CourseCardProps {
  title?: string
  description?: string
  image?: string
  level?: string
  duration?: string
  instructor?: string
  heroImage?: string
  date?: string
  isShort?: boolean
  slug?: string
  eventData?: EventFCA
  isDraft?: boolean
}

export function CourseCard({
  title: propTitle,
  description: propDescription,
  image: propImage,
  level: propLevel,
  duration: propDuration,
  heroImage: propHeroImage,
  instructor: propInstructor,
  date: propDate,
  isShort: propIsShort,
  slug: propSlug,
  eventData,
  isDraft: propIsDraft,
}: CourseCardProps) {
  const [short, setShort] = useState(false)
  
  const title = eventData?.title || eventData?.name || propTitle || '';
  const description = eventData?.description || propDescription || '';
  const image = eventData?.image || propImage || '';
  const level = eventData?.level || propLevel || 'BÁSICO';
  const duration = eventData?.duration || propDuration || '';
  const instructor = eventData?.instructor || propInstructor || '';
  const heroImage = eventData?.heroImage || propHeroImage || '';
  const date = eventData?.date || propDate || '';
  const slug = eventData?.slug || propSlug || '';
  const isShort = propIsShort || (eventData?.type === 'curso especializado');
  
  const isDraftStatus = propIsDraft || 
                        eventData?.isDraft || 
                        eventData?.status === 'draft' || 
                        eventData?.status === 'Borrador';

  useEffect(() => {
    if (isShort) {
      setShort(true)
    }
  }, [isShort])

  return (
    <div className="group relative bg-bgCard rounded-2xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700/70 transition-all duration-500 hover:shadow-2xl hover:shadow-blueApp/10 hover:-translate-y-2">
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image || '/placeholder.jpg'} 
          width={500}
          height={300}
          alt={title || 'Curso'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/40 to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 z-10">
          <div
            className={`${
              level === 'BÁSICO'
                ? 'bg-gradient-to-r from-blueApp to-blue-600'
                : level === 'INTERMEDIO'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600'
                : 'bg-gradient-to-r from-purple-500 to-purple-700'
            } text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-white/20`}
          >
            {level}
          </div>
          
          {isShort && (
            <div className="bg-gradient-to-r from-darkBlue to-blue-900 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
              ESPECIALIZADO
            </div>
          )}
        </div>

        {isDraftStatus && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-max bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg border border-amber-400/30 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            BORRADOR
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-7 space-y-5">
        {/* Title */}
        <h3 className="text-2xl font-bold text-white line-clamp-2 group-hover:text-blueApp transition-colors duration-300 leading-tight">
          {title}
        </h3>

        {/* Description */}
        <div className="text-gray-400 line-clamp-3 text-sm leading-relaxed">
          {typeof description === 'string' ? HTMLReactParser(description) : ''}
        </div>

        {/* Metadata */}
        <div className="flex flex-col gap-3 pt-2">
          {date && (
            <div className="flex items-center gap-3 text-gray-300 text-sm">
              <div className="flex items-center justify-center w-9 h-9 bg-zinc-800/60 rounded-lg border border-zinc-700/50 group-hover:bg-zinc-800 transition-colors">
                <Calendar className="h-4 w-4 text-blueApp" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Inicio</p>
                <p className="text-sm text-gray-300 font-semibold">{formatDate(date)}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <div className="flex items-center justify-center w-9 h-9 bg-zinc-800/60 rounded-lg border border-zinc-700/50 group-hover:bg-zinc-800 transition-colors">
              <ClockIcon className="h-4 w-4 text-blueApp" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Duración</p>
              <p className="text-sm text-gray-300 font-semibold">{duration}</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href={`/programas-academicos/${slug}`}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blueApp to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blueApp/25 hover:shadow-blueApp/40 transition-all duration-300 group/btn"
        >
          <span>{isShort ? 'Ver curso especializado' : 'Ver diplomado'}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}