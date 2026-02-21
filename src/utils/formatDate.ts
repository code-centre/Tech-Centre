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
