'use client'

import React from 'react'
import CareerCard from './CareerCard'
import { BrainCircuit } from 'lucide-react'
import { careersData } from '@/data/careers'
import type { CareersSectionProps } from '@/types/careers'

export function CareersSection({ careers = careersData }: CareersSectionProps) {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Separador visual */}
        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-color"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-background px-4">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Header de la sección */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
              Carreras Tecnológicas
            </h2>
          </div>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Formación profunda y especializada para convertirte en un referente en las tecnologías más demandadas del mercado.
          </p>
        </div>

        {/* Grid de carreras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {careersData.map((career) => (
            <CareerCard key={career.slug} career={career} />
          ))}
        </div>

        {/* Mensaje si no hay carreras (para futuro) */}
        {careersData.length === 0 && (
          <div className="text-center py-12 bg-bg-card rounded-xl border border-border-color">
            <p className="text-text-muted">Próximamente nuevas carreras tecnológicas.</p>
          </div>
        )}
      </div>
    </section>
  )
}
