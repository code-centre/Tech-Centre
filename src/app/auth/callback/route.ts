import { createClient } from '@/lib/supabase/route-handler';
import { ensureUserProfile } from '@/app/registro/actions';
import { NextResponse } from 'next/server';

function buildProfileFromUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const meta = user.user_metadata ?? {};
  const fullName = (meta.full_name as string) ?? (meta.name as string) ?? '';
  const parts = fullName.trim().split(/\s+/);
  const firstName = (meta.given_name as string) ?? (meta.first_name as string) ?? parts[0] ?? '';
  const lastName = (meta.family_name as string) ?? (meta.last_name as string) ?? parts.slice(1).join(' ') ?? '';
  const picture = (meta.picture as string) ?? (meta.avatar_url as string) ?? null;

  return {
    userId: user.id,
    email: user.email ?? '',
    firstName: firstName || 'Usuario',
    lastName: lastName || '',
    profileImage: picture,
  };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session?.user) {
      const profileInput = buildProfileFromUser(data.session.user);
      await ensureUserProfile(profileInput);
    }
  }

  const nextParam = requestUrl.searchParams.get('next') ?? '/';
  const next =
    nextParam.startsWith('/') && !nextParam.startsWith('//')
      ? nextParam
      : '/';
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}