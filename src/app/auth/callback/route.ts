import { createClient } from '@/lib/supabase/route-handler';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirigir al usuario después de la autenticación
  return NextResponse.redirect(requestUrl.origin);
}