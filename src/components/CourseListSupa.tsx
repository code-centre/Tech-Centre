import React from 'react'
import { CourseCardSupa } from './CoursesCardSupa'

// Interfaz para los programas
export interface Program {
  id: number
  code: string
  name: string
  kind?: string
  difficulty?: string
  total_hours?: number
  default_price?: number
  is_active: boolean
  created_at: string
  updated_at: string
  image:string;
  description:string;
  video:string;
  subtitle:string;
  faqs:any[];
  slug?: string
  [key: string]: any
}

interface CourseListSupaProps {
  programs: Program[]
  showHeader?: boolean
  backgroundColor?: string
}

export function CourseListSupa({ 
  programs, 
  showHeader = true,
  backgroundColor = 'bg-background' 
}: CourseListSupaProps) {
  return (
    <div id="cursos" className={backgroundColor}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showHeader && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">
              Programas educativos
            </h2>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Enfoque práctico y orientados al aprendizaje experiencial, 
              diseñados por expertos de la industria.
            </p>
          </div>
        )}
        
        {programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border-2 border-yellow-500">
            {programs.map((program) => (
              <CourseCardSupa
                key={program.id}
                title={program.name}
                subtitle={program.subtitle}
                image={program.image}
                kind={program.kind}
                description={program.description}
                level={program.difficulty}
                duration={`${program.total_hours || 0} horas`}
                slug={program.slug || program.code.toString()}
                isActive={!program.is_active}
              />
            ))}
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