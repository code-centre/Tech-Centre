import React from 'react'
import { ClockIcon, User, Award} from 'lucide-react'
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
  [key: string]: any // Para cualquier otra propiedad que pueda tener el objeto
}

interface CourseCardProps {
  title?: string
  subtitle?: string
  kind?: string
  description?: string
  image?: string
  level?: string
  duration?: string
  instructor?: string
  heroImage?: string
  date?: string
  slug?: string
  eventData?: EventFCA
  isActive?: boolean
}

export function CourseCardSupa({
  title: propTitle,
  subtitle: propSubtitle,
  kind: propKind,
  description: propDescription,
  image: propImage,
  level: propLevel,
  duration: propDuration,
  heroImage: propHeroImage,
  instructor: propInstructor,
  date: propDate,
  slug: propSlug,
  eventData,
  isActive: propIsActive,
}: CourseCardProps) {
  const [short, setShort] = useState(false)
  
  const title = eventData?.title || eventData?.name || propTitle || '';
  const subtitle = eventData?.subtitle || propSubtitle || '';
  const kind = eventData?.kind || propKind || '';
  const description = eventData?.description || propDescription || '';
  const image = eventData?.image || propImage || '';
  const level = eventData?.level || propLevel || 'BÁSICO';
  const duration = eventData?.duration || propDuration || '';
  const instructor = eventData?.instructor || propInstructor || '';
  const heroImage = eventData?.heroImage || propHeroImage || '';
  const date = eventData?.date || propDate || '';
  const slug = eventData?.slug || propSlug || '';
  

  const isActiveStatus = propIsActive || 
                        eventData?.isActive || 
                        eventData?.status === 'draft' || 
                        eventData?.status === 'Borrador';

  
  return (
    <div className="bg-bgCard rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-zinc-800/30 group">
      <div className="relative">
        <div
          className={`absolute top-4 left-4 ${level === 'BÁSICO'
              ? 'bg-gradient-to-r from-blueApp to-blue-600'
              : level === 'INTERMEDIO'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600'
                : 'bg-gradient-to-r from-blueApp to-blue-600'
            } text-white text-xs font-bold px-4 py-1.5 rounded-full z-10 shadow-lg backdrop-blur-sm border border-white/10`}
        >
          {level}
        </div>        
        {isActiveStatus && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-max bg-amber-600 text-white text-xs font-bold px-4 py-1.5 rounded-full z-10 shadow-lg backdrop-blur-sm border border-white/10 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            BORRADOR
          </div>
        )}
        <div className="relative overflow-hidden">
          <Image
            src={image} 
            width={500}
            height={300}
            alt={title || 'Curso'}
            className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Overlay gradient para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent opacity-60"></div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {date && (
          <div className="flex items-center text-gray-300 text-sm">
            <div className="bg-zinc-800 p-1.5 rounded-full mr-2 shadow-inner border border-zinc-700/40">
              <ClockIcon className="h-3.5 w-3.5 text-blueApp" />
            </div>
            {formatDate(date)}
          </div>
        )}        
        <h3 className="text-xl font-bold text-white mb-1 line-clamp-2 group-hover:text-blueApp transition-colors duration-300">{title}</h3>
        <h4 className="text-xl font-bold text-white mb-1 line-clamp-2 group-hover:text-blueApp transition-colors duration-300">{subtitle}</h4>
        <div className="text-gray-300 mb-2 line-clamp-3 text-sm leading-relaxed">
          tipo: {typeof kind === 'string' ? HTMLReactParser(kind) : ''}
        </div>
          <div className="flex items-center text-gray-300 text-sm">
            <div className="bg-zinc-800 p-1.5 rounded-full mr-2 shadow-inner border border-zinc-700/40">
              <ClockIcon className="h-3.5 w-3.5 text-blueApp" />
            </div>
            <span>{duration}</span>
          </div>
        {instructor && (
          <div className="border-t border-zinc-700/50 pt-4 mt-3">
            <div className="flex items-center">
              <div className="bg-zinc-800 p-2 rounded-lg shadow-inner border border-zinc-700/40">
                <User className="h-5 w-5 text-blueApp" />
              </div>
              <div className="ml-3">
                <div className="text-sm text-gray-400">Instructor:</div>
                <div className="font-medium text-white">{instructor}</div>
              </div>
            </div>
          </div>
        )}
        <div className="border-t border-zinc-700/50 pt-4 mt-3">
            <div className="flex items-center">
              <div className="bg-zinc-800 p-2 rounded-lg shadow-inner border border-zinc-700/40">
                <Award className="h-5 w-5 text-blueApp" />
              </div>
              <div className="ml-3">
                <div className="text-sm text-gray-400">Requisito de certificación:</div>
                <div className="font-medium text-white">Proyecto final</div>
              </div>
            </div>
          </div>
        <Link
          href={`/programas-academicos/${slug}`}
          className="mt-6 inline-flex items-center px-5 py-2.5 border border-blue-500/30 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blueApp to-blue-600 hover:from-blue-600 hover:to-blueApp shadow-lg shadow-blueApp/20 hover:shadow-blueApp/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"        >
          Ver Programa
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
