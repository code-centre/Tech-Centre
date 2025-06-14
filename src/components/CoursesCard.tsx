import React from 'react'
import { ClockIcon, User } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '../../utils/formatDate'
import { useEffect, useState } from 'react'

interface CourseCardProps {
  title: string
  description: string
  image: string
  level: string
  duration?: string
  instructor?: string
  heroImage?: string
  date?: string
  isShort?: boolean
  slug: string
}

export function CourseCard({
  title,
  description,
  image,
  level,
  duration,
  heroImage,
  instructor,
  date,
  isShort,
  slug,
}: CourseCardProps) {
  const [short, setShort] = useState(false)

  useEffect(() => {
    if (isShort) {
      setShort(true)
    }
  }, [isShort])
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
        {isShort && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-darkBlue to-blue-900 text-white text-xs font-bold px-4 py-1.5 rounded-full z-10 shadow-lg backdrop-blur-sm border border-white/10">
            CURSO ESPECIALIZADO
          </div>
        )}
        <div className="relative overflow-hidden">
          <Image
            src={image}
            width={500}
            height={300}
            alt={title}
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
        <div className="text-gray-300 mb-2 line-clamp-3 text-sm leading-relaxed">{HTMLReactParser(description)}</div>
        {!isShort && (
          <div className="flex items-center text-gray-300 text-sm">
            <div className="bg-zinc-800 p-1.5 rounded-full mr-2 shadow-inner border border-zinc-700/40">
              <ClockIcon className="h-3.5 w-3.5 text-blueApp" />
            </div>
            <span>{duration}</span>
          </div>
        )}
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
        <Link
          href={`/programas-academicos/${slug}`}
          className="mt-6 inline-flex items-center px-5 py-2.5 border border-blue-500/30 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blueApp to-blue-600 hover:from-blue-600 hover:to-blueApp shadow-lg shadow-blueApp/20 hover:shadow-blueApp/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"        >
          {isShort ? 'Ver curso especializado' : 'Ver diplomado'}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
