'use client'

import React, { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@/lib/supabase'
import CardLoader from '@/components/loaders-skeletons/CardLoader'
import ProgramCardOptimized from '@/components/ProgramCardOptimized'
import type { Program } from '@/types/programs'
import type { Cohort } from '@/types/cohorts'

interface ProgramWithCohort {
  program: Program
  cohort: Cohort
}

interface ProgramWithCohorts {
  program: Program
  cohorts: Cohort[]
}

export default function AcademicOffer() {
  const supabase = useSupabaseClient()
  const { user } = useUser()
  const isAdmin = user?.role === 'admin'
  
  const [programsWithCohorts, setProgramsWithCohorts] = useState<ProgramWithCohorts[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProgramsWithCohorts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Obtener cohortes activas con sus programas usando inner join
        let query = supabase
          .from('cohorts')
          .select(`
            *,
            programs:program_id!inner (*)
          `)
          .eq('offering', true)
        
        // Si no es admin, solo mostrar programas activos
        if (!isAdmin) {
          query = query.eq('programs.is_active', true)
        }

        // Ordenar por fecha de inicio de la cohorte (más próximas primero)
        query = query.order('start_date', { ascending: true })

        const { data, error: queryError } = await query

        if (queryError) throw queryError
        
        // Transformar y agrupar: una tarjeta por programa con todas sus cohortes
        const transformedData: ProgramWithCohort[] = (data || [])
          .map((item: any) => {
            const cohort = item as Cohort
            const program = Array.isArray(item.programs) 
              ? item.programs[0] 
              : item.programs
            
            if (!program) return null
            
            // Filtrar programas activos si no es admin (por si acaso)
            if (!isAdmin && !(program as Program).is_active) {
              return null
            }
            
            return {
              program: program as Program,
              cohort
            }
          })
          .filter((item): item is ProgramWithCohort => item !== null)
        
        // Agrupar por program_id: una tarjeta por programa
        const groupedByProgram = new Map<number, ProgramWithCohorts>()
        transformedData.forEach(({ program, cohort }) => {
          const existing = groupedByProgram.get(program.id)
          if (existing) {
            existing.cohorts.push(cohort)
          } else {
            groupedByProgram.set(program.id, { program, cohorts: [cohort] })
          }
        })
        const result: ProgramWithCohorts[] = Array.from(groupedByProgram.values()).map(({ program, cohorts }) => ({
          program,
          cohorts: [...cohorts].sort((a, b) => 
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          )
        }))
        
        setProgramsWithCohorts(result)
      } catch (err) {
        console.error('Error cargando programas:', err)
        setError('Error al cargar los programas')
        setProgramsWithCohorts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProgramsWithCohorts()
  }, [isAdmin, supabase])

  return (
    <section id="programs" className="py-16 px-4 sm:px-6 bg-background grain-bg">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header de sección */}
        <header className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3">
            Encuentra tu programa
          </h2>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto">
            Formación práctica y presencial para construir tu futuro en tecnología
          </p>
        </header>

        {/* Grid de programas */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardLoader />
            <CardLoader />
            <CardLoader />
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-bg-card rounded-xl border border-border-color">
            <p className="text-text-muted">{error}</p>
          </div>
        ) : programsWithCohorts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programsWithCohorts.map(({ program, cohorts }) => (
              <ProgramCardOptimized 
                key={program.id} 
                program={program} 
                cohorts={cohorts}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-bg-card rounded-xl border border-border-color">
            <p className="text-text-muted">No hay programas disponibles actualmente.</p>
          </div>
        )}
      </div>
    </section>
  )
}
