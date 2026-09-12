import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { logMetaError } from './log';
import type {
  AttributionSnapshot,
  PersistMarketingEventInput,
} from './types';

function serviceClient() {
  try {
    return createServiceRoleClient();
  } catch {
    return null;
  }
}

function touchFields(prefix: 'first' | 'last', touch: AttributionSnapshot['first']) {
  return {
    [`${prefix}_utm_source`]: touch.utm_source ?? null,
    [`${prefix}_utm_medium`]: touch.utm_medium ?? null,
    [`${prefix}_utm_campaign`]: touch.utm_campaign ?? null,
    [`${prefix}_utm_content`]: touch.utm_content ?? null,
    [`${prefix}_utm_term`]: touch.utm_term ?? null,
    [`${prefix}_fbclid`]: touch.fbclid ?? null,
    [`${prefix}_landing_page`]: touch.landing_page ?? null,
    [`${prefix}_referrer`]: touch.referrer ?? null,
    [`${prefix}_fbp`]: touch.fbp ?? null,
    [`${prefix}_fbc`]: touch.fbc ?? null,
  };
}

export async function persistMarketingEvent(
  input: PersistMarketingEventInput
): Promise<{ inserted: boolean }> {
  const supabase = serviceClient();
  if (!supabase) return { inserted: false };

  const { error } = await (supabase as any).from('marketing_events').insert({
    event_name: input.eventName,
    event_id: input.eventId,
    source: input.source,
    lead_id: input.leadId ?? null,
    user_id: input.userId ?? null,
    enrollment_id: input.enrollmentId ?? null,
    invoice_id: input.invoiceId ?? null,
    program_id: input.programId ?? null,
    value: input.value ?? null,
    currency: input.currency ?? 'COP',
    metadata: input.metadata ?? {},
    occurred_at: input.occurredAt ?? new Date().toISOString(),
  });

  if (error) {
    if (error.code === '23505') {
      return { inserted: false };
    }
    logMetaError('failed to persist marketing_event', {
      eventName: input.eventName,
      eventId: input.eventId,
    });
    return { inserted: false };
  }

  return { inserted: true };
}

export async function hasEventForUser(
  eventName: string,
  userId: string
): Promise<boolean> {
  const supabase = serviceClient();
  if (!supabase || !userId) return false;
  const { data } = await (supabase as any)
    .from('marketing_events')
    .select('id')
    .eq('event_name', eventName)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

async function findAttributionRow(params: {
  sessionId?: string | null;
  leadId?: number | null;
  userId?: string | null;
  email?: string | null;
}) {
  const supabase = serviceClient();
  if (!supabase) return { supabase: null, row: null as Record<string, unknown> | null };

  if (params.userId) {
    const { data } = await (supabase as any)
      .from('marketing_attribution')
      .select('*')
      .eq('user_id', params.userId)
      .maybeSingle();
    if (data) return { supabase, row: data as Record<string, unknown> };
  }

  if (params.leadId) {
    const { data } = await (supabase as any)
      .from('marketing_attribution')
      .select('*')
      .eq('lead_id', params.leadId)
      .maybeSingle();
    if (data) return { supabase, row: data as Record<string, unknown> };
  }

  if (params.sessionId) {
    const { data } = await (supabase as any)
      .from('marketing_attribution')
      .select('*')
      .eq('session_id', params.sessionId)
      .maybeSingle();
    if (data) return { supabase, row: data as Record<string, unknown> };
  }

  if (params.email) {
    const { data: lead } = await (supabase as any)
      .from('leads')
      .select('id')
      .eq('email', params.email.trim().toLowerCase())
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (lead?.id) {
      const { data } = await (supabase as any)
        .from('marketing_attribution')
        .select('*')
        .eq('lead_id', lead.id)
        .maybeSingle();
      if (data) return { supabase, row: data as Record<string, unknown> };
    }
  }

  return { supabase, row: null as Record<string, unknown> | null };
}

export async function upsertAttribution(params: {
  snapshot: AttributionSnapshot;
  leadId?: number | null;
  userId?: string | null;
  email?: string | null;
}): Promise<void> {
  const { snapshot } = params;
  const { supabase, row } = await findAttributionRow({
    sessionId: snapshot.session_id,
    leadId: params.leadId,
    userId: params.userId,
    email: params.email,
  });
  if (!supabase) return;

  const firstFields = touchFields('first', snapshot.first);
  const lastFields = touchFields('last', snapshot.last);
  const now = new Date().toISOString();

  if (!row) {
    await (supabase as any).from('marketing_attribution').insert({
      session_id: snapshot.session_id,
      lead_id: params.leadId ?? null,
      user_id: params.userId ?? null,
      ...firstFields,
      ...lastFields,
      first_touch_at: snapshot.first_touch_at ?? now,
      last_touch_at: snapshot.last_touch_at ?? now,
      updated_at: now,
    });
    return;
  }

  const update: Record<string, unknown> = {
    ...lastFields,
    last_touch_at: snapshot.last_touch_at ?? row.last_touch_at ?? now,
    updated_at: now,
  };

  if (params.leadId && !row.lead_id) update.lead_id = params.leadId;
  if (params.userId && !row.user_id) update.user_id = params.userId;
  if (!row.session_id && snapshot.session_id) update.session_id = snapshot.session_id;

  // First-touch is immutable once stored.
  await (supabase as any)
    .from('marketing_attribution')
    .update(update)
    .eq('id', row.id);
}

export async function getAttributionForIdentity(params: {
  leadId?: number | null;
  userId?: string | null;
  email?: string | null;
}): Promise<Record<string, unknown> | null> {
  const { row } = await findAttributionRow(params);
  return row;
}
