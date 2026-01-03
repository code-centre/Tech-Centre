'use client'

import { useState, useEffect } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface Profile {
  user_id: string
  first_name: string
  last_name: string
  email: string
  profile_image?: string
  professional_title?: string
  bio?: string
  linkedin_url?: string
}

interface Props {
  cohortId: number
  currentInstructor?: Profile | null
  onClose: () => void
}

export default function InstructorAssignmentModal({ cohortId, currentInstructor, onClose }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedInstructor, setSelectedInstructor] = useState<Profile | null>(currentInstructor || null)

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Buscar usuarios con rol instructor o admin
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, profile_image, professional_title, bio, linkedin_url')
        .in('role', ['instructor', 'admin'])
        .order('first_name', { ascending: true })

      if (fetchError) throw fetchError

      setProfiles(data || [])
    } catch (err: any) {
      setError('Error al cargar los instructores')
      console.error('Error fetching instructors:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchInstructors()
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { data, error: searchError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, profile_image, professional_title, bio, linkedin_url')
        .in('role', ['instructor', 'admin'])
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('first_name', { ascending: true })

      if (searchError) throw searchError

      setProfiles(data || [])
    } catch (err: any) {
      setError('Error al buscar instructores')
      console.error('Error searching instructors:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedInstructor) {
      setError('Por favor selecciona un instructor')
      return
    }

    if (!cohortId) {
      setError('No se pudo identificar la cohorte')
      return
    }

    setSaving(true)
    setError('')

    try {
      // Convertir cohortId a número si es necesario
      const cohortIdNum = typeof cohortId === 'string' ? parseInt(cohortId, 10) : cohortId
      
      if (isNaN(cohortIdNum)) {
        throw new Error('ID de cohorte inválido')
      }

      // Primero, eliminar cualquier instructor existente para esta cohorte
      const { error: deleteError } = await supabase
        .from('cohort_instructors')
        .delete()
        .eq('cohort_id', cohortIdNum)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        // No lanzar error si no hay instructor para eliminar
        if (deleteError.code !== 'PGRST116') {
          throw new Error(`Error al eliminar instructor existente: ${deleteError.message}`)
        }
      }

      // Luego, asignar el nuevo instructor
      const { data, error: insertError } = await supabase
        .from('cohort_instructors')
        .insert({
          cohort_id: cohortIdNum,
          instructor_id: selectedInstructor.user_id,
          role: 'instructor'
        })
        .select()

      if (insertError) {
        console.error('Insert error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        })
        
        // Mensajes de error más específicos
        if (insertError.code === '23505') {
          throw new Error('Este instructor ya está asignado a esta cohorte')
        } else if (insertError.code === '23503') {
          throw new Error('El instructor o la cohorte no existe')
        } else {
          throw new Error(`Error al asignar instructor: ${insertError.message || insertError.hint || 'Error desconocido'}`)
        }
      }

      if (!data || data.length === 0) {
        throw new Error('No se pudo asignar el instructor. Por favor, intenta de nuevo.')
      }

      onClose()
    } catch (err: any) {
      const errorMessage = err.message || 'Error al asignar el instructor'
      setError(errorMessage)
      console.error('Error assigning instructor:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!cohortId) return

    setSaving(true)
    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('cohort_instructors')
        .delete()
        .eq('cohort_id', cohortId)

      if (deleteError) throw deleteError

      onClose()
    } catch (err: any) {
      setError('Error al eliminar el instructor')
      console.error('Error removing instructor:', err)
    } finally {
      setSaving(false)
    }
  }

  const filteredProfiles = profiles.filter(profile =>
    profile.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {currentInstructor ? 'Cambiar Instructor' : 'Asignar Instructor'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar por nombre o email..."
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blueApp"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blueApp hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-800">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blueApp" />
            </div>
          )}

          {/* Instructors List */}
          {!loading && (
            <div className="space-y-3">
              {filteredProfiles.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No se encontraron instructores</p>
              ) : (
                filteredProfiles.map((profile) => (
                  <div
                    key={profile.user_id}
                    onClick={() => setSelectedInstructor(profile)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedInstructor?.user_id === profile.user_id
                        ? 'border-blueApp bg-blueApp/10'
                        : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-700">
                        <Image
                          width={48}
                          height={48}
                          src={profile.profile_image || '/man-avatar.png'}
                          alt={`${profile.first_name} ${profile.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">
                          {profile.first_name} {profile.last_name}
                        </h3>
                        <p className="text-gray-400 text-sm">{profile.email}</p>
                        {profile.professional_title && (
                          <p className="text-gray-500 text-xs mt-1">{profile.professional_title}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-700 flex justify-between items-center gap-4">
          {currentInstructor && (
            <button
              onClick={handleRemove}
              disabled={saving}
              className="px-4 py-2 text-red-400 hover:text-red-300 border border-red-800/50 hover:border-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Eliminar Instructor
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedInstructor || saving}
              className="px-4 py-2 bg-blueApp hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Asignar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

