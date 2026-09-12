import { createHash } from 'node:crypto';

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function normalizeEmail(email?: string | null): string | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return normalized.includes('@') ? normalized : null;
}

/** E.164-ish digits for Colombia. Meta wants country code, no symbols. */
export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('57')) return digits;
  if (digits.length === 10) return `57${digits}`;
  return digits;
}

export function hashEmail(email?: string | null): string | null {
  const normalized = normalizeEmail(email);
  return normalized ? sha256Hex(normalized) : null;
}

export function hashPhone(phone?: string | null): string | null {
  const normalized = normalizePhone(phone);
  return normalized ? sha256Hex(normalized) : null;
}

export function hashExternalId(externalId?: string | null): string | null {
  if (!externalId) return null;
  const normalized = externalId.trim();
  return normalized ? sha256Hex(normalized) : null;
}
