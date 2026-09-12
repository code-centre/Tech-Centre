import { headers } from 'next/headers';
import type { AttributionSnapshot } from './types';
import { upsertAttribution } from './persist';
import { recordAndSendMetaEvent } from './server';
import type { MetaEventName } from './types';

export interface LeadTrackingInput {
  eventId?: string | null;
  scheduleEventId?: string | null;
  attribution?: AttributionSnapshot | null;
  email: string;
  phone?: string | null;
  leadId: number;
  programId?: number | null;
  contentName?: string | null;
  contentIds?: string[];
  eventName?: Extract<MetaEventName, 'Lead' | 'Schedule'>;
}

export async function trackServerLeadConversion(input: LeadTrackingInput): Promise<void> {
  if (input.attribution?.session_id) {
    try {
      await upsertAttribution({
        snapshot: input.attribution,
        leadId: input.leadId,
        email: input.email,
      });
    } catch {
      // attribution must not fail the lead
    }
  }

  if (!input.eventId) return;

  const headersList = await headers();
  const eventSourceUrl = headersList.get('referer');
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || headersList.get('x-real-ip');
  const userAgent = headersList.get('user-agent');
  const fbp = input.attribution?.last?.fbp || input.attribution?.first?.fbp || null;
  const fbc = input.attribution?.last?.fbc || input.attribution?.first?.fbc || null;

  await recordAndSendMetaEvent({
    eventName: input.eventName ?? 'Lead',
    eventId: input.eventId,
    eventSourceUrl,
    userData: {
      email: input.email,
      phone: input.phone,
      externalId: String(input.leadId),
      clientIpAddress: ip,
      clientUserAgent: userAgent,
      fbp,
      fbc,
    },
    customData: {
      currency: 'COP',
      content_name: input.contentName || undefined,
      content_ids: input.contentIds,
      content_type: 'product',
      content_category: input.contentName || undefined,
    },
    persist: {
      leadId: input.leadId,
      programId: input.programId ?? null,
    },
  });
}
