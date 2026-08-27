-- Security hardening: enable RLS, remove permissive policies, add role-based access.

-- Extend invoice_status for receipt review workflow
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'pending_review';

-- Revoke public RPC execution of SECURITY DEFINER helpers
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_instructor() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin_or_instructor() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.owns_enrollment(bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.instructor_of_enrollment(bigint) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Authenticated insert mcp audit log" ON public.mcp_audit_log;
CREATE POLICY "Authenticated insert mcp audit log"
  ON public.mcp_audit_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

GRANT INSERT ON public.mcp_audit_log TO authenticated;

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'::user_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'instructor'::user_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_instructor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR public.is_instructor();
$$;

CREATE OR REPLACE FUNCTION public.owns_enrollment(enrollment_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.id = enrollment_id AND e.student_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.instructor_of_enrollment(enrollment_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments e
    JOIN public.cohort_instructors ci ON ci.cohort_id = e.cohort_id
    WHERE e.id = enrollment_id AND ci.instructor_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Drop dangerous / overly permissive policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all for testing" ON public.profiles;
DROP POLICY IF EXISTS "Permitir todo para anon" ON public.evaluaciones;
DROP POLICY IF EXISTS "Allow all access to cohorts" ON public.cohorts;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.cohorts;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.cohorts;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.cohorts;
DROP POLICY IF EXISTS "Allow public read access to cohort_instructors" ON public.cohort_instructors;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.cohort_instructors;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.invoices;
DROP POLICY IF EXISTS "Permitir ver evaluaciones" ON public.assessments;
DROP POLICY IF EXISTS "Permitir inserciones a usuarios autenticados" ON public.assessments;

-- Storage: blog images — restrict writes to admin/instructor
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;

-- Storage: receipts — restrict public write
DROP POLICY IF EXISTS "Allow uploads to receipts folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to receipts folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow select from receipts folder" ON storage.objects;

-- ---------------------------------------------------------------------------
-- Enable RLS on exposed tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments_payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;
CREATE POLICY "Admins manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Instructors read cohort student profiles" ON public.profiles;
CREATE POLICY "Instructors read cohort student profiles"
  ON public.profiles FOR SELECT
  USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR (
      public.is_instructor()
      AND EXISTS (
        SELECT 1
        FROM public.enrollments e
        JOIN public.cohort_instructors ci ON ci.cohort_id = e.cohort_id
        WHERE e.student_id = profiles.user_id
          AND ci.instructor_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- programs & modules (public catalog)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read programs" ON public.programs;
CREATE POLICY "Public read programs"
  ON public.programs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage programs" ON public.programs;
CREATE POLICY "Admins manage programs"
  ON public.programs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read program modules" ON public.program_modules;
CREATE POLICY "Public read program modules"
  ON public.program_modules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage program modules" ON public.program_modules;
CREATE POLICY "Admins manage program modules"
  ON public.program_modules FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- cohorts
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read offering cohorts" ON public.cohorts;
CREATE POLICY "Public read offering cohorts"
  ON public.cohorts FOR SELECT
  USING (offering = true OR public.is_admin_or_instructor());

DROP POLICY IF EXISTS "Admins manage cohorts" ON public.cohorts;
CREATE POLICY "Admins manage cohorts"
  ON public.cohorts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Instructors read assigned cohorts" ON public.cohorts;
CREATE POLICY "Instructors read assigned cohorts"
  ON public.cohorts FOR SELECT
  USING (
    public.is_instructor()
    AND EXISTS (
      SELECT 1 FROM public.cohort_instructors ci
      WHERE ci.cohort_id = cohorts.id AND ci.instructor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students read enrolled cohorts" ON public.cohorts;
CREATE POLICY "Students read enrolled cohorts"
  ON public.cohorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.cohort_id = cohorts.id AND e.student_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- cohort_instructors
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read cohort instructors" ON public.cohort_instructors;
CREATE POLICY "Public read cohort instructors"
  ON public.cohort_instructors FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage cohort instructors" ON public.cohort_instructors;
CREATE POLICY "Admins manage cohort instructors"
  ON public.cohort_instructors FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "student sees own enrollments" ON public.enrollments;

-- ---------------------------------------------------------------------------
-- enrollments
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage all enrollments" ON public.enrollments;
CREATE POLICY "Admins manage all enrollments"
  ON public.enrollments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Students read own enrollments" ON public.enrollments;
CREATE POLICY "Students read own enrollments"
  ON public.enrollments FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students create own enrollments" ON public.enrollments;
CREATE POLICY "Students create own enrollments"
  ON public.enrollments FOR INSERT
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students update own pending enrollments" ON public.enrollments;
CREATE POLICY "Students update own pending enrollments"
  ON public.enrollments FOR UPDATE
  USING (student_id = auth.uid() AND status = 'pending_payment')
  WITH CHECK (student_id = auth.uid() AND status = 'pending_payment');

DROP POLICY IF EXISTS "Students delete own pending enrollments" ON public.enrollments;
CREATE POLICY "Students delete own pending enrollments"
  ON public.enrollments FOR DELETE
  USING (student_id = auth.uid() AND status = 'pending_payment');

DROP POLICY IF EXISTS "Instructors read cohort enrollments" ON public.enrollments;
CREATE POLICY "Instructors read cohort enrollments"
  ON public.enrollments FOR SELECT
  USING (
    public.is_instructor()
    AND EXISTS (
      SELECT 1 FROM public.cohort_instructors ci
      WHERE ci.cohort_id = enrollments.cohort_id
        AND ci.instructor_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage all invoices" ON public.invoices;
CREATE POLICY "Admins manage all invoices"
  ON public.invoices FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Students read own invoices" ON public.invoices;
CREATE POLICY "Students read own invoices"
  ON public.invoices FOR SELECT
  USING (public.owns_enrollment(enrollment_id));

DROP POLICY IF EXISTS "Students create invoices for own enrollments" ON public.invoices;
CREATE POLICY "Students create invoices for own enrollments"
  ON public.invoices FOR INSERT
  WITH CHECK (
    public.owns_enrollment(enrollment_id)
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "Students upload receipt for own invoices" ON public.invoices;
CREATE POLICY "Students upload receipt for own invoices"
  ON public.invoices FOR UPDATE
  USING (
    public.owns_enrollment(enrollment_id)
    AND status IN ('pending', 'pending_review')
  )
  WITH CHECK (
    public.owns_enrollment(enrollment_id)
    AND status IN ('pending', 'pending_review')
  );

DROP POLICY IF EXISTS "Instructors read cohort invoices" ON public.invoices;
CREATE POLICY "Instructors read cohort invoices"
  ON public.invoices FOR SELECT
  USING (public.instructor_of_enrollment(enrollment_id));

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
CREATE POLICY "Admins manage payments"
  ON public.payments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Students read own payments" ON public.payments;
CREATE POLICY "Students read own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      JOIN public.enrollments e ON e.id = i.enrollment_id
      WHERE i.id = payments.invoice_id AND e.student_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- leads & applicants
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;
CREATE POLICY "Anyone can submit leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage leads" ON public.leads;
CREATE POLICY "Admins manage leads"
  ON public.leads FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can submit applicants" ON public.applicants;
CREATE POLICY "Anyone can submit applicants"
  ON public.applicants FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage applicants" ON public.applicants;
CREATE POLICY "Admins manage applicants"
  ON public.applicants FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- discount codes / coupons / payment plans
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated read discount codes" ON public.discount_codes;
CREATE POLICY "Authenticated read discount codes"
  ON public.discount_codes FOR SELECT
  USING (auth.role() = 'authenticated' OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage discount codes" ON public.discount_codes;
CREATE POLICY "Admins manage discount codes"
  ON public.discount_codes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated read active coupons" ON public.discount_coupons;
CREATE POLICY "Authenticated read active coupons"
  ON public.discount_coupons FOR SELECT
  USING (auth.role() = 'authenticated' OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage discount coupons" ON public.discount_coupons;
CREATE POLICY "Admins manage discount coupons"
  ON public.discount_coupons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read payment plans" ON public.payment_plans;
CREATE POLICY "Public read payment plans"
  ON public.payment_plans FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage payment plans" ON public.payment_plans;
CREATE POLICY "Admins manage payment plans"
  ON public.payment_plans FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Students read own enrollment payment plans" ON public.enrollments_payment_plans;
CREATE POLICY "Students read own enrollment payment plans"
  ON public.enrollments_payment_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.id = enrollments_payment_plans.enrollment_id
        AND e.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage enrollment payment plans" ON public.enrollments_payment_plans;
CREATE POLICY "Admins manage enrollment payment plans"
  ON public.enrollments_payment_plans FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- assessments & evaluaciones
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage assessments" ON public.assessments;
CREATE POLICY "Admins manage assessments"
  ON public.assessments FOR ALL
  USING (public.is_admin_or_instructor())
  WITH CHECK (public.is_admin_or_instructor());

DROP POLICY IF EXISTS "Students read cohort assessments" ON public.assessments;
CREATE POLICY "Students read cohort assessments"
  ON public.assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.cohort_id = assessments.cohort_id AND e.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage evaluaciones" ON public.evaluaciones;
CREATE POLICY "Admins manage evaluaciones"
  ON public.evaluaciones FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage policies
-- ---------------------------------------------------------------------------
CREATE POLICY "Admin instructor upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images'
    AND public.is_admin_or_instructor()
  );

CREATE POLICY "Admin instructor update blog images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-images' AND public.is_admin_or_instructor())
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin_or_instructor());

CREATE POLICY "Admin instructor delete blog images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND public.is_admin_or_instructor());

CREATE POLICY "Authenticated upload own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'activities'
    AND (storage.foldername(name))[1] = 'receipts'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users read own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'activities'
    AND (storage.foldername(name))[1] = 'receipts'
    AND (
      public.is_admin()
      OR owner = auth.uid()
    )
  );

CREATE POLICY "Users update own receipts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'activities'
    AND (storage.foldername(name))[1] = 'receipts'
    AND owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'activities'
    AND (storage.foldername(name))[1] = 'receipts'
    AND owner = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- MCP audit log (for phase 3)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mcp_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_sub text NOT NULL,
  tool_name text NOT NULL,
  input jsonb,
  result_status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mcp_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read mcp audit log" ON public.mcp_audit_log;
CREATE POLICY "Admins read mcp audit log"
  ON public.mcp_audit_log FOR SELECT
  USING (public.is_admin());
