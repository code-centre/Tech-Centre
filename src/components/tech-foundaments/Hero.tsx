import React from 'react'
import { CalendarIcon, EditIcon } from 'lucide-react'
import Image from 'next/image'

interface Props {
  title: string
  subtitle: string
  date: string
  heroImage: string
}

export function Hero({ title, subtitle, date, heroImage }: Props) {
  return (
    <section className="relative w-full min-h-[350px] lg:min-h-[420px] flex items-stretch overflow-hidden rounded-xl mb-8">
      {/* BG image */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
        }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full w-full lg:w-1/2 px-6 py-10">
        <div className="inline-flex items-center rounded-lg px-4 py-2 mb-8 bg-[#151e2e]/90">
          <CalendarIcon className="w-5 h-5 mr-2 text-white" />
          <span className="text-sm text-white font-medium">
            {new Date(date).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <button className="ml-2 bg-blue-600 p-1 rounded">
            <EditIcon className="w-4 h-4 text-white" />
          </button>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
          {title}
        </h1>
        <h2 className="text-2xl md:text-3xl font-medium text-white mb-4 drop-shadow">
          {subtitle}
        </h2>
      </div>
    </section>
  )
}