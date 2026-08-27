-- Fix: authenticated role must EXECUTE RLS helper functions so policies evaluate correctly.
-- Safe to re-run (idempotent).

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_instructor() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin_or_instructor() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owns_enrollment(bigint) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.instructor_of_enrollment(bigint) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_instructor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_instructor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_enrollment(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.instructor_of_enrollment(bigint) TO authenticated;
