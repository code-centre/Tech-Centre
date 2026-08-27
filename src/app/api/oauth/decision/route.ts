import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const decision = formData.get('decision');
  const authorizationId = formData.get('authorization_id');

  if (!authorizationId || typeof authorizationId !== 'string') {
    return NextResponse.json({ error: 'Missing authorization_id' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) {
    return NextResponse.redirect(
      new URL(
        `/iniciar-sesion?next=${encodeURIComponent(`/oauth/consent?authorization_id=${authorizationId}`)}`,
        request.url
      )
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', claimsData.claims.sub)
    .single();

  const role = (profile as { role?: string } | null)?.role;
  if (role !== 'admin' && role !== 'instructor') {
    return NextResponse.redirect(
      new URL('/oauth/consent?authorization_id=' + encodeURIComponent(authorizationId) + '&error=forbidden', request.url)
    );
  }

  if (decision === 'approve') {
    const { data, error } = await supabase.auth.oauth.approveAuthorization(authorizationId);

    if (error) {
      return NextResponse.redirect(
        new URL(
          `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}&error=${encodeURIComponent(error.message)}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(data.redirect_url);
  }

  if (decision === 'deny') {
    const { data, error } = await supabase.auth.oauth.denyAuthorization(authorizationId);

    if (error) {
      return NextResponse.redirect(
        new URL(
          `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}&error=${encodeURIComponent(error.message)}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(data.redirect_url);
  }

  return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
}
