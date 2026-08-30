/**
 * Cuánto se le debe a un profesor y por qué.
 *
 * La tarifa se acuerda por cohorte y admite tres formas, porque en la práctica
 * se mezclan: un instructor titular suele ir por toda la cohorte y un monitor
 * por clase. Lo que las une es de dónde sale la cifra — las clases que ya se
 * dictaron, que es un dato que solo existe en la plataforma.
 */

import type { Session } from '@/types/supabase';
import { isSessionDone } from './cohorts';
import { parseLocalDate } from './students';

export type PayMode = 'per_session' | 'per_cohort' | 'monthly';

export interface InstructorRate {
  instructor_id: string;
  cohort_id: number;
  mode: PayMode;
  amount: number;
  requires_attendance: boolean;
}

export interface InstructorPayment {
  id: number;
  instructor_id: string;
  cohort_id: number;
  concept: string;
  amount: number;
  period_start: string;
  period_end: string;
  session_count: number;
  status: 'pending' | 'paid';
  paid_at: string | null;
  method: string | null;
}

export const PAY_MODE_LABEL: Record<PayMode, string> = {
  per_session: 'por clase dictada',
  per_cohort: 'por toda la cohorte',
  monthly: 'al mes',
};

export const PAY_MODE_TITLE: Record<PayMode, string> = {
  per_session: 'Por clase',
  per_cohort: 'Por la cohorte',
  monthly: 'Mensual fijo',
};

/** El estado en el que está el pago del periodo que corre. */
export type PayState =
  | 'no_rate' // todavía no se acordó tarifa
  | 'ready' // hay algo por pagar y nada lo bloquea
  | 'blocked' // hay clases dictadas sin asistencia y la tarifa la exige
  | 'scheduled' // se paga al cerrar la cohorte
  | 'paid' // el periodo ya se pagó
  | 'nothing'; // no hay nada que pagar este periodo

export interface CohortPay {
  state: PayState;
  /** Lo que corresponde pagar por el periodo que corre. */
  payableNow: number;
  /** Clases del periodo que ya cuentan. */
  sessionsInPeriod: number;
  /** Clases del periodo dictadas pero sin asistencia: lo que bloquea. */
  blockedSessions: number;
  blockedAmount: number;
  /** Total dictado en la cohorte y total elegible, para la barra de avance. */
  doneSessions: number;
  totalSessions: number;
  /** Lo generado en toda la cohorte hasta hoy, y lo que valdría completa. */
  generated: number;
  fullValue: number;
  /** El pago del periodo, si ya existe. */
  payment: InstructorPayment | null;
  periodStart: string;
  periodEnd: string;
}

/** «2026-08-01» y «2026-08-31» del mes de una fecha. */
export function monthBounds(today: Date = new Date()): { start: string; end: string } {
  const year = today.getFullYear();
  const month = today.getMonth();
  const pad = (n: number) => String(n).padStart(2, '0');
  const lastDay = new Date(year, month + 1, 0).getDate();
  return {
    start: `${year}-${pad(month + 1)}-01`,
    end: `${year}-${pad(month + 1)}-${pad(lastDay)}`,
  };
}

function inRange(value: string, start: string, end: string): boolean {
  const day = value.slice(0, 10);
  return day >= start && day <= end;
}

/**
 * Resuelve el pago de una cohorte para el periodo que corre.
 *
 * Para el modo por clase el periodo es el mes; para los otros dos es toda la
 * cohorte, así que el «periodo» va de su fecha de inicio a la de cierre.
 */
export function computeCohortPay(params: {
  rate: InstructorRate | null;
  sessions: Session[];
  /** Ids de clases que tienen al menos un registro de asistencia. */
  sessionsWithAttendance: Set<number>;
  cohortStart: string | null;
  cohortEnd: string | null;
  payments: InstructorPayment[];
  today?: Date;
}): CohortPay {
  const { rate, sessions, sessionsWithAttendance, cohortStart, cohortEnd, payments } = params;
  const today = params.today ?? new Date();

  const ordered = [...sessions].sort((a, b) => (a.starts_at || '').localeCompare(b.starts_at || ''));
  const done = ordered.filter((session) => isSessionDone(session, today));
  const totalSessions = ordered.length;

  const counts = (session: Session) =>
    !rate?.requires_attendance || sessionsWithAttendance.has(session.id);

  const eligible = done.filter(counts);
  const blockedAll = done.filter((session) => !counts(session));

  const base: CohortPay = {
    state: 'no_rate',
    payableNow: 0,
    sessionsInPeriod: 0,
    blockedSessions: 0,
    blockedAmount: 0,
    doneSessions: done.length,
    totalSessions,
    generated: 0,
    fullValue: 0,
    payment: null,
    periodStart: cohortStart ?? '',
    periodEnd: cohortEnd ?? '',
  };

  if (!rate) return base;

  if (rate.mode === 'per_session') {
    const { start, end } = monthBounds(today);
    const inMonth = (session: Session) => inRange(session.starts_at, start, end);

    const monthEligible = eligible.filter(inMonth);
    const monthBlocked = blockedAll.filter(inMonth);
    const payment = payments.find((p) => p.period_start === start && p.period_end === end) ?? null;

    const payable = monthEligible.length * rate.amount;
    const state: PayState = payment
      ? payment.status === 'paid'
        ? 'paid'
        : 'ready'
      : monthBlocked.length > 0 && monthEligible.length === 0
        ? 'blocked'
        : payable > 0
          ? 'ready'
          : monthBlocked.length > 0
            ? 'blocked'
            : 'nothing';

    return {
      ...base,
      state,
      payableNow: payment ? payment.amount : payable,
      sessionsInPeriod: payment ? payment.session_count : monthEligible.length,
      blockedSessions: monthBlocked.length,
      blockedAmount: monthBlocked.length * rate.amount,
      generated: eligible.length * rate.amount,
      fullValue: totalSessions * rate.amount,
      payment,
      periodStart: start,
      periodEnd: end,
    };
  }

  if (rate.mode === 'monthly') {
    const { start, end } = monthBounds(today);
    const payment = payments.find((p) => p.period_start === start && p.period_end === end) ?? null;
    const monthBlocked = blockedAll.filter((session) => inRange(session.starts_at, start, end));
    const ranThisMonth = done.some((session) => inRange(session.starts_at, start, end));

    const state: PayState = payment
      ? payment.status === 'paid'
        ? 'paid'
        : 'ready'
      : !ranThisMonth
        ? 'nothing'
        : monthBlocked.length > 0
          ? 'blocked'
          : 'ready';

    return {
      ...base,
      state,
      payableNow: payment ? payment.amount : ranThisMonth ? rate.amount : 0,
      sessionsInPeriod: done.filter((session) => inRange(session.starts_at, start, end)).length,
      blockedSessions: monthBlocked.length,
      blockedAmount: monthBlocked.length > 0 ? rate.amount : 0,
      generated: rate.amount,
      fullValue: rate.amount,
      payment,
      periodStart: start,
      periodEnd: end,
    };
  }

  // per_cohort: un solo pago, cuando la cohorte cierra.
  const start = cohortStart ?? '';
  const end = cohortEnd ?? '';
  const payment = payments.find((p) => p.period_start === start && p.period_end === end) ?? null;
  const closed = end ? (parseLocalDate(end)?.getTime() ?? 0) < today.getTime() : false;

  const state: PayState = payment
    ? payment.status === 'paid'
      ? 'paid'
      : 'ready'
    : !closed
      ? 'scheduled'
      : blockedAll.length > 0
        ? 'blocked'
        : 'ready';

  return {
    ...base,
    state,
    payableNow: payment ? payment.amount : closed ? rate.amount : 0,
    sessionsInPeriod: done.length,
    blockedSessions: blockedAll.length,
    blockedAmount: blockedAll.length > 0 ? rate.amount : 0,
    // Con este modo lo generado avanza con las clases: es lo que deja ver
    // cuánto lleva ganado aunque todavía no se le pague.
    generated: totalSessions > 0 ? Math.round((eligible.length / totalSessions) * rate.amount) : 0,
    fullValue: rate.amount,
    payment,
    periodStart: start,
    periodEnd: end,
  };
}

/** Cómo se lee la tarifa en una línea: «$150.000 por clase dictada». */
export function rateLine(rate: InstructorRate | null, money: (v: number) => string): string {
  if (!rate) return 'Sin tarifa acordada';
  return `${money(rate.amount)} ${PAY_MODE_LABEL[rate.mode]}`;
}

/** Cuánto valdría la cohorte completa con esa tarifa. */
export function fullValueOf(rate: InstructorRate, totalSessions: number, months = 1): number {
  if (rate.mode === 'per_session') return rate.amount * totalSessions;
  if (rate.mode === 'monthly') return rate.amount * Math.max(1, months);
  return rate.amount;
}

/** Meses que abarca la cohorte, para estimar el total del modo mensual. */
export function monthsBetween(start: string | null, end: string | null): number {
  const from = parseLocalDate(start);
  const to = parseLocalDate(end);
  if (!from || !to) return 1;
  return Math.max(1, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1);
}
