'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { GraduationCap } from 'lucide-react'
import { useSupabaseClient } from '@/lib/supabase'

interface Instructor {
  user_id: string
  first_name: string
  last_name: string
  profile_image?: string
  professional_title?: string
}

interface ProfessorWelcomeProps {
  cohortId: number | null
  programName?: string
  welcomeMessage?: string
}

export function ProfessorWelcome({ 
  cohortId, 
  programName,
  welcomeMessage 
}: ProfessorWelcomeProps) {
  const supabase = useSupabaseClient()
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (cohortId) {
      fetchInstructor()
    } else {
      setLoading(false)
    }
  }, [cohortId, supabase])

  const fetchInstructor = async () => {
    if (!cohortId) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cohort_instructors')
        .select(`
          instructor_id,
          profiles:instructor_id (
            user_id,
            first_name,
            last_name,
            profile_image,
            professional_title
          )
        `)
        .eq('cohort_id', cohortId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching instructor:', error)
        return
      }

      if ((data as any)?.profiles) {
        // profiles puede ser un objeto o un array, normalizamos
        const profileData = Array.isArray((data as any).profiles) 
          ? (data as any).profiles[0] 
          : (data as any).profiles
        
        if (profileData) {
          setInstructor({
            user_id: profileData.user_id,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            profile_image: profileData.profile_image,
            professional_title: profileData.professional_title
          })
        } else {
          setInstructor(null)
        }
      } else {
        setInstructor(null)
      }
    } catch (error) {
      console.error('Error fetching instructor:', error)
      setInstructor(null)
    } finally {
      setLoading(false)
    }
  }

  // No mostrar el componente si no hay instructor o está cargando sin cohortId
  if (!cohortId || loading) {
    return null
  }

  // No mostrar si no hay instructor asignado
  if (!instructor) {
    return null
  }

  // Mensaje de bienvenida por defecto (placeholder editable)
  const defaultWelcomeMessage = welcomeMessage || 
    `¡Bienvenido/a${programName ? ` a ${programName}` : ''}! Estoy emocionado de acompañarte en este viaje de aprendizaje práctico. Pronto recibirás toda la información por correo para comenzar. ¡Nos vemos en la comunidad Tech Centre!`

  return (
    <div className="w-full flex flex-col gap-4 bg-zinc-900/90 backdrop-blur-md p-6 rounded-2xl border border-zinc-700/50">
      {/* Contenedor principal con avatar y contenido */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Avatar del profesor */}
        <div className="shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-zinc-700/50 shadow-lg">
            <Image
              width={96}
              height={96}
              src={instructor.profile_image || '/man-avatar.png'}
              alt={`${instructor.first_name} ${instructor.last_name}`}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        {/* Información del profesor y mensaje */}
        <div className="flex-1 flex flex-col gap-3 text-center sm:text-left">
          {/* Nombre y rol */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <GraduationCap className="w-5 h-5 card-text-primary" />
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {instructor.first_name} {instructor.last_name}
              </h3>
            </div>
            <p className="text-sm text-gray-400">
              Profesor del programa
            </p>
            {instructor.professional_title && (
              <p className="text-xs text-gray-500 italic">
                {instructor.professional_title}
              </p>
            )}
          </div>

          {/* Mensaje de bienvenida */}
          <div className="mt-2">
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {defaultWelcomeMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Área reservada para video futuro - preparado para implementación */}
      {/* Video placeholder - preparado para futura implementación */}
      {false && (
        <div className="mt-6 aspect-video rounded-lg overflow-hidden bg-zinc-800/50 border border-zinc-700/30">
          {/* Video component here */}
        </div>
      )}
    </div>
  )
}
