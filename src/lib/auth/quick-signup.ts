/**
 * Servicio para registro rápido de usuarios en checkout
 * Solo requiere email y contraseña, crea perfil mínimo
 */

import { createClient } from '@/lib/supabase/client'

export interface QuickSignUpResult {
  success: boolean
  user?: {
    id: string
    email: string
  }
  error?: string
  requiresEmailVerification?: boolean
}

/**
 * Crea una cuenta rápida con solo email y contraseña
 * Crea un perfil mínimo en la tabla profiles (solo campos obligatorios)
 */
export async function quickSignUp(
  email: string,
  password: string
): Promise<QuickSignUpResult> {
  const supabase = createClient()

  try {
    // Validar email
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Por favor, ingresa un correo electrónico válido',
      }
    }

    // Validar contraseña
    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres',
      }
    }

    // 1. Crear usuario en Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    })

    if (signUpError) {
      // Manejar errores comunes
      if (signUpError.message.includes('already registered')) {
        return {
          success: false,
          error: 'Este correo electrónico ya está registrado. Por favor, inicia sesión.',
        }
      }

      return {
        success: false,
        error: signUpError.message || 'Error al crear la cuenta',
      }
    }

    if (!authData?.user) {
      return {
        success: false,
        error: 'No se pudo crear el usuario',
      }
    }

    // 2. Verificar si el correo requiere verificación
    const requiresEmailVerification = !authData.user.email_confirmed_at

    // 3. Si el correo requiere verificación, crear el perfil sin sesión
    // Si no requiere verificación, esperar un momento para asegurar que la sesión esté establecida
    if (!requiresEmailVerification) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // 4. Crear perfil mínimo en Supabase (usando el user.id del authData)
    const profileData = {
      user_id: authData.user.id,
      email: email.trim().toLowerCase(),
      role: 'student' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Todos los demás campos son opcionales (NULL)
      first_name: null,
      last_name: null,
      phone: null,
      id_type: null,
      id_number: null,
      birthdate: null,
      address: null,
    }

    const { error: profileError } = await (supabase as any)
      .from('profiles')
      .insert([profileData])

    if (profileError) {
      // Si el perfil ya existe (por ejemplo, si se creó automáticamente), no es un error crítico
      if (profileError.code !== '23505') {
        console.error('Error al crear perfil:', profileError)
        // No lanzamos error aquí porque el usuario ya está creado en Auth
        // El perfil se puede completar después
      }
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email || email,
      },
      requiresEmailVerification,
    }
  } catch (error) {
    console.error('Error en quickSignUp:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error desconocido al crear la cuenta',
    }
  }
}

