/**
 * Qué le falta a un programa para que su página pública se vea completa.
 *
 * Vive aquí y no dentro de una pantalla porque lo usan las dos: el listado
 * lo muestra como columna (para no tener que entrar programa por programa) y
 * el detalle lo muestra como pendientes que llevan a la pestaña que los
 * arregla.
 */

import { getStack } from '@/lib/programLanding';
import { normalizeFaqs } from '@/lib/programFaqs';
import type { Program } from '@/types/programs';

/** Las pestañas del detalle del programa. */
export type ProgramTab = 'info' | 'contenido' | 'publica' | 'temario' | 'cohortes';

export interface ReadinessCheck {
  id: string;
  /** Cómo se nombra cuando está listo. */
  label: string;
  /** Cómo se nombra cuando falta: se lee como una tarea. */
  missingLabel: string;
  ok: boolean;
  tab: ProgramTab;
}

export interface Readiness {
  checks: ReadinessCheck[];
  missing: ReadinessCheck[];
  done: number;
  total: number;
  /** Pestañas con algo pendiente, para el punto de aviso. */
  pendingTabs: Set<ProgramTab>;
}

interface Options {
  /** Cohortes con `offering = true`. */
  offeringCohorts?: number;
}

export function getProgramReadiness(program: Program, options: Options = {}): Readiness {
  const modules = program.syllabus?.modules ?? [];
  const description = (program.description || '').replace(/<[^>]*>/g, '').trim();

  const checks: ReadinessCheck[] = [
    {
      id: 'identidad',
      label: 'Nombre y código',
      missingLabel: 'Sin código',
      ok: Boolean(program.name && program.code),
      tab: 'info',
    },
    {
      id: 'subtitulo',
      label: 'Subtítulo',
      missingLabel: 'Sin subtítulo',
      ok: Boolean(program.subtitle),
      tab: 'info',
    },
    {
      id: 'duracion',
      label: 'Duración',
      missingLabel: 'Sin duración',
      ok: Boolean(program.duration),
      tab: 'info',
    },
    {
      id: 'horas',
      label: 'Horas totales',
      missingLabel: 'Sin horas',
      ok: Boolean(program.total_hours),
      tab: 'info',
    },
    {
      id: 'precio',
      label: 'Precio',
      missingLabel: 'Sin precio',
      ok: Boolean(program.default_price || program.discount),
      tab: 'info',
    },
    {
      id: 'portada',
      label: 'Portada',
      missingLabel: 'Sin portada',
      ok: Boolean(program.image),
      tab: 'contenido',
    },
    {
      id: 'descripcion',
      label: 'Descripción',
      missingLabel: 'Sin descripción',
      ok: description.length > 0,
      tab: 'contenido',
    },
    {
      id: 'faqs',
      label: 'Preguntas frecuentes',
      missingLabel: 'Sin preguntas frecuentes',
      ok: normalizeFaqs(program.faqs).length > 0,
      tab: 'contenido',
    },
    {
      id: 'video',
      label: 'Video',
      missingLabel: 'Sin video',
      ok: Boolean(program.video),
      tab: 'publica',
    },
    {
      id: 'stack',
      label: 'Stack',
      missingLabel: 'Sin stack',
      ok: getStack(program).length > 0,
      tab: 'publica',
    },
    {
      id: 'temario',
      label: 'Temario',
      missingLabel: 'Sin temario',
      ok: modules.length > 0,
      tab: 'temario',
    },
    {
      id: 'cohorte',
      label: 'Cohorte ofertando',
      missingLabel: 'Sin cohorte abierta',
      ok: (options.offeringCohorts ?? 0) > 0,
      tab: 'cohortes',
    },
  ];

  const missing = checks.filter((check) => !check.ok);
  const pendingTabs = new Set<ProgramTab>(missing.map((check) => check.tab));

  return {
    checks,
    missing,
    done: checks.length - missing.length,
    total: checks.length,
    pendingTabs,
  };
}
