function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function logMetaInfo(message: string, extra?: Record<string, unknown>): void {
  if (isProd()) {
    console.info('[meta]', message, extra?.eventName, extra?.eventId);
    return;
  }
  console.info('[meta]', message, extra);
}

export function logMetaError(message: string, extra?: Record<string, unknown>): void {
  if (isProd()) {
    console.error('[meta]', message, extra?.eventName, extra?.eventId);
    return;
  }
  console.error('[meta]', message, extra);
}
