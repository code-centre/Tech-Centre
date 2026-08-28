import { getDiagnosticoNotifyEmail } from './resend-client';
import { sendTemplateEmail } from './send-template-email';

export interface DiagnosticoBookingPayload {
  name: string;
  email: string;
  phone: string;
  program: string;
  message?: string | null;
  source?: string | null;
  referrer?: string | null;
  submittedAt?: string;
}

export async function sendDiagnosticoBookingNotification(
  payload: DiagnosticoBookingPayload,
): Promise<{ sent: boolean; error?: string }> {
  const variables = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    program: payload.program,
    message: payload.message?.trim() || '—',
    source: payload.source?.trim() || '—',
    referrer: payload.referrer?.trim() || '—',
    submitted_at: payload.submittedAt ?? new Date().toISOString(),
  };

  const dedupeKey = `diagnostico_admin:${payload.email}:${variables.submitted_at.slice(0, 16)}`;

  const result = await sendTemplateEmail({
    slug: 'diagnostico_admin',
    to: getDiagnosticoNotifyEmail(),
    variables,
    dedupeKey,
    replyTo: payload.email,
  });

  return { sent: result.sent, error: result.error };
}
