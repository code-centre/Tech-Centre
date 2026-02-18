-- Ensure cohorts.offering column exists for visibility toggle
-- Run this in Supabase SQL Editor if "Error al cambiar la visibilidad de la cohorte" appears
--
-- The offering column controls whether a cohort appears on landing and /programas-academicos

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cohorts' AND column_name = 'offering'
  ) THEN
    ALTER TABLE public.cohorts ADD COLUMN offering boolean DEFAULT true;
    UPDATE public.cohorts SET offering = true WHERE offering IS NULL;
  END IF;
END $$;
