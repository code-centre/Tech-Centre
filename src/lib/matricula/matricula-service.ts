import { createClient } from '@/lib/supabase/client'

export interface MatriculaConfig {
  id: string
  amount: number
  description?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserMatriculaStatus {
  paid: boolean
  paidYear: number | null
  shouldShow: boolean
  amount: number
  description?: string | null
}

type SupabaseClient = ReturnType<typeof createClient>

/**
 * Obtiene la configuración activa de matrícula desde la base de datos
 */
export async function getMatriculaConfig(
  supabaseClient: SupabaseClient
): Promise<MatriculaConfig | null> {
  try {
    const { data, error } = await (supabaseClient as any)
      .from('matricula_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No hay configuración activa
        return null
      }
      console.error('Error al obtener configuración de matrícula:', error)
      return null
    }

    return data as MatriculaConfig
  } catch (error) {
    console.error('Error al obtener configuración de matrícula:', error)
    return null
  }
}

/**
 * Verifica si el usuario ha pagado la matrícula del año actual
 */
export async function checkMatriculaPaid(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const currentYear = new Date().getFullYear()

    const { data, error } = await (supabaseClient as any)
      .from('profiles')
      .select('matricula_paid, matricula_paid_year')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error al verificar matrícula pagada:', error)
      return false
    }

    if (!data) {
      return false
    }

    // Si matricula_paid es false, no ha pagado
    if (!data.matricula_paid) {
      return false
    }

    // Si matricula_paid_year es null o menor al año actual, necesita pagar de nuevo
    if (!data.matricula_paid_year || data.matricula_paid_year < currentYear) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error al verificar matrícula pagada:', error)
    return false
  }
}

/**
 * Marca la matrícula como pagada para el usuario y el año actual
 */
export async function markMatriculaAsPaid(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const currentYear = new Date().getFullYear()

    const { error } = await (supabaseClient as any)
      .from('profiles')
      .update({
        matricula_paid: true,
        matricula_paid_year: currentYear,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error al marcar matrícula como pagada:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error al marcar matrícula como pagada:', error)
    return false
  }
}

/**
 * Determina si se debe mostrar la matrícula en el checkout
 * Retorna el estado completo incluyendo el monto
 */
export async function shouldShowMatricula(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<UserMatriculaStatus> {
  try {
    const config = await getMatriculaConfig(supabaseClient)
    
    if (!config || !config.is_active) {
      return {
        paid: false,
        paidYear: null,
        shouldShow: false,
        amount: 0,
        description: null,
      }
    }

    const hasPaid = await checkMatriculaPaid(supabaseClient, userId)

    return {
      paid: hasPaid,
      paidYear: null, // Se obtendrá de la consulta si es necesario
      shouldShow: !hasPaid,
      amount: Number(config.amount),
      description: config.description || `Matrícula requerida para el año ${new Date().getFullYear()}`,
    }
  } catch (error) {
    console.error('Error al verificar si se debe mostrar matrícula:', error)
    return {
      paid: false,
      paidYear: null,
      shouldShow: false,
      amount: 0,
      description: null,
    }
  }
}

/**
 * Función para reiniciar matrículas (puede ser llamada desde un cron job o manualmente)
 */
export async function resetMatriculasForNewYear(
  supabaseClient: SupabaseClient
): Promise<boolean> {
  try {
    const { error } = await (supabaseClient as any).rpc('check_and_reset_matricula')

    if (error) {
      console.error('Error al reiniciar matrículas:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error al reiniciar matrículas:', error)
    return false
  }
}

