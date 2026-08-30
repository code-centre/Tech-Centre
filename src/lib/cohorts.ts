/**
 * Derivaciones de cohortes para las cuatro pantallas que las muestran: la del
 * alumno, la del profesor y las dos del admin.
 *
 * El modelo ya existe: una cohorte tiene clases (`sessions`), las clases se
 * agrupan en módulos del programa (`program_modules`), cada clase guarda su
 * material y su asistencia, y cada módulo se califica por matrícula. Lo que
 * faltaba era calcular, en un solo sitio, lo que las pantallas preguntan:
 * cuál es la próxima clase, cuánto va del curso y cómo va cada quien.
 */

import { parseLocalDate } from './students';
import type { AttendanceStatus, ProgramModule, Session, SessionMaterial } from '@/types/supabase';

export type CohortStatus = 'upcoming' | 'active' | 'finished';

export interface CohortLite {
  id: number;
  name: string;
  slug?: string | null;
  start_date: string | null;
  end_date: string | null;
  modality?: string | null;
  campus?: string | null;
  capacity?: number | null;
  schedule?: { days?: string[]; hours?: string[] } | null;
  program?: { id: number; name: string; total_hours?: number | null } | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

/** Días que faltan para una fecha. Negativo si ya pasó. */
export function daysUntil(value: string | null | undefined, today: Date = new Date()): number | null {
  const date = parseLocalDate(value);
  if (!date) return null;
  return Math.round((startOfDay(date) - startOfDay(today)) / DAY_MS);
}

export function cohortStatus(
  cohort: Pick<CohortLite, 'start_date' | 'end_date'>,
  today: Date = new Date()
): CohortStatus {
  const start = parseLocalDate(cohort.start_date);
  const end = parseLocalDate(cohort.end_date);
  if (end && startOfDay(end) < startOfDay(today)) return 'finished';
  if (start && startOfDay(start) > startOfDay(today)) return 'upcoming';
  if (!start && !end) return 'upcoming';
  return 'active';
}

export const COHORT_STATUS_LABEL: Record<CohortStatus, string> = {
  upcoming: 'Por iniciar',
  active: 'En curso',
  finished: 'Terminada',
};

/* -------------------------------------------------------------------------- */
/* Horario y lugar                                                             */
/* -------------------------------------------------------------------------- */

/** «Sábados, 8:00 a.m. a 12:00 m.» a partir del schedule guardado. */
export function scheduleLine(schedule: CohortLite['schedule']): string | null {
  const days = schedule?.days?.filter(Boolean) ?? [];
  const hours = schedule?.hours?.filter((h) => h && h.trim()) ?? [];

  let dayText = '';
  if (days.length === 1) {
    // Un solo día se lee mejor en plural: «Sábados» en vez de «Sábado».
    dayText = `${days[0]}s`.replace(/ss$/, 's');
  } else if (days.length > 1) {
    const lower = days.map((d, i) => (i === 0 ? d : d.toLowerCase()));
    dayText = `${lower.slice(0, -1).join(', ')} y ${lower[lower.length - 1]}`;
  }

  const hourText = hours.join(' · ');
  if (!dayText && !hourText) return null;
  if (!hourText) return dayText;
  if (!dayText) return hourText;
  return `${dayText}, ${hourText}`;
}

/** «Presencial · Salón 2» — el salón sale de la clase, no de la cohorte. */
export function placeLine(modality: string | null | undefined, room?: string | null): string | null {
  const parts: string[] = [];
  if (modality) parts.push(modality.charAt(0).toUpperCase() + modality.slice(1));
  if (room) parts.push(room);
  return parts.length > 0 ? parts.join(' · ') : null;
}

/* -------------------------------------------------------------------------- */
/* Clases                                                                      */
/* -------------------------------------------------------------------------- */

const DAY_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DAY_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTH_LONG = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** «sáb 15 ago». */
export function sessionDay(startsAt: string | null | undefined): string {
  if (!startsAt) return '—';
  const date = new Date(startsAt);
  if (isNaN(date.getTime())) return '—';
  return `${DAY_SHORT[date.getDay()]} ${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

/** «Sábado 5 de septiembre». */
export function sessionDayLong(startsAt: string | null | undefined): string {
  if (!startsAt) return '—';
  const date = new Date(startsAt);
  if (isNaN(date.getTime())) return '—';
  const day = DAY_LONG[date.getDay()];
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} ${date.getDate()} de ${MONTH_LONG[date.getMonth()]}`;
}

/** «8:00 a.m.» — sin el espacio que mete el locale. */
export function sessionHour(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours < 12 ? 'a.m.' : hours === 12 && minutes === '00' ? 'm.' : 'p.m.';
  const base = hours % 12 === 0 ? 12 : hours % 12;
  return `${base}:${minutes} ${suffix}`;
}

/** «8:00 a.m. a 12:00 m.». */
export function sessionHourRange(startsAt: string, endsAt: string | null | undefined): string {
  const from = sessionHour(startsAt);
  const to = sessionHour(endsAt);
  return to ? `${from} a ${to}` : from;
}

export type SessionState = 'done' | 'next' | 'upcoming';

/** Una clase ya se dictó cuando pasó su hora de fin. */
export function isSessionDone(session: Pick<Session, 'starts_at' | 'ends_at'>, now: Date = new Date()): boolean {
  const end = new Date(session.ends_at || session.starts_at);
  if (isNaN(end.getTime())) return false;
  return end.getTime() < now.getTime();
}

/** La primera clase que todavía no termina: la que hay que mirar hoy. */
export function findNextSession<T extends Pick<Session, 'starts_at' | 'ends_at'>>(
  sessions: T[],
  now: Date = new Date()
): T | null {
  const ordered = [...sessions].sort((a, b) => (a.starts_at || '').localeCompare(b.starts_at || ''));
  return ordered.find((session) => !isSessionDone(session, now)) ?? null;
}

export function sessionState(
  session: Pick<Session, 'id' | 'starts_at' | 'ends_at'>,
  nextId: number | null,
  now: Date = new Date()
): SessionState {
  if (isSessionDone(session, now)) return 'done';
  return session.id === nextId ? 'next' : 'upcoming';
}

export function materialsOf(session: Pick<Session, 'materials'>): SessionMaterial[] {
  const raw = session.materials;
  if (!Array.isArray(raw)) return [];
  return raw.filter((m): m is SessionMaterial => Boolean(m && typeof m === 'object' && 'url' in m));
}

export interface ModuleGroup {
  key: string;
  moduleId: number | null;
  name: string;
  order: number;
  hours: number | null;
  sessions: Session[];
  doneCount: number;
}

/**
 * Agrupa las clases por módulo, en el orden del programa. Las clases sin
 * módulo se juntan al final: existen, y esconderlas sería peor.
 */
export function groupSessionsByModule(
  sessions: Session[],
  modules: ProgramModule[],
  now: Date = new Date()
): ModuleGroup[] {
  const byModule = new Map<string, Session[]>();
  for (const session of sessions) {
    const key = session.module_id == null ? 'sin-modulo' : String(session.module_id);
    const list = byModule.get(key) ?? [];
    list.push(session);
    byModule.set(key, list);
  }

  const groups: ModuleGroup[] = [];

  for (const module of [...modules].sort((a, b) => a.order_index - b.order_index)) {
    const list = byModule.get(String(module.id));
    if (!list || list.length === 0) continue;
    byModule.delete(String(module.id));
    groups.push({
      key: String(module.id),
      moduleId: module.id,
      name: module.name,
      order: module.order_index,
      hours: module.hours,
      sessions: sortSessions(list),
      doneCount: list.filter((s) => isSessionDone(s, now)).length,
    });
  }

  for (const [key, list] of byModule) {
    groups.push({
      key,
      moduleId: key === 'sin-modulo' ? null : Number(key),
      name: 'Otras clases',
      order: 999,
      hours: null,
      sessions: sortSessions(list),
      doneCount: list.filter((s) => isSessionDone(s, now)).length,
    });
  }

  return groups;
}

function sortSessions(list: Session[]): Session[] {
  return [...list].sort((a, b) => (a.starts_at || '').localeCompare(b.starts_at || ''));
}

/* -------------------------------------------------------------------------- */
/* Asistencia y notas                                                          */
/* -------------------------------------------------------------------------- */

/** Presente y justificado cuentan como asistencia; así lo hace ya el pase de lista. */
export function countsAsPresent(status: AttendanceStatus | string | null | undefined): boolean {
  return status === 'present' || status === 'excused';
}

export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  present: 'Presente',
  late: 'Tarde',
  absent: 'Ausente',
  excused: 'Justificado',
};

/** Un color por estado, tomado de la paleta ya validada de pagos. */
export const ATTENDANCE_COLOR: Record<AttendanceStatus, string> = {
  present: 'var(--pay-serie-cobrado)',
  late: 'var(--pay-aviso)',
  absent: 'var(--pay-critico)',
  excused: 'var(--pay-serie-porcobrar)',
};

export interface AttendanceRate {
  present: number;
  total: number;
  percent: number;
}

export function rate(present: number, total: number): AttendanceRate {
  return { present, total, percent: total > 0 ? Math.round((present / total) * 100) : 0 };
}

/** Bajo este umbral el estudiante entra en la lista de los que hay que llamar. */
export const AT_RISK_PERCENT = 70;

/** Promedio de notas en escala 0–5, con un decimal de más para no perder detalle. */
export function averageGrade(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

export function formatGrade(value: number | null): string {
  return value == null ? '—' : value.toFixed(2).replace(/0$/, '');
}
