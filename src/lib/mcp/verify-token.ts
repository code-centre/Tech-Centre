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

function extractClientId(payload: Record<string, unknown>): string | undefined {
  if (typeof payload.client_id === 'string') return payload.client_id;
  if (typeof payload.azp === 'string') return payload.azp;
  return undefined;
}

/**
 * Decodes JWT claims WITHOUT verifying the signature.
 *
 * Only use this on a token whose authenticity was already established by another
 * means (e.g. after the Auth server confirmed it via getUser). It exists so we
 * can read non-security-critical claims such as `client_id` on symmetric-key
 * (HS256) projects, where the JWKS endpoint is empty and local signature
 * verification is not possible.
 */
export function decodeJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(json);
    return typeof payload === 'object' && payload !== null ? payload : null;
  } catch {
    return null;
  }
}

/**
 * Verifies a Supabase access token locally against the project's JWKS.
 *
 * This ONLY succeeds when the project signs JWTs with asymmetric keys
 * (RS256/ES256). Projects still on the legacy HS256 shared secret expose an
 * empty JWKS (`{"keys":[]}`), so this returns null for them and callers must
 * fall back to validating the token against the Auth server.
 */
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

    return { sub: payload.sub, clientId: extractClientId(payload) };
  } catch {
    return null;
  }
}
