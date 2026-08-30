/**
 * Normalizadores para las columnas jsonb de `programs`.
 *
 * Postgres devuelve estos campos tal como se guardaron, así que pueden llegar
 * null, con la forma equivocada o con entradas vacías. Cada sección de la
 * página se oculta cuando su normalizador devuelve algo vacío, de modo que un
 * programa sin llenar sigue viéndose bien.
 */

import type {
  AudienceFit,
  FinalProject,
  FinalProjectItem,
  Prerequisite,
  Program,
} from '@/types/programs';

/** Lista de textos: descarta lo que no sea string con contenido. */
function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function readText(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === 'string' ? value.trim() : '';
}

function toItemList(value: unknown): FinalProjectItem[] {
  if (!Array.isArray(value)) return [];
  const items: FinalProjectItem[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const source = entry as Record<string, unknown>;
    const title = readText(source, 'title');
    if (!title) continue;
    const description = readText(source, 'description');
    items.push(description ? { title, description } : { title });
  }
  return items;
}

export function getAudienceFit(program: Program | null | undefined): AudienceFit | null {
  const raw = program?.audience_fit;
  if (!raw || typeof raw !== 'object') return null;
  const yes = toStringList((raw as AudienceFit).yes);
  const notYet = toStringList((raw as AudienceFit).not_yet);
  if (yes.length === 0 && notYet.length === 0) return null;
  return { yes, not_yet: notYet };
}

export function getPrerequisites(program: Program | null | undefined): Prerequisite[] {
  const raw = program?.prerequisites;
  if (!Array.isArray(raw)) return [];
  const items: Prerequisite[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const source = entry as unknown as Record<string, unknown>;
    const name = readText(source, 'name');
    if (!name) continue;
    const detail = readText(source, 'detail');
    items.push(detail ? { name, detail } : { name });
  }
  return items;
}

export function getFinalProject(program: Program | null | undefined): FinalProject | null {
  const raw = program?.final_project;
  if (!raw || typeof raw !== 'object') return null;

  const source = raw as Record<string, unknown>;
  const title = readText(source, 'title');
  const summary = readText(source, 'summary');
  const requirements = toItemList(source.requirements);
  const examples = toItemList(source.examples);

  if (!title && !summary && requirements.length === 0 && examples.length === 0) {
    return null;
  }

  return {
    ...(title ? { title } : {}),
    ...(summary ? { summary } : {}),
    requirements,
    examples,
  };
}

export function getStack(program: Program | null | undefined): string[] {
  return toStringList(program?.stack);
}

export function getIncludes(program: Program | null | undefined): string[] {
  return toStringList(program?.includes);
}
