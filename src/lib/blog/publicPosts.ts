import type { SupabaseClient } from '@supabase/supabase-js';

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

export async function fetchAuthorsById(
  supabase: SupabaseClient,
  authorIds: string[]
): Promise<Map<string, BlogAuthor>> {
  const unique = [...new Set(authorIds.filter(Boolean))];
  if (unique.length === 0) return new Map();

  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, profile_image')
    .in('user_id', unique);

  if (error || !data) return new Map();

  return new Map(
    data.map((row) => [
      row.user_id as string,
      {
        first_name: (row.first_name as string) || '',
        last_name: (row.last_name as string) || '',
        profile_image: (row.profile_image as string | null) ?? null,
      },
    ])
  );
}

export function authorDisplayName(
  author: BlogAuthor | null | undefined,
  fallback = 'Tech Centre'
): string {
  if (!author) return fallback;
  return `${author.first_name} ${author.last_name}`.trim() || fallback;
}
