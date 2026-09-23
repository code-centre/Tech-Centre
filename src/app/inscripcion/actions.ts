'use server';

import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { ensureUserProfile } from '@/app/registro/actions';
import { linkAttributionIdentity } from '@/lib/analytics/meta/persist';
import { SESSION_COOKIE } from '@/lib/analytics/meta/types';
import { splitFullName } from '@/lib/signupPrefill';
import { SIN_DECIDIR } from './constants';

export interface InscripcionInput {
  nombre: string;
  email: string;
  telefono: string;
  password?: string;
  programa: string;
  fuente: string;
  company?: string; // honeypot
}

export type InscripcionResult =
  | { status: 'created'; userId: string; email: string }
  | { status: 'signed-in' }
  | { status: 'existing'; email: string }
  | { status: 'enrolled' }
  | { status: 'error'; error: string };

const MIN_PASSWORD = 6;

function validate(input: InscripcionInput, needsPassword: boolean): string | null {
  if (!input.nombre?.trim()) return 'El nombre es obligatorio.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email?.trim() ?? '')) {
    return 'Ingresa un correo electrónico válido.';
  }
  if ((input.telefono ?? '').replace(/\D/g, '').length < 7) {
    return 'Ingresa un teléfono válido.';
  }
  if (needsPassword && (input.password ?? '').length < MIN_PASSWORD) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
  }
  return null;
}

export async function submitInscripcion(input: InscripcionInput): Promise<InscripcionResult> {
  if (input.company?.trim()) return { status: 'enrolled' };

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const validationError = validate(input, !currentUser);
  if (validationError) return { status: 'error', error: validationError };

  const email = input.email.trim().toLowerCase();
  const phone = input.telefono.replace(/\D/g, '').slice(0, 20);
  const { firstName, lastName } = splitFullName(input.nombre.slice(0, 160));
  const headersList = await headers();

  const { error: leadError } = await supabase.from('leads').insert({
    full_name: input.nombre.trim(),
    email,
    phone,
    source: 'inscripcion',
    stage: input.programa === SIN_DECIDIR ? 'dudas' : 'apartar',
    notes: JSON.stringify({
      programa: input.programa,
      fuente: input.fuente,
      source_page: 'inscripcion',
      metadata: {
        referrer: headersList.get('referer'),
        submittedAt: new Date().toISOString(),
        userId: currentUser?.id ?? null,
      },
    }),
  } as never);

  if (leadError) console.error('Error inserting inscripcion lead:', leadError);

  if (currentUser) return { status: 'enrolled' };

  const password = input.password ?? '';
  const admin = createServiceRoleClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });

  if (createError || !created?.user) {
    const alreadyExists =
      createError?.code === 'email_exists' ||
      /already|registered|exists/i.test(createError?.message ?? '');

    if (alreadyExists) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      return signInError ? { status: 'existing', email } : { status: 'signed-in' };
    }

    if (createError?.code === 'weak_password') {
      return {
        status: 'error',
        error: 'La contraseña es muy débil. Usa al menos 6 caracteres con letras y números.',
      };
    }

    console.error('Error creating inscripcion account:', createError);
    return {
      status: 'error',
      error: 'Guardamos tu inscripción, pero no pudimos crear tu cuenta. Escríbenos por WhatsApp y te ayudamos.',
    };
  }

  const userId = created.user.id;

  await ensureUserProfile({ userId, email, firstName, lastName, phone });
  await admin.from('profiles').update({ phone } as never).eq('user_id', userId);

  try {
    const cookieStore = await cookies();
    await linkAttributionIdentity({
      userId,
      email,
      sessionId: cookieStore.get(SESSION_COOKIE)?.value ?? null,
    });
  } catch {
    // attribution must not fail signup
  }

  await supabase.auth.signInWithPassword({ email, password });

  return { status: 'created', userId, email };
}
