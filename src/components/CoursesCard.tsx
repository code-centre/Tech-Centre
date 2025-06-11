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
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <div
          className={`absolute top-4 left-4 ${level === 'BÁSICO'
              ? 'bg-blueApp'
              : level === 'INTERMEDIO'
                ? 'bg-yellow-500'
                : 'bg-blueApp'
            } text-white text-xs font-bold px-3 py-1 rounded-full z-10`}
        >
          {level}
        </div>
        {isShort && (
          <div className="absolute top-4 right-4 bg-darkBlue text-white text-xs font-bold px-3 py-1 rounded-full z-10">
            CURSO ESPECIALIZADO
          </div>
        )}
        <div className="relative overflow-hidden">
          <Image
            src={image}
            width={500}
            height={300}
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>
      </div>
      <div className="p-6">
        {date && (
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <ClockIcon className="h-4 w-4 mr-1" />
            {formatDate(date)}
          </div>
        )}
        <h3 className="text-xl font-bold text-black mb-2 line-clamp-2">{title}</h3>
        <p className="text-black mb-4 line-clamp-3">{HTMLReactParser(description)}</p>
        {!isShort && (
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{duration}</span>
          </div>
        )}
        {instructor && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <div className="text-sm text-gray-500">Instructor:</div>
                <div className="font-medium text-black">{instructor}</div>
              </div>
            </div>
          </div>
        )}
        <Link
          href={`/programas-academicos/${slug}`}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blueApp hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
        >
          {isShort ? 'Ver curso especializado' : 'Ver diplomado'}
        </Link>
      </div>
    </div>
  )
}
