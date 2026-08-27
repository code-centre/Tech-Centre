import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AppRole = 'admin' | 'instructor' | 'student' | 'lead';

export interface AuthContext {
  userId: string;
  role: AppRole;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const role = (profile as { role?: AppRole } | null)?.role;
  if (!role) return null;

  return { userId: user.id, role };
}

export async function requireRole(
  allowedRoles: AppRole[],
  options?: { redirectTo?: string }
): Promise<AuthContext> {
  const auth = await getAuthContext();
  const redirectTo = options?.redirectTo ?? '/';

  if (!auth) {
    redirect('/iniciar-sesion');
  }

  if (!allowedRoles.includes(auth.role)) {
    redirect(redirectTo);
  }

  return auth;
}

export async function requireApiRole(
  allowedRoles: AppRole[]
): Promise<{ ok: true; auth: AuthContext } | { ok: false; status: number; error: string }> {
  const auth = await getAuthContext();

  if (!auth) {
    return { ok: false, status: 401, error: 'No autorizado' };
  }

  if (!allowedRoles.includes(auth.role)) {
    return { ok: false, status: 403, error: 'Sin permisos' };
  }

  return { ok: true, auth };
}
