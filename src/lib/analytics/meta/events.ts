'use client';

import { attachBrowserIds, readAttribution } from './attribution';
import { newEventId, trackPixel } from './client';
import type { AttributionSnapshot, MetaCustomData, MetaEventName } from './types';

export interface ClientTrackPayload {
  eventName: MetaEventName;
  eventId?: string;
  eventSourceUrl?: string;
  email?: string | null;
  phone?: string | null;
  externalId?: string | null;
  customData?: MetaCustomData;
  leadId?: number | null;
  userId?: string | null;
  programId?: number | null;
  persistCapi?: boolean;
}

async function sendToServer(payload: ClientTrackPayload & { eventId: string }): Promise<void> {
  if (payload.persistCapi === false) return;
  const attribution = attachBrowserIds(readAttribution());
  try {
    await fetch('/api/analytics/meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: payload.eventName,
        eventId: payload.eventId,
        eventSourceUrl: payload.eventSourceUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        externalId: payload.externalId ?? null,
        customData: payload.customData,
        leadId: payload.leadId ?? null,
        userId: payload.userId ?? null,
        programId: payload.programId ?? null,
        attribution,
      }),
      keepalive: true,
    });
  } catch {
    // never block the UI
  }
}

function trackBoth(payload: ClientTrackPayload): string {
  const eventId = payload.eventId || newEventId();
  trackPixel(payload.eventName, payload.customData, eventId);
  void sendToServer({ ...payload, eventId });
  return eventId;
}

export function currentAttribution(): AttributionSnapshot | null {
  return attachBrowserIds(readAttribution());
}

export function trackViewContent(params: {
  contentName: string;
  contentIds: string[];
  contentCategory?: string;
  value?: number | null;
  programId?: number | null;
}): string {
  const customData: MetaCustomData = {
    content_name: params.contentName,
    content_ids: params.contentIds,
    content_type: 'product',
    content_category: params.contentCategory,
    currency: 'COP',
  };
  if (typeof params.value === 'number' && params.value > 0) {
    customData.value = params.value;
  }
  return trackBoth({
    eventName: 'ViewContent',
    customData,
    programId: params.programId,
  });
}

export function trackLead(params: {
  eventId: string;
  email: string;
  phone?: string | null;
  contentName?: string;
  contentIds?: string[];
  programId?: number | null;
  leadId?: number | null;
  persistCapi?: boolean;
}): string {
  return trackBoth({
    eventName: 'Lead',
    eventId: params.eventId,
    email: params.email,
    phone: params.phone,
    leadId: params.leadId,
    programId: params.programId,
    persistCapi: params.persistCapi,
    customData: {
      content_name: params.contentName,
      content_ids: params.contentIds,
      content_type: 'product',
      currency: 'COP',
    },
  });
}

export function trackSchedule(params: {
  eventId: string;
  email: string;
  phone?: string | null;
  contentName?: string;
  contentIds?: string[];
  programId?: number | null;
  leadId?: number | null;
  persistCapi?: boolean;
}): string {
  return trackBoth({
    eventName: 'Schedule',
    eventId: params.eventId,
    email: params.email,
    phone: params.phone,
    leadId: params.leadId,
    programId: params.programId,
    persistCapi: params.persistCapi,
    customData: {
      content_name: params.contentName,
      content_ids: params.contentIds,
      content_type: 'product',
      currency: 'COP',
    },
  });
}

export function trackInitiateCheckout(params: {
  contentName: string;
  contentIds: string[];
  value?: number | null;
  programId?: number | null;
  email?: string | null;
  userId?: string | null;
}): string {
  const key = `meta:checkout:${params.contentIds.join(',')}`;
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) {
    return sessionStorage.getItem(key) as string;
  }
  const eventId = newEventId();
  try {
    sessionStorage.setItem(key, eventId);
  } catch {
    // ignore
  }
  const customData: MetaCustomData = {
    content_name: params.contentName,
    content_ids: params.contentIds,
    content_type: 'product',
    currency: 'COP',
  };
  if (typeof params.value === 'number' && params.value > 0) {
    customData.value = params.value;
  }
  return trackBoth({
    eventName: 'InitiateCheckout',
    eventId,
    email: params.email,
    externalId: params.userId,
    programId: params.programId,
    userId: params.userId,
    customData,
  });
}

export function trackCompleteRegistration(params: {
  email: string;
  userId: string;
}): string {
  const key = `meta:reg:${params.userId}`;
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) {
    return sessionStorage.getItem(key) as string;
  }
  const eventId = newEventId();
  try {
    sessionStorage.setItem(key, eventId);
  } catch {
    // ignore
  }
  return trackBoth({
    eventName: 'CompleteRegistration',
    eventId,
    email: params.email,
    externalId: params.userId,
    userId: params.userId,
  });
}

export function trackPurchase(): never {
  throw new Error('Purchase is server-only after payment confirmation');
}

export { newEventId };
