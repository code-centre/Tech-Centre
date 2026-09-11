import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export type BlogAuthor = {
  first_name: string;
  last_name: string;
  profile_image: string | null;
};

const LIST_COLUMNS =
  'id, author_id, title, slug, excerpt, cover_image, is_published, published_at, created_at, updated_at';

/**
 * Public blog queries must not embed `profiles`. PostgREST evaluates the
 * related-table RLS as part of the parent select; `profiles` policies call
 * `is_admin()` / `is_instructor()`, which `anon` cannot execute, so the
 * whole blog_posts query errors. Plain post columns work (sitemap, llms.txt).
 */
export async function fetchPublishedPosts(supabase: SupabaseClient) {
  return supabase
    .from('blog_posts')
    .select(LIST_COLUMNS)
    .eq('is_published', true)
    .order('published_at', { ascending: false });
}

export async function fetchPublishedPostBySlug(
  supabase: SupabaseClient,
  slug: string
) {
  return supabase
    .from('blog_posts')
    .select(`${LIST_COLUMNS}, content`)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
}

type AuthorRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
};

function toAuthorMap(rows: AuthorRow[] | null | undefined): Map<string, BlogAuthor> {
  const map = new Map<string, BlogAuthor>();
  for (const row of rows || []) {
    if (!row.user_id) continue;
    map.set(row.user_id, {
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      profile_image: row.profile_image ?? null,
    });
  }
  return map;
}

/**
 * Author names are public for published posts. Anon cannot read `profiles`
 * (RLS calls is_instructor()). Prefer the SECURITY DEFINER RPC; fall back
 * to a display-only service-role read so prod works before the migration.
 */
export async function fetchAuthorsById(
  supabase: SupabaseClient,
  authorIds: string[]
): Promise<Map<string, BlogAuthor>> {
  const unique = [...new Set(authorIds.filter(Boolean))];
  if (unique.length === 0) return new Map();

  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name, profile_image')
      .in('user_id', unique);
    if (!error && data) return toAuthorMap(data as AuthorRow[]);
  }

  const viaRpc = await (
    supabase as unknown as {
      rpc: (
        fn: 'blog_authors_public',
        args: { ids: string[] }
      ) => Promise<{ data: AuthorRow[] | null; error: { message: string } | null }>;
    }
  ).rpc('blog_authors_public', { ids: unique });
  if (!viaRpc.error && viaRpc.data) {
    return toAuthorMap(viaRpc.data);
  }

  const viaProfiles = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, profile_image')
    .in('user_id', unique);
  if (!viaProfiles.error && viaProfiles.data && viaProfiles.data.length > 0) {
    return toAuthorMap(viaProfiles.data as AuthorRow[]);
  }

  return new Map();
}

export function authorDisplayName(
  author: BlogAuthor | null | undefined,
  fallback = 'Tech Centre'
): string {
  if (!author) return fallback;
  return `${author.first_name} ${author.last_name}`.trim() || fallback;
}
