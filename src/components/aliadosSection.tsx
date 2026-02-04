'use client'
import React from 'react'
import Image from 'next/image'
import sponsorsData from '../../data/aliados.json'
import { useTheme } from '@/contexts/ThemeContext'

export const AliadosSection = () => {
  const { theme } = useTheme()
  const allies = sponsorsData.allies

  // Función para obtener el logo según el tema
  const getLogo = (ally: { name: string; logo: string }) => {
    // En light mode, usar logos negros para FCA, Caribe Ventures y 51 Labs
    if (theme === 'light') {
      if (ally.name === 'FCA') {
        return '/logos/fca-black.png'
      }
      if (ally.name === 'Caribe Ventures') {
        return '/logos/caribe-ventures-black.png'
      }
      if (ally.name === '51 Labs') {
        return '/logos/five-one-labs-black.webp'
      }
    }
    // En dark mode o para otros aliados, usar el logo original
    return ally.logo
  }

  return (
    <section className="w-full px-6 md:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="py-16 mt-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <h3 className="text-4xl font-bold text-secondary">
                Aliados que confían en el talento del Caribe
              </h3>
            </div>
            <div className="w-64 h-0.5 bg-linear-to-r from-transparent via-border-color to-transparent mx-auto"></div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-10">
            {allies.map((ally, index) => (
              <div 
                key={index} 
                className="p-5 rounded-lg items-center flex justify-center hover:bg-white/5 dark:hover:bg-white/5 transition-colors duration-300 border border-transparent hover:border-border-color/50"
              >
                <Image 
                  src={getLogo(ally)} 
                  alt={ally.name} 
                  width={100} 
                  height={100}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
