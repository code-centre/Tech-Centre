'use client'
import { GraduationCap, CalendarClock, Network, MapPin } from 'lucide-react'
import { Program } from '@/types/programs'
import { useState } from 'react'
import ButtonToEdit from '../ButtonToEdit'
import ContainerButtonsEdit from '../ContainerButtonsEdit'
import { useSupabaseClient, useUser } from '@/lib/supabase'

interface Props {
  programData: Program
  cohorts: any
  user: any
  onDetailsUpdate?: (updatedData: Partial<Program>) => void
}

export default function ProgramDetails({ programData, cohorts, user, onDetailsUpdate }: Props) {
  const supabase = useSupabaseClient()
  const { user: currentUser } = useUser()
  const isAdmin = currentUser?.role === 'admin' || user?.role === 'admin'
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({
    duration: programData?.duration || '',
    difficulty: programData?.difficulty || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleFieldChange = (field: 'duration' | 'difficulty', value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!isAdmin) return
    
    setIsSaving(true)
    setError('')
    
    try {
      const { error: updateError } = await supabase
        .from('programs')
        .update({
          duration: editedData.duration,
          difficulty: editedData.difficulty,
          updated_at: new Date().toISOString()
        })
        .eq('id', programData.id)

      if (updateError) {
        setError('Error al guardar los cambios. Por favor, inténtalo de nuevo.')
        return
      }

      setIsEditing(false)
      
      // Notificar al componente padre si existe el callback
      if (onDetailsUpdate) {
        onDetailsUpdate({
          duration: editedData.duration,
          difficulty: editedData.difficulty
        })
      }
    } catch (err) {
      setError('Error al guardar los cambios.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedData({
      duration: programData?.duration || '',
      difficulty: programData?.difficulty || '',
    })
    setIsEditing(false)
    setError('')
  }

  const handleStartEdit = () => {
    setEditedData({
      duration: programData?.duration || '',
      difficulty: programData?.difficulty || '',
    })
    setIsEditing(true)
    setError('')
  }

  return (
    <section className="bg-bgCard backdrop-blur-sm p-8 rounded-2xl border border-blue-100/20 shadow-lg">
      <div className="flex justify-between items-center">
        {isAdmin && !isEditing && (
          <ButtonToEdit startEditing={handleStartEdit} />
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Inicio de clases - Solo lectura (viene de cohorte) */}
        <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6 text-secondary" />
          </div>
          <span className="text-sm font-medium text-white mb-1">Inicio de clases</span>
          <span className='text-sm text-white'> 
            {cohorts[0]?.start_date ? (() => {
              const dateParts = cohorts[0]?.start_date?.split('-') || []
              const year = parseInt(dateParts[0], 10)
              const month = parseInt(dateParts[1], 10) - 1
              const day = parseInt(dateParts[2], 10)
              const fixedDate = new Date(Date.UTC(year, month, day))
              return fixedDate.toLocaleDateString('es-CO', {
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC'
              })
            })() : 'Fecha no establecida'}
          </span>
        </div>

        {/* Duración - Editable */}
        <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
            <CalendarClock className="w-6 h-6 text-secondary" />
          </div>
          <span className="text-sm font-medium text-white mb-1">Duración</span>
          {isEditing ? (
            <input
              type="text"
              value={editedData.duration}
              onChange={(e) => handleFieldChange('duration', e.target.value)}
              className="w-full px-2 py-1 text-xs text-white font-semibold bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-center"
              placeholder="Ej: 120 horas"
            />
          ) : (
            <span className="text-xs text-white font-semibold">{programData?.duration || 'No especificada'}</span>
          )}
        </div>

        {/* Dificultad - Editable */}
        <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
            <Network className="w-6 h-6 text-secondary" />
          </div>
          <span className="text-sm font-medium text-white mb-1">Dificultad</span>
          {isEditing ? (
            <select
              value={editedData.difficulty}
              onChange={(e) => handleFieldChange('difficulty', e.target.value)}
              className="w-full px-2 py-1 text-xs text-white font-semibold bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-center"
            >
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          ) : (
            <span className="text-xs text-white font-semibold">
              {programData?.difficulty || 'No especificada'}
            </span>
          )}
        </div>

        {/* Horario - Solo lectura (viene de cohorte) */}
        <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
            <MapPin className="w-6 h-6 text-secondary" />
          </div>
          <span className="text-sm font-medium text-white mb-1">Horario</span>
          <span className="text-xs text-white font-semibold">{cohorts[0]?.schedule?.days || 'Por definir'}</span>
          <span className="text-xs text-white font-semibold">{cohorts[0]?.schedule?.hours || 'Por definir'}</span>
        </div>
      </div>

      {isEditing && (
        <div className="mt-6">
          <ContainerButtonsEdit
            setFinishEdit={handleCancel}
            onSave={handleSave}
          />
          {isSaving && (
            <span className="ml-4 text-gray-400 text-sm">Guardando...</span>
          )}
        </div>
      )}
    </section>
  )
}