-- `discount` y `currency` se leen en tres sitios de la página pública
-- (NavigationCard, ProgramPriceBlock y el bloque de inversión) pero la
-- columna nunca existió: el código caía siempre al precio normal y a COP.
--
-- Aditivas y opcionales: un programa sin oferta se comporta igual que hoy.

ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS discount numeric,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'COP';

COMMENT ON COLUMN public.programs.discount IS 'Precio en oferta. NULL o 0 = sin oferta; manda sobre default_price.';
COMMENT ON COLUMN public.programs.currency IS 'Moneda de default_price y discount. Por defecto COP.';
