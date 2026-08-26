/**
 * Extrae la parte de fecha (YYYY-MM-DD) de un string que puede ser
 * "2025-02-18" o "2025-02-18T00:00:00.000Z" para evitar problemas de zona horaria.
 */
function extractDatePart(dateStr: string): string {
  return dateStr?.split('T')[0] || '';
}

/**
 * Formatea una fecha para mostrar en zona horaria de Bogotá (America/Bogota).
 * Evita el desfase cuando la BD devuelve timestamps en UTC.
 */
export function formatDate(dateToFormat: string) {
  const datePart = extractDatePart(dateToFormat);
  if (!datePart) return '';
  const dateCourse = new Date(`${datePart}T12:00:00-05:00`);
  return dateCourse.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });
}

/**
 * Formatea fecha mostrando solo mes y año (ej: "marzo de 2020") para zona Bogotá.
 */
export function formatDateMonth(dateToFormat: string) {
  const datePart = extractDatePart(dateToFormat);
  if (!datePart) return '';
  const dateCourse = new Date(`${datePart}T12:00:00-05:00`);
  return dateCourse.toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });
}

/**
 * Formatea fecha en estilo corto (ej: "18 feb 2025") para zona Bogotá.
 */
export function formatDateShort(dateToFormat: string) {
  const datePart = extractDatePart(dateToFormat);
  if (!datePart) return '';
  const dateCourse = new Date(`${datePart}T12:00:00-05:00`);
  return dateCourse.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });
}

/**
 * Parsea una fecha solo-día como Date en zona Bogotá, para comparaciones.
 */
export function parseDateBogota(dateStr: string): Date {
  const datePart = extractDatePart(dateStr);
  if (!datePart) return new Date(NaN);
  return new Date(`${datePart}T12:00:00-05:00`);
}

const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/** Parte la fecha en sus números, sin pasar por Date, para no depender de la zona. */
function datePieces(dateStr: string): { y: number; m: number; d: number } | null {
  const [y, m, d] = extractDatePart(dateStr).split('-').map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

/**
 * Fecha compacta para tablas: "28 sep 2026".
 * Más corta que formatDateShort, que en es-CO devuelve "28 de sept de 2026".
 */
export function formatDateCompact(dateToFormat: string): string {
  const p = datePieces(dateToFormat);
  if (!p) return '';
  return `${p.d} ${MESES_CORTOS[p.m - 1]} ${p.y}`;
}

/**
 * Rango en una línea: "28 sep a 23 nov 2026".
 * Omite el año de la fecha inicial cuando las dos caen en el mismo año.
 */
export function formatDateRange(start: string, end: string): string {
  const a = datePieces(start);
  const b = datePieces(end);
  if (!a && !b) return '';
  if (!a) return formatDateCompact(end);
  if (!b) return formatDateCompact(start);
  const left =
    a.y === b.y ? `${a.d} ${MESES_CORTOS[a.m - 1]}` : formatDateCompact(start);
  return `${left} a ${formatDateCompact(end)}`;
}

/** Semanas completas entre dos fechas, mínimo 1. */
export function weeksBetween(start: string, end: string): number {
  const a = parseDateBogota(start).getTime();
  const b = parseDateBogota(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.max(1, Math.round((b - a) / (7 * 24 * 60 * 60 * 1000)));
}

/** En qué semana va una cohorte en curso, acotado al total. */
export function currentWeek(start: string, end: string): number {
  const a = parseDateBogota(start).getTime();
  const now = Date.now();
  const total = weeksBetween(start, end);
  if (Number.isNaN(a) || total === 0) return 0;
  const elapsed = Math.floor((now - a) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.min(Math.max(elapsed, 1), total);
}
