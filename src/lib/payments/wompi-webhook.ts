import { createHash } from 'crypto';

interface WompiSignature {
  properties: string[];
  checksum: string;
}

interface WompiEvent {
  event: string;
  data: Record<string, unknown>;
  timestamp: number;
  signature: WompiSignature;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function verifyWompiEventChecksum(
  event: WompiEvent,
  headerChecksum: string | null,
  eventsSecret: string
): boolean {
  const properties = event.signature?.properties ?? [];
  let concatenated = '';

  for (const property of properties) {
    const value = getNestedValue(event.data, property);
    if (value === undefined || value === null) {
      return false;
    }
    concatenated += String(value);
  }

  concatenated += String(event.timestamp);
  concatenated += eventsSecret;

  const computed = createHash('sha256').update(concatenated).digest('hex');
  const expected = (headerChecksum || event.signature?.checksum || '').toLowerCase();

  return computed === expected.toLowerCase();
}

export type { WompiEvent };
