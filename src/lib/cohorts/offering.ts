import { createClient } from '@supabase/supabase-js';
import type { OfferingCohort } from './checkout';

export type { OfferingCohort } from './checkout';
export { checkoutHref } from './checkout';

interface CohortWithProgramRow {
  id: number;
  slug: string | null;
  start_date: string | null;
  offering: boolean;
  programs: { code: string | null } | { code: string | null }[] | null;
}

/**
 * Devuelve un mapa de code de programa -> cohorte abierta, leyendo en vivo
 * desde Supabase las cohortes con offering=true. La clave es el `code` del
 * programa, que coincide con el slug de cada módulo público
 * (ej: "fundamentos-de-programacion").
 *
 * Si faltan credenciales o la consulta falla, devuelve un mapa vacío: los
 * módulos sin cohorte abierta simplemente no muestran el botón de inscripción.
 */
export async function getOfferingCohortsByCode(): Promise<Record<string, OfferingCohort>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return {};

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase
      .from('cohorts')
      .select('id, slug, start_date, offering, programs(code)')
      .eq('offering', true)
      .order('start_date', { ascending: true });

    if (error || !data) return {};

    const rows = data as unknown as CohortWithProgramRow[];
    const map: Record<string, OfferingCohort> = {};

    for (const row of rows) {
      const program = Array.isArray(row.programs) ? row.programs[0] : row.programs;
      const code = program?.code;
      if (!code) continue;
      // La cohorte más próxima gana (ya vienen ordenadas por start_date asc).
      if (map[code]) continue;
      map[code] = {
        cohortId: row.id,
        cohortSlug: row.slug ?? null,
        startDate: row.start_date ?? null,
      };
    }

    return map;
  } catch {
    return {};
  }
}

/** Cohorte abierta de un programa por su `code` (= slug del módulo). */
export async function getOfferingCohortForCode(code: string): Promise<OfferingCohort | null> {
  const map = await getOfferingCohortsByCode();
  return map[code] ?? null;
}
