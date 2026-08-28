import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getDefaultTemplate } from './default-templates';
import { renderEmailTemplate } from './template-engine';
import {
  getResendClient,
  getResendFromEmail,
  isResendConfigured,
} from './resend-client';
import type { EmailTemplateRow, TemplateVariables } from './types';

const templateCache = new Map<string, { row: EmailTemplateRow; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

export async function loadEmailTemplate(slug: string): Promise<EmailTemplateRow | null> {
  const cached = templateCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.row;
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('[email] load template error:', slug, error);
    }

    if (data) {
      const row = normalizeTemplateRow(data);
      templateCache.set(slug, { row, expiresAt: Date.now() + CACHE_TTL_MS });
      return row;
    }
  } catch (err) {
    console.warn('[email] DB template load failed, using default:', slug, err);
  }

  const fallback = getDefaultTemplate(slug);
  if (!fallback) return null;

  const row: EmailTemplateRow = {
    id: `default-${slug}`,
    slug: fallback.slug,
    name: fallback.name,
    description: fallback.description,
    subject: fallback.subject,
    html_body: fallback.html_body,
    text_body: fallback.text_body,
    sample_variables: fallback.sample_variables,
    is_active: true,
    updated_at: new Date().toISOString(),
    updated_by: null,
  };
  templateCache.set(slug, { row, expiresAt: Date.now() + CACHE_TTL_MS });
  return row;
}

export function invalidateTemplateCache(slug?: string): void {
  if (slug) {
    templateCache.delete(slug);
    return;
  }
  templateCache.clear();
}

function normalizeTemplateRow(data: Record<string, unknown>): EmailTemplateRow {
  const sample =
    data.sample_variables && typeof data.sample_variables === 'object' && !Array.isArray(data.sample_variables)
      ? (data.sample_variables as Record<string, string>)
      : {};

  return {
    id: String(data.id),
    slug: String(data.slug),
    name: String(data.name),
    description: data.description != null ? String(data.description) : null,
    subject: String(data.subject),
    html_body: String(data.html_body),
    text_body: data.text_body != null ? String(data.text_body) : null,
    sample_variables: sample,
    is_active: Boolean(data.is_active),
    updated_at: String(data.updated_at),
    updated_by: data.updated_by != null ? String(data.updated_by) : null,
  };
}

export interface SendTemplateEmailOptions {
  slug: string;
  to: string;
  variables: TemplateVariables;
  dedupeKey?: string;
  enrollmentId?: number;
  cohortId?: number;
  replyTo?: string;
  skipLayout?: boolean;
}

export interface SendTemplateEmailResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
  resendId?: string;
}

export async function sendTemplateEmail(
  options: SendTemplateEmailOptions,
): Promise<SendTemplateEmailResult> {
  const { slug, to, variables, dedupeKey, enrollmentId, cohortId, replyTo, skipLayout } = options;

  if (!isResendConfigured()) {
    console.warn('[email] RESEND_API_KEY no configurada; envío omitido:', slug);
    return { sent: false, error: 'Resend no configurado' };
  }

  const template = await loadEmailTemplate(slug);
  if (!template) {
    return { sent: false, error: `Template no encontrado: ${slug}` };
  }

  if (!template.is_active) {
    return { sent: false, skipped: true, error: 'Template inactivo' };
  }

  const supabase = createServiceRoleClient();

  if (dedupeKey) {
    const { data: existing } = await supabase
      .from('email_send_log')
      .select('id')
      .eq('dedupe_key', dedupeKey)
      .maybeSingle();

    if (existing) {
      return { sent: false, skipped: true, error: 'Ya enviado (dedupe)' };
    }
  }

  const rendered = renderEmailTemplate(template, variables, {
    wrapLayout: !skipLayout,
    siteUrl: variables.site_url,
  });

  const resend = getResendClient();
  if (!resend) {
    return { sent: false, error: 'Cliente Resend no disponible' };
  }

  const { data: sendData, error: sendError } = await resend.emails.send({
    from: getResendFromEmail(),
    to: [to],
    replyTo: replyTo || undefined,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });

  const logPayload = {
    template_slug: slug,
    recipient_email: to,
    enrollment_id: enrollmentId ?? null,
    cohort_id: cohortId ?? null,
    dedupe_key: dedupeKey ?? `${slug}:${to}:${Date.now()}`,
    resend_id: sendData?.id ?? null,
    status: sendError ? 'failed' : 'sent',
    error: sendError?.message ?? null,
  };

  const { error: logError } = await supabase.from('email_send_log').insert(logPayload as never);
  if (logError && !sendError) {
    console.warn('[email] log insert error:', logError);
  }

  if (sendError) {
    console.error('[email] Resend error:', slug, sendError);
    return { sent: false, error: sendError.message };
  }

  return { sent: true, resendId: sendData?.id };
}
