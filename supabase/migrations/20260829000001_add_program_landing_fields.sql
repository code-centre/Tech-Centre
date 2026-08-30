-- Campos de la página de programa que hasta ahora vivían hardcodeados en el
-- componente. Todos son aditivos y opcionales: la página oculta la sección
-- cuando el campo viene vacío, así que los programas existentes no cambian.

ALTER TABLE public.programs
  -- { "yes": ["…"], "not_yet": ["…"] } — la sección "¿Es para ti?"
  ADD COLUMN IF NOT EXISTS audience_fit jsonb NOT NULL DEFAULT '{"yes": [], "not_yet": []}'::jsonb,
  -- [{ "name": "Python 3.10+", "detail": "asincronía, decoradores, tipado" }]
  ADD COLUMN IF NOT EXISTS prerequisites jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- { "title", "summary", "requirements": [{title, description}], "examples": [{title, description}] }
  ADD COLUMN IF NOT EXISTS final_project jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- ["Google ADK", "FastAPI", …]
  ADD COLUMN IF NOT EXISTS stack jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- ["32 horas presenciales", …] — el "qué incluye" del bloque de inversión
  ADD COLUMN IF NOT EXISTS includes jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.programs.audience_fit IS 'Sección "¿Es para ti?": { yes: string[], not_yet: string[] }';
COMMENT ON COLUMN public.programs.prerequisites IS 'Prerrequisitos: [{ name, detail }]';
COMMENT ON COLUMN public.programs.final_project IS 'Proyecto final: { title, summary, requirements: [{title, description}], examples: [{title, description}] }';
COMMENT ON COLUMN public.programs.stack IS 'Tecnologías que se manejan en el programa: string[]';
COMMENT ON COLUMN public.programs.includes IS 'Qué incluye la inversión: string[]';

-- ---------------------------------------------------------------------------
-- Cupos disponibles de una cohorte
-- ---------------------------------------------------------------------------
-- La página muestra "quedan N cupos", pero enrollments no es legible en
-- público (y no debe serlo). Esta función expone únicamente el conteo
-- agregado, nunca las filas. Devuelve NULL cuando la cohorte no tiene cupo
-- máximo definido, y en ese caso la página no muestra la banda de urgencia.
CREATE OR REPLACE FUNCTION public.cohort_seats_left(p_cohort_id bigint)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
           WHEN c.capacity IS NULL OR c.capacity <= 0 THEN NULL
           ELSE GREATEST(
             c.capacity - (SELECT count(*) FROM public.enrollments e WHERE e.cohort_id = c.id),
             0
           )::int
         END
  FROM public.cohorts c
  WHERE c.id = p_cohort_id
    AND c.offering = true;
$$;

REVOKE ALL ON FUNCTION public.cohort_seats_left(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cohort_seats_left(bigint) TO anon, authenticated;
