'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/require-role';
import { getDefaultTemplate } from '@/lib/email/default-templates';
import { invalidateTemplateCache } from '@/lib/email/send-template-email';
import type { EmailTemplateRow } from '@/lib/email/types';
import type { Json } from '@/types/supabase';

export interface EmailTemplateActionResult {
  success: boolean;
  error?: string;
}

function normalizeRow(data: Record<string, unknown>): EmailTemplateRow {
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

export async function listEmailTemplates(): Promise<EmailTemplateRow[]> {
  await requireRole(['admin']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[admin/correos] list error:', error);
    return [];
  }

  return (data ?? []).map((row) => normalizeRow(row as Record<string, unknown>));
}

export async function updateEmailTemplate(
  slug: string,
  input: {
    subject: string;
    html_body: string;
    text_body?: string | null;
    is_active: boolean;
  },
): Promise<EmailTemplateActionResult> {
  const auth = await requireRole(['admin']);
  const supabase = await createClient();

  const { error } = await supabase
    .from('email_templates')
    .update({
      subject: input.subject,
      html_body: input.html_body,
      text_body: input.text_body ?? null,
      is_active: input.is_active,
      updated_at: new Date().toISOString(),
      updated_by: auth.userId,
    } as never)
    .eq('slug', slug);

  if (error) {
    return { success: false, error: error.message };
  }

  invalidateTemplateCache(slug);
  return { success: true };
}

export async function restoreEmailTemplateDefault(
  slug: string,
): Promise<EmailTemplateActionResult> {
  await requireRole(['admin']);
  const defaults = getDefaultTemplate(slug);
  if (!defaults) {
    return { success: false, error: 'Plantilla default no encontrada' };
  }

  return updateEmailTemplate(slug, {
    subject: defaults.subject,
    html_body: defaults.html_body,
    text_body: defaults.text_body,
    is_active: true,
  });
}

export async function getEmailTemplateBySlug(slug: string): Promise<EmailTemplateRow | null> {
  await requireRole(['admin']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return null;
  return normalizeRow(data as Record<string, unknown>);
}

export async function updateSampleVariables(
  slug: string,
  sample_variables: Record<string, string>,
): Promise<EmailTemplateActionResult> {
  await requireRole(['admin']);
  const supabase = await createClient();

  const { error } = await supabase
    .from('email_templates')
    .update({ sample_variables: sample_variables as Json } as never)
    .eq('slug', slug);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
