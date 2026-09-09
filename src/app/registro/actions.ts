'use server';

import { createServiceRoleClient } from '@/lib/supabase/service-role';

interface SignupProfileInput {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface EnsureProfileInput {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
}

interface ActionResult {
  success: boolean;
  error?: string;
}

async function getServiceClient() {
  try {
    return createServiceRoleClient();
  } catch {
    return null;
  }
}

/** Garantiza que exista un perfil para el usuario dado. */
export async function ensureUserProfile(input: EnsureProfileInput): Promise<ActionResult> {
  const userId = input.userId.trim();
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim() || 'Usuario';
  const lastName = input.lastName.trim();

  if (!userId || !email) {
    return { success: false, error: 'Faltan datos para crear el perfil' };
  }

  const admin = await getServiceClient();
  if (!admin) {
    return { success: false, error: 'Configuración del servidor incompleta' };
  }

  const { data: authData, error: authError } = await admin.auth.admin.getUserById(userId);
  if (authError || !authData.user) {
    return { success: false, error: 'No se encontró la cuenta' };
  }

  if ((authData.user.email ?? '').toLowerCase() !== email) {
    return { success: false, error: 'Los datos no coinciden con la cuenta' };
  }

  const { data: existing } = await admin
    .from('profiles')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return { success: true };
  }

  const now = new Date().toISOString();
  const { error: profileError } = await admin.from('profiles').insert({
    user_id: userId,
    email,
    first_name: firstName,
    last_name: lastName,
    phone: '',
    id_type: 'CC',
    id_number: '',
    birthdate: '1990-01-01',
    address: null,
    role: 'lead',
    profile_image: input.profileImage ?? null,
    created_at: now,
    updated_at: now,
  } as never);

  if (profileError) {
    if (profileError.code === '23505') {
      return { success: true };
    }
    return { success: false, error: profileError.message || 'No se pudo crear el perfil' };
  }

  return { success: true };
}

/**
 * Crea el perfil tras el registro público. Usa service role porque, con
 * confirmación de email, el cliente aún no tiene sesión y RLS bloquea el insert.
 */
export async function createSignupProfile(input: SignupProfileInput): Promise<ActionResult> {
  if (!input.firstName.trim() || !input.lastName.trim()) {
    return { success: false, error: 'Faltan datos para crear el perfil' };
  }

  return ensureUserProfile({
    userId: input.userId,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
  });
}
