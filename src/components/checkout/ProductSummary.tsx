'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Calendar, Clock } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'
import { useSupabaseClient, useUser } from '@/lib/supabase'
import { formatDate } from '../../../utils/formatDate'
import { shouldShowMatricula } from '@/lib/matricula/matricula-service'
import MatriculaItem from './MatriculaItem'
import type { Program } from '@/types/programs'

interface CohortInfo {
  start_date: string
  schedule?: {
    clases?: {
      horas?: string[]
      dias?: string[]
    }
    hours?: string[]
    days?: string[]
  }
}

interface Props {
  data: Program
  selectedCohortId: number | null
  onMatriculaAmountChange?: (amount: number) => void
  onMatriculaStatusChange?: (shouldShow: boolean) => void
}

export default function ProductSummary({ 
  data, 
  selectedCohortId,
  onMatriculaAmountChange,
  onMatriculaStatusChange,
}: Props) {
  const supabase = useSupabaseClient()
  const { user } = useUser()
  const [cohortInfo, setCohortInfo] = useState<CohortInfo | null>(null)
  const [showMatricula, setShowMatricula] = useState<boolean>(false)
  const [matriculaAmount, setMatriculaAmount] = useState<number>(0)
  const [matriculaDescription, setMatriculaDescription] = useState<string>('')
  const [loadingMatricula, setLoadingMatricula] = useState<boolean>(true)

  // Obtener información de la cohorte
  useEffect(() => {
    const fetchCohortInfo = async () => {
      if (!selectedCohortId) {
        setCohortInfo(null)
        return
      }

      try {
        const { data: cohortData, error: cohortError } = await supabase
          .from('cohorts')
          .select('start_date, schedule')
          .eq('id', selectedCohortId)
          .single()

        if (cohortError) throw cohortError

        if (cohortData) {
          setCohortInfo({
            start_date: cohortData.start_date,
            schedule: cohortData.schedule,
          })
        }
      } catch (error) {
        console.error('Error al obtener información de la cohorte:', error)
        setCohortInfo(null)
      }
    }

    fetchCohortInfo()
  }, [selectedCohortId, supabase])

  // Verificar si se debe mostrar la matrícula
  useEffect(() => {
    const checkMatricula = async () => {
      if (!user?.id) {
        setLoadingMatricula(false)
        setShowMatricula(false)
        return
      }

      try {
        setLoadingMatricula(true)
        const matriculaStatus = await shouldShowMatricula(supabase, user.id)
        setShowMatricula(matriculaStatus.shouldShow)
        setMatriculaAmount(matriculaStatus.amount)
        setMatriculaDescription(matriculaStatus.description || `Matrícula requerida para el año ${new Date().getFullYear()}`)
        // Notificar al componente padre del monto de matrícula
        if (onMatriculaAmountChange) {
          onMatriculaAmountChange(matriculaStatus.amount)
        }
        // Notificar al componente padre si se debe mostrar la matrícula (siempre agregada)
        if (onMatriculaStatusChange) {
          onMatriculaStatusChange(matriculaStatus.shouldShow)
        }
      } catch (error) {
        console.error('Error al verificar matrícula:', error)
        setShowMatricula(false)
        if (onMatriculaStatusChange) {
          onMatriculaStatusChange(false)
        }
      } finally {
        setLoadingMatricula(false)
      }
    }

    checkMatricula()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, supabase])

  // Formatear horario
  const formatSchedule = () => {
    if (!cohortInfo?.schedule) return null

    // Manejar ambos formatos posibles: schedule.clases o schedule directo
    let horas: string[] = []
    let dias: string[] = []

    if (cohortInfo.schedule.clases) {
      horas = cohortInfo.schedule.clases.horas || []
      dias = cohortInfo.schedule.clases.dias || []
    } else if (cohortInfo.schedule.hours || cohortInfo.schedule.days) {
      horas = cohortInfo.schedule.hours || []
      dias = cohortInfo.schedule.days || []
    }

    if (horas.length === 0 && dias.length === 0) return null

    const scheduleParts: string[] = []
    
    if (horas.length > 0) {
      scheduleParts.push(horas.join(', '))
    }
    
    if (dias.length > 0) {
      scheduleParts.push(dias.join(', '))
    }

    return scheduleParts.join(' | ')
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-4xl font-bold mb-4">Resumen del programa</h2>
        <div className="h-1 border-b"></div>
      </div>

      {/* Matrícula anual - Primer elemento */}
      {/* {!loadingMatricula && showMatricula && matriculaAmount > 0 && (
        <MatriculaItem
          amount={matriculaAmount}
          description={matriculaDescription}
        />
      )} */}

      {/* Información del programa */}
      <div className="flex flex-col md:flex-row gap-6 p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
        <div className="shrink-0">
          <Image
            src={data.image || '/placeholder-course.jpg'}
            alt={data.name}
            width={120}
            height={120}
            className="w-32 h-32 rounded-lg object-cover bg-center border border-secondary/10 shadow-lg"
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{data.name}</h3>
            {data.subtitle && (
              <p className="text-secondary/80 text-lg">{data.subtitle}</p>
            )}
          </div>

          {/* Descripción del programa */}
          {data.description && (
            <div className="text-gray-300 text-sm leading-relaxed">
              {HTMLReactParser(data.description)}
            </div>
          )}

          {/* Información de la cohorte */}
          {cohortInfo && (
            <div className="space-y-3">
              {cohortInfo.start_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Fecha de inicio</p>
                    <p className="text-white font-semibold">{formatDate(cohortInfo.start_date)}</p>
                  </div>
                </div>
              )}
              {formatSchedule() && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Horario</p>
                    <p className="text-white font-semibold">{formatSchedule()}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

