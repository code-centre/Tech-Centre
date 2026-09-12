import { canonicalSiteUrl } from '@/lib/blog/siteUrl';
import { hashEmail, hashExternalId, hashPhone } from './hash';
import { logMetaError, logMetaInfo } from './log';
import { persistMarketingEvent } from './persist';
import type {
  MetaCustomData,
  MetaEventName,
  MetaUserDataInput,
  PersistMarketingEventInput,
  SendMetaEventInput,
} from './types';

const DEFAULT_API_VERSION = 'v21.0';
const CAPI_TIMEOUT_MS = 5_000;

function pixelId(): string | null {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || null;
}

function accessToken(): string | null {
  return process.env.META_CONVERSIONS_API_ACCESS_TOKEN?.trim() || null;
}

function apiVersion(): string {
  return process.env.META_API_VERSION?.trim() || DEFAULT_API_VERSION;
}

function compactUserData(userData?: MetaUserDataInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const em = hashEmail(userData?.email);
  const ph = hashPhone(userData?.phone);
  const externalId = hashExternalId(userData?.externalId);
  if (em) out.em = [em];
  if (ph) out.ph = [ph];
  if (externalId) out.external_id = [externalId];
  if (userData?.clientIpAddress) out.client_ip_address = userData.clientIpAddress;
  if (userData?.clientUserAgent) out.client_user_agent = userData.clientUserAgent;
  if (userData?.fbp) out.fbp = userData.fbp;
  if (userData?.fbc) out.fbc = userData.fbc;
  return out;
}

function compactCustomData(customData?: MetaCustomData): Record<string, unknown> | undefined {
  if (!customData) return undefined;
  const out: Record<string, unknown> = {};
  if (customData.currency) out.currency = customData.currency;
  if (typeof customData.value === 'number' && Number.isFinite(customData.value)) {
    out.value = customData.value;
  }
  if (customData.content_name) out.content_name = customData.content_name;
  if (customData.content_ids?.length) out.content_ids = customData.content_ids;
  if (customData.content_type) out.content_type = customData.content_type;
  if (customData.content_category) out.content_category = customData.content_category;
  if (customData.order_id) out.order_id = customData.order_id;
  else if (customData.transaction_id) out.order_id = customData.transaction_id;
  return Object.keys(out).length ? out : undefined;
}

export async function sendMetaEvent(input: SendMetaEventInput): Promise<{ ok: boolean }> {
  const id = pixelId();
  const token = accessToken();
  if (!id || !token) {
    logMetaInfo('CAPI skipped (missing pixel or token)', {
      eventName: input.eventName,
      eventId: input.eventId,
    });
    return { ok: false };
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl || canonicalSiteUrl(),
        action_source: 'website',
        user_data: compactUserData(input.userData),
        custom_data: compactCustomData(input.customData),
      },
    ],
  };

  const testCode = process.env.META_TEST_EVENT_CODE?.trim();
  if (testCode) payload.test_event_code = testCode;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion()}/${id}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, access_token: token }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      logMetaError('CAPI request failed', {
        eventName: input.eventName,
        eventId: input.eventId,
        status: response.status,
      });
      return { ok: false };
    }

    logMetaInfo('CAPI sent', { eventName: input.eventName, eventId: input.eventId });
    return { ok: true };
  } catch (error) {
    const timedOut =
      (error instanceof Error && error.name === 'AbortError') ||
      (typeof error === 'object' && error !== null && 'name' in error && (error as { name?: string }).name === 'AbortError');
    logMetaError(timedOut ? 'CAPI request timed out' : 'CAPI request threw', {
      eventName: input.eventName,
      eventId: input.eventId,
    });
    return { ok: false };
  } finally {
    clearTimeout(timeout);
  }
}

export async function recordAndSendMetaEvent(params: {
  eventName: MetaEventName;
  eventId: string;
  eventSourceUrl?: string | null;
  userData?: MetaUserDataInput;
  customData?: MetaCustomData;
  persist?: Omit<PersistMarketingEventInput, 'eventName' | 'eventId' | 'source'>;
}): Promise<{ sent: boolean }> {
  let inserted = false;
  let duplicate = false;
  try {
    const persist = await persistMarketingEvent({
      eventName: params.eventName,
      eventId: params.eventId,
      source: 'capi',
      ...params.persist,
      value: params.persist?.value ?? params.customData?.value ?? null,
      currency: params.persist?.currency ?? params.customData?.currency ?? 'COP',
      metadata: {
        ...(params.persist?.metadata ?? {}),
        content_ids: params.customData?.content_ids,
        content_name: params.customData?.content_name,
        order_id: params.customData?.order_id ?? params.customData?.transaction_id,
      },
    });
    inserted = persist.inserted;
    duplicate = Boolean(persist.duplicate);
  } catch {
    logMetaError('persist before CAPI failed', {
      eventName: params.eventName,
      eventId: params.eventId,
    });
  }

  if (duplicate) {
    return { sent: false };
  }

  if (params.eventName === 'CompleteRegistration' && !inserted) {
    return { sent: false };
  }

  try {
    const capi = await sendMetaEvent({
      eventName: params.eventName,
      eventId: params.eventId,
      eventSourceUrl: params.eventSourceUrl,
      userData: params.userData,
      customData: params.customData,
    });
    return { sent: capi.ok };
  } catch {
    logMetaError('CAPI swallowed', {
      eventName: params.eventName,
      eventId: params.eventId,
    });
    return { sent: false };
  }
}

export function requestClientHints(request: Request): {
  clientIpAddress: string | null;
  clientUserAgent: string | null;
} {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip');
  return {
    clientIpAddress: ip || null,
    clientUserAgent: request.headers.get('user-agent'),
  };
}
