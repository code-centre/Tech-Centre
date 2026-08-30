'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { AlertCircle, Loader2, SearchX } from 'lucide-react';
import type { Session } from '@/types/supabase';
import { cohortStatus, type CohortLite } from '@/lib/cohorts';
import { formatMoney, formatShortDate } from '@/lib/students';
import {
  computeCohortPay,
  monthsBetween,
  PAY_MODE_LABEL,
  rateLine,
  type CohortPay,
  type InstructorPayment,
  type InstructorRate,
} from '@/lib/instructorPay';
import InstructorRateModal from './InstructorRateModal';
import { payInstructor } from '@/app/admin/pagos/actions';

const GRID =
  'grid grid-cols-[minmax(0,1.5fr)_166px_148px_122px_126px_116px] gap-3.5 items-center';

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

interface Assignment {
  key: string;
  instructorId: string;
  name: string;
  role: string;
  cohort: CohortLite;
  rate: InstructorRate | null;
  sessions: Session[];
  pay: CohortPay;
}

function tint(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '··';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ROLE_LABEL: Record<string, string> = {
  owner: '· instructor',
  instructor: '· instructor',
  assistant: '· monitor',
  monitor: '· monitor',
};

export default function InstructorPayouts() {
  const supabase = useSupabaseClient();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState<string | null>(null);
  const [editing, setEditing] = useState<Assignment | null>(null);

  const now = useMemo(() => new Date(), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data: links, error: linksError } = await supabase
        .from('cohort_instructors')
        .select(
          'cohort_id, instructor_id, role, profile:profiles!instructor_id(first_name, last_name), cohort:cohorts!cohort_id(id, name, start_date, end_date, modality, capacity, program:programs!program_id(id, name))'
        );

      if (linksError) throw linksError;

      const rows = ((links ?? []) as Record<string, unknown>[])
        .map((row) => {
          const cohortRaw = one(row.cohort as never) as Record<string, unknown> | null;
          const profile = one(row.profile as never) as
            | { first_name?: string; last_name?: string }
            | null;
          if (!cohortRaw) return null;
          return {
            instructorId: row.instructor_id as string,
            role: (row.role as string) ?? 'instructor',
            name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Sin nombre',
            cohort: {
              ...(cohortRaw as unknown as CohortLite),
              program: one(cohortRaw.program as never) as CohortLite['program'],
            },
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      if (rows.length === 0) {
        setAssignments([]);
        return;
      }

      const cohortIds = Array.from(new Set(rows.map((row) => row.cohort.id)));

      const [sessionsRes, ratesRes, paymentsRes] = await Promise.all([
        supabase.from('sessions').select('*').in('cohort_id', cohortIds).order('starts_at'),
        supabase.from('instructor_rates').select('*').in('cohort_id', cohortIds),
        supabase.from('instructor_payments').select('*').in('cohort_id', cohortIds),
      ]);

      const allSessions = (sessionsRes.data ?? []) as Session[];
      const rates = (ratesRes.data ?? []) as InstructorRate[];
      const payments = (paymentsRes.data ?? []) as InstructorPayment[];

      // Qué clases tienen lista pasada: es lo que desbloquea el pago.
      const sessionIds = allSessions.map((session) => session.id);
      const attendanceRes =
        sessionIds.length > 0
          ? await supabase.from('attendance').select('session_id').in('session_id', sessionIds)
          : { data: [] };
      const withAttendance = new Set(
        ((attendanceRes.data ?? []) as { session_id: number }[]).map((row) => row.session_id)
      );

      const built: Assignment[] = rows.map((row) => {
        const sessions = allSessions.filter((session) => session.cohort_id === row.cohort.id);
        const rate =
          rates.find(
            (r) => r.instructor_id === row.instructorId && Number(r.cohort_id) === Number(row.cohort.id)
          ) ?? null;
        const mine = payments.filter(
          (p) => p.instructor_id === row.instructorId && Number(p.cohort_id) === Number(row.cohort.id)
        );

        return {
          key: `${row.instructorId}:${row.cohort.id}`,
          instructorId: row.instructorId,
          name: row.name,
          role: ROLE_LABEL[row.role] ?? '· instructor',
          cohort: row.cohort,
          rate,
          sessions,
          pay: computeCohortPay({
            rate,
            sessions,
            sessionsWithAttendance: withAttendance,
            cohortStart: row.cohort.start_date,
            cohortEnd: row.cohort.end_date,
            payments: mine,
            today: now,
          }),
        };
      });

      // Primero lo que hay que resolver, después lo ya cerrado.
      const order: Record<string, number> = { ready: 0, blocked: 1, no_rate: 2, scheduled: 3, nothing: 4, paid: 5 };
      built.sort((a, b) => (order[a.pay.state] ?? 9) - (order[b.pay.state] ?? 9));
      setAssignments(built);
    } catch (err) {
      console.error('Error al cargar los pagos a profesores:', err);
      setError('No pudimos cargar los pagos a profesores.');
    } finally {
      setLoading(false);
    }
  }, [supabase, now]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePay = async (assignment: Assignment) => {
    if (!assignment.rate) return;
    setPaying(assignment.key);
    setError('');

    try {
      const result = await payInstructor({
        instructorId: assignment.instructorId,
        cohortId: assignment.cohort.id,
        concept: conceptOf(assignment),
        amount: assignment.pay.payableNow,
        periodStart: assignment.pay.periodStart,
        periodEnd: assignment.pay.periodEnd,
        sessionCount: assignment.pay.sessionsInPeriod,
      });
      if (!result.success) throw new Error(result.error);
      await fetchData();
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'No se pudo registrar el pago');
    } finally {
      setPaying(null);
    }
  };

  const ready = assignments.filter((a) => a.pay.state === 'ready' && !a.pay.payment);
  const blocked = assignments.filter((a) => a.pay.state === 'blocked');
  const paid = assignments.filter((a) => a.pay.state === 'paid');

  const readyTotal = ready.reduce((sum, a) => sum + a.pay.payableNow, 0);
  const blockedTotal = blocked.reduce((sum, a) => sum + a.pay.blockedAmount, 0);
  const paidTotal = paid.reduce((sum, a) => sum + a.pay.payableNow, 0);
  const monthTotal = assignments.reduce((sum, a) => sum + a.pay.payableNow, 0);

  // Lo que falta por pagar hasta que cierren las cohortes que siguen abiertas.
  const committed = assignments
    .filter((a) => a.rate && cohortStatus(a.cohort, now) !== 'finished')
    .reduce((sum, a) => sum + Math.max(0, a.pay.fullValue - a.pay.generated), 0);

  const monthName = `${MONTHS[now.getMonth()]}`;
  const openCohorts = new Set(
    assignments.filter((a) => cohortStatus(a.cohort, now) !== 'finished').map((a) => a.cohort.id)
  ).size;

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {/* Cifras */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          dot="var(--pay-serie-cobrado)"
          label="Listo para pagar"
          value={formatMoney(readyTotal)}
          note={
            ready.length === 0
              ? 'Nada pendiente por ahora'
              : `${ready.length} ${ready.length === 1 ? 'pago' : 'pagos'}, ya con todo en orden`
          }
        />
        <Kpi
          dot="var(--pay-aviso)"
          label="Bloqueado"
          value={formatMoney(blockedTotal)}
          note={
            blocked.length === 0
              ? 'Toda la asistencia al día'
              : `${blocked.reduce((sum, a) => sum + a.pay.blockedSessions, 0)} clases sin asistencia pasada`
          }
          color={blockedTotal > 0 ? 'var(--pay-aviso)' : undefined}
          border={blockedTotal > 0 ? tint('var(--pay-aviso)', 32) : undefined}
        />
        <Kpi
          dot="var(--pay-serie-porcobrar)"
          label={`Pagado en ${monthName}`}
          value={formatMoney(paidTotal)}
          note={`${paid.length} ${paid.length === 1 ? 'pago hecho' : 'pagos hechos'}`}
        />
        <Kpi
          dot="var(--pay-neutro)"
          label="Comprometido"
          value={formatMoney(committed)}
          note={
            openCohorts > 0
              ? `Lo que falta hasta que cierren las ${openCohorts} cohortes abiertas`
              : 'Sin cohortes abiertas'
          }
        />
      </div>

      {/* Tabla */}
      {assignments.length === 0 ? (
        <section className="rounded-xl border border-border-color bg-[var(--card-background)] px-10 py-11 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-text-muted/10 text-text-muted">
            <SearchX size={24} strokeWidth={1.8} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-text-primary">
            Todavía no hay profesores asignados a cohortes
          </h2>
          <p className="mx-auto mt-2 max-w-[400px] text-sm leading-relaxed text-text-muted">
            Cuando asignes un instructor a una cohorte, podrás acordar aquí cómo se le paga.
          </p>
        </section>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
          <div className={`hidden ${GRID} border-b border-border-color bg-bg-secondary px-4 py-3 lg:grid`}>
            <HeadCell>Profesor y cohorte</HeadCell>
            <HeadCell>Cómo se le paga</HeadCell>
            <HeadCell>Clases dictadas</HeadCell>
            <HeadCell>A pagar ahora</HeadCell>
            <HeadCell>Estado</HeadCell>
            <span />
          </div>

          {assignments.map((assignment) => (
            <Row
              key={assignment.key}
              assignment={assignment}
              paying={paying === assignment.key}
              onPay={() => handlePay(assignment)}
              onEditRate={() => setEditing(assignment)}
            />
          ))}

          <div className="flex items-center justify-between gap-4 border-t border-border-color bg-bg-secondary px-4 py-3.5">
            <span className="text-[13px] text-text-muted">
              {assignments.length} {assignments.length === 1 ? 'asignación' : 'asignaciones'} ·{' '}
              {new Set(assignments.map((a) => a.instructorId)).size} profesores
            </span>
            <span className="text-[13.5px] text-text-primary">
              Total del mes <strong className="font-bold">{formatMoney(monthTotal)}</strong>
            </span>
          </div>
        </div>
      )}

      <InstructorRateModal
        open={Boolean(editing)}
        instructorId={editing?.instructorId ?? ''}
        instructorName={editing?.name ?? ''}
        cohortId={editing?.cohort.id ?? 0}
        cohortLabel={
          editing ? `${editing.cohort.program?.name ?? 'Programa'} · ${editing.cohort.name}` : ''
        }
        totalSessions={editing?.sessions.length ?? 0}
        months={monthsBetween(editing?.cohort.start_date ?? null, editing?.cohort.end_date ?? null)}
        rate={editing?.rate ?? null}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          fetchData();
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Row({
  assignment,
  paying,
  onPay,
  onEditRate,
}: {
  assignment: Assignment;
  paying: boolean;
  onPay: () => void;
  onEditRate: () => void;
}) {
  const { pay, rate, cohort } = assignment;
  // Ya vienen calculadas con la misma fecha que el resto de la fila.
  const done = pay.doneSessions;
  const total = pay.totalSessions;

  const state = STATE[pay.state];
  const highlight =
    pay.state === 'blocked'
      ? { background: tint('var(--pay-aviso)', 5) }
      : pay.state === 'no_rate'
        ? { background: tint('var(--pay-critico)', 4) }
        : undefined;

  return (
    <div
      className={`${GRID} border-b border-border-color/50 px-4 py-3 last:border-b-0 max-lg:flex max-lg:flex-col max-lg:items-start max-lg:gap-2`}
      style={highlight}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/12 text-[13px] font-semibold text-secondary">
          {initials(assignment.name)}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[14.5px] font-semibold text-text-primary">
            {assignment.name}{' '}
            <span className="text-xs font-normal text-text-muted">{assignment.role}</span>
          </span>
          <span className="truncate text-[12.5px] text-text-muted">
            {cohort.program?.name ?? 'Programa'} · {cohort.name}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onEditRate}
        className="flex min-w-0 flex-col gap-0.5 text-left transition-colors hover:text-secondary"
      >
        {rate ? (
          <>
            <span className="text-[13.5px] text-text-primary">{formatMoney(rate.amount)}</span>
            <span className="text-xs text-text-muted">{PAY_MODE_LABEL[rate.mode]}</span>
          </>
        ) : (
          <>
            <span className="text-[13.5px] font-semibold" style={{ color: 'var(--pay-critico)' }}>
              Sin tarifa
            </span>
            <span className="text-xs text-text-muted">Toca para acordarla</span>
          </>
        )}
      </button>

      <div className="flex flex-col gap-[5px]">
        <span className="text-[12.5px] text-text-muted">
          {done} de {total} clases
        </span>
        <span className="block h-[5px] overflow-hidden rounded-[2px] bg-border-color">
          <span
            className="block h-full rounded-[2px] bg-secondary"
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {pay.state === 'scheduled' ? (
          <>
            <span className="text-sm font-semibold text-text-primary">Al cerrar</span>
            <span className="text-xs text-text-muted">
              el {formatShortDate(cohort.end_date)}
            </span>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-text-primary">
              {pay.payableNow > 0 ? formatMoney(pay.payableNow) : '—'}
            </span>
            <span className="text-xs text-text-muted">{periodNote(assignment)}</span>
          </>
        )}
      </div>

      <span
        className="inline-flex h-6 w-fit shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-semibold"
        style={{ background: tint(state.color, 14), color: state.color }}
      >
        {pay.state === 'paid' && pay.payment?.paid_at
          ? `Pagado ${formatShortDate(pay.payment.paid_at.slice(0, 10))}`
          : state.label}
      </span>

      <div className="flex justify-end">
        {pay.state === 'ready' && !pay.payment ? (
          <button
            type="button"
            onClick={onPay}
            disabled={paying}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-secondary px-3 text-[12.5px] font-semibold text-[#0E1116] transition-colors hover:bg-secondary/90 disabled:opacity-50"
          >
            {paying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Marcar pagado
          </button>
        ) : pay.state === 'blocked' ? (
          <a
            href={cohort.slug ? `/perfil/instructor/${cohort.slug}` : `/admin/cohortes/${cohort.id}`}
            className="inline-flex h-8 items-center rounded-lg border border-border-color bg-bg-secondary px-3 text-[12.5px] font-medium text-text-primary transition-colors hover:border-secondary/50"
          >
            Ver las clases
          </a>
        ) : pay.state === 'no_rate' ? (
          <button
            type="button"
            onClick={onEditRate}
            className="inline-flex h-8 items-center rounded-lg border border-border-color bg-bg-secondary px-3 text-[12.5px] font-medium text-text-primary transition-colors hover:border-secondary/50"
          >
            Definir tarifa
          </button>
        ) : (
          <a
            href={`/admin/cohortes/${cohort.id}`}
            className="inline-flex h-8 items-center rounded-lg border border-border-color bg-bg-secondary px-3 text-[12.5px] font-medium text-text-primary transition-colors hover:border-secondary/50"
          >
            Ver detalle
          </a>
        )}
      </div>
    </div>
  );
}

const STATE: Record<CohortPay['state'], { label: string; color: string }> = {
  ready: { label: 'Listo para pagar', color: 'var(--pay-serie-cobrado)' },
  blocked: { label: 'Falta asistencia', color: 'var(--pay-aviso)' },
  scheduled: { label: 'Programado', color: 'var(--pay-neutro)' },
  paid: { label: 'Pagado', color: 'var(--pay-serie-porcobrar)' },
  nothing: { label: 'Sin movimiento', color: 'var(--pay-neutro)' },
  no_rate: { label: 'Sin tarifa', color: 'var(--pay-critico)' },
};

function periodNote(assignment: Assignment): string {
  const { pay, rate } = assignment;
  if (!rate) return 'Falta acordarla';
  if (rate.mode === 'per_session') {
    return pay.sessionsInPeriod === 0
      ? 'sin clases este mes'
      : `${pay.sessionsInPeriod} ${pay.sessionsInPeriod === 1 ? 'clase' : 'clases'} este mes`;
  }
  if (rate.mode === 'monthly') return 'mensualidad del mes';
  return 'al cerrar la cohorte';
}

function conceptOf(assignment: Assignment): string {
  const { rate, pay } = assignment;
  if (!rate) return 'Pago';
  if (rate.mode === 'per_cohort') return `Cohorte ${assignment.cohort.name}`;
  const month = MONTHS[Number(pay.periodStart.slice(5, 7)) - 1] ?? '';
  return rate.mode === 'monthly'
    ? `Mensualidad de ${month}`
    : `Clases de ${month}`;
}

function Kpi({
  dot,
  label,
  value,
  note,
  color,
  border,
}: {
  dot: string;
  label: string;
  value: string;
  note: string;
  color?: string;
  border?: string;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border bg-[var(--card-background)] p-5"
      style={{ borderColor: border ?? 'var(--border-color)' }}
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} aria-hidden />
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
          {label}
        </span>
      </div>
      <span
        className="text-[26px] font-bold tracking-tight tabular-nums"
        style={{ color: color ?? 'var(--text-primary)' }}
      >
        {value}
      </span>
      <span className="text-[13px] leading-snug text-text-muted">{note}</span>
    </div>
  );
}

function HeadCell({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">{children}</span>
  );
}
