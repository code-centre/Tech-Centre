import type { SupabaseClient } from '@supabase/supabase-js';

export const DIAGNOSTICO_ORIENTATION_OPTION = 'No sé qué orientación';

/**
 * Programas con al menos una cohorte en oferta (`offering = true`).
 *
 * Lee la misma fuente de verdad que `getOfferingCohortsByCode`
 * (`src/lib/cohorts/offering.ts`): la tabla `cohorts` filtrada por
 * `offering = true`, embebiendo el programa relacionado. El recurso embebido se
 * referencia por su nombre de tabla (`programs(name)`), idéntico al embed
 * probado de las CTAs de inscripción. El intento anterior embebía con
 * `programs:program_id!inner(name)`, cuya resolución de relación no devolvía
 * filas bajo el cliente público, por lo que el select se quedaba solo con la
 * opción de orientación.
 */
export async function getDiagnosticoProgramOptions(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('cohorts')
    .select('programs(name)')
    .eq('offering', true)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('[diagnostico] Error cargando programas con cohortes activas:', error);
    return [DIAGNOSTICO_ORIENTATION_OPTION];
  }

  const names = new Set<string>();
  for (const row of data ?? []) {
    const program = Array.isArray(row.programs) ? row.programs[0] : row.programs;
    const name = (program as { name?: string | null } | null)?.name?.trim();
    if (name) names.add(name);
  }

  const programs = [...names].sort((a, b) => a.localeCompare(b, 'es'));
  return [...programs, DIAGNOSTICO_ORIENTATION_OPTION];
}

export function isAllowedDiagnosticoProgram(
  program: string,
  options: string[],
): boolean {
  return options.includes(program.trim());
}

/** Resuelve `?programa=` legacy hacia un nombre presente en las opciones actuales. */
export function resolveDiagnosticoDefaultProgram(
  queryKey: string | undefined,
  options: string[],
  legacyMap: Record<string, string>,
): string | undefined {
  if (!options.length) return undefined;

  const key = queryKey?.toLowerCase().trim();
  const legacyLabel = key ? legacyMap[key] : undefined;

  if (legacyLabel && options.includes(legacyLabel)) {
    return legacyLabel;
  }

  if (legacyLabel) {
    const normalized = legacyLabel.toLowerCase();
    const fuzzy = options.find(
      (option) =>
        option !== DIAGNOSTICO_ORIENTATION_OPTION &&
        option.toLowerCase().includes(normalized.slice(0, 12)),
    );
    if (fuzzy) return fuzzy;
  }

  return options.find((option) => option !== DIAGNOSTICO_ORIENTATION_OPTION) ?? options[0];
}
