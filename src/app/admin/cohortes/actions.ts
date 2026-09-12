'use server'

import { createClient } from '@/lib/supabase/server'
import { refresh } from 'next/cache'
import { revalidateProgramsOffer } from '@/lib/revalidate-programs-offer'

export interface ActionResult {
  success: boolean
  error?: string
}

/** Marca una cohorte como visible u oculta en el sitio web y refresca header, landing y /programas. */
export async function setCohortOffering(
  cohortId: string,
  offering: boolean
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  const role = (profileRow as { role?: string } | null)?.role
  if (role !== 'admin' && role !== 'instructor') {
    return { success: false, error: 'Sin permiso' }
  }

  // `cohorts` aún no está en el tipo Database generado; el cast evita `never`.
  const { error } = await (supabase as any)
    .from('cohorts')
    .update({ offering })
    .eq('id', cohortId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidateProgramsOffer('action')
  refresh()
  return { success: true }
}

/** Quita a una persona de una cohorte (matrícula, facturas, asistencia). Solo admin. */
export async function removeEnrollmentFromCohort(enrollmentId: number): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  const role = (profileRow as { role?: string } | null)?.role
  if (role !== 'admin') {
    return { success: false, error: 'Sin permiso' }
  }

  const { data: enrollmentData, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('id', enrollmentId)
    .maybeSingle()

  if (enrollmentError || !enrollmentData) {
    return { success: false, error: 'Matrícula no encontrada' }
  }

  const { error: attendanceError } = await supabase
    .from('attendance')
    .delete()
    .eq('enrollment_id', enrollmentId)

  if (attendanceError) {
    console.error('Error al borrar asistencia:', attendanceError)
    return { success: false, error: attendanceError.message }
  }

  const { error: invoicesError } = await supabase
    .from('invoices')
    .delete()
    .eq('enrollment_id', enrollmentId)

  if (invoicesError) {
    console.error('Error al borrar facturas:', invoicesError)
    return { success: false, error: invoicesError.message }
  }

  const { error: deleteError } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', enrollmentId)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  refresh()
  return { success: true }
}
