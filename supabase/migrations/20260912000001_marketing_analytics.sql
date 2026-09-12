-- Marketing attribution, conversion events, and manual ad spend.
-- Does not recreate `leads` (that table predates in-repo migrations).

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS diagnostic_completed_at timestamptz;

COMMENT ON COLUMN public.leads.diagnostic_completed_at IS
  'Set when staff marks that the diagnóstico actually happened. Independent of leads.stage.';

CREATE TABLE IF NOT EXISTS public.marketing_attribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  lead_id bigint REFERENCES public.leads(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  first_utm_source text,
  first_utm_medium text,
  first_utm_campaign text,
  first_utm_content text,
  first_utm_term text,
  first_fbclid text,
  first_landing_page text,
  first_referrer text,
  first_fbp text,
  first_fbc text,
  first_touch_at timestamptz,
  last_utm_source text,
  last_utm_medium text,
  last_utm_campaign text,
  last_utm_content text,
  last_utm_term text,
  last_fbclid text,
  last_landing_page text,
  last_referrer text,
  last_fbp text,
  last_fbc text,
  last_touch_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS marketing_attribution_lead_id_uidx
  ON public.marketing_attribution (lead_id)
  WHERE lead_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS marketing_attribution_user_id_uidx
  ON public.marketing_attribution (user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS marketing_attribution_session_id_uidx
  ON public.marketing_attribution (session_id)
  WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS marketing_attribution_campaign_idx
  ON public.marketing_attribution (first_utm_campaign, last_utm_campaign);

CREATE TABLE IF NOT EXISTS public.marketing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_id text NOT NULL,
  source text NOT NULL CHECK (source IN ('pixel', 'capi', 'server')),
  lead_id bigint REFERENCES public.leads(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  enrollment_id bigint REFERENCES public.enrollments(id) ON DELETE SET NULL,
  invoice_id bigint REFERENCES public.invoices(id) ON DELETE SET NULL,
  program_id bigint REFERENCES public.programs(id) ON DELETE SET NULL,
  value numeric,
  currency text NOT NULL DEFAULT 'COP',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS marketing_events_event_id_uidx
  ON public.marketing_events (event_id);

CREATE INDEX IF NOT EXISTS marketing_events_name_occurred_idx
  ON public.marketing_events (event_name, occurred_at DESC);

CREATE INDEX IF NOT EXISTS marketing_events_lead_id_idx
  ON public.marketing_events (lead_id);

CREATE INDEX IF NOT EXISTS marketing_events_user_id_idx
  ON public.marketing_events (user_id);

CREATE TABLE IF NOT EXISTS public.marketing_spend (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  utm_campaign text,
  utm_content text,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  spend numeric NOT NULL CHECK (spend >= 0),
  notes text,
  created_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marketing_spend_dates_chk CHECK (ends_on >= starts_on)
);

CREATE INDEX IF NOT EXISTS marketing_spend_dates_idx
  ON public.marketing_spend (starts_on, ends_on);

CREATE INDEX IF NOT EXISTS marketing_spend_utm_campaign_idx
  ON public.marketing_spend (utm_campaign);

ALTER TABLE public.marketing_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_spend ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage marketing attribution" ON public.marketing_attribution;
CREATE POLICY "Admins manage marketing attribution"
  ON public.marketing_attribution FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage marketing events" ON public.marketing_events;
CREATE POLICY "Admins manage marketing events"
  ON public.marketing_events FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage marketing spend" ON public.marketing_spend;
CREATE POLICY "Admins manage marketing spend"
  ON public.marketing_spend FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_attribution TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_spend TO authenticated;

COMMENT ON TABLE public.marketing_attribution IS
  'First-touch (immutable) and last-touch UTM/fbclid for a session, lead, or user.';
COMMENT ON TABLE public.marketing_events IS
  'Funnel reconstruction. Purchase rows are written only after payment-provider confirmation.';
COMMENT ON TABLE public.marketing_spend IS
  'Manual ad spend by campaign and date range. Meta Ads Insights API is not wired yet.';
