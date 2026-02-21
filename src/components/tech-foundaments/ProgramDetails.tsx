'use client'
import { GraduationCap, CalendarClock, Network, MapPin } from 'lucide-react'
import { Program } from '@/types/programs'
import { useState } from 'react'
import ButtonToEdit from '../ButtonToEdit'
import ContainerButtonsEdit from '../ContainerButtonsEdit'
import { useSupabaseClient, useUser } from '@/lib/supabase'
import type { Cohort } from '@/types/cohorts'
import { formatDate, formatDateShort, formatDateMonth } from '@/utils/formatDate'

interface Props {
  programData: Program
  cohorts: Cohort[]
  user: any
  selectedCohortId?: number | null
  onCohortSelect?: (cohortId: number) => void
  onDetailsUpdate?: (updatedData: Partial<Program>) => void
}

// Helper para obtener días/horas del horario (soporta schedule.days y schedule.clases.dias)
const getScheduleDisplay = (cohort: Cohort | undefined) => {
  if (!cohort) return { days: [], hours: [] }
  const s = (cohort as any).schedule
  if (!s) return { days: [], hours: [] }
  const days = s.days ?? s.clases?.dias ?? []
  const hours = s.hours ?? s.clases?.horas ?? []
  return { days: Array.isArray(days) ? days : [], hours: Array.isArray(hours) ? hours : [] }
}

export default function ProgramDetails({ programData, cohorts, user, selectedCohortId, onCohortSelect, onDetailsUpdate }: Props) {
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

  // Cohorte seleccionada: por ID o primera disponible
  const selectedCohort = cohorts.find((c) => c.id === selectedCohortId) ?? cohorts[0]
  const hasMultipleCohorts = cohorts.length > 1

  return (
    <section className="bg-(--card-diplomado-bg) backdrop-blur-sm p-6 md:p-8 rounded-2xl border [border-color:var(--card-diplomado-border)] dark:border-border-color shadow-lg">
      <div className="flex justify-between items-center">
        {isAdmin && !isEditing && (
          <ButtonToEdit startEditing={handleStartEdit} />
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className={hasMultipleCohorts ? 'flex flex-col gap-4 md:gap-6' : ''}>
        <div className={hasMultipleCohorts ? 'grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'}>
          {/* Inicio de clases - Solo lectura (viene de cohorte) */}
          <div className="group flex flex-col items-center text-center p-5 md:p-6 rounded-xl border border-gray-300 dark:border-border-color hover:border-gray-500 dark:hover:border-secondary/50 hover:shadow-md transition-all duration-300">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 dark:bg-gradient-to-br dark:from-secondary/20 dark:to-secondary/10 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-gray-200 dark:border-transparent">
            <GraduationCap className="w-7 h-7 md:w-8 md:h-8 text-gray-700 dark:text-secondary" />
          </div>
          <span className="text-xs md:text-sm font-semibold card-text-muted mb-2 uppercase tracking-wide">Inicio de clases</span>
          <span className='text-sm md:text-base font-bold card-text-primary leading-tight'> 
            {selectedCohort?.start_date
              ? hasMultipleCohorts
                ? formatDateMonth(selectedCohort.start_date)
                : formatDate(selectedCohort.start_date)
              : 'Fecha no establecida'}
          </span>
        </div>

        {/* Duración - Editable */}
        <div className="group flex flex-col items-center text-center p-5 md:p-6 rounded-xl border border-gray-300 dark:border-border-color hover:border-gray-500 dark:hover:border-secondary/50 hover:shadow-md transition-all duration-300">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 dark:bg-gradient-to-br dark:from-secondary/20 dark:to-secondary/10 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-gray-200 dark:border-transparent">
            <CalendarClock className="w-7 h-7 md:w-8 md:h-8 text-gray-700 dark:text-secondary" />
          </div>
          <span className="text-xs md:text-sm font-semibold card-text-muted mb-2 uppercase tracking-wide">Duración</span>
          {isEditing ? (
            <input
              type="text"
              value={editedData.duration}
              onChange={(e) => handleFieldChange('duration', e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold card-text-primary bg-bg-card dark:bg-bg-primary border border-gray-300 dark:border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-center transition-all"
              placeholder="Ej: 120 horas"
            />
          ) : (
            <span className="text-sm md:text-base font-bold card-text-primary">{programData?.duration || 'No especificada'}</span>
          )}
        </div>

        {/* Dificultad - Editable */}
        <div className="group flex flex-col items-center text-center p-5 md:p-6 rounded-xl border border-gray-300 dark:border-border-color hover:border-gray-500 dark:hover:border-secondary/50 hover:shadow-md transition-all duration-300">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 dark:bg-gradient-to-br dark:from-secondary/20 dark:to-secondary/10 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-gray-200 dark:border-transparent">
            <Network className="w-7 h-7 md:w-8 md:h-8 text-gray-700 dark:text-secondary" />
          </div>
          <span className="text-xs md:text-sm font-semibold card-text-muted mb-2 uppercase tracking-wide">Dificultad</span>
          {isEditing ? (
            <select
              value={editedData.difficulty}
              onChange={(e) => handleFieldChange('difficulty', e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold card-text-primary bg-bg-card dark:bg-bg-primary border border-gray-300 dark:border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-center transition-all cursor-pointer"
            >
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          ) : (
            <span className="text-sm md:text-base font-bold card-text-primary">
              {programData?.difficulty || 'No especificada'}
            </span>
          )}
        </div>

        {/* Horario - Solo en grid cuando hay 1 cohorte (4 columnas) */}
        {!hasMultipleCohorts && (
          <div className="group flex flex-col items-center text-center p-5 md:p-6 rounded-xl border border-gray-300 dark:border-border-color hover:border-gray-500 dark:hover:border-secondary/50 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 dark:bg-gradient-to-br dark:from-secondary/20 dark:to-secondary/10 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-gray-200 dark:border-transparent">
              <MapPin className="w-7 h-7 md:w-8 md:h-8 text-gray-700 dark:text-secondary" />
            </div>
            <span className="text-xs md:text-sm font-semibold card-text-muted mb-2 uppercase tracking-wide">Horario</span>
            <div className="flex flex-col gap-1">
              {selectedCohort ? (() => {
                const { days, hours } = getScheduleDisplay(selectedCohort)
                return (
                  <>
                    <span className="text-sm md:text-base font-bold card-text-primary">{days.join(', ') || 'Por definir'}</span>
                    {hours.length > 0 && (
                      <span className="text-xs md:text-sm card-text-muted">{hours.join(' - ')}</span>
                    )}
                  </>
                )
              })() : (
                <span className="text-sm md:text-base font-bold card-text-primary">Por definir</span>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Segunda fila: Horario completo - solo cuando hay múltiples cohortes */}
        {hasMultipleCohorts && (
          <div className="group flex flex-col p-5 md:p-6 rounded-xl border border-gray-300 dark:border-border-color hover:border-gray-500 dark:hover:border-secondary/50 hover:shadow-md transition-all duration-300 w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 dark:bg-gradient-to-br dark:from-secondary/20 dark:to-secondary/10 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-gray-200 dark:border-transparent">
                <MapPin className="w-7 h-7 md:w-8 md:h-8 text-gray-700 dark:text-secondary" />
              </div>
              <span className="text-xs md:text-sm font-semibold card-text-muted uppercase tracking-wide">Horario</span>
            </div>
            <div className="w-full space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {cohorts.map((c) => {
                  const { days, hours } = getScheduleDisplay(c)
                  const daysStr = days.join(', ') || 'Por definir'
                  const hoursStr = hours.join(' - ') || ''
                  return (
                    <div
                      key={c.id}
                      className="flex flex-col items-start p-3 rounded-lg border-2 border-gray-300 dark:border-border-color text-left bg-gray-50/50 dark:bg-bg-card/50"
                    >
                      <span className="text-sm font-bold card-text-primary">{daysStr}</span>
                      {hoursStr && <span className="text-xs card-text-muted">{hoursStr}</span>}
                      {c.start_date && (
                        <span className="text-xs font-medium card-text-primary mt-1">
                          Inicio: {formatDateShort(c.start_date)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="mt-6 pt-6 border-t border-gray-300 dark:border-border-color">
          <ContainerButtonsEdit
            setFinishEdit={handleCancel}
            onSave={handleSave}
          />
          {isSaving && (
            <span className="ml-4 text-text-muted text-sm">Guardando...</span>
          )}
        </div>
      )}
    </section>
  )
}