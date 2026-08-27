import { createClient } from '@supabase/supabase-js';
import type { AuthInfo } from '@modelcontextprotocol/server';
import type { Database } from '@/types/supabase';
import type { AppRole } from '@/lib/auth/require-role';
import { verifySupabaseAccessToken } from '@/lib/mcp/verify-token';

export const MCP_SCOPES = {
  COHORTS_READ: 'cohorts:read',
  COHORTS_WRITE: 'cohorts:write',
  ENROLLMENTS_READ: 'enrollments:read',
  ENROLLMENTS_WRITE: 'enrollments:write',
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
        MCP_SCOPES.COHORTS_READ,
        MCP_SCOPES.ENROLLMENTS_READ,
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
  const verified = await verifySupabaseAccessToken(bearerToken);
  if (verified) {
    return { userId: verified.sub, clientId: verified.clientId };
  }

  const supabase = createSupabaseClientForToken(bearerToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return { userId: user.id };
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

export function getMcpResourceUrl(): string {
  return `${getPublicSiteUrl()}/api/mcp/mcp`;
}
