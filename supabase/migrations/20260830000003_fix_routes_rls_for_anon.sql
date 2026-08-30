-- Mismo bug que ya arreglamos en cohorts y programs, ahora en routes.
--
-- La política "Admins have full access to routes" es FOR ALL, así que su
-- USING también se evalúa en los SELECT anónimos. Adentro consulta `profiles`,
-- y las políticas de `profiles` llaman a is_instructor(), que `anon` no puede
-- ejecutar. Resultado: un visitante sin sesión no puede leer NINGUNA ruta,
-- ni siquiera las visibles, y la consulta falla entera con
-- 42501 «permission denied for function is_instructor».
--
-- Arreglo: acotar la política de administración al rol `authenticated`. Para
-- `anon` deja de evaluarse y solo queda "Public can read visible routes".
-- No amplía el acceso de nadie.

DROP POLICY IF EXISTS "Admins have full access to routes" ON public.routes;
CREATE POLICY "Admins have full access to routes"
  ON public.routes FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- La lectura pública se mantiene igual: solo rutas visibles, sin llamar a
-- ninguna función revocada.
DROP POLICY IF EXISTS "Public can read visible routes" ON public.routes;
CREATE POLICY "Public can read visible routes"
  ON public.routes FOR SELECT
  USING (is_visible = true);
