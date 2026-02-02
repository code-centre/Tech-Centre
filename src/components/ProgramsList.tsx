'use client'
import React, { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { ProgramCard } from './ProgramCard'
import { GraduationCap, BookOpen, Award, ArrowRight } from 'lucide-react'
import { useSupabaseClient, useUser } from '@/lib/supabase'
import CardLoader from './loaders-skeletons/CardLoader'
import ProgramCreationModal from './ProgramCreationModal'
import type { Program, CourseListSupaProps } from '@/types/programs'

// Re-exportar Program para compatibilidad con código existente
export type { Program }

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

export function ProgramsList({ 
  programs: programsProp,
  backgroundColor = 'bg-background',
  showHeader = true,
  fetchPrograms = true, // Por defecto siempre hace fetch desde Supabase
  horizontalScroll = false // Si es true, muestra todos en una fila con scroll horizontal
}: CourseListSupaProps) {
  const supabase = useSupabaseClient()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  const isAdmin = user?.role === 'admin'

  // Siempre hacer fetch desde Supabase
  useEffect(() => {
    const fetchProgramsData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let query = supabase
          .from('programs')
          .select('*')
        
        // Si no es admin, solo mostrar programas activos
        if (!isAdmin) {
          query = query.eq('is_active', true)
        }

        // Ordenar por fecha de creación (más recientes primero)
        query = query.order('created_at', { ascending: false })

        const { data, error: queryError } = await query

        if (queryError) throw queryError
        
        // Siempre usar los datos de Supabase
        setPrograms(data || [])
      } catch (err) {
        console.error('Error cargando programas desde Supabase:', err)
        setError('Error al cargar los programas')
        // En caso de error, usar programas prop si están disponibles como fallback
        if (programsProp && programsProp.length > 0) {
          setPrograms(programsProp)
        } else {
          setPrograms([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProgramsData()
  }, [isAdmin, supabase]) // Solo depende de isAdmin para refrescar cuando cambia el rol

  // Manejar la creación de nuevos programas - refrescar desde Supabase
  const handleProgramCreate = async (newProgram: Program) => {
    // Refrescar la lista desde Supabase para asegurar datos actualizados
    try {
      let query = supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!isAdmin) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query
      
      if (!error && data) {
        setPrograms(data)
      } else {
        // Fallback: agregar el nuevo programa manualmente
        setPrograms(prev => [newProgram, ...prev])
      }
    } catch (err) {
      console.error('Error al refrescar programas:', err)
      // Fallback: agregar el nuevo programa manualmente
      setPrograms(prev => [newProgram, ...prev])
    }
  }

  // Agrupar programas por tipo - DEBE estar antes de los early returns
  const groupedPrograms = useMemo(() => {
    const groups: { [key: string]: Program[] } = {}
    
    programs.forEach((program) => {
      const type = program.kind || 'otros'
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(program)
    })
    
    return groups
  }, [programs])

  // Ordenar los tipos (Diplomados primero, luego Cursos, luego otros) - DEBE estar antes de los early returns
  const sortedTypes = useMemo(() => {
    return Object.keys(groupedPrograms).sort((a, b) => {
      const aLower = a.toLowerCase()
      const bLower = b.toLowerCase()
      
      if (aLower.includes('diplomado')) return -1
      if (bLower.includes('diplomado')) return 1
      if (aLower.includes('curso')) return -1
      if (bLower.includes('curso')) return 1
      
      return a.localeCompare(b)
    })
  }, [groupedPrograms])

  // No hacer early return para mantener el header visible durante la carga

  return (
    <section id="oferta-academica" className={`py-15 px-4 text-white ${backgroundColor}`}>
      <div className="mx-auto">
        {/* Header opcional */}
        {showHeader && (
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
              Programas académicos
            </h2>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 drop-shadow-lg">
              para el mercado laboral actual
            </h2>
            <p className="mx-auto text-xl">
              Enfoque práctico y orientados al aprendizaje experiencial, diseñados por profesionales de la industria.
            </p>

            {isAdmin && (
              <div className="mt-6 flex justify-center gap-4 text-white">
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
              <div className="text-center py-12 bg-red-100 rounded-lg mb-8">
                <p className="text-red-600">{error}</p>
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
            ) : programs.length > 0 ? (
              horizontalScroll ? (
                <>
                  {/* Modo scroll horizontal: todos los programas activos en una fila */}
                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {programs
                      .filter(program => program.is_active) // Solo programas activos
                      .map((program) => {
                        const typeSchedule = getTypeSchedule(program.kind)
                        return (
                          <div key={program.id} className="shrink-0 w-[350px]">
                            <ProgramCard
                              title={program.name}
                              subtitle={program.subtitle}
                              image={program.image}
                              kind={program.kind}
                              description={program.description}
                              level={program.difficulty}
                              duration={program.total_hours ? `${program.total_hours} horas` : program.duration || ''}
                              schedule={program.schedule || typeSchedule}
                              slug={program.slug || program.code.toString()}
                              isActive={!program.is_active}
                            />
                          </div>
                        )
                      })}
                  </div>
                  {/* Botón "Ver todos los programas" debajo del scroll */}
                  <div className="flex justify-center mt-6">
                    <Link
                      href="/programas-academicos"
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-secondary/50 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20"
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
                              <div className="w-full border-t border-zinc-700/50"></div>
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
                            <h3 className="text-2xl md:text-3xl font-bold text-white">
                              {typeLabel}
                            </h3>
                            {typeSchedule && (
                              <p className="text-sm text-gray-400 mt-1 font-medium">
                                {typeSchedule}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Grid de tarjetas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {typePrograms.map((program) => (
                            <ProgramCard
                              key={program.id}
                              title={program.name}
                              subtitle={program.subtitle}
                              image={program.image}
                              kind={program.kind}
                              description={program.description}
                              level={program.difficulty}
                              duration={`${program.duration}`}
                              schedule={program.schedule || typeSchedule}
                              slug={program.slug || program.code.toString()}
                              isActive={!program.is_active}
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
                <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700">
                  <p className="text-gray-300">No hay programas disponibles actualmente.</p>
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