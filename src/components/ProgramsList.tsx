import React, { useMemo } from 'react'
import { CourseCardSupa } from './CoursesCardSupa'
import { GraduationCap, BookOpen, Award } from 'lucide-react'
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
  programs, 
  backgroundColor = 'bg-background' 
}: CourseListSupaProps) {
  // Agrupar programas por tipo
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

  // Ordenar los tipos (Diplomados primero, luego Cursos, luego otros)
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

  return (
    <div id="cursos" className={backgroundColor}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">        
        {programs.length > 0 ? (
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
                          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-blueApp to-transparent"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Título de la sección */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blueApp/20 to-blueApp/10 border border-blueApp/30 text-blueApp">
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
                      <CourseCardSupa
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
        ) : (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700">
            <p className="text-gray-300">No hay programas disponibles actualmente.</p>
          </div>
        )}
      </div>
    </div>
  )
}