import React from 'react'
import { CourseCard } from './CoursesCard'

// Interfaces actualizadas que incluyen isDraft
interface Program {
  id: string
  name: string
  startDate?: string
  description?: string
  image?: string
  level?: string
  duration?: string
  teacher?: string[]
  slug: string
  status?: string
  isDraft?: boolean
  [key: string]: any
}

interface EventFCA {
  id: string
  title?: string
  description?: string
  heroImage?: string
  date?: string
  slug?: string
  status?: string
  type?: string
  isDraft?: boolean
  [key: string]: any
}

interface CourseListProps {
  diplomados: Program[]
  cursosCortos: EventFCA[]
  showHeader?: boolean
  backgroundColor?: string
}

export function CourseList({ diplomados, cursosCortos, showHeader = true }: CourseListProps) {
  return (
    <div id="cursos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Cursos diseñados para el mercado laboral actual
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Programas con enfoque práctico y orientados al aprendizaje
              experiencial, diseñados por expertos de la industria.
            </p>
          </div>
        )}
          {diplomados.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white   mb-6">Diplomados</h3>            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">              
              {diplomados.map((diplomado) => (
                <CourseCard
                  key={diplomado.id}
                  title={diplomado.name}
                  date={diplomado.startDate}
                  description={diplomado.description}
                  image={diplomado.image}
                  level={(diplomado.level || '').toString().toUpperCase()}
                  duration={diplomado.duration}
                  instructor={(diplomado.teacher || []).join(", ")}
                  slug={diplomado.slug}
                  isDraft={diplomado.isDraft}
                />
              ))}
            </div>
          </div>
        )}          <div>
            <h3 className="text-2xl font-bold text-white mb-6">
              Cursos especializados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">              
               {cursosCortos.length > 0 ? 
                 cursosCortos.map((curso) => (
                  <CourseCard
                    key={curso.id}
                    title={curso.title}
                    description={curso.description}
                    image={curso.heroImage}
                    level="BÁSICO"
                    date={curso.date}
                    isShort={true}
                    slug={curso.slug}
                    isDraft={curso.isDraft}
                  />
                )) : (
                  <div className="col-span-3 p-8 bg-slate-800/30 rounded-xl border border-slate-700 text-center">
                    <p className="text-gray-300 mb-4">No hay cursos especializados disponibles todavía.</p>
                  </div>
                )
               }
            </div>
          </div>
      </div>
    </div>
  )
}
