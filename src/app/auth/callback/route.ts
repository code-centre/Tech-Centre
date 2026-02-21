import { createClient } from '@/lib/supabase/route-handler';
import { NextResponse } from 'next/server';

function buildProfileFromUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const meta = user.user_metadata ?? {};
  const fullName = (meta.full_name as string) ?? (meta.name as string) ?? '';
  const parts = fullName.trim().split(/\s+/);
  const firstName = (meta.given_name as string) ?? parts[0] ?? '';
  const lastName = (meta.family_name as string) ?? parts.slice(1).join(' ') ?? '';
  const picture = (meta.picture as string) ?? (meta.avatar_url as string) ?? null;

  return {
    user_id: user.id,
    email: user.email ?? '',
    first_name: firstName || 'Usuario',
    last_name: lastName || '',
    birthdate: '1990-01-01',
    phone: '',
    id_type: 'CC' as const,
    id_number: '',
    address: null,
    role: 'lead' as const,
    profile_image: picture,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session?.user) {
      const profileData = buildProfileFromUser(data.session.user);
      await (supabase as any)
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id', ignoreDuplicates: true });
    }
  }

  const nextParam = requestUrl.searchParams.get('next') ?? '/';
  const next =
    nextParam.startsWith('/') && !nextParam.startsWith('//')
      ? nextParam
      : '/';
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}