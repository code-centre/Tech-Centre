'use server'

import { createClient } from '@/lib/supabase/server'
import { refresh } from 'next/cache'
import { revalidateProgramsOffer } from '@/lib/revalidate-programs-offer'

export interface ActionResult {
  success: boolean
  error?: string
}

/** Marca una cohorte como visible u oculta en el sitio y refresca la oferta pública. */
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin' && profile?.role !== 'instructor') {
    return { success: false, error: 'Sin permiso' }
  }

  const { error } = await supabase
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
