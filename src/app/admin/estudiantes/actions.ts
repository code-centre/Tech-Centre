'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

interface ActionResult {
  success: boolean;
  error?: string;
}

/** Todas las acciones de esta pantalla son de admin; se verifica en el servidor. */
async function requireAdmin() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: 'No autenticado' as const };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if ((profile as { role?: string } | null)?.role !== 'admin') {
    return { supabase, error: 'Sin permisos' as const };
  }

  return { supabase, error: null };
}

/**
 * Registra a mano a alguien que escribió por fuera del sitio (WhatsApp, una
 * feria, una recomendación). Va a la misma tabla `leads` que los formularios,
 * para que no haya dos listas de interesados.
 */
export async function createLeadAdmin(payload: {
  fullName: string;
  email: string;
  phone?: string;
  stage?: string;
  program?: string;
  message?: string;
}): Promise<ActionResult & { leadId?: number }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const fullName = payload.fullName.trim();
  const email = payload.email.trim().toLowerCase();

  if (!fullName) return { success: false, error: 'Falta el nombre' };
  if (!email || !email.includes('@')) return { success: false, error: 'El correo no es válido' };

  // Las notas guardan el interés y el mensaje como JSON, igual que los
  // formularios públicos, para que la pantalla las lea de una sola forma.
  const notes = JSON.stringify({
    program: payload.program?.trim() || undefined,
    message: payload.message?.trim() || undefined,
    source: 'registrado a mano por el equipo',
  });

  const { data, error } = await supabase
    .from('leads')
    .insert({
      full_name: fullName,
      email,
      phone: payload.phone?.trim() || null,
      source: 'admin_manual',
      stage: payload.stage || 'dudas',
      notes,
    } as never)
    .select('id')
    .single();

  if (error) {
    return { success: false, error: error.message || 'No se pudo registrar el lead' };
  }

  return { success: true, leadId: (data as { id: number }).id };
}

/**
 * Convierte un lead en persona con cuenta: crea el usuario, su perfil y le
 * manda el correo para que ponga su contraseña. Devuelve el `user_id` para
 * poder llevarlo directo a su ficha y matricularlo.
 */
export async function createProfileFromLead(
  leadId: number
): Promise<ActionResult & { userId?: string; emailSent?: boolean }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('id, full_name, email, phone')
    .eq('id', leadId)
    .single();

  if (leadError || !lead) return { success: false, error: 'No se encontró el lead' };

  const typedLead = lead as { full_name: string | null; email: string | null; phone: string | null };
  const email = (typedLead.email || '').trim().toLowerCase();
  if (!email) return { success: false, error: 'El lead no tiene correo' };

  // Si ya existe un perfil con ese correo no hay nada que crear: es la misma
  // persona y su ficha ya está.
  const { data: existing } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    return { success: true, userId: (existing as { user_id: string }).user_id, emailSent: false };
  }

  const parts = (typedLead.full_name || '').trim().split(/\s+/).filter(Boolean);
  const firstName = parts.slice(0, -1).join(' ') || parts[0] || 'Sin';
  const lastName = parts.length > 1 ? parts[parts.length - 1] : 'nombre';

  const admin = createServiceRoleClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });

  if (createError || !created?.user) {
    return { success: false, error: createError?.message || 'No se pudo crear la cuenta' };
  }

  const userId = created.user.id;

  // Los campos de documento y nacimiento son obligatorios en la tabla; se
  // guardan los mismos marcadores que usa el registro público y el admin los
  // completa desde la ficha.
  const { error: profileError } = await admin.from('profiles').insert({
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
    email,
    phone: typedLead.phone || '',
    id_type: 'CC',
    id_number: '',
    birthdate: '1990-01-01',
    role: 'student',
  } as never);

  if (profileError) {
    // Sin perfil la cuenta no sirve para nada: se deshace para no dejar
    // usuarios sueltos en auth.
    await admin.auth.admin.deleteUser(userId);
    return { success: false, error: profileError.message || 'No se pudo crear el perfil' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://techcentre.com.co';
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/restablecer-contrasena`,
  });

  return { success: true, userId, emailSent: !resetError };
}
