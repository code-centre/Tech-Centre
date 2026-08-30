-- Renombra la entidad "carreras" a "rutas" en la base de datos.
-- Las políticas RLS, el trigger de updated_at y los índices siguen
-- asociados a la tabla renombrada; aquí solo renombramos objetos con
-- prefijo careers_* por claridad.

ALTER TABLE public.careers RENAME TO routes;

ALTER INDEX IF EXISTS careers_slug_idx RENAME TO routes_slug_idx;
ALTER INDEX IF EXISTS careers_visible_idx RENAME TO routes_visible_idx;

ALTER FUNCTION public.update_careers_updated_at() RENAME TO update_routes_updated_at;

DROP TRIGGER IF EXISTS careers_updated_at_trigger ON public.routes;
CREATE TRIGGER routes_updated_at_trigger
  BEFORE UPDATE ON public.routes
  FOR EACH ROW
  EXECUTE FUNCTION update_routes_updated_at();

-- Políticas RLS (conservan el nombre original; solo actualizamos el texto)
DROP POLICY IF EXISTS "Public can read visible careers" ON public.routes;
CREATE POLICY "Public can read visible routes"
  ON public.routes FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS "Admins have full access to careers" ON public.routes;
CREATE POLICY "Admins have full access to routes"
  ON public.routes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Leads que venían con prefijo carrera_ pasan a ruta_
UPDATE public.leads
SET source = 'ruta_' || substring(source FROM length('carrera_') + 1)
WHERE source LIKE 'carrera_%';

COMMENT ON TABLE public.routes IS 'Rutas de formación (antes careers).';
