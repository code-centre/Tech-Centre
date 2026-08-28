-- Anon/authenticated users must read offering cohorts without calling
-- is_admin_or_instructor(), which anon cannot EXECUTE (42501).

DROP POLICY IF EXISTS "Public read offering cohorts" ON public.cohorts;
CREATE POLICY "Public read offering cohorts"
  ON public.cohorts FOR SELECT
  USING (offering = true);
