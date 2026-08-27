import { createRemoteJWKSet, jwtVerify } from 'jose';

let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getSupabaseAuthIssuer(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }
  return `${url}/auth/v1`;
}

function getJwks() {
  if (!cachedJwks) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    if (!url) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
    }
    cachedJwks = createRemoteJWKSet(
      new URL(`${url}/auth/v1/.well-known/jwks.json`)
    );
  }
  return cachedJwks;
}

export async function verifySupabaseAccessToken(
  token: string
): Promise<{ sub: string; clientId?: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: getSupabaseAuthIssuer(),
    });

    if (!payload.sub || typeof payload.sub !== 'string') {
      return null;
    }

    const clientId =
      typeof payload.client_id === 'string'
        ? payload.client_id
        : typeof payload.azp === 'string'
          ? payload.azp
          : undefined;

    return { sub: payload.sub, clientId };
  } catch {
    return null;
  }
}
