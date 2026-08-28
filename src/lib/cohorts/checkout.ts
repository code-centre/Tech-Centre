/**
 * Helpers puros (sin dependencias de servidor) para enlazar hacia el checkout
 * existente con alcance por cohorte. Se puede importar tanto en componentes de
 * servidor como de cliente sin arrastrar el SDK de Supabase al bundle.
 */

/**
 * Datos mínimos de una cohorte abierta (offering=true) para armar el enlace de
 * inscripción hacia el checkout: /checkout?cohortId=<id>.
 */
export interface OfferingCohort {
  cohortId: number;
  cohortSlug: string | null;
  startDate: string | null;
}

/** URL del checkout ya existente, con alcance por cohorte. */
export function checkoutHref(cohortId: number): string {
  return `/checkout?cohortId=${cohortId}`;
}
