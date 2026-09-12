export const META_STANDARD_EVENTS = [
  'PageView',
  'ViewContent',
  'Lead',
  'CompleteRegistration',
  'InitiateCheckout',
  'Purchase',
] as const;

export const META_CUSTOM_EVENTS = ['Schedule', 'DiagnosticCompleted'] as const;

export type MetaStandardEvent = (typeof META_STANDARD_EVENTS)[number];
export type MetaCustomEvent = (typeof META_CUSTOM_EVENTS)[number];
export type MetaEventName = MetaStandardEvent | MetaCustomEvent;

export type MarketingEventSource = 'pixel' | 'capi' | 'server';

export interface AttributionTouch {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  fbclid?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
  fbp?: string | null;
  fbc?: string | null;
}

export interface AttributionSnapshot {
  session_id: string;
  first: AttributionTouch;
  last: AttributionTouch;
  first_touch_at: string | null;
  last_touch_at: string | null;
}

export interface MetaUserDataInput {
  email?: string | null;
  phone?: string | null;
  externalId?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
}

export interface MetaCustomData {
  currency?: string;
  value?: number;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  content_category?: string;
  order_id?: string;
  transaction_id?: string;
  status?: string;
}

export interface SendMetaEventInput {
  eventName: MetaEventName;
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string | null;
  userData?: MetaUserDataInput;
  customData?: MetaCustomData;
}

export interface PersistMarketingEventInput {
  eventName: MetaEventName;
  eventId: string;
  source: MarketingEventSource;
  leadId?: number | null;
  userId?: string | null;
  enrollmentId?: number | null;
  invoiceId?: number | null;
  programId?: number | null;
  value?: number | null;
  currency?: string;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
}

export const ATTRIBUTION_COOKIE = 'tc_attr';
export const SESSION_COOKIE = 'tc_sid';
export const ATTRIBUTION_STORAGE_KEY = 'tc_attr';

export const MARKETING_PROGRAM_CODES = [
  'fundamentos-de-programacion',
  'fundamentos-con-python',
  'ingenieria-de-producto',
  'ingenieria-de-datos',
  'harness-y-agentes-de-ia',
  'machine-learning-aplicado',
] as const;

export const MARKETING_EJECUTIVO_CODES = [
  'programa-ejecutivo-de-ia-aplicada',
  'programa-ejecutivo-ia-aplicada',
  'ejecutivo-ia',
] as const;

export const DEFAULT_MODULE_CAPACITY = 12;

export function programListPrice(program: {
  discount?: number | null;
  default_price?: number | null;
}): number | null {
  const discount = Number(program.discount);
  if (Number.isFinite(discount) && discount > 0) return discount;
  const price = Number(program.default_price);
  if (Number.isFinite(price) && price > 0) return price;
  return null;
}
