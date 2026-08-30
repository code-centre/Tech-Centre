'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  GraduationCap,
  Loader2,
  MapPin,
  Receipt,
  User as UserIcon,
} from 'lucide-react';
import type { Session } from '@/types/supabase';
import { daysUntil, findNextSession, sessionDayLong, sessionHour, type CohortLite } from '@/lib/cohorts';
import { completionSummary } from '@/lib/profileCompletion';
import { daysBetween, formatMoney } from '@/lib/students';

interface NextClass {
  session: Session;
  cohort: CohortLite;
}

interface OverdueInvoice {
  label: string;
  amount: number;
  dueDate: string;
  program: string;
}

function tint(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * La primera pantalla del perfil: lo que sigue, no un formulario.
 *
 * Antes /perfil caía en «datos personales», que es lo último que alguien viene
 * a mirar. Aquí arriba va lo que hay que hacer hoy — la próxima clase y lo que
 * se debe — y debajo los accesos, que ya traen su estado.
 */
export default function ProfileSummary() {
  const supabase = useSupabaseClient();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [nextClass, setNextClass] = useState<NextClass | null>(null);
  const [overdue, setOverdue] = useState<OverdueInvoice | null>(null);
  const [overdueCount, setOverdueCount] = useState(0);
  const [courseSummary, setCourseSummary] = useState('');
  const [pendingRolls, setPendingRolls] = useState(0);

  const now = useMemo(() => new Date(), []);
  const isStaff = ['admin', 'instructor'].includes(user?.role ?? '');

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const [enrollmentsRes, linksRes] = await Promise.all([
        supabase
          .from('enrollments')
          .select(
            'id, cohort_id, cohort:cohorts!cohort_id(id, name, slug, start_date, end_date, modality, program:programs!program_id(id, name))'
          )
          .eq('student_id', user.id),
        isStaff
          ? supabase
              .from('cohort_instructors')
              .select(
                'cohort_id, cohort:cohorts!cohort_id(id, name, slug, start_date, end_date, modality, program:programs!program_id(id, name))'
              )
              .eq('instructor_id', user.id)
          : Promise.resolve({ data: [] }),
      ]);

      const toCohort = (raw: Record<string, unknown> | null): CohortLite | null => {
        if (!raw) return null;
        return {
          ...(raw as unknown as CohortLite),
          program: one(raw.program as never) as CohortLite['program'],
        };
      };

      const myCohorts: CohortLite[] = [];
      const enrollmentIds: number[] = [];
      for (const row of (enrollmentsRes.data ?? []) as Record<string, unknown>[]) {
        const cohort = toCohort(one(row.cohort as never) as Record<string, unknown> | null);
        if (cohort) myCohorts.push(cohort);
        enrollmentIds.push(row.id as number);
      }

      const taughtCohorts: CohortLite[] = [];
      for (const row of (linksRes.data ?? []) as Record<string, unknown>[]) {
        const cohort = toCohort(one(row.cohort as never) as Record<string, unknown> | null);
        if (cohort) taughtCohorts.push(cohort);
      }

      const allCohorts = [...myCohorts, ...taughtCohorts];
      const cohortIds = Array.from(new Set(allCohorts.map((cohort) => cohort.id)));

      // La próxima clase manda, dicte o estudie.
      if (cohortIds.length > 0) {
        const { data: sessionsData } = await supabase
          .from('sessions')
          .select('*')
          .in('cohort_id', cohortIds)
          .order('starts_at');

        const sessions = (sessionsData ?? []) as Session[];
        const upcoming = findNextSession(sessions, now);
        if (upcoming) {
          const cohort = allCohorts.find((c) => Number(c.id) === Number(upcoming.cohort_id));
          if (cohort) setNextClass({ session: upcoming, cohort });
        }

        const done = sessions.filter(
          (session) => new Date(session.ends_at || session.starts_at).getTime() < now.getTime()
        );
        setCourseSummary(
          myCohorts.length > 0
            ? `${myCohorts.length} ${myCohorts.length === 1 ? 'curso' : 'cursos'} · ${done.filter((s) => myCohorts.some((c) => Number(c.id) === Number(s.cohort_id))).length} clases vistas`
            : 'Todavía sin cursos'
        );

        if (isStaff && taughtCohorts.length > 0) {
          const taughtIds = new Set(taughtCohorts.map((c) => Number(c.id)));
          const doneTaught = done.filter((session) => taughtIds.has(Number(session.cohort_id)));
          if (doneTaught.length > 0) {
            const { data: attendance } = await supabase
              .from('attendance')
              .select('session_id')
              .in('session_id', doneTaught.map((session) => session.id));
            const marked = new Set(
              ((attendance ?? []) as { session_id: number }[]).map((row) => row.session_id)
            );
            setPendingRolls(doneTaught.filter((session) => !marked.has(session.id)).length);
          }
        }
      }

      // Lo que debe, si debe algo.
      if (enrollmentIds.length > 0) {
        const today = now.toISOString().slice(0, 10);
        const { data: invoices } = await supabase
          .from('invoices')
          .select('label, amount, due_date, enrollment_id')
          .in('enrollment_id', enrollmentIds)
          .neq('status', 'paid')
          .lt('due_date', today)
          .order('due_date');

        const rows = (invoices ?? []) as {
          label: string;
          amount: number;
          due_date: string;
          enrollment_id: number;
        }[];
        setOverdueCount(rows.length);
        if (rows[0]) {
          setOverdue({
            label: rows[0].label,
            amount: rows[0].amount,
            dueDate: rows[0].due_date,
            program: myCohorts[0]?.program?.name ?? '',
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar el resumen:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, user?.id, isStaff, now]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  const completion = completionSummary(user ?? {});
  const daysToClass = nextClass ? daysUntil(nextClass.session.starts_at.slice(0, 10), now) : null;
  const overdueDays = overdue ? daysBetween(overdue.dueDate, now) ?? 0 : 0;
  const teachesNext =
    nextClass && isStaff
      ? !nextClass.cohort.slug
        ? false
        : true
      : false;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-[27px] font-bold tracking-tight text-text-primary">
          Hola{user?.first_name ? `, ${user.first_name}` : ''}
        </h1>
        <p className="text-sm text-text-muted">Esto es lo que sigue.</p>
      </header>

      {nextClass ? (
        <section
          className="flex flex-wrap items-center justify-between gap-6 rounded-xl border p-[20px_22px]"
          style={{ borderColor: tint('var(--secondary)', 30), background: tint('var(--secondary)', 5) }}
        >
          <div className="flex min-w-0 flex-col gap-2.5">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-secondary">
              Tu próxima clase
              {daysToClass != null &&
                (daysToClass === 0 ? ' · hoy' : daysToClass === 1 ? ' · mañana' : ` · en ${daysToClass} días`)}
            </span>
            <span className="text-[21px] font-bold tracking-tight text-text-primary">
              {nextClass.session.title || 'Clase sin título'}
            </span>
            <div className="flex flex-wrap gap-3.5 text-[13px] text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-[15px] w-[15px]" />
                {nextClass.cohort.program?.name ?? 'Curso'} · {nextClass.cohort.name}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-[15px] w-[15px]" />
                {sessionDayLong(nextClass.session.starts_at)}, {sessionHour(nextClass.session.starts_at)}
              </span>
              {nextClass.session.room && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-[15px] w-[15px]" />
                  {nextClass.session.room}
                </span>
              )}
            </div>
          </div>
          <Link
            href={
              teachesNext && nextClass.cohort.slug
                ? `/perfil/instructor/${nextClass.cohort.slug}`
                : `/perfil/cursos/${nextClass.cohort.id}`
            }
            className="inline-flex h-[42px] shrink-0 items-center rounded-lg bg-secondary px-[18px] text-sm font-semibold text-[#0E1116] transition-colors hover:bg-secondary/90"
          >
            {teachesNext ? 'Abrir la cohorte' : 'Entrar al curso'}
          </Link>
        </section>
      ) : (
        <section className="rounded-xl border border-border-color bg-[var(--card-background)] px-6 py-8 text-center">
          <p className="text-[13.5px] text-text-muted">
            No tienes clases programadas por ahora.
          </p>
        </section>
      )}

      {overdue && (
        <section
          className="flex flex-wrap items-center justify-between gap-6 rounded-xl border p-[18px_22px]"
          style={{ borderColor: tint('var(--pay-critico)', 35), background: tint('var(--pay-critico)', 6) }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <AlertTriangle className="h-[15px] w-[15px] shrink-0" style={{ color: 'var(--pay-critico)' }} />
            <div className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold text-text-primary">
                {overdueCount === 1
                  ? `Tienes una cuota vencida hace ${overdueDays} días`
                  : `Tienes ${overdueCount} cuotas vencidas`}
              </span>
              <span className="text-[13px] text-text-muted">
                {overdue.label}
                {overdue.program ? ` de ${overdue.program}` : ''} · {formatMoney(overdue.amount)}
              </span>
            </div>
          </div>
          <Link
            href="/perfil/facturas"
            className="inline-flex h-[38px] shrink-0 items-center rounded-lg bg-secondary px-[18px] text-sm font-semibold text-[#0E1116] transition-colors hover:bg-secondary/90"
          >
            Pagar ahora
          </Link>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isStaff && (
          <Shortcut
            href="/perfil/instructor"
            icon={<GraduationCap size={20} />}
            title="Mis cohortes"
            state={
              pendingRolls > 0
                ? `${pendingRolls} ${pendingRolls === 1 ? 'asistencia sin pasar' : 'asistencias sin pasar'}`
                : 'Todo al día'
            }
            tone={pendingRolls > 0 ? 'var(--pay-aviso)' : undefined}
          />
        )}
        <Shortcut
          href="/perfil/cursos"
          icon={<BookOpen size={20} />}
          title="Mis cursos"
          state={courseSummary || 'Todavía sin cursos'}
        />
        <Shortcut
          href="/perfil/facturas"
          icon={<Receipt size={20} />}
          title="Mis pagos"
          state={
            overdueCount > 0
              ? `${overdueCount} ${overdueCount === 1 ? 'cuota vencida' : 'cuotas vencidas'}`
              : 'Sin nada vencido'
          }
          tone={overdueCount > 0 ? 'var(--pay-critico)' : undefined}
        />
        <Shortcut
          href="/perfil/datos-personales"
          icon={<UserIcon size={20} />}
          title="Mis datos"
          state={
            completion.missing > 0
              ? `Te ${completion.missing === 1 ? 'falta 1 cosa' : `faltan ${completion.missing} cosas`}`
              : 'Perfil completo'
          }
          tone={completion.missing > 0 ? 'var(--pay-aviso)' : undefined}
        />
      </div>
    </div>
  );
}

function Shortcut({
  href,
  icon,
  title,
  state,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  state: string;
  tone?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 rounded-xl border border-border-color bg-[var(--card-background)] p-[16px_18px] transition-colors hover:border-secondary/40"
    >
      <span className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-secondary/10 text-secondary">
        {icon}
      </span>
      <span className="flex min-w-0 grow flex-col gap-0.5">
        <span className="text-[14.5px] font-semibold text-text-primary">{title}</span>
        <span className="truncate text-[12.5px]" style={{ color: tone ?? 'var(--text-muted)' }}>
          {state}
        </span>
      </span>
      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-text-muted" />
    </Link>
  );
}
