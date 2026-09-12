import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_STORAGE_KEY,
  SESSION_COOKIE,
  type AttributionSnapshot,
  type AttributionTouch,
} from './types';

function blankToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function newSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `s_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function emptyTouch(): AttributionTouch {
  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    fbclid: null,
    landing_page: null,
    referrer: null,
    fbp: null,
    fbc: null,
  };
}

function hasAttributedSignal(touch: AttributionTouch): boolean {
  return Boolean(
    touch.utm_source ||
      touch.utm_medium ||
      touch.utm_campaign ||
      touch.utm_content ||
      touch.utm_term ||
      touch.fbclid
  );
}

function touchFromSearch(params: URLSearchParams, landingPage: string, referrer: string | null): AttributionTouch {
  return {
    utm_source: blankToNull(params.get('utm_source')),
    utm_medium: blankToNull(params.get('utm_medium')),
    utm_campaign: blankToNull(params.get('utm_campaign')),
    utm_content: blankToNull(params.get('utm_content')),
    utm_term: blankToNull(params.get('utm_term')),
    fbclid: blankToNull(params.get('fbclid')),
    landing_page: blankToNull(landingPage),
    referrer: blankToNull(referrer),
    fbp: null,
    fbc: null,
  };
}

export function buildFbc(fbclid: string | null | undefined, now = Date.now()): string | null {
  if (!fbclid) return null;
  return `fb.1.${Math.floor(now / 1000)}.${fbclid}`;
}

export function mergeAttribution(
  stored: AttributionSnapshot | null,
  incoming: AttributionTouch,
  nowIso: string
): AttributionSnapshot {
  const session_id = stored?.session_id || newSessionId();

  if (!stored || !stored.first_touch_at) {
    return {
      session_id,
      first: { ...incoming },
      last: hasAttributedSignal(incoming) ? { ...incoming } : { ...incoming },
      first_touch_at: nowIso,
      last_touch_at: hasAttributedSignal(incoming) ? nowIso : nowIso,
    };
  }

  const next: AttributionSnapshot = {
    session_id,
    first: { ...stored.first },
    last: { ...stored.last },
    first_touch_at: stored.first_touch_at,
    last_touch_at: stored.last_touch_at,
  };

  if (hasAttributedSignal(incoming)) {
    next.last = { ...incoming };
    next.last_touch_at = nowIso;
  } else {
    if (incoming.fbp && !next.last.fbp) next.last.fbp = incoming.fbp;
    if (incoming.fbc && !next.last.fbc) next.last.fbc = incoming.fbc;
    if (incoming.fbp && !next.first.fbp) next.first.fbp = incoming.fbp;
    if (incoming.fbc && !next.first.fbc) next.first.fbc = incoming.fbc;
  }

  return next;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split('=');
    if (rawName === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

function writeCookie(name: string, value: string, maxAgeSec: number): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax`;
}

function parseSnapshot(raw: string | null): AttributionSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AttributionSnapshot;
    if (!parsed || typeof parsed !== 'object' || !parsed.session_id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readAttribution(): AttributionSnapshot | null {
  if (typeof window === 'undefined') return null;
  const fromStorage = parseSnapshot(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY));
  if (fromStorage) return fromStorage;
  return parseSnapshot(readCookie(ATTRIBUTION_COOKIE));
}

export function persistAttribution(snapshot: AttributionSnapshot): void {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify(snapshot);
  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, payload);
  } catch {
    // private mode
  }
  writeCookie(ATTRIBUTION_COOKIE, payload, 60 * 60 * 24 * 180);
  writeCookie(SESSION_COOKIE, snapshot.session_id, 60 * 60 * 24 * 180);
}

export function readBrowserIds(): { fbp: string | null; fbc: string | null } {
  return {
    fbp: readCookie('_fbp'),
    fbc: readCookie('_fbc'),
  };
}

export function captureAttributionFromLocation(): AttributionSnapshot | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const landing = `${window.location.pathname}${window.location.search}`;
  const incoming = touchFromSearch(params, landing, document.referrer || null);
  const ids = readBrowserIds();
  incoming.fbp = ids.fbp;
  incoming.fbc = ids.fbc || buildFbc(incoming.fbclid);

  const stored = readAttribution();
  const merged = mergeAttribution(stored, incoming, new Date().toISOString());
  persistAttribution(merged);
  return merged;
}

export function attachBrowserIds(snapshot: AttributionSnapshot | null): AttributionSnapshot | null {
  if (!snapshot) return readAttribution();
  const ids = readBrowserIds();
  const next: AttributionSnapshot = {
    ...snapshot,
    first: { ...snapshot.first },
    last: { ...snapshot.last },
  };
  if (ids.fbp) {
    next.last.fbp = ids.fbp;
    if (!next.first.fbp) next.first.fbp = ids.fbp;
  }
  if (ids.fbc) {
    next.last.fbc = ids.fbc;
    if (!next.first.fbc) next.first.fbc = ids.fbc;
  }
  persistAttribution(next);
  return next;
}
