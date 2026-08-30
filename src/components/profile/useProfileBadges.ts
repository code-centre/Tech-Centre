'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSupabaseClient } from '@/lib/supabase'
import { completionSummary, type ProfileFields } from '@/lib/profileCompletion'

export interface ProfileBadges {
  /** Cuotas vencidas del estudiante. */
  overdueInvoices: number
  /** Clases dictadas del profesor a las que no se les pasó lista. */
  pendingRolls: number
  /** Datos del perfil que faltan. */
  missingProfile: number
}

const EMPTY: ProfileBadges = { overdueInvoices: 0, pendingRolls: 0, missingProfile: 0 }

/**
 * Lo pendiente de cada quien, para que el menú lo avise sin tener que entrar.
 *
 * Se resuelve en el marco del perfil y no dentro de cada sección: la gracia es
 * ver el aviso antes de abrir la sección, no después.
 */
export function useProfileBadges(
  user: (ProfileFields & { id?: string; role?: string }) | null | undefined
): ProfileBadges {
  const supabase = useSupabaseClient()
  const [counts, setCounts] = useState<ProfileBadges>(EMPTY)

  const userId = user?.id
  const role = user?.role

  const load = useCallback(async () => {
    if (!userId) return

    try {
      const today = new Date().toISOString().slice(0, 10)

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', userId)

      const enrollmentIds = ((enrollments ?? []) as { id: number }[]).map((row) => row.id)

      let overdueInvoices = 0
      if (enrollmentIds.length > 0) {
        const { data: invoices } = await supabase
          .from('invoices')
          .select('id, status, due_date')
          .in('enrollment_id', enrollmentIds)
          .neq('status', 'paid')
          .lt('due_date', today)
        overdueInvoices = (invoices ?? []).length
      }

      let pendingRolls = 0
      if (role === 'instructor' || role === 'admin') {
        const { data: links } = await supabase
          .from('cohort_instructors')
          .select('cohort_id')
          .eq('instructor_id', userId)

        const cohortIds = ((links ?? []) as { cohort_id: number }[]).map((row) => row.cohort_id)
        if (cohortIds.length > 0) {
          const { data: sessions } = await supabase
            .from('sessions')
            .select('id, ends_at, starts_at')
            .in('cohort_id', cohortIds)

          const now = Date.now()
          const doneIds = ((sessions ?? []) as { id: number; ends_at: string; starts_at: string }[])
            .filter((session) => new Date(session.ends_at || session.starts_at).getTime() < now)
            .map((session) => session.id)

          if (doneIds.length > 0) {
            const { data: attendance } = await supabase
              .from('attendance')
              .select('session_id')
              .in('session_id', doneIds)
            const marked = new Set(
              ((attendance ?? []) as { session_id: number }[]).map((row) => row.session_id)
            )
            pendingRolls = doneIds.filter((id) => !marked.has(id)).length
          }
        }
      }

      setCounts({
        overdueInvoices,
        pendingRolls,
        missingProfile: completionSummary(user ?? {}).missing,
      })
    } catch (error) {
      // Un aviso que no carga no debe romper el perfil: se queda en cero.
      console.error('No se pudieron contar los pendientes del perfil:', error)
    }
  }, [supabase, userId, role, user])

  useEffect(() => {
    load()
  }, [load])

  return counts
}
