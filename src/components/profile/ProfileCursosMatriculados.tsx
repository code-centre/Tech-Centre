'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSupabaseClient } from '@/lib/supabase';
import { Clock, Loader2, MapPin, SearchX } from 'lucide-react';
import type { AttendanceStatus, Grade, Session, User } from '@/types/supabase';
import {
  averageGrade,
  cohortStatus,
  countsAsPresent,
  daysUntil,
  findNextSession,
  formatGrade,
  isSessionDone,
  placeLine,
  scheduleLine,
  sessionDayLong,
  type CohortLite,
  type CohortStatus,
} from '@/lib/cohorts';
import { formatLongDate } from '@/lib/students';

interface Props {
  user: User;
}

interface Course {
  enrollmentId: number | null;
  cohort: CohortLite;
  status: CohortStatus;
  sessions: Session[];
  doneCount: number;
  nextSession: Session | null;
  attendancePercent: number | null;
  average: number | null;
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

export default function ProfileCursosMatriculados({ user }: Props) {
  const supabase = useSupabaseClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = useMemo(() => new Date(), []);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');

    try {
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(
          'id, cohort_id, cohort:cohorts!cohort_id(id, name, slug, start_date, end_date, modality, campus, capacity, schedule, program:programs!program_id(id, name, total_hours))'
        )
        .eq('student_id', user.id);

      if (enrollmentsError) throw enrollmentsError;

      const enrollments: { id: number; cohort: CohortLite }[] = [];
      for (const row of (enrollmentsData ?? []) as Record<string, unknown>[]) {
        const cohortRaw = one(row.cohort as never) as Record<string, unknown> | null;
        if (!cohortRaw) continue;
        enrollments.push({
          id: row.id as number,
          cohort: {
            ...(cohortRaw as unknown as CohortLite),
            program: one(cohortRaw.program as never) as CohortLite['program'],
          },
        });
      }

      const cohortIds = enrollments.map((row) => row.cohort.id);
      const enrollmentIds = enrollments.map((row) => row.id);

      const [sessionsRes, attendanceRes, gradesRes] = await Promise.all([
        cohortIds.length > 0
          ? supabase.from('sessions').select('*').in('cohort_id', cohortIds).order('starts_at')
          : Promise.resolve({ data: [] }),
        enrollmentIds.length > 0
          ? supabase
              .from('attendance')
              .select('enrollment_id, session_id, status')
              .in('enrollment_id', enrollmentIds)
          : Promise.resolve({ data: [] }),
        enrollmentIds.length > 0
          ? supabase.from('grades').select('*').in('enrollment_id', enrollmentIds)
          : Promise.resolve({ data: [] }),
      ]);

      const allSessions = (sessionsRes.data ?? []) as Session[];
      const attendanceRows = (attendanceRes.data ?? []) as {
        enrollment_id: number;
        session_id: number;
        status: AttendanceStatus;
      }[];
      const gradeRows = (gradesRes.data ?? []) as Grade[];

      const built: Course[] = enrollments.map(({ id, cohort }) => {
        const sessions = allSessions.filter((session) => session.cohort_id === cohort.id);
        const done = sessions.filter((session) => isSessionDone(session, now));
        const mine = attendanceRows.filter((row) => row.enrollment_id === id);
        const tracked = mine.filter((row) => done.some((session) => session.id === row.session_id));
        const present = tracked.filter((row) => countsAsPresent(row.status)).length;
        const grades = gradeRows.filter((row) => row.enrollment_id === id).map((row) => row.value);

        return {
          enrollmentId: id,
          cohort,
          status: cohortStatus(cohort, now),
          sessions,
          doneCount: done.length,
          nextSession: findNextSession(sessions, now),
          attendancePercent: tracked.length > 0 ? Math.round((present / tracked.length) * 100) : null,
          average: averageGrade(grades),
        };
      });

      built.sort((a, b) => (b.cohort.start_date ?? '').localeCompare(a.cohort.start_date ?? ''));
      setCourses(built);
    } catch (err) {
      console.error('Error al cargar los cursos:', err);
      setError('No pudimos cargar tus cursos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [supabase, user?.id, now]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const active = courses.filter((course) => course.status === 'active');
  const upcoming = courses.filter((course) => course.status === 'upcoming');
  const finished = courses.filter((course) => course.status === 'finished');

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-[27px] font-bold tracking-tight text-text-primary">Mis cursos</h1>
        <p className="text-sm text-text-muted">{summaryLine(active.length, upcoming.length, finished.length)}</p>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
      )}

      {courses.length === 0 && !error && (
        <section className="rounded-xl border border-border-color bg-[var(--card-background)] px-10 py-11 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-text-muted/10 text-text-muted">
            <SearchX size={24} strokeWidth={1.8} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-text-primary">Todavía no tienes cursos</h2>
          <p className="mx-auto mt-2 max-w-[400px] text-sm leading-relaxed text-text-muted">
            Cuando te matricules en un programa, aparecerá aquí con su horario y su material.
          </p>
          <Link href="/programas" className="btn-primary mt-5 inline-flex items-center gap-2">
            Ver los programas
          </Link>
        </section>
      )}

      {active.length > 0 && (
        <Group label="En curso">
          {active.map((course) => (
            <ActiveCourseCard key={course.cohort.id} course={course} now={now} />
          ))}
        </Group>
      )}

      {upcoming.length > 0 && (
        <Group label="Por empezar">
          {upcoming.map((course) => (
            <CompactCourseCard key={course.cohort.id} course={course} now={now} />
          ))}
        </Group>
      )}

      {finished.length > 0 && (
        <Group label="Terminados">
          {finished.map((course) => (
            <CompactCourseCard key={course.cohort.id} course={course} now={now} />
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

function ActiveCourseCard({ course, now }: { course: Course; now: Date }) {
  const { cohort } = course;
  const schedule = scheduleLine(cohort.schedule);
  const place = placeLine(cohort.modality, course.nextSession?.room ?? cohort.campus);
  const percent = course.sessions.length > 0 ? (course.doneCount / course.sessions.length) * 100 : 0;

  return (
    <article
      className="overflow-hidden rounded-xl border bg-[var(--card-background)]"
      style={{ borderColor: tint('var(--secondary)', 28) }}
    >
      <div className="flex flex-wrap items-start justify-between gap-6 px-6 py-[22px]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xl font-bold tracking-tight text-text-primary">
              {cohort.program?.name ?? 'Curso'}
            </span>
            <span className="text-sm text-text-muted">{cohort.name}</span>
            <Pill color={STATUS_COLOR.active}>En curso</Pill>
          </div>
          <div className="flex flex-wrap gap-2">
            {schedule && <Fact icon={<Clock className="h-[15px] w-[15px]" />}>{schedule}</Fact>}
            {place && <Fact icon={<MapPin className="h-[15px] w-[15px]" />}>{place}</Fact>}
          </div>
          {course.nextSession && (
            <div
              className="flex w-fit items-center gap-2.5 rounded-[9px] border px-3.5 py-2.5"
              style={{ borderColor: tint('var(--secondary)', 20), background: tint('var(--secondary)', 8) }}
            >
              <Clock className="h-[15px] w-[15px] shrink-0 text-secondary" />
              <span className="text-[13.5px] text-text-primary">
                Próxima clase:{' '}
                <strong className="font-semibold">{course.nextSession.title || 'Clase'}</strong> ·{' '}
                {sessionDayLong(course.nextSession.starts_at).toLowerCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3.5">
          <Link
            href={`/perfil/cursos/${cohort.id}`}
            className="inline-flex h-[42px] items-center gap-2 rounded-lg bg-secondary px-[18px] text-sm font-semibold text-[#0E1116] transition-colors hover:bg-secondary/90"
          >
            Entrar al curso
          </Link>
          <div className="flex gap-6">
            {course.attendancePercent != null && (
              <MiniStat value={`${course.attendancePercent}%`} label="tu asistencia" />
            )}
            {course.average != null && <MiniStat value={formatGrade(course.average)} label="tus notas" />}
          </div>
        </div>
      </div>

      {course.sessions.length > 0 && (
        <div className="flex items-center gap-3.5 border-t border-border-color bg-bg-secondary px-6 py-3.5">
          <span className="w-28 shrink-0 text-[12.5px] text-text-muted">
            {course.doneCount} de {course.sessions.length} clases
          </span>
          <span className="h-1.5 grow overflow-hidden rounded-[3px] bg-border-color">
            <span className="block h-full rounded-[3px] bg-secondary" style={{ width: `${percent}%` }} />
          </span>
          {cohort.end_date && (
            <span className="shrink-0 text-[12.5px] text-text-muted">
              Termina el {formatLongDate(cohort.end_date).replace(/ de \d{4}$/, '')}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function CompactCourseCard({ course, now }: { course: Course; now: Date }) {
  const { cohort, status } = course;
  const days = daysUntil(cohort.start_date, now);
  const schedule = scheduleLine(cohort.schedule);

  const detail =
    status === 'upcoming'
      ? [
          [cohort.start_date, cohort.end_date]
            .filter(Boolean)
            .map((d) => formatLongDate(d).replace(/ de \d{4}$/, ''))
            .join(' – '),
          schedule,
          cohort.modality,
        ]
          .filter(Boolean)
          .join(' · ')
      : [
          [cohort.start_date, cohort.end_date]
            .filter(Boolean)
            .map((d) => formatLongDate(d).replace(/ de \d{4}$/, ''))
            .join(' – '),
          course.average != null ? `nota final ${formatGrade(course.average)}` : null,
          course.attendancePercent != null ? `asistencia ${course.attendancePercent}%` : null,
        ]
          .filter(Boolean)
          .join(' · ');

  return (
    <article className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
      <div className="flex flex-wrap items-center justify-between gap-5 px-6 py-[18px]">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[17px] font-semibold text-text-primary">
              {cohort.program?.name ?? 'Curso'}
            </span>
            <span className="text-[13.5px] text-text-muted">{cohort.name}</span>
            <Pill color={STATUS_COLOR[status]}>
              {status === 'upcoming'
                ? days != null && days > 0
                  ? `Empieza en ${days} ${days === 1 ? 'día' : 'días'}`
                  : 'Por iniciar'
                : 'Terminado'}
            </Pill>
          </div>
          <span className="text-[13px] text-text-muted">{detail}</span>
        </div>
        <Link
          href={`/perfil/cursos/${cohort.id}`}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border-color bg-bg-secondary px-4 text-sm font-medium text-text-primary transition-colors hover:border-secondary/50"
        >
          {status === 'upcoming' ? 'Ver el temario' : 'Ver el material'}
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

function Fact({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[30px] items-center gap-[7px] rounded-[7px] border border-border-color bg-bg-secondary px-[11px] text-[12.5px] text-text-primary">
      <span className="text-secondary">{icon}</span>
      {children}
    </span>
  );
}

function summaryLine(active: number, upcoming: number, finished: number): string {
  const parts: string[] = [];
  if (active > 0) parts.push(`${active} ${active === 1 ? 'curso en marcha' : 'cursos en marcha'}`);
  if (upcoming > 0) parts.push(`${upcoming} por empezar`);
  if (finished > 0) parts.push(`${finished} ${finished === 1 ? 'terminado' : 'terminados'}`);
  if (parts.length === 0) return 'Aquí verás los cursos en los que estés matriculado.';
  return `${parts.join(', ')}.`;
}
