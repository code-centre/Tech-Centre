-- Public display names for authors of published posts.
--
-- profiles RLS calls is_instructor(), which anon cannot EXECUTE (42501).
-- A direct select or embed therefore fails for visitors without a session.
-- This function returns only first_name, last_name and profile_image, and
-- only for people who have a published blog post. No email, phone or ID.

CREATE OR REPLACE FUNCTION public.blog_authors_public(ids uuid[])
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  profile_image text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.first_name, p.last_name, p.profile_image
  FROM public.profiles p
  WHERE p.user_id = ANY (ids)
    AND EXISTS (
      SELECT 1
      FROM public.blog_posts b
      WHERE b.author_id = p.user_id
        AND b.is_published = true
    );
$$;

REVOKE ALL ON FUNCTION public.blog_authors_public(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.blog_authors_public(uuid[]) TO anon, authenticated;
