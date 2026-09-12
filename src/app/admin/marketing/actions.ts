'use server';

import { requireRole } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { buildMarketingReport, type MarketingFilters, type MarketingReport } from '@/lib/analytics/meta/dashboard';
import { recordAndSendMetaEvent } from '@/lib/analytics/meta/server';
import { getAttributionForIdentity } from '@/lib/analytics/meta/persist';

export async function getMarketingDashboard(filters: MarketingFilters): Promise<MarketingReport> {
  await requireRole(['admin']);
  return buildMarketingReport(filters);
}

export async function addMarketingSpend(input: {
  campaignName: string;
  utmCampaign?: string;
  utmContent?: string;
  startsOn: string;
  endsOn: string;
  spend: number;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const auth = await requireRole(['admin']);
  const supabase = await createClient();
  const campaignName = input.campaignName.trim();
  if (!campaignName) return { success: false, error: 'Falta el nombre de la campaña' };
  if (!input.startsOn || !input.endsOn) return { success: false, error: 'Falta el rango de fechas' };
  if (input.endsOn < input.startsOn) return { success: false, error: 'El rango de fechas no es válido' };
  if (!Number.isFinite(input.spend) || input.spend < 0) return { success: false, error: 'El gasto no es válido' };

  const { error } = await (supabase as any).from('marketing_spend').insert({
    campaign_name: campaignName,
    utm_campaign: input.utmCampaign?.trim() || null,
    utm_content: input.utmContent?.trim() || null,
    starts_on: input.startsOn,
    ends_on: input.endsOn,
    spend: input.spend,
    notes: input.notes?.trim() || null,
    created_by: auth.userId,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function markDiagnosticCompleted(leadId: number): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: lead, error } = await (supabase as any)
    .from('leads')
    .update({ diagnostic_completed_at: now })
    .eq('id', leadId)
    .is('diagnostic_completed_at', null)
    .select('id, email, phone, interested_program_id')
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!lead) return { success: true };

  const attribution = await getAttributionForIdentity({ leadId, email: lead.email });

  try {
    await recordAndSendMetaEvent({
      eventName: 'DiagnosticCompleted',
      eventId: `diagnostic:${leadId}`,
      userData: {
        email: lead.email,
        phone: lead.phone,
        externalId: String(leadId),
        fbp: (attribution?.last_fbp as string | null) || (attribution?.first_fbp as string | null),
        fbc: (attribution?.last_fbc as string | null) || (attribution?.first_fbc as string | null),
      },
      persist: {
        leadId,
        programId: lead.interested_program_id,
      },
    });
  } catch {
    // conversion tracking must not fail the admin action
  }

  return { success: true };
}
