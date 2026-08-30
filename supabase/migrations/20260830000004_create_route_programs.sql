-- Relación entre rutas y programas.
--
-- Hasta ahora una ruta solo listaba `learning_points` con títulos y URLs
-- escritas a mano, así que nada garantizaba que apuntaran a un programa real
-- ni en qué orden iban. Con esta tabla la ruta se arma desde los programas
-- que existen, y /programas puede separar los que están en una ruta de los
-- que van sueltos.

CREATE TABLE IF NOT EXISTS public.route_programs (
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  program_id bigint NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  -- Orden dentro de la ruta: 1 es el primer módulo.
  position integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (route_id, program_id)
);

COMMENT ON TABLE public.route_programs IS 'Qué programas componen cada ruta, y en qué orden.';
COMMENT ON COLUMN public.route_programs.position IS 'Orden dentro de la ruta: 1 es el primer módulo.';

CREATE INDEX IF NOT EXISTS route_programs_route_idx ON public.route_programs (route_id, position);
CREATE INDEX IF NOT EXISTS route_programs_program_idx ON public.route_programs (program_id);

ALTER TABLE public.route_programs ENABLE ROW LEVEL SECURITY;

-- Es catálogo público, igual que programs y las rutas visibles.
DROP POLICY IF EXISTS "Public read route programs" ON public.route_programs;
CREATE POLICY "Public read route programs"
  ON public.route_programs FOR SELECT
  USING (true);

-- Acotada a `authenticated` a propósito: is_admin() está revocada para anon y
-- una política FOR ALL sin TO se evalúa también en los SELECT anónimos.
DROP POLICY IF EXISTS "Admins manage route programs" ON public.route_programs;
CREATE POLICY "Admins manage route programs"
  ON public.route_programs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
