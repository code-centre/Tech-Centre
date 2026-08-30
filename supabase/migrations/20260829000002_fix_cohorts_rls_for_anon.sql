-- Bug: un visitante anónimo no puede leer NINGUNA cohorte.
--
-- `20260326000001` revocó a `anon` el EXECUTE sobre is_admin() / is_instructor()
-- (correcto: no deben ser invocables como RPC público). Pero las políticas
-- "Admins manage cohorts" e "Instructors read assigned cohorts" siguen
-- llamándolas dentro del USING, y Postgres evalúa TODAS las políticas
-- permisivas de SELECT. Cuando el visitante es anónimo, la llamada revienta
-- con 42501 «permission denied for function is_instructor» y la consulta
-- entera falla — aunque "Public read offering cohorts" por sí sola habría
-- devuelto la fila.
--
-- Efecto visible: en /programas-academicos/<slug> no se ven fechas de inicio,
-- horarios ni modalidades, y el botón de inscripción no puede armar el enlace
-- a checkout porque nunca hay cohortId.
--
-- Arreglo: acotar esas políticas al rol `authenticated` con `TO`. Para `anon`
-- ni siquiera se evalúan, así que la función revocada nunca se llama y el
-- REVOKE se mantiene intacto. No se amplía el acceso de nadie.

-- cohorts -------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage cohorts" ON public.cohorts;
CREATE POLICY "Admins manage cohorts"
  ON public.cohorts FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Instructors read assigned cohorts" ON public.cohorts;
CREATE POLICY "Instructors read assigned cohorts"
  ON public.cohorts FOR SELECT
  TO authenticated
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
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.cohort_id = cohorts.id AND e.student_id = auth.uid()
    )
  );

-- programs ------------------------------------------------------------------
-- Mismo patrón latente: "Admins manage programs" es FOR ALL, así que su USING
-- también se evalúa en los SELECT anónimos.
DROP POLICY IF EXISTS "Admins manage programs" ON public.programs;
CREATE POLICY "Admins manage programs"
  ON public.programs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- program_modules -----------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage program modules" ON public.program_modules;
CREATE POLICY "Admins manage program modules"
  ON public.program_modules FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
