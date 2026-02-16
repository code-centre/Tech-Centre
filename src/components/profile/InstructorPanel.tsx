'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, ChevronRight, Loader2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useSupabaseClient, useUser } from '@/lib/supabase'
import { formatDate } from '../../../utils/formatDate'

interface CohortWithProgram {
  id: number
  name: string
  start_date: string | null
  end_date: string | null
  modality?: string
  program: { id: number; name: string; code?: string } | { id: number; name: string; code?: string }[] | null
}

export default function InstructorPanel() {
  const supabase = useSupabaseClient()
  const { user } = useUser()
  const [cohorts, setCohorts] = useState<CohortWithProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCohorts = async () => {
      if (!user?.id) return
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('cohort_instructors')
          .select(
            `
            cohort_id,
            role,
            cohort:cohorts(
              id,
              name,
              start_date,
              end_date,
              modality,
              program:programs(id, name, code)
            )
          `
          )
          .eq('instructor_id', user.id)

        if (error) throw error

        const raw = (data || []) as Array<{ cohort: CohortWithProgram | CohortWithProgram[] | null }>
        const cohortsRaw = raw
          .map((row) => {
            const c = row.cohort
            return Array.isArray(c) ? c[0] ?? null : c
          })
          .filter((c): c is CohortWithProgram => !!c?.id)

        const seen = new Set<number>()
        const unique = cohortsRaw
          .filter((c) => {
            if (seen.has(c.id)) return false
            seen.add(c.id)
            return true
          })
          .map((c) => {
            const programRaw = c.program
            const program = Array.isArray(programRaw) ? programRaw[0] ?? null : programRaw
            return { ...c, program }
          })
          .sort((a, b) => {
            const endA = a.end_date ? new Date(a.end_date).getTime() : 0
            const endB = b.end_date ? new Date(b.end_date).getTime() : 0
            return endB - endA
          })

        setCohorts(unique)
      } catch (err) {
        console.error('Error fetching instructor cohorts:', err)
        setCohorts([])
      } finally {
        setLoading(false)
      }
    }

    fetchCohorts()
  }, [user?.id, supabase])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-secondary/10 rounded-lg">
          <GraduationCap className="text-secondary" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Cohortes como instructor</h2>
          <p className="text-sm text-text-muted mt-1">
            Cohortes en las que eres instructor
          </p>
        </div>
      </div>

      <div className="bg-[var(--card-background)] rounded-xl border border-border-color overflow-hidden shadow-lg">
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-secondary" />
              <p className="text-text-muted text-sm">Cargando cohortes...</p>
            </div>
          ) : cohorts.length === 0 ? (
            <p className="text-text-muted py-8 text-center">
              No estás asignado como instructor en ninguna cohorte.
            </p>
          ) : (
            <ul className="space-y-3">
              {cohorts.map((cohort) => {
                const program = Array.isArray(cohort.program) ? cohort.program[0] : cohort.program
                const endDate = cohort.end_date ? new Date(cohort.end_date) : null
                if (endDate) endDate.setHours(0, 0, 0, 0)
                const isActive = endDate ? endDate >= today : false

                return (
                  <li key={cohort.id}>
                    <Link
                      href={`/instructor/${encodeURIComponent(cohort.name)}`}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border-2 transition-colors hover:opacity-90 ${
                        isActive
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-bg-secondary border-border-color'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-text-primary">
                          {program?.name || 'Programa'}
                        </p>
                        <p className="text-sm text-text-muted mt-0.5">
                          {cohort.name}
                          {cohort.start_date && cohort.end_date && (
                            <> • {formatDate(cohort.start_date)} – {formatDate(cohort.end_date)}</>
                          )}
                          {cohort.modality && ` • ${cohort.modality}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${
                            isActive
                              ? 'bg-green-500/90 text-white'
                              : 'bg-amber-600/90 text-white'
                          }`}
                        >
                          {isActive ? 'Activa' : 'Finalizada'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-text-muted" />
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/instructor"
          className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
        >
          <GraduationCap className="w-4 h-4" />
          Ver panel de instructor
        </Link>
        <Link
          href="/admin/instructores"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Administración de instructores
        </Link>
      </div>
    </div>
  )
}
