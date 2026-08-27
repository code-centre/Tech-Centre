import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Shield, Bot, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { AppRole } from '@/lib/auth/require-role';

interface Props {
  searchParams: Promise<{
    authorization_id?: string;
    error?: string;
  }>;
}

function isOAuthAuthorizationDetails(
  data: unknown
): data is {
  authorization_id: string;
  client: { name: string };
  redirect_uri: string;
  scope?: string | null;
} {
  return (
    typeof data === 'object' &&
    data !== null &&
    'authorization_id' in data &&
    'client' in data
  );
}

function isOAuthRedirect(data: unknown): data is { redirect_url: string } {
  return typeof data === 'object' && data !== null && 'redirect_url' in data;
}

export default async function OAuthConsentPage({ searchParams }: Props) {
  const params = await searchParams;
  const authorizationId = params.authorization_id;
  const errorParam = params.error;

  if (!authorizationId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-bg-primary">
        <section className="max-w-md w-full rounded-2xl border border-border-color bg-bg-card p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-text-primary mb-2">Solicitud inválida</h1>
          <p className="text-text-muted text-sm">Falta el parámetro authorization_id.</p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect(
      `/iniciar-sesion?next=${encodeURIComponent(`/oauth/consent?authorization_id=${authorizationId}`)}`
    );
  }

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('role, first_name, last_name, email')
    .eq('user_id', userId)
    .single();

  const profile = profileRow as {
    role?: AppRole;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;

  const role = profile?.role;
  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    profile?.email ||
    'Usuario';

  const { data: authDetails, error: authError } =
    await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

  if (authError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-bg-primary">
        <section className="max-w-md w-full rounded-2xl border border-red-500/30 bg-bg-card p-8">
          <h1 className="text-xl font-semibold text-text-primary mb-2">Error de autorización</h1>
          <p className="text-text-muted text-sm">{authError.message}</p>
        </section>
      </main>
    );
  }

  if (isOAuthRedirect(authDetails)) {
    redirect(authDetails.redirect_url);
  }

  if (!isOAuthAuthorizationDetails(authDetails)) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-bg-primary">
        <section className="max-w-md w-full rounded-2xl border border-border-color bg-bg-card p-8">
          <p className="text-text-muted text-sm">No se encontró la solicitud de autorización.</p>
        </section>
      </main>
    );
  }

  const scopes = authDetails.scope?.trim()
    ? authDetails.scope.trim().split(/\s+/)
    : [];

  const canApprove = role === 'admin' || role === 'instructor';

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-bg-primary">
      <section className="max-w-lg w-full rounded-2xl border border-border-color bg-bg-card p-8 shadow-xl">
        <header className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-secondary/10">
            <Bot className="w-6 h-6 text-secondary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Autorizar aplicación</h1>
            <p className="text-sm text-text-muted">Conexión MCP a Tech Centre</p>
          </div>
        </header>

        {errorParam === 'forbidden' && (
          <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Solo administradores e instructores pueden conectar agentes MCP.
          </p>
        )}

        {errorParam && errorParam !== 'forbidden' && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {decodeURIComponent(errorParam)}
          </p>
        )}

        <dl className="space-y-4 mb-6 text-sm">
          <div>
            <dt className="text-text-muted">Aplicación</dt>
            <dd className="font-medium text-text-primary">{authDetails.client.name}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Tu cuenta</dt>
            <dd className="font-medium text-text-primary">{displayName}</dd>
            <dd className="text-text-muted capitalize">{role ?? 'sin rol'}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Redirección</dt>
            <dd className="font-mono text-xs text-text-primary break-all">{authDetails.redirect_uri}</dd>
          </div>
          {scopes.length > 0 && (
            <div>
              <dt className="text-text-muted mb-1">Permisos solicitados</dt>
              <dd>
                <ul className="list-disc list-inside space-y-1 text-text-primary">
                  {scopes.map((scope) => (
                    <li key={scope}>{scope}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>

        <p className="flex items-start gap-2 text-sm text-text-muted mb-6">
          <Shield className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          El agente accederá a cohortes, inscripciones y pagos según tu rol, respetando las políticas de seguridad de la plataforma.
        </p>

        {canApprove ? (
          <form action="/api/oauth/decision" method="post" className="flex flex-col sm:flex-row gap-3">
            <input type="hidden" name="authorization_id" value={authorizationId} />
            <button
              type="submit"
              name="decision"
              value="approve"
              className="btn-primary flex-1 justify-center"
            >
              Autorizar
            </button>
            <button
              type="submit"
              name="decision"
              value="deny"
              className="flex-1 rounded-lg border border-border-color px-4 py-2.5 text-text-primary hover:bg-bg-secondary transition-colors"
            >
              Denegar
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-muted">
              Tu cuenta no tiene permisos para conectar agentes externos. Contacta al equipo de Tech Centre si necesitas acceso.
            </p>
            <Link href="/" className="inline-block text-secondary hover:underline text-sm">
              Volver al inicio
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
