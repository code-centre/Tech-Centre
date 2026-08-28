import { Resend } from 'resend';

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export function getResendFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL ??
    'Tech Centre <onboarding@resend.dev>'
  );
}

export function getDiagnosticoNotifyEmail(): string {
  return process.env.DIAGNOSTICO_NOTIFY_EMAIL ?? 'anuar@codigoabierto.tech';
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
