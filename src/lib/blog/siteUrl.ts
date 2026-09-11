/**
 * Canonical public origin. Apex techcentre.co 307s to www; LinkedIn
 * often refuses to follow redirects when fetching og:image.
 */
export function canonicalSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://www.techcentre.co';
  try {
    const url = new URL(raw);
    if (url.hostname === 'techcentre.co') {
      url.hostname = 'www.techcentre.co';
    }
    return url.origin.replace(/\/$/, '');
  } catch {
    return 'https://www.techcentre.co';
  }
}
