import { MARKETING_EJECUTIVO_CODES } from "@/lib/analytics/meta/types";
import type { HubProgram, HubRoute } from "@/data/programsHub";

export const AI_DEVELOPER_MODULE_CODES = [
  "fundamentos-de-programacion",
  "ingenieria-de-producto",
  "harness-y-agentes-de-ia",
] as const;

export const DATOS_MODULE_CODES = [
  "fundamentos-con-python",
  "ingenieria-de-datos",
  "machine-learning-aplicado",
] as const;

export const AI_DEVELOPER_ROUTE_FALLBACK = "/programas-academicos/rutas/producto";
export const DATOS_ROUTE_FALLBACK = "/programas-academicos/rutas/datos";
export const EJECUTIVO_PROGRAM_FALLBACK =
  "/programas-academicos/programa-ejecutivo-de-ia-aplicada";

export function isEjecutivoProgram(program: {
  code: string;
  name?: string | null;
}): boolean {
  const code = program.code.toLowerCase();
  const name = (program.name ?? "").toLowerCase();
  return (
    (MARKETING_EJECUTIVO_CODES as readonly string[]).includes(program.code) ||
    code.includes("ejecutivo") ||
    name.includes("ejecutivo")
  );
}

export function routePageHref(
  routes: HubRoute[],
  moduleCodes: readonly string[],
  fallback: string,
): string {
  const route = routes.find((item) =>
    item.programs.some((program) => moduleCodes.includes(program.code)),
  );
  return route ? `/programas-academicos/rutas/${route.slug}` : fallback;
}

export function ejecutivoHref(loose: HubProgram[]): string {
  const program = loose.find(isEjecutivoProgram);
  if (!program) return EJECUTIVO_PROGRAM_FALLBACK;
  return program.cohortId
    ? `/programas-academicos/${program.code}?cohortId=${program.cohortId}`
    : `/programas-academicos/${program.code}`;
}

export function standaloneLoosePrograms(loose: HubProgram[]): HubProgram[] {
  return loose.filter((program) => !isEjecutivoProgram(program));
}
