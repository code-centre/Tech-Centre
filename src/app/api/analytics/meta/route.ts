import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/route-handler';
import { upsertAttribution } from '@/lib/analytics/meta/persist';
import { recordAndSendMetaEvent, requestClientHints } from '@/lib/analytics/meta/server';
import {
  META_CUSTOM_EVENTS,
  META_STANDARD_EVENTS,
  SESSION_COOKIE,
  type AttributionSnapshot,
  type MetaEventName,
} from '@/lib/analytics/meta/types';

export const runtime = 'nodejs';

const ALLOWED = new Set<string>([...META_STANDARD_EVENTS, ...META_CUSTOM_EVENTS]);

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limited = rateLimit(`meta-capi:${ip}`, 60, 60_000);
  if (!limited.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName = body.eventName as string;
  const eventId = typeof body.eventId === 'string' ? body.eventId : '';
  if (!ALLOWED.has(eventName) || !eventId) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }

  if (eventName === 'Purchase') {
    return NextResponse.json({ ok: false, reason: 'purchase_server_only' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? null;
  const email = user?.email ?? null;

  if (eventName === 'CompleteRegistration' && !userId) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const hints = requestClientHints(request);
  const attribution = (body.attribution ?? null) as AttributionSnapshot | null;
  const cookieSessionId = request.cookies.get(SESSION_COOKIE)?.value || null;

  if (attribution && (cookieSessionId || userId)) {
    try {
      await upsertAttribution({
        snapshot: {
          ...attribution,
          session_id: cookieSessionId || `user:${userId}`,
        },
        userId,
        email,
      });
    } catch {
      // attribution must not fail the conversion
    }
  }

  const customData = (body.customData ?? {}) as Record<string, unknown>;
  const fbp = attribution?.last?.fbp || attribution?.first?.fbp || null;
  const fbc = attribution?.last?.fbc || attribution?.first?.fbc || null;

  await recordAndSendMetaEvent({
    eventName: eventName as MetaEventName,
    eventId,
    eventSourceUrl: typeof body.eventSourceUrl === 'string' ? body.eventSourceUrl : request.headers.get('referer'),
    userData: {
      email,
      externalId: userId,
      clientIpAddress: hints.clientIpAddress,
      clientUserAgent: hints.clientUserAgent,
      fbp,
      fbc,
    },
    customData: {
      currency: typeof customData.currency === 'string' ? customData.currency : 'COP',
      value: typeof customData.value === 'number' ? customData.value : undefined,
      content_name: typeof customData.content_name === 'string' ? customData.content_name : undefined,
      content_ids: Array.isArray(customData.content_ids) ? (customData.content_ids as string[]) : undefined,
      content_type: typeof customData.content_type === 'string' ? customData.content_type : undefined,
      content_category: typeof customData.content_category === 'string' ? customData.content_category : undefined,
    },
    persist: {
      userId,
      programId: typeof body.programId === 'number' ? body.programId : null,
    },
  });

  return NextResponse.json({ ok: true });
}
