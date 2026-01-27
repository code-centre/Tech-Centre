import { Plus, X } from 'lucide-react'
import React, { useEffect , useState} from 'react'
import { useSupabaseClient } from '@/lib/supabase'
import type { Program, EventFCA } from '@/types/programs'

interface Props {
  data: Program | EventFCA | any
  selectedSchedule: string | null
  setSelectedSchedule: (value: string | null) => void
  isShort?: boolean
  schedules?: any[]
  selectedCohortId: number | null;
  onCohortSelect?: (cohortId: number) => void;
}

export default function SelectSchedule({ data, selectedSchedule, setSelectedSchedule, isShort, onCohortSelect, selectedCohortId }: Props) {
  const supabase = useSupabaseClient()
  const [cohort, setCohort] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCohort = async () => {
      if (!data?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data: cohortData, error: cohortError } = await supabase
          .from('cohorts')
          .select('*')
          .eq('program_id', data.id)

        if (cohortError) throw cohortError
        // console.log('Datos de la cohorte:', cohortData)
        setCohort(cohortData)
      } catch (err) {
        console.error('Error fetching cohort:', err)
        setError('Error al cargar la cohorte')
      } finally {
        setLoading(false)
      }
    }

    fetchCohort()
  }, [data?.id, supabase]) // Only re-run if data.id changes

  if (loading) return <div>Cargando información de la cohorte...</div>
  if (error) return <div className="text-red-500">{error}</div>

  // console.log('Cohort items:', JSON.stringify(cohort, null, 2));
  return (
    <section className='flex flex-col gap-1'>
      {
        selectedSchedule ? (
          <p className='text-blueApp font-semibold flex flex-col md:flex-row gap-2 md:items-center'>
            <span className='font-normal text-white'>Horario seleccionado:</span>
            {selectedSchedule}
            <button 
              onClick={() => setSelectedSchedule(null)} 
              className='rounded-md border-2 border-red-500 w-fit hover:bg-red-500 transition-colors group'
            >
              <X className='text-red-500 w-4 h-4 group-hover:text-white transition-colors' />
            </button>
          </p>
        ) : (
          <div className="space-y-3">
            <p className='font-semibold'>Horarios disponibles</p>
            {cohort && cohort.length > 0 ? (
              <div className="space-y-2">
                {cohort.map((cohortItem: any) => (
                  <div 
                    key={cohortItem.id} 
                    className="flex items-center justify-between p-3 rounded-lg  transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          {cohortItem.schedule?.clases?.horas?.[0] && (
                            <span className="text-blueApp">{cohortItem.schedule.clases.horas[0]}</span>
                          )}
                          {cohortItem.schedule?.clases?.dias?.[0] && (
                            <span className="text-white">| {cohortItem.schedule.clases.dias[0]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const scheduleText = [
                          cohortItem.schedule?.clases?.horas?.[0],
                          cohortItem.schedule?.clases?.dias?.[0],
                        ].filter(Boolean).join(' | ');
                        
                        setSelectedSchedule(scheduleText);
                        onCohortSelect?.(cohortItem.id); // Esto actualizará el estado en el componente padre
                      }}
                      className="ml-4 p-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex-shrink-0"
                      aria-label="Seleccionar horario"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No hay horarios disponibles</p>
            )}
          </div>
        )
      }
    </section>
  )
}
