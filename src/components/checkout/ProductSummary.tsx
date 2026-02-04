'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Check } from 'lucide-react'
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
  matriculaAdded?: boolean
  matriculaAmount?: number
}

export default function ProductSummary({ 
  data, 
  selectedCohortId,
  onMatriculaAmountChange,
  onMatriculaStatusChange,
  matriculaAdded = false,
  matriculaAmount = 0,
}: Props) {
  const supabase = useSupabaseClient()
  const { user } = useUser()
  const [cohortInfo, setCohortInfo] = useState<CohortInfo | null>(null)
  const [showMatricula, setShowMatricula] = useState<boolean>(false)
  const [localMatriculaAmount, setLocalMatriculaAmount] = useState<number>(0)
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
        setLocalMatriculaAmount(matriculaStatus.amount)
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
    <section className="flex flex-col gap-6" aria-labelledby="program-summary-heading">
      <header>
        <h2 id="program-summary-heading" className="text-4xl font-bold mb-4 text-text-primary">
          Resumen del programa
        </h2>
      </header>

      {/* Matrícula anual - Primer elemento */}
      {/* {!loadingMatricula && showMatricula && matriculaAmount > 0 && (
        <MatriculaItem
          amount={matriculaAmount}
          description={matriculaDescription}
        />
      )} */}

      {/* Información del programa */}
      <article className="flex flex-col gap-6 p-6 bg-bg-card rounded-xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Imagen del programa - Mayor predominancia */}
          <figure className="shrink-0">
            <Image
              src={data.image || '/placeholder-course.jpg'}
              alt={`Imagen del programa ${data.name}`}
              width={200}
              height={200}
              className="w-40 h-40 lg:w-48 lg:h-48 rounded-xl object-contain shadow-xl bg-bg-secondary"
              priority
            />
          </figure>
          
          {/* Información del programa */}
          <div className="flex-1 flex flex-col gap-4">
            <header>
              <h3 className="text-xl font-bold text-text-primary mb-1">{data.name}</h3>
              {data.subtitle && (
                <p className="text-secondary/80 text-base">{data.subtitle}</p>
              )}
            </header>

            {/* Descripción del programa */}
            {data.description && (
              <div>
                <div className="text-text-muted text-sm leading-relaxed line-clamp-3">
                  {HTMLReactParser(data.description)}
                </div>
                <Link 
                  href={`/programas-academicos/${data.slug || data.code}`}
                  className="text-secondary hover:text-secondary/80 text-sm font-medium inline-flex items-center gap-1 mt-2"
                  aria-label={`Ver detalles completos del programa ${data.name}`}
                >
                  Ver detalles del programa
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Información clave de la cohorte - destacada */}
        {cohortInfo && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {cohortInfo.start_date && (
              <div className="flex items-center gap-3">
                <dt className="sr-only">Fecha de inicio</dt>
                <dd className="flex items-center gap-3 w-full">
                  <div className="shrink-0 w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <Calendar className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Fecha de inicio</p>
                    <p className="text-text-primary font-semibold">{formatDate(cohortInfo.start_date)}</p>
                  </div>
                </dd>
              </div>
            )}
            {formatSchedule() && (
              <div className="flex items-center gap-3">
                <dt className="sr-only">Horario</dt>
                <dd className="flex items-center gap-3 w-full">
                  <div className="shrink-0 w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <Clock className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Horario</p>
                    <p className="text-text-primary font-semibold">{formatSchedule()}</p>
                  </div>
                </dd>
              </div>
            )}
          </dl>
        )}

        {/* Información de beneficios de matrícula */}
        {matriculaAdded && matriculaAmount > 0 && (
          <div className="pt-4">
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Matrícula anual Tech Centre
            </h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                <span>Kit de estudiante incluido</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                <span>Acceso a la comunidad Tech Centre</span>
              </li>
            </ul>
          </div>
        )}
      </article>
    </section>
  )
}
