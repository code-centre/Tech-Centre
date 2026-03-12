'use client'

import React, { useEffect, useState } from 'react'
import CareerCard from './CareerCard'
import { BrainCircuit, Loader2 } from 'lucide-react'
import { useSupabaseClient } from '@/lib/supabase'
import type { Career } from '@/types/careers'

export function CareersSection() {
  const supabase = useSupabaseClient()
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCareers() {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setCareers(data as Career[])
      }
      setLoading(false)
    }
    fetchCareers()
  }, [supabase])

  if (loading) {
    return (
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      </section>
    )
  }

  if (careers.length === 0) {
    return null
  }

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-color"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-background px-4">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>
            </div>
          </div>
        </div>

        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
              Carreras Tecnológicas
            </h2>
          </div>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Formación profunda y especializada para convertirte en un referente en las tecnologías más demandadas del mercado.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {careers.map((career) => (
            <CareerCard key={career.slug} career={career} />
          ))}
        </div>
      </div>
    </section>
  )
}
