-- Marketing tables are service-role + admin only. Revoke leftover table grants
-- that Postgres/Supabase default privileges may have given to PUBLIC/anon.
REVOKE ALL ON public.marketing_attribution FROM PUBLIC;
REVOKE ALL ON public.marketing_events FROM PUBLIC;
REVOKE ALL ON public.marketing_spend FROM PUBLIC;
REVOKE ALL ON public.marketing_attribution FROM anon;
REVOKE ALL ON public.marketing_events FROM anon;
REVOKE ALL ON public.marketing_spend FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_attribution TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_spend TO authenticated;
