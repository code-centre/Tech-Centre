'use client'
import React, { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import ProgramCardOptimized from './ProgramCardOptimized'
import { GraduationCap, BookOpen, Award, ArrowRight } from 'lucide-react'
import { useSupabaseClient, useUser } from '@/lib/supabase'
import CardLoader from './loaders-skeletons/CardLoader'
import ProgramCreationModal from './ProgramCreationModal'
import type { Program, CourseListSupaProps } from '@/types/programs'
import type { Cohort } from '@/types/cohorts'

// Re-exportar Program para compatibilidad con código existente
export type { Program }

interface ProgramWithCohort {
  program: Program
  cohort: Cohort
}

/** Programa con todas sus cohortes activas agrupadas (1 tarjeta por programa) */
interface ProgramWithCohorts {
  program: Program
  cohorts: Cohort[]
}

// Función para obtener el nombre formateado del tipo
const getTypeLabel = (kind: string | undefined): string => {
  if (!kind) return 'Otros Programas'
  
  const kindLower = kind.toLowerCase().trim()
  
  if (kindLower.includes('diplomado')) return 'Diplomados'
  if (kindLower.includes('curso')) return 'Cursos cortos'
  
  // Capitalizar primera letra
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

// Función para obtener el icono según el tipo
const getTypeIcon = (kind: string | undefined) => {
  if (!kind) return <Award className="w-6 h-6" />
  
  const kindLower = kind.toLowerCase().trim()
  
  if (kindLower.includes('diplomado')) return <GraduationCap className="w-6 h-6" />
  if (kindLower.includes('curso')) return <BookOpen className="w-6 h-6" />
  
  return <Award className="w-6 h-6" />
}

// Función para obtener el horario según el tipo
const getTypeSchedule = (kind: string | undefined): string => {
  if (!kind) return ''
  
  const kindLower = kind.toLowerCase().trim()
  
  if (kindLower.includes('diplomado')) return 'Lunes a jueves 7pm a 9pm'
  if (kindLower.includes('curso')) return 'Sábados 9am y 2pm'
  
  return ''
}

// Función para obtener el subtítulo según el tipo
const getTypeSubtitle = (kind: string | undefined): string => {
  const kindLower = kind?.toLowerCase() || ''
  if (kindLower.includes('diplomado')) {
    return 'Para quienes quieren una formación más profunda, estructurada y con impacto profesional a mediano plazo.'
  }
  if (kindLower.includes('curso')) {
    return 'Para aprender rápido, probar una tecnología o dar el primer paso en el mundo tech.'
  }
  return ''
}

export function ProgramsList({ 
  programs: programsProp,
  backgroundColor = 'bg-background',
  showHeader = true,
  fetchPrograms = true, // Por defecto siempre hace fetch desde Supabase
  horizontalScroll = false // Si es true, muestra todos en una fila con scroll horizontal
}: CourseListSupaProps) {
  const supabase = useSupabaseClient()
  const [programsWithCohorts, setProgramsWithCohorts] = useState<ProgramWithCohorts[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  const isAdmin = user?.role === 'admin'

  // Siempre hacer fetch desde Supabase con cohortes
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
        // Ordenar cohortes por start_date dentro de cada programa
        const result: ProgramWithCohorts[] = Array.from(groupedByProgram.values()).map(({ program, cohorts }) => ({
          program,
          cohorts: [...cohorts].sort((a, b) => 
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          )
        }))
        
        setProgramsWithCohorts(result)
      } catch (err) {
        console.error('Error cargando programas desde Supabase:', err)
        setError('Error al cargar los programas')
        setProgramsWithCohorts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProgramsWithCohorts()
  }, [isAdmin, supabase])

  // Manejar la creación de nuevos programas - refrescar desde Supabase
  const handleProgramCreate = async (newProgram: Program) => {
    // Refrescar la lista desde Supabase para asegurar datos actualizados
    // Nota: El nuevo programa necesitará una cohorte para aparecer en la lista
    // Por ahora solo recargamos todo
    window.location.reload()
  }

  // Agrupar programas por tipo - DEBE estar antes de los early returns
  const groupedPrograms = useMemo(() => {
    const groups: { [key: string]: ProgramWithCohorts[] } = {}
    
    programsWithCohorts.forEach((item) => {
      const type = item.program.kind || 'otros'
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(item)
    })
    
    return groups
  }, [programsWithCohorts])

  // Ordenar los tipos (Cursos cortos primero, luego Diplomados, luego otros) - DEBE estar antes de los early returns
  const sortedTypes = useMemo(() => {
    return Object.keys(groupedPrograms).sort((a, b) => {
      const aLower = a.toLowerCase()
      const bLower = b.toLowerCase()
      
      if (aLower.includes('curso')) return -1
      if (bLower.includes('curso')) return 1
      if (aLower.includes('diplomado')) return -1
      if (bLower.includes('diplomado')) return 1
      
      return a.localeCompare(b)
    })
  }, [groupedPrograms])

  // No hacer early return para mantener el header visible durante la carga

  return (
    <section id="oferta-academica" className={`py-15 px-4 text-text-primary ${backgroundColor}`}>
      <div className="mx-auto">
        {/* Header opcional */}
        {showHeader && (
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg text-text-primary">
              Programas académicos
            </h2>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 drop-shadow-lg text-text-primary">
              para construir tu carrera en tecnología
            </h2>
            <p className="mx-auto text-xl text-text-muted">
              Elige el camino que mejor se adapta a tu nivel, tiempo y objetivos profesionales.
            </p>

            {isAdmin && (
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => setIsOpen(true)}
                  className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg 
                         hover:from-blue-500 hover:to-blue-400 transform hover:-translate-y-0.5 
                         transition-all duration-200 shadow-lg shadow-blue-700/30"
                >
                  Crear nuevo programa
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lista de programas */}
        <div id="cursos" className={backgroundColor}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Mostrar error si existe */}
            {error && fetchPrograms && (
              <div className="text-center py-12 bg-red-100 dark:bg-red-900/20 rounded-lg mb-8 border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-300">{error}</p>
              </div>
            )}
            
            {/* Mostrar loaders SOLO durante la carga */}
            {loading && fetchPrograms ? (
              horizontalScroll ? (
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                  <div className="shrink-0 w-[350px]">
                    <CardLoader />
                  </div>
                  <div className="shrink-0 w-[350px]">
                    <CardLoader />
                  </div>
                  <div className="shrink-0 w-[350px]">
                    <CardLoader />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <CardLoader />
                  <CardLoader />
                  <CardLoader />
                </div>
              )
            ) : programsWithCohorts.length > 0 ? (
              horizontalScroll ? (
                <>
                  {/* Modo scroll horizontal: todos los programas activos en una fila */}
                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {programsWithCohorts
                      .filter(item => item.program.is_active) // Solo programas activos
                      .map(({ program, cohorts }) => (
                        <div key={program.id} className="shrink-0 w-[350px]">
                          <ProgramCardOptimized
                            program={program}
                            cohorts={cohorts}
                          />
                        </div>
                      ))}
                  </div>
                  {/* Botón "Ver todos los programas" debajo del scroll */}
                  <div className="flex justify-center mt-6">
                    <Link
                      href="/programas-academicos"
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-bg-card hover:bg-bg-secondary border border-border-color hover:border-secondary/50 rounded-lg text-text-primary font-medium transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20"
                    >
                      <span>Ver todos los programas</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </>
              ) : (
                // Modo agrupado por tipo (comportamiento original)
                <div className="space-y-16">
                  {sortedTypes.map((type, typeIndex) => {
                    const typePrograms = groupedPrograms[type]
                    const typeLabel = getTypeLabel(type)
                    const typeIcon = getTypeIcon(type)
                    const typeSchedule = getTypeSchedule(type)
                    
                    return (
                      <div key={type} className="space-y-8">
                        {/* Separador y título de sección */}
                        {typeIndex > 0 && (
                          <div className="relative my-12">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-border-color"></div>
                            </div>
                            <div className="relative flex justify-center">
                              <div className="bg-background px-4">
                                <div className="h-1 w-24 bg-linear-to-r from-transparent via-secondary to-transparent"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Título de la sección */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-secondary/20 to-secondary/10 border border-secondary/30 text-secondary">
                            {typeIcon}
                          </div>
                          <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-text-primary">
                              {typeLabel}
                            </h3>
                            {typeSchedule && (
                              <p className="text-sm text-text-muted mt-1 font-medium">
                                {typeSchedule}
                              </p>
                            )}
                            {getTypeSubtitle(type) && (
                              <p className="text-base text-text-muted mt-2 font-medium max-w-2xl">
                                {getTypeSubtitle(type)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Grid de tarjetas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {typePrograms.map(({ program, cohorts }) => (
                            <ProgramCardOptimized
                              key={program.id}
                              program={program}
                              cohorts={cohorts}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              // Solo mostrar mensaje si NO está cargando
              !loading && (
                <div className="text-center py-12 bg-slate-800/30 dark:bg-slate-800/30 rounded-xl border border-slate-700 dark:border-slate-700">
                  <p className="text-gray-300 dark:text-gray-300">No hay programas disponibles actualmente.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear nuevo programa */}
      {isAdmin && (
        <ProgramCreationModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onProgramCreate={handleProgramCreate}
        />
      )}
    </section>
  )
}