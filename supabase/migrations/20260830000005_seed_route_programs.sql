-- Siembra la relación ruta -> programas con el mapeo que ya vivía escrito a
-- mano en components/landing/rutas/data.ts. Empareja por slug de ruta y code
-- de programa, así que si alguno no existe simplemente no inserta esa fila.
--
-- Idempotente: ON CONFLICT actualiza la posición.

INSERT INTO public.route_programs (route_id, program_id, position)
SELECT r.id, p.id, m.position
FROM (VALUES
  ('producto', 'fundamentos-de-programacion', 1),
  ('producto', 'ingenieria-de-producto',      2),
  ('producto', 'harness-y-agentes-de-ia',     3),
  ('datos',    'fundamentos-con-python',      1),
  ('datos',    'ingenieria-de-datos',         2),
  ('datos',    'machine-learning-aplicado',   3)
) AS m(route_slug, program_code, position)
JOIN public.routes   r ON r.slug = m.route_slug
JOIN public.programs p ON p.code = m.program_code
ON CONFLICT (route_id, program_id)
DO UPDATE SET position = EXCLUDED.position;
