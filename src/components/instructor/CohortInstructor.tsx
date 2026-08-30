'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import { AlertTriangle, BookOpen, Clock, Loader2 } from 'lucide-react';
import type { AttendanceStatus, Grade, ProgramModule, Session } from '@/types/supabase';
import {
  AT_RISK_PERCENT,
  cohortStatus,
  countsAsPresent,
  findNextSession,
  isSessionDone,
  placeLine,
  scheduleLine,
  sessionDayLong,
  type CohortLite,
  type CohortStatus,
} from '@/lib/cohorts';
import { formatLongDate } from '@/lib/students';

interface CohortCard {
  cohort: CohortLite;
  status: CohortStatus;
  studentCount: number;
  sessionCount: number;
  doneCount: number;
  nextSession: Session | null;
  groupAttendance: number | null;
  pendingRolls: number;
  pendingGrades: number;
  atRisk: number;
}

const STATUS_COLOR: Record<CohortStatus, string> = {
  active: 'var(--pay-serie-cobrado)',
  upcoming: 'var(--pay-aviso)',
  finished: 'var(--pay-serie-porcobrar)',
};

function tint(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default function CohortInstructor() {
  const supabase = useSupabaseClient();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [cards, setCards] = useState<CohortCard[]>([]);
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
          'cohort:cohorts!cohort_id(id, name, slug, program_id, start_date, end_date, modality, campus, capacity, schedule, program:programs!program_id(id, name, total_hours))'
        )
        .eq('instructor_id', user.id);

      if (linksError) throw linksError;

      const cohorts: (CohortLite & { program_id?: number })[] = [];
      for (const row of (links ?? []) as Record<string, unknown>[]) {
        const raw = one(row.cohort as never) as Record<string, unknown> | null;
        if (!raw) continue;
        cohorts.push({
          ...(raw as unknown as CohortLite & { program_id?: number }),
          program: one(raw.program as never) as CohortLite['program'],
        });
      }

      if (cohorts.length === 0) {
        setCards([]);
        return;
      }

      const cohortIds = cohorts.map((cohort) => cohort.id);
      const programIds = Array.from(
        new Set(cohorts.map((cohort) => cohort.program_id).filter((id): id is number => id != null))
      );

      const [sessionsRes, enrollmentsRes, modulesRes] = await Promise.all([
        supabase.from('sessions').select('*').in('cohort_id', cohortIds).order('starts_at'),
        supabase.from('enrollments').select('id, cohort_id').in('cohort_id', cohortIds),
        programIds.length > 0
          ? supabase.from('program_modules').select('id, program_id').in('program_id', programIds)
          : Promise.resolve({ data: [] }),
      ]);

      const allSessions = (sessionsRes.data ?? []) as Session[];
      const enrollments = (enrollmentsRes.data ?? []) as { id: number; cohort_id: number }[];
      const modules = (modulesRes.data ?? []) as Pick<ProgramModule, 'id' | 'program_id'>[];

      const enrollmentIds = enrollments.map((row) => row.id);
      const [attendanceRes, gradesRes] = await Promise.all([
        enrollmentIds.length > 0
          ? supabase
              .from('attendance')
              .select('session_id, enrollment_id, status')
              .in('enrollment_id', enrollmentIds)
          : Promise.resolve({ data: [] }),
        enrollmentIds.length > 0
          ? supabase.from('grades').select('enrollment_id, module_id').in('enrollment_id', enrollmentIds)
          : Promise.resolve({ data: [] }),
      ]);

      const attendance = (attendanceRes.data ?? []) as {
        session_id: number;
        enrollment_id: number;
        status: AttendanceStatus;
      }[];
      const grades = (gradesRes.data ?? []) as Pick<Grade, 'enrollment_id' | 'module_id'>[];

      const built = cohorts.map((cohort) => {
        const sessions = allSessions.filter((session) => session.cohort_id === cohort.id);
        const done = sessions.filter((session) => isSessionDone(session, now));
        const cohortEnrollments = enrollments.filter((row) => row.cohort_id === cohort.id);
        const cohortEnrollmentIds = new Set(cohortEnrollments.map((row) => row.id));

        const marked = attendance.filter(
          (row) => cohortEnrollmentIds.has(row.enrollment_id) && done.some((s) => s.id === row.session_id)
        );
        const present = marked.filter((row) => countsAsPresent(row.status)).length;

        const markedSessions = new Set(marked.map((row) => row.session_id));
        const moduleCount = modules.filter((m) => m.program_id === cohort.program_id).length;
        const cohortGrades = grades.filter((row) => cohortEnrollmentIds.has(row.enrollment_id));

        const atRisk = cohortEnrollments.filter((enrollment) => {
          const mine = marked.filter((row) => row.enrollment_id === enrollment.id);
          if (mine.length === 0) return false;
          const ok = mine.filter((row) => countsAsPresent(row.status)).length;
          return Math.round((ok / mine.length) * 100) < AT_RISK_PERCENT;
        }).length;

        return {
          cohort,
          status: cohortStatus(cohort, now),
          studentCount: cohortEnrollments.length,
          sessionCount: sessions.length,
          doneCount: done.length,
          nextSession: findNextSession(sessions, now),
          groupAttendance: marked.length > 0 ? Math.round((present / marked.length) * 100) : null,
          pendingRolls: done.filter((session) => !markedSessions.has(session.id)).length,
          pendingGrades: Math.max(0, cohortEnrollments.length * moduleCount - cohortGrades.length),
          atRisk,
        };
      });

      built.sort((a, b) => (b.cohort.start_date ?? '').localeCompare(a.cohort.start_date ?? ''));
      setCards(built);
    } catch (err) {
      console.error('Error al cargar las cohortes:', err);
      setError('No pudimos cargar tus cohortes. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [supabase, user?.id, now]);

  useEffect(() => {
    if (userLoading || !user) return;
    if (!['admin', 'instructor'].includes(user.role ?? '')) {
      router.push('/unauthorized');
      return;
    }
    fetchData();
  }, [user, userLoading, router, fetchData]);

  const active = cards.filter((card) => card.status === 'active');
  const upcoming = cards.filter((card) => card.status === 'upcoming');
  const finished = cards.filter((card) => card.status === 'finished');

  const pendingRolls = cards.reduce((total, card) => total + card.pendingRolls, 0);
  const pendingGrades = cards.reduce((total, card) => total + card.pendingGrades, 0);

  if (loading || userLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-[27px] font-bold tracking-tight text-text-primary">Mis cohortes</h1>
        <p className="text-sm text-text-muted">
          {cards.length === 0
            ? 'Todavía no tienes cohortes asignadas.'
            : [
                `${active.length} ${active.length === 1 ? 'cohorte en curso' : 'cohortes en curso'}`,
                pendingRolls > 0
                  ? `${pendingRolls} ${pendingRolls === 1 ? 'asistencia sin pasar' : 'asistencias sin pasar'}`
                  : null,
                pendingGrades > 0
                  ? `${pendingGrades} ${pendingGrades === 1 ? 'nota por poner' : 'notas por poner'}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ') + '.'}
        </p>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
      )}

      {cards.length === 0 && !error && (
        <section className="rounded-xl border border-border-color bg-[var(--card-background)] px-10 py-11 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-text-muted/10 text-text-muted">
            <BookOpen size={24} strokeWidth={1.8} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-text-primary">Aún no dictas ninguna cohorte</h2>
          <p className="mx-auto mt-2 max-w-[400px] text-sm leading-relaxed text-text-muted">
            Cuando te asignen una, aparecerá aquí con sus clases y sus estudiantes.
          </p>
        </section>
      )}

      {active.length > 0 && (
        <Group label="En curso">
          {active.map((card) => (
            <ActiveCard key={card.cohort.id} card={card} />
          ))}
        </Group>
      )}

      {upcoming.length > 0 && (
        <Group label="Por empezar">
          {upcoming.map((card) => (
            <CompactCard key={card.cohort.id} card={card} />
          ))}
        </Group>
      )}

      {finished.length > 0 && (
        <Group label="Terminadas">
          {finished.map((card) => (
            <CompactCard key={card.cohort.id} card={card} />
          ))}
        </Group>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</span>
      {children}
    </section>
  );
}

function ActiveCard({ card }: { card: CohortCard }) {
  const { cohort } = card;
  const schedule = scheduleLine(cohort.schedule);
  const place = placeLine(cohort.modality, card.nextSession?.room ?? cohort.campus);

  const todos: { text: string; color: string }[] = [];
  if (card.pendingRolls > 0) {
    todos.push({
      text: `${card.pendingRolls} ${card.pendingRolls === 1 ? 'asistencia sin pasar' : 'asistencias sin pasar'}`,
      color: 'var(--pay-aviso)',
    });
  }
  if (card.pendingGrades > 0) {
    todos.push({
      text: `${card.pendingGrades} ${card.pendingGrades === 1 ? 'nota por poner' : 'notas por poner'}`,
      color: 'var(--pay-aviso)',
    });
  }
  if (card.atRisk > 0) {
    todos.push({
      text: `${card.atRisk} ${card.atRisk === 1 ? 'estudiante en riesgo' : 'estudiantes en riesgo'}`,
      color: 'var(--pay-critico)',
    });
  }

  return (
    <article className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
      <div className="flex flex-wrap items-start justify-between gap-5 px-[22px] py-5">
        <div className="flex min-w-0 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-lg font-bold text-text-primary">{cohort.program?.name ?? 'Cohorte'}</span>
            <span className="text-[13.5px] text-text-muted">{cohort.name}</span>
            <Pill color={STATUS_COLOR.active}>En curso</Pill>
          </div>
          <span className="text-[13px] text-text-muted">
            {[schedule, place, cohort.end_date ? `termina el ${formatLongDate(cohort.end_date).replace(/ de \d{4}$/, '')}` : null]
              .filter(Boolean)
              .join(' · ')}
          </span>
          {card.nextSession && (
            <div
              className="flex w-fit items-center gap-2.5 rounded-[9px] border px-3.5 py-2.5"
              style={{ borderColor: tint('var(--secondary)', 20), background: tint('var(--secondary)', 8) }}
            >
              <Clock className="h-[15px] w-[15px] shrink-0 text-secondary" />
              <span className="text-[13px] text-text-primary">
                Próxima clase:{' '}
                <strong className="font-semibold">{card.nextSession.title || 'Clase'}</strong> ·{' '}
                {sessionDayLong(card.nextSession.starts_at).toLowerCase()}
              </span>
            </div>
          )}
          {todos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {todos.map((todo) => (
                <span
                  key={todo.text}
                  className="inline-flex h-[26px] items-center gap-1.5 rounded-[7px] px-2.5 text-[12.5px] font-medium"
                  style={{ background: tint(todo.color, 12), color: todo.color }}
                >
                  <AlertTriangle className="h-[15px] w-[15px]" />
                  {todo.text}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3.5">
          <Link
            href={`/perfil/instructor/${cohort.slug}`}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-secondary px-[18px] text-sm font-semibold text-[#0E1116] transition-colors hover:bg-secondary/90"
          >
            Abrir cohorte
          </Link>
          <div className="flex gap-[22px]">
            <MiniStat value={String(card.studentCount)} label="estudiantes" />
            {card.groupAttendance != null && (
              <MiniStat value={`${card.groupAttendance}%`} label="asistencia" />
            )}
            <MiniStat value={`${card.doneCount}/${card.sessionCount}`} label="clases" />
          </div>
        </div>
      </div>
    </article>
  );
}

function CompactCard({ card }: { card: CohortCard }) {
  const { cohort, status } = card;
  const detail = [
    [cohort.start_date, cohort.end_date]
      .filter(Boolean)
      .map((d) => formatLongDate(d).replace(/ de \d{4}$/, ''))
      .join(' – '),
    `${card.studentCount} ${card.studentCount === 1 ? 'estudiante' : 'estudiantes'}`,
    card.groupAttendance != null ? `asistencia ${card.groupAttendance}%` : null,
    status === 'finished'
      ? card.pendingGrades > 0
        ? `${card.pendingGrades} notas sin poner`
        : 'notas completas'
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
      <div className="flex flex-wrap items-center justify-between gap-5 px-[22px] py-[18px]">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[17px] font-semibold text-text-primary">
              {cohort.program?.name ?? 'Cohorte'}
            </span>
            <span className="text-[13.5px] text-text-muted">{cohort.name}</span>
            <Pill color={STATUS_COLOR[status]}>
              {status === 'upcoming' ? 'Por iniciar' : 'Terminada'}
            </Pill>
          </div>
          <span className="text-[13px] text-text-muted">{detail}</span>
        </div>
        <Link
          href={`/perfil/instructor/${cohort.slug}`}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border-color bg-bg-secondary px-4 text-sm font-medium text-text-primary transition-colors hover:border-secondary/50"
        >
          Ver la cohorte
        </Link>
      </div>
    </article>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-[17px] font-bold text-text-primary">{value}</span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex h-6 w-fit shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-semibold"
      style={{ background: tint(color, 14), color }}
    >
      {children}
    </span>
  );
}
