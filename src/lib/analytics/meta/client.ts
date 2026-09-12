'use client';

import type { MetaCustomData, MetaEventName } from './types';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    __tcMetaPixelLoaded?: boolean;
  }
}

const STANDARD = new Set([
  'PageView',
  'ViewContent',
  'Lead',
  'CompleteRegistration',
  'InitiateCheckout',
  'Purchase',
]);

export function getPixelId(): string | null {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  return id || null;
}

export function loadMetaPixel(): void {
  if (typeof window === 'undefined') return;
  const pixelId = getPixelId();
  if (!pixelId) return;
  if (window.__tcMetaPixelLoaded) return;

  const fbq: ((...args: unknown[]) => void) & {
    queue?: unknown[];
    loaded?: boolean;
    version?: string;
    callMethod?: (...args: unknown[]) => void;
    push?: unknown;
  } =
    window.fbq ||
    function (...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        (fbq.queue = fbq.queue || []).push(args);
      }
    };

  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const first = document.getElementsByTagName('script')[0];
  first?.parentNode?.insertBefore(script, first);

  fbq('init', pixelId);
  window.__tcMetaPixelLoaded = true;
}

export function trackPixel(
  eventName: MetaEventName,
  customData?: MetaCustomData,
  eventId?: string
): void {
  if (typeof window === 'undefined') return;
  if (!getPixelId()) return;
  loadMetaPixel();
  if (typeof window.fbq !== 'function') return;

  const method = STANDARD.has(eventName) ? 'track' : 'trackCustom';
  const payload = customData ? { ...customData } : undefined;
  const options = eventId ? { eventID: eventId } : undefined;

  try {
    if (payload && options) {
      window.fbq(method, eventName, payload, options);
    } else if (payload) {
      window.fbq(method, eventName, payload);
    } else if (options) {
      window.fbq(method, eventName, {}, options);
    } else {
      window.fbq(method, eventName);
    }
  } catch {
    // analytics must never break the page
  }
}

export function newEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
