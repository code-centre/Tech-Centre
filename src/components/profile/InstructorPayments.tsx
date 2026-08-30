'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import { AlertTriangle, Loader2, SearchX } from 'lucide-react';
import type { Session } from '@/types/supabase';
import { cohortStatus, isSessionDone, type CohortLite } from '@/lib/cohorts';
import { formatLongDate, formatMoney } from '@/lib/students';
import {
  computeCohortPay,
  PAY_MODE_LABEL,
  type CohortPay,
  type InstructorPayment,
  type InstructorRate,
} from '@/lib/instructorPay';

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const PG = 'grid grid-cols-[minmax(0,1fr)_120px_130px_150px] gap-3.5 items-center';

interface CohortRow {
  cohort: CohortLite;
  rate: InstructorRate | null;
  sessions: Session[];
  payments: InstructorPayment[];
  pay: CohortPay;
}

function tint(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default function InstructorPayments() {
  const supabase = useSupabaseClient();
  const { user } = useUser();

  const [rows, setRows] = useState<CohortRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = useMemo(() => new Date(), []);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');

    try {
      const { data: links, error: linksError } = await supabase
        .from('cohort_instructors')
        .select(
          'cohort_id, cohort:cohorts!cohort_id(id, name, slug, start_date, end_date, modality, program:programs!program_id(id, name))'
        )
        .eq('instructor_id', user.id);

      if (linksError) throw linksError;

      const cohorts: CohortLite[] = [];
      for (const row of (links ?? []) as Record<string, unknown>[]) {
        const raw = one(row.cohort as never) as Record<string, unknown> | null;
        if (!raw) continue;
        cohorts.push({
          ...(raw as unknown as CohortLite),
          program: one(raw.program as never) as CohortLite['program'],
        });
      }

      if (cohorts.length === 0) {
        setRows([]);
        return;
      }

      const cohortIds = cohorts.map((cohort) => cohort.id);
      const [sessionsRes, ratesRes, paymentsRes] = await Promise.all([
        supabase.from('sessions').select('*').in('cohort_id', cohortIds).order('starts_at'),
        supabase.from('instructor_rates').select('*').eq('instructor_id', user.id),
        supabase
          .from('instructor_payments')
          .select('*')
          .eq('instructor_id', user.id)
          .order('period_start', { ascending: false }),
      ]);

      const allSessions = (sessionsRes.data ?? []) as Session[];
      const rates = (ratesRes.data ?? []) as InstructorRate[];
      const payments = (paymentsRes.data ?? []) as InstructorPayment[];

      const sessionIds = allSessions.map((session) => session.id);
      const attendanceRes =
        sessionIds.length > 0
          ? await supabase.from('attendance').select('session_id').in('session_id', sessionIds)
          : { data: [] };
      const withAttendance = new Set(
        ((attendanceRes.data ?? []) as { session_id: number }[]).map((row) => row.session_id)
      );

      const built: CohortRow[] = cohorts.map((cohort) => {
        const sessions = allSessions.filter((session) => session.cohort_id === cohort.id);
        const rate = rates.find((r) => Number(r.cohort_id) === Number(cohort.id)) ?? null;
        const mine = payments.filter((p) => Number(p.cohort_id) === Number(cohort.id));

        return {
          cohort,
          rate,
          sessions,
          payments: mine,
          pay: computeCohortPay({
            rate,
            sessions,
            sessionsWithAttendance: withAttendance,
            cohortStart: cohort.start_date,
            cohortEnd: cohort.end_date,
            payments: mine,
            today: now,
          }),
        };
      });

      const rank: Record<string, number> = { active: 0, upcoming: 1, finished: 2 };
      built.sort((a, b) => rank[cohortStatus(a.cohort, now)] - rank[cohortStatus(b.cohort, now)]);
      setRows(built);
    } catch (err) {
      console.error('Error al cargar los honorarios:', err);
      setError('No pudimos cargar tus honorarios. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [supabase, user?.id, now]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const thisMonth = rows
    .filter((row) => row.pay.state === 'ready' || row.pay.state === 'blocked')
    .reduce((sum, row) => sum + row.pay.payableNow, 0);

  const paidThisYear = rows
    .flatMap((row) => row.payments)
    .filter((payment) => payment.status === 'paid' && payment.period_start.startsWith(String(now.getFullYear())))
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const pending = rows
    .filter((row) => row.rate && cohortStatus(row.cohort, now) !== 'finished')
    .reduce((sum, row) => sum + Math.max(0, row.pay.fullValue - row.pay.generated), 0);

  const blocked = rows.filter((row) => row.pay.blockedSessions > 0);
  const blockedCount = blocked.reduce((sum, row) => sum + row.pay.blockedSessions, 0);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-[27px] font-bold tracking-tight text-text-primary">Mis honorarios</h1>
        <p className="text-sm text-text-muted">Lo que has ganado en cada cohorte y cuándo entra.</p>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
      )}

      {blockedCount > 0 && (
        <section
          className="flex flex-wrap items-center justify-between gap-5 rounded-xl border p-[16px_20px]"
          style={{ borderColor: tint('var(--pay-aviso)', 35), background: tint('var(--pay-aviso)', 6) }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <AlertTriangle className="h-[15px] w-[15px] shrink-0" style={{ color: 'var(--pay-aviso)' }} />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-text-primary">
                {blockedCount === 1
                  ? 'Una de tus clases no tiene asistencia pasada'
                  : `${blockedCount} de tus clases no tienen asistencia pasada`}
              </span>
              <span className="text-[13px] text-text-muted">
                Hasta que las pases, esas clases no entran al pago del mes.
              </span>
            </div>
          </div>
          {blocked[0]?.cohort.slug && (
            <Link
              href={`/perfil/instructor/${blocked[0].cohort.slug}`}
              className="inline-flex h-9 shrink-0 items-center rounded-lg bg-secondary px-[18px] text-sm font-semibold text-[#0E1116] transition-colors hover:bg-secondary/90"
            >
              Pasarlas ahora
            </Link>
          )}
        </section>
      )}

      {rows.length === 0 ? (
        <section className="rounded-xl border border-border-color bg-[var(--card-background)] px-10 py-11 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-text-muted/10 text-text-muted">
            <SearchX size={24} strokeWidth={1.8} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-text-primary">Todavía no tienes cohortes asignadas</h2>
          <p className="mx-auto mt-2 max-w-[400px] text-sm leading-relaxed text-text-muted">
            Cuando dictes una, aquí verás lo que se te va generando.
          </p>
        </section>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Este mes" value={formatMoney(thisMonth)} note={monthNote(rows, now)} />
            <Stat
              label="Ya te pagamos"
              value={formatMoney(paidThisYear)}
              note={`En lo que va de ${now.getFullYear()}`}
            />
            <Stat
              label="Falta por generar"
              value={formatMoney(pending)}
              note="Si dictas las clases que quedan"
            />
          </div>

          {rows.map((row) => (
            <CohortCard key={row.cohort.id} row={row} now={now} />
          ))}
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function CohortCard({ row, now }: { row: CohortRow; now: Date }) {
  const { cohort, rate, pay } = row;
  const done = row.sessions.filter((session) => isSessionDone(session, now)).length;
  const total = row.sessions.length;
  const status = cohortStatus(cohort, now);

  return (
    <section className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
      <div className="flex items-center justify-between gap-4 border-b border-border-color px-5 py-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-base font-semibold text-text-primary">
            {cohort.program?.name ?? 'Cohorte'} · {cohort.name}
          </h2>
          <p className="text-[12.5px] text-text-muted">{rateSentence(rate)}</p>
        </div>
        <span
          className="inline-flex h-6 w-fit shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-semibold"
          style={
            status === 'active'
              ? { background: tint('var(--pay-serie-cobrado)', 14), color: 'var(--pay-serie-cobrado)' }
              : status === 'upcoming'
                ? { background: tint('var(--pay-aviso)', 14), color: 'var(--pay-aviso)' }
                : { background: tint('var(--pay-serie-porcobrar)', 14), color: 'var(--pay-serie-porcobrar)' }
          }
        >
          {status === 'active' ? 'En curso' : status === 'upcoming' ? 'Por iniciar' : 'Terminada'}
        </span>
      </div>

      <div
        className={`flex items-center gap-3.5 px-5 py-4 ${row.payments.length > 0 ? 'border-b border-border-color' : ''}`}
      >
        <span className="w-[140px] shrink-0 text-[12.5px] text-text-muted">
          {done} de {total} clases
        </span>
        <span className="h-1.5 grow overflow-hidden rounded-[3px] bg-border-color">
          <span
            className="block h-full rounded-[3px] bg-secondary"
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </span>
        <span className="shrink-0 text-[13px] text-text-primary">
          {!rate ? (
            <span className="text-text-muted">Todavía sin tarifa acordada</span>
          ) : pay.state === 'scheduled' ? (
            <span className="text-text-muted">
              Se paga el {formatLongDate(cohort.end_date).replace(/ de \d{4}$/, '')}
            </span>
          ) : (
            <>
              Llevas <strong className="font-semibold">{formatMoney(pay.generated)}</strong> de{' '}
              {formatMoney(pay.fullValue)}
            </>
          )}
        </span>
      </div>

      {row.payments.map((payment, index) => (
        <div
          key={payment.id}
          className={`${PG} px-5 py-3 ${index < row.payments.length - 1 ? 'border-b border-border-color/50' : ''}`}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[13.5px] text-text-primary">{payment.concept}</span>
            <span className="text-[12.5px] text-text-muted">
              {payment.session_count > 0
                ? `${payment.session_count} ${payment.session_count === 1 ? 'clase' : 'clases'}`
                : 'Pago acordado'}
            </span>
          </div>
          <span className="text-[13px] text-text-muted">
            {payment.paid_at ? shortDay(payment.paid_at) : 'este mes'}
          </span>
          <span className="text-right text-[13.5px] font-semibold text-text-primary">
            {formatMoney(Number(payment.amount))}
          </span>
          <div className="flex justify-end">
            <span
              className="inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold"
              style={
                payment.status === 'paid'
                  ? { background: tint('var(--pay-serie-cobrado)', 14), color: 'var(--pay-serie-cobrado)' }
                  : { background: tint('var(--pay-aviso)', 14), color: 'var(--pay-aviso)' }
              }
            >
              {payment.status === 'paid' ? 'Pagado' : 'Listo para pagar'}
            </span>
          </div>
        </div>
      ))}

      {/* El periodo que corre todavía no tiene registro: se muestra igual. */}
      {rate && !pay.payment && (pay.state === 'ready' || pay.state === 'blocked') && (
        <div className={`${PG} border-t border-border-color/50 px-5 py-3`}>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[13.5px] text-text-primary">{currentConcept(rate, pay)}</span>
            <span className="text-[12.5px] text-text-muted">
              {pay.state === 'blocked'
                ? `${pay.blockedSessions} sin asistencia pasada`
                : `${pay.sessionsInPeriod} ${pay.sessionsInPeriod === 1 ? 'clase' : 'clases'}`}
            </span>
          </div>
          <span className="text-[13px] text-text-muted">este mes</span>
          <span className="text-right text-[13.5px] font-semibold text-text-primary">
            {formatMoney(pay.payableNow)}
          </span>
          <div className="flex justify-end">
            <span
              className="inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold"
              style={
                pay.state === 'blocked'
                  ? { background: tint('var(--pay-aviso)', 14), color: 'var(--pay-aviso)' }
                  : { background: tint('var(--pay-serie-cobrado)', 14), color: 'var(--pay-serie-cobrado)' }
              }
            >
              {pay.state === 'blocked' ? 'Falta asistencia' : 'Listo para pagar'}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border-color bg-[var(--card-background)] p-[18px_20px]">
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</span>
      <span className="text-2xl font-bold text-text-primary">{value}</span>
      <span className="text-[12.5px] text-text-muted">{note}</span>
    </div>
  );
}

function rateSentence(rate: InstructorRate | null): string {
  if (!rate) return 'Todavía no se ha acordado cómo se paga esta cohorte.';
  if (rate.mode === 'per_session') return `Te pagamos ${formatMoney(rate.amount)} por cada clase que dictes.`;
  if (rate.mode === 'monthly') return `Te pagamos ${formatMoney(rate.amount)} al mes mientras dure.`;
  return `Esta va por toda la cohorte: ${formatMoney(rate.amount)} al cerrar.`;
}

function currentConcept(rate: InstructorRate, pay: CohortPay): string {
  const month = MONTHS[Number(pay.periodStart.slice(5, 7)) - 1] ?? '';
  if (rate.mode === 'monthly') return `Mensualidad de ${month}`;
  return `Clases de ${month}`;
}

function monthNote(rows: CohortRow[], now: Date): string {
  const sessions = rows
    .filter((row) => row.rate?.mode === 'per_session')
    .reduce((sum, row) => sum + row.pay.sessionsInPeriod, 0);
  const month = MONTHS[now.getMonth()];
  return sessions > 0
    ? `${sessions} ${sessions === 1 ? 'clase dictada' : 'clases dictadas'} en ${month}`
    : `Sin movimiento en ${month}`;
}

function shortDay(value: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';
  const short = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${date.getDate()} ${short[date.getMonth()]}`;
}
