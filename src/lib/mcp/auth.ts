import { createClient } from '@supabase/supabase-js';
import type { AuthInfo } from '@modelcontextprotocol/server';
import type { Database } from '@/types/supabase';
import type { AppRole } from '@/lib/auth/require-role';
import { decodeJwtClaims, verifySupabaseAccessToken } from '@/lib/mcp/verify-token';

export const MCP_SCOPES = {
  PROGRAMS_READ: 'programs:read',
  PROGRAMS_WRITE: 'programs:write',
  ROUTES_READ: 'routes:read',
  ROUTES_WRITE: 'routes:write',
  COHORTS_READ: 'cohorts:read',
  COHORTS_WRITE: 'cohorts:write',
  ENROLLMENTS_READ: 'enrollments:read',
  ENROLLMENTS_WRITE: 'enrollments:write',
  LEADS_READ: 'leads:read',
  LEADS_WRITE: 'leads:write',
  INSTRUCTORS_READ: 'instructors:read',
  INSTRUCTORS_WRITE: 'instructors:write',
  SESSIONS_READ: 'sessions:read',
  SESSIONS_WRITE: 'sessions:write',
  INSTRUCTOR_PAYMENTS_READ: 'instructor_payments:read',
  INSTRUCTOR_PAYMENTS_WRITE: 'instructor_payments:write',
  PAYMENTS_READ: 'payments:read',
  PAYMENTS_WRITE: 'payments:write',
} as const;

export type McpScope = (typeof MCP_SCOPES)[keyof typeof MCP_SCOPES];

export interface McpAuthInfo extends AuthInfo {
  userId: string;
  role: AppRole;
}

function scopesForRole(role: AppRole): McpScope[] {
  switch (role) {
    case 'admin':
      return Object.values(MCP_SCOPES);
    case 'instructor':
      return [
        MCP_SCOPES.PROGRAMS_READ,
        MCP_SCOPES.ROUTES_READ,
        MCP_SCOPES.COHORTS_READ,
        MCP_SCOPES.ENROLLMENTS_READ,
        MCP_SCOPES.INSTRUCTORS_READ,
        MCP_SCOPES.SESSIONS_READ,
        MCP_SCOPES.INSTRUCTOR_PAYMENTS_READ,
        MCP_SCOPES.PAYMENTS_READ,
      ];
    default:
      return [];
  }
}

export function hasScope(auth: McpAuthInfo, scope: McpScope): boolean {
  return (auth.scopes ?? []).includes(scope);
}

export function createSupabaseClientForToken(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase env vars are not configured');
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

async function resolveUserIdFromToken(
  bearerToken: string
): Promise<{ userId: string; clientId?: string } | null> {
  // Fast path: locally verify asymmetric (RS256/ES256) tokens against the JWKS.
  const verified = await verifySupabaseAccessToken(bearerToken);
  if (verified) {
    return { userId: verified.sub, clientId: verified.clientId };
  }

  // Fallback for projects still on the legacy HS256 shared secret: the JWKS is
  // empty so the token cannot be verified locally. Validate it authoritatively
  // against the Auth server by passing the token explicitly to getUser().
  // (Calling getUser() with no argument looks for a stored session, which never
  // exists here, so the token would be ignored and auth would always fail.)
  const supabase = createSupabaseClientForToken(bearerToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(bearerToken);

  if (error || !user) return null;

  const claims = decodeJwtClaims(bearerToken);
  const clientId =
    claims && typeof claims.client_id === 'string'
      ? claims.client_id
      : claims && typeof claims.azp === 'string'
        ? claims.azp
        : undefined;

  return { userId: user.id, clientId };
}

export async function verifyMcpToken(
  _req: Request,
  bearerToken?: string
): Promise<McpAuthInfo | undefined> {
  if (!bearerToken) return undefined;

  const identity = await resolveUserIdFromToken(bearerToken);
  if (!identity) return undefined;

  const supabase = createSupabaseClientForToken(bearerToken);
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', identity.userId)
    .single();

  const role = (profile as { role?: AppRole } | null)?.role;
  if (!role) return undefined;

  const scopes = scopesForRole(role);
  if (scopes.length === 0) return undefined;

  return {
    token: bearerToken,
    clientId: identity.clientId ?? identity.userId,
    scopes,
    userId: identity.userId,
    role,
    extra: { role },
  };
}

export function getSupabaseAuthServerUrls(): string[] {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return [];
  return [`${supabaseUrl.replace(/\/$/, '')}/auth/v1`];
}

export function getPublicSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://www.techcentre.co'
  ).replace(/\/$/, '');
}

export const MCP_ENDPOINT_PATH = '/api/mcp/mcp';

/**
 * Canonical MCP resource identifier (RFC 9728 / RFC 8707).
 *
 * Pass the origin the client actually connected to (derived from the incoming
 * request) so the advertised `resource` always matches the host in the request,
 * regardless of apex-vs-www. Falls back to the configured public site URL when
 * no request origin is available.
 */
export function getMcpResourceUrl(origin?: string): string {
  const base = (origin ?? getPublicSiteUrl()).replace(/\/$/, '');
  return `${base}${MCP_ENDPOINT_PATH}`;
}
