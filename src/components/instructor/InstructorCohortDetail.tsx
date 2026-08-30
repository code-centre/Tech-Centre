'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Github,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Users,
  Video,
  X,
} from 'lucide-react';
import type {
  AttendanceStatus,
  Grade,
  ProgramModule,
  Session,
  SessionMaterial,
} from '@/types/supabase';
import InstructorGrades from './InstructorGrades';
import {
  ATTENDANCE_LABEL,
  AT_RISK_PERCENT,
  averageGrade,
  cohortStatus,
  COHORT_STATUS_LABEL,
  countsAsPresent,
  daysUntil,
  findNextSession,
  formatGrade,
  groupSessionsByModule,
  isSessionDone,
  materialsOf,
  placeLine,
  scheduleLine,
  sessionDay,
  sessionDayLong,
  sessionHour,
  sessionHourRange,
  type CohortLite,
} from '@/lib/cohorts';

interface Props {
  cohortSlug: string;
}

interface StudentRow {
  enrollmentId: number;
  studentId: string;
  name: string;
  email: string;
}

interface AttendanceRow {
  session_id: number;
  enrollment_id: number;
  status: AttendanceStatus;
}

type Tab = 'clases' | 'estudiantes' | 'notas';

const STATUS_COLOR = {
  upcoming: 'var(--pay-aviso)',
  active: 'var(--pay-serie-cobrado)',
  finished: 'var(--pay-serie-porcobrar)',
} as const;

const ROLL_OPTIONS: { value: AttendanceStatus; short: string; color: string }[] = [
  { value: 'present', short: 'Presente', color: 'var(--pay-serie-cobrado)' },
  { value: 'late', short: 'Tarde', color: 'var(--pay-aviso)' },
  { value: 'absent', short: 'Ausente', color: 'var(--pay-critico)' },
  { value: 'excused', short: 'Justif.', color: 'var(--pay-serie-porcobrar)' },
];

const MATERIAL_ICON: Record<SessionMaterial['type'], typeof Github> = {
  github: Github,
  youtube: Video,
  file: FileText,
  link: LinkIcon,
};

const MATERIAL_TYPES: { value: SessionMaterial['type']; label: string }[] = [
  { value: 'github', label: 'Repositorio' },
  { value: 'youtube', label: 'Video' },
  { value: 'file', label: 'Archivo' },
  { value: 'link', label: 'Enlace' },
];

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

export default function InstructorCohortDetail({ cohortSlug }: Props) {
  const supabase = useSupabaseClient();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const [cohort, setCohort] = useState<CohortLite | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [tab, setTab] = useState<Tab>('clases');
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [touchedModules, setTouchedModules] = useState(false);
  const [rollSessionId, setRollSessionId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<number, AttendanceStatus>>({});
  const [savingRoll, setSavingRoll] = useState(false);
  const [materialSessionId, setMaterialSessionId] = useState<number | null>(null);

  const now = useMemo(() => new Date(), []);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');

    try {
      const { data: cohortData, error: cohortError } = await supabase
        .from('cohorts')
        .select(
          'id, name, slug, program_id, start_date, end_date, modality, campus, capacity, schedule, program:programs!program_id(id, name, total_hours)'
        )
        .eq('slug', cohortSlug)
        .single();

      if (cohortError || !cohortData) {
        setNotFound(true);
        return;
      }

      const raw = cohortData as Record<string, unknown>;
      const cohortLite: CohortLite = {
        ...(raw as unknown as CohortLite),
        program: one(raw.program as never) as CohortLite['program'],
      };
      setCohort(cohortLite);

      const [sessionsRes, enrollmentsRes, modulesRes] = await Promise.all([
        supabase.from('sessions').select('*').eq('cohort_id', cohortLite.id).order('starts_at'),
        supabase
          .from('enrollments')
          .select('id, student_id, profile:profiles!student_id(first_name, last_name, email)')
          .eq('cohort_id', cohortLite.id),
        raw.program_id
          ? supabase
              .from('program_modules')
              .select('*')
              .eq('program_id', raw.program_id as number)
              .order('order_index')
          : Promise.resolve({ data: [] }),
      ]);

      setSessions((sessionsRes.data ?? []) as Session[]);
      setModules((modulesRes.data ?? []) as ProgramModule[]);

      const rows = ((enrollmentsRes.data ?? []) as Record<string, unknown>[]).map((row) => {
        const profile = one(row.profile as never) as
          | { first_name?: string; last_name?: string; email?: string }
          | null;
        return {
          enrollmentId: row.id as number,
          studentId: row.student_id as string,
          name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Sin nombre',
          email: profile?.email ?? '',
        };
      });
      rows.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(rows);

      const enrollmentIds = rows.map((row) => row.enrollmentId);
      const [attendanceRes, gradesRes] = await Promise.all([
        enrollmentIds.length > 0
          ? supabase
              .from('attendance')
              .select('session_id, enrollment_id, status')
              .in('enrollment_id', enrollmentIds)
          : Promise.resolve({ data: [] }),
        enrollmentIds.length > 0
          ? supabase.from('grades').select('*').in('enrollment_id', enrollmentIds)
          : Promise.resolve({ data: [] }),
      ]);

      setAttendance((attendanceRes.data ?? []) as AttendanceRow[]);
      setGrades((gradesRes.data ?? []) as Grade[]);
    } catch (err) {
      console.error('Error al cargar la cohorte:', err);
      setError('No pudimos cargar la cohorte. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [supabase, cohortSlug, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const groups = useMemo(
    () => groupSessionsByModule(sessions, modules, now),
    [sessions, modules, now]
  );
  const nextSession = useMemo(() => findNextSession(sessions, now), [sessions, now]);

  useEffect(() => {
    if (touchedModules || groups.length === 0) return;
    const current =
      groups.find((group) => group.sessions.some((s) => s.id === nextSession?.id)) ??
      groups[groups.length - 1];
    setOpenModules(new Set([current.key]));
  }, [groups, nextSession, touchedModules]);

  /** Cuántos marcados hay por clase, para saber si ya se pasó asistencia. */
  const markedBySession = useMemo(() => {
    const map = new Map<number, AttendanceRow[]>();
    for (const row of attendance) {
      const list = map.get(row.session_id) ?? [];
      list.push(row);
      map.set(row.session_id, list);
    }
    return map;
  }, [attendance]);

  const doneSessions = sessions.filter((session) => isSessionDone(session, now));
  const pendingRolls = doneSessions.filter((session) => (markedBySession.get(session.id)?.length ?? 0) === 0);

  const groupAttendance = useMemo(() => {
    const marked = attendance.filter((row) => doneSessions.some((s) => s.id === row.session_id));
    if (marked.length === 0) return null;
    const present = marked.filter((row) => countsAsPresent(row.status)).length;
    return Math.round((present / marked.length) * 100);
  }, [attendance, doneSessions]);

  const perStudent = useMemo(
    () =>
      students.map((student) => {
        const mine = attendance.filter(
          (row) => row.enrollment_id === student.enrollmentId && doneSessions.some((s) => s.id === row.session_id)
        );
        const present = mine.filter((row) => countsAsPresent(row.status)).length;
        const percent = mine.length > 0 ? Math.round((present / mine.length) * 100) : null;
        const mineGrades = grades.filter((row) => row.enrollment_id === student.enrollmentId);
        return {
          ...student,
          present,
          tracked: mine.length,
          percent,
          average: averageGrade(mineGrades.map((row) => row.value)),
          gradedModules: mineGrades.length,
        };
      }),
    [students, attendance, doneSessions, grades]
  );

  const atRisk = perStudent.filter((row) => row.percent != null && row.percent < AT_RISK_PERCENT);
  const pendingGrades = students.length * modules.length - grades.length;

  const openRoll = (sessionId: number) => {
    if (rollSessionId === sessionId) {
      setRollSessionId(null);
      return;
    }
    const existing = markedBySession.get(sessionId) ?? [];
    const next: Record<number, AttendanceStatus> = {};
    for (const row of existing) next[row.enrollment_id] = row.status;
    setDraft(next);
    setRollSessionId(sessionId);
    setMaterialSessionId(null);
  };

  const saveRoll = async () => {
    if (rollSessionId == null) return;
    setSavingRoll(true);
    setError('');

    try {
      const rows = Object.entries(draft).map(([enrollmentId, status]) => ({
        session_id: rollSessionId,
        enrollment_id: Number(enrollmentId),
        status,
        marked_at: new Date().toISOString(),
      }));

      // Se reemplaza el pase de lista completo de esa clase: es más simple de
      // razonar que actualizar fila por fila, y siempre queda consistente.
      const existing = markedBySession.get(rollSessionId) ?? [];
      if (existing.length > 0) {
        await supabase.from('attendance').delete().eq('session_id', rollSessionId);
      }
      if (rows.length > 0) {
        const { error: insertError } = await supabase.from('attendance').insert(rows as never);
        if (insertError) throw insertError;
      }

      setAttendance((prev) => [
        ...prev.filter((row) => row.session_id !== rollSessionId),
        ...rows.map((row) => ({
          session_id: row.session_id,
          enrollment_id: row.enrollment_id,
          status: row.status,
        })),
      ]);
      setRollSessionId(null);
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'No se pudo guardar la asistencia');
    } finally {
      setSavingRoll(false);
    }
  };

  const addMaterial = async (sessionId: number, material: SessionMaterial) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const next = [...materialsOf(session), material];
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ materials: next } as never)
      .eq('id', sessionId);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, materials: next } : s)));
    setMaterialSessionId(null);
  };

  const removeMaterial = async (sessionId: number, index: number) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const next = materialsOf(session).filter((_, i) => i !== index);
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ materials: next } as never)
      .eq('id', sessionId);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, materials: next } : s)));
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (notFound || !cohort) {
    return (
      <div className="py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">Cohorte no encontrada</h1>
        <Link href="/perfil/instructor" className="btn-primary mt-4 inline-flex items-center gap-2">
          Volver a mis cohortes
        </Link>
      </div>
    );
  }

  const status = cohortStatus(cohort, now);
  const schedule = scheduleLine(cohort.schedule);
  const place = placeLine(cohort.modality, nextSession?.room ?? cohort.campus);
  const daysToNext = nextSession ? daysUntil(nextSession.starts_at.slice(0, 10), now) : null;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/perfil/instructor"
        className="inline-flex w-fit items-center gap-2 text-[13.5px] text-text-muted transition-colors hover:text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis cohortes
      </Link>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
      )}

      <header className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[27px] font-bold tracking-tight text-text-primary">
            {cohort.program?.name ?? 'Cohorte'}
          </h1>
          <span className="text-[15px] text-text-muted">{cohort.name}</span>
          <Pill color={STATUS_COLOR[status]}>{COHORT_STATUS_LABEL[status]}</Pill>
        </div>
        <div className="flex flex-wrap gap-2">
          {(cohort.start_date || cohort.end_date) && (
            <Fact icon={<Calendar className="h-[15px] w-[15px]" />}>
              {[cohort.start_date, cohort.end_date].filter(Boolean).map(shortDate).join(' – ')}
            </Fact>
          )}
          {schedule && <Fact icon={<Clock className="h-[15px] w-[15px]" />}>{schedule}</Fact>}
          {place && <Fact icon={<MapPin className="h-[15px] w-[15px]" />}>{place}</Fact>}
          <Fact icon={<Users className="h-[15px] w-[15px]" />}>
            {students.length} {students.length === 1 ? 'estudiante' : 'estudiantes'}
          </Fact>
        </div>
      </header>

      {nextSession && (
        <section
          className="flex flex-wrap items-center justify-between gap-6 rounded-xl border p-[20px_22px]"
          style={{ borderColor: tint('var(--secondary)', 30), background: tint('var(--secondary)', 5) }}
        >
          <div className="flex min-w-0 flex-col gap-2.5">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-secondary">
              Tu próxima clase
              {daysToNext != null &&
                (daysToNext === 0 ? ' · hoy' : daysToNext === 1 ? ' · mañana' : ` · en ${daysToNext} días`)}
            </span>
            <span className="text-[21px] font-bold tracking-tight text-text-primary">
              {nextSession.title || 'Clase sin título'}
            </span>
            <div className="flex flex-wrap gap-3.5 text-[13px] text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-[15px] w-[15px]" />
                {sessionDayLong(nextSession.starts_at)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-[15px] w-[15px]" />
                {sessionHourRange(nextSession.starts_at, nextSession.ends_at)}
              </span>
              {nextSession.room && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-[15px] w-[15px]" />
                  {nextSession.room}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setTab('clases');
                setMaterialSessionId(nextSession.id);
                setRollSessionId(null);
              }}
              className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-border-color bg-bg-secondary px-4 text-sm font-medium text-text-primary transition-colors hover:border-secondary/50"
            >
              Subir material
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('clases');
                openRoll(nextSession.id);
              }}
              className="inline-flex h-[38px] items-center gap-2 rounded-lg bg-secondary px-[18px] text-sm font-semibold text-[#0E1116] transition-colors hover:bg-secondary/90"
            >
              Pasar asistencia
            </button>
          </div>
        </section>
      )}

      {/* Cómo va el grupo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Asistencia del grupo">
          <span className="text-2xl font-bold text-text-primary">
            {groupAttendance == null ? '—' : `${groupAttendance}%`}
          </span>
          <span className="text-[12.5px] text-text-muted">
            {doneSessions.length > 0
              ? `Promedio de ${doneSessions.length} ${doneSessions.length === 1 ? 'clase' : 'clases'}`
              : 'Todavía no hay clases dictadas'}
          </span>
        </StatCard>
        <StatCard label="Clases dictadas">
          <span className="text-2xl font-bold text-text-primary">
            {doneSessions.length}{' '}
            <span className="text-[15px] font-normal text-text-muted">de {sessions.length}</span>
          </span>
          <span className="block h-1.5 overflow-hidden rounded-[3px] bg-border-color">
            <span
              className="block h-full rounded-[3px] bg-secondary"
              style={{ width: `${sessions.length ? (doneSessions.length / sessions.length) * 100 : 0}%` }}
            />
          </span>
        </StatCard>
        <StatCard label="Asistencia sin pasar" alert={pendingRolls.length > 0} alertColor="var(--pay-aviso)">
          <span
            className="text-2xl font-bold"
            style={{ color: pendingRolls.length > 0 ? 'var(--pay-aviso)' : 'var(--text-primary)' }}
          >
            {pendingRolls.length}
          </span>
          <span className="text-[12.5px] text-text-muted">
            {pendingRolls.length > 0
              ? `Clases del ${pendingRolls.slice(0, 2).map((s) => sessionDay(s.starts_at)).join(' y ')}`
              : 'Todas las clases al día'}
          </span>
        </StatCard>
        <StatCard label="Estudiantes en riesgo" alert={atRisk.length > 0} alertColor="var(--pay-critico)">
          <span
            className="text-2xl font-bold"
            style={{ color: atRisk.length > 0 ? 'var(--pay-critico)' : 'var(--text-primary)' }}
          >
            {atRisk.length}
          </span>
          <span className="text-[12.5px] text-text-muted">
            Menos del {AT_RISK_PERCENT}% de asistencia
          </span>
        </StatCard>
      </div>

      <div className="flex w-fit items-center gap-1 rounded-[10px] border border-border-color bg-[var(--card-background)] p-1">
        <TabButton active={tab === 'clases'} onClick={() => setTab('clases')}>
          Clases
        </TabButton>
        <TabButton active={tab === 'estudiantes'} onClick={() => setTab('estudiantes')}>
          Estudiantes
        </TabButton>
        <TabButton active={tab === 'notas'} onClick={() => setTab('notas')}>
          Notas por módulo
        </TabButton>
      </div>

      {tab === 'clases' && (
        <div className="flex flex-col gap-3">
          {groups.length === 0 ? (
            <EmptyCard>Todavía no hay clases programadas en esta cohorte.</EmptyCard>
          ) : (
            groups.map((group, index) => {
              const open = openModules.has(group.key);
              return (
                <section
                  key={group.key}
                  className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTouchedModules(true);
                      setOpenModules((prev) => {
                        const next = new Set(prev);
                        if (next.has(group.key)) next.delete(group.key);
                        else next.add(group.key);
                        return next;
                      });
                    }}
                    aria-expanded={open}
                    className={`flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-bg-secondary/40 ${
                      open ? 'border-b border-border-color' : ''
                    }`}
                  >
                    {open ? (
                      <ChevronDown className="h-[18px] w-[18px] shrink-0 text-text-muted" />
                    ) : (
                      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-text-muted" />
                    )}
                    <span className="flex flex-col gap-0.5">
                      <span className="text-base font-semibold text-text-primary">
                        {group.moduleId ? `Módulo ${index + 1} · ${group.name}` : group.name}
                      </span>
                      <span className="text-[12.5px] text-text-muted">
                        {group.hours ? `${group.hours} horas · ` : ''}
                        {group.sessions.length} {group.sessions.length === 1 ? 'clase' : 'clases'} ·{' '}
                        {group.doneCount} dictadas
                      </span>
                    </span>
                  </button>

                  {open &&
                    group.sessions.map((session) => {
                      const done = isSessionDone(session, now);
                      const marked = markedBySession.get(session.id) ?? [];
                      const present = marked.filter((row) => countsAsPresent(row.status)).length;
                      const materials = materialsOf(session);
                      const rollOpen = rollSessionId === session.id;
                      const materialOpen = materialSessionId === session.id;

                      return (
                        <div
                          key={session.id}
                          style={
                            done && marked.length === 0
                              ? { background: tint('var(--pay-aviso)', 4) }
                              : undefined
                          }
                          className="border-b border-border-color/50 last:border-b-0"
                        >
                          <div className="grid grid-cols-[9px_84px_minmax(0,1fr)_112px_132px_148px] items-center gap-3.5 px-5 py-3">
                            <span
                              className="h-[9px] w-[9px] rounded-full"
                              style={
                                done
                                  ? { background: 'var(--pay-serie-cobrado)' }
                                  : session.id === nextSession?.id
                                    ? {
                                        background: 'var(--secondary)',
                                        boxShadow: '0 0 0 4px color-mix(in srgb, var(--secondary) 18%, transparent)',
                                      }
                                    : { border: '2px solid var(--border-color)', boxSizing: 'border-box' }
                              }
                              aria-hidden
                            />
                            <span className="text-[13px] font-semibold text-text-primary">
                              {sessionDay(session.starts_at)}
                            </span>
                            <span className="truncate text-sm text-text-primary">
                              {session.title || 'Clase sin título'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setMaterialSessionId(materialOpen ? null : session.id);
                                setRollSessionId(null);
                              }}
                              className="text-left text-[12.5px] transition-colors hover:text-secondary"
                              style={{ color: materials.length ? 'var(--text-muted)' : 'var(--pay-aviso)' }}
                            >
                              {materials.length
                                ? `${materials.length} ${materials.length === 1 ? 'material' : 'materiales'}`
                                : 'Sin material'}
                            </button>
                            {done && marked.length > 0 ? (
                              <span className="flex flex-col gap-1">
                                <span className="text-[12.5px] text-text-primary">
                                  {present} de {marked.length}
                                </span>
                                <span className="block h-[5px] overflow-hidden rounded-[2px] bg-border-color">
                                  <span
                                    className="block h-full rounded-[2px]"
                                    style={{
                                      width: `${marked.length ? (present / marked.length) * 100 : 0}%`,
                                      background: 'var(--pay-serie-cobrado)',
                                    }}
                                  />
                                </span>
                              </span>
                            ) : done ? (
                              <Pill color="var(--pay-aviso)">Sin pasar</Pill>
                            ) : (
                              <span className="text-[12.5px] text-text-muted/60">—</span>
                            )}
                            <span className="flex justify-end">
                              {done ? (
                                <button
                                  type="button"
                                  onClick={() => openRoll(session.id)}
                                  className={`inline-flex h-8 items-center rounded-lg px-3 text-[12.5px] font-medium transition-colors ${
                                    marked.length === 0
                                      ? 'bg-secondary font-semibold text-[#0E1116] hover:bg-secondary/90'
                                      : 'border border-border-color bg-bg-secondary text-text-primary hover:border-secondary/50'
                                  }`}
                                >
                                  {marked.length === 0 ? 'Pasar asistencia' : 'Ver asistencia'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMaterialSessionId(materialOpen ? null : session.id);
                                    setRollSessionId(null);
                                  }}
                                  className="inline-flex h-8 items-center rounded-lg border border-border-color bg-bg-secondary px-3 text-[12.5px] font-medium text-text-primary transition-colors hover:border-secondary/50"
                                >
                                  Preparar clase
                                </button>
                              )}
                            </span>
                          </div>

                          {materialOpen && (
                            <MaterialPanel
                              materials={materials}
                              onAdd={(material) => addMaterial(session.id, material)}
                              onRemove={(index) => removeMaterial(session.id, index)}
                              onClose={() => setMaterialSessionId(null)}
                            />
                          )}

                          {rollOpen && (
                            <div className="mb-[18px] ml-[62px] mr-5 rounded-[10px] border border-border-color bg-bg-secondary p-[16px_18px]">
                              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-4">
                                <span className="text-[13.5px] font-semibold text-text-primary">
                                  Pasando asistencia · {students.length}{' '}
                                  {students.length === 1 ? 'estudiante' : 'estudiantes'}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDraft(
                                        Object.fromEntries(
                                          students.map((s) => [s.enrollmentId, 'present' as AttendanceStatus])
                                        )
                                      )
                                    }
                                    className="inline-flex h-[30px] items-center rounded-lg border border-border-color bg-[var(--card-background)] px-[11px] text-[12.5px] font-medium text-text-primary transition-colors hover:border-secondary/50"
                                  >
                                    Marcar todos presentes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={saveRoll}
                                    disabled={savingRoll}
                                    className="inline-flex h-[30px] items-center gap-1.5 rounded-lg bg-secondary px-[13px] text-[12.5px] font-bold text-[#0E1116] disabled:opacity-50"
                                  >
                                    {savingRoll && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    Guardar
                                  </button>
                                </div>
                              </div>

                              {students.length === 0 ? (
                                <p className="py-3 text-[13px] text-text-muted">
                                  No hay estudiantes matriculados todavía.
                                </p>
                              ) : (
                                students.map((student) => (
                                  <div
                                    key={student.enrollmentId}
                                    className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border-color/50 py-2.5 last:border-b-0"
                                  >
                                    <span
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-[#0E1116]"
                                      style={{
                                        background:
                                          ROLL_OPTIONS.find((o) => o.value === draft[student.enrollmentId])
                                            ?.color ?? 'var(--pay-neutro)',
                                      }}
                                      aria-hidden
                                    >
                                      {initials(student.name)}
                                    </span>
                                    <span className="truncate text-[13.5px] text-text-primary">
                                      {student.name}
                                    </span>
                                    <div className="flex gap-0.5 rounded-[9px] border border-border-color bg-[var(--card-background)] p-[3px]">
                                      {ROLL_OPTIONS.map((option) => {
                                        const active = draft[student.enrollmentId] === option.value;
                                        return (
                                          <button
                                            key={option.value}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() =>
                                              setDraft((prev) => ({
                                                ...prev,
                                                [student.enrollmentId]: option.value,
                                              }))
                                            }
                                            title={ATTENDANCE_LABEL[option.value]}
                                            className="inline-flex h-[30px] items-center justify-center rounded-[7px] px-3 text-[12.5px] transition-colors"
                                            style={
                                              active
                                                ? { background: option.color, color: '#0E1116', fontWeight: 700 }
                                                : { color: 'var(--text-muted)', fontWeight: 500 }
                                            }
                                          >
                                            {option.short}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </section>
              );
            })
          )}
        </div>
      )}

      {tab === 'estudiantes' && (
        <section className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
          <div className="grid grid-cols-[36px_minmax(0,1fr)_180px_150px] items-center gap-3.5 border-b border-border-color bg-bg-secondary px-5 py-3">
            <span />
            <HeadCell>Estudiante</HeadCell>
            <HeadCell>Asistencia</HeadCell>
            <HeadCell>Notas</HeadCell>
          </div>
          {perStudent.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13.5px] text-text-muted">
              Todavía no hay estudiantes matriculados.
            </p>
          ) : (
            perStudent.map((student) => {
              const risky = student.percent != null && student.percent < AT_RISK_PERCENT;
              const color = risky
                ? 'var(--pay-critico)'
                : student.percent != null && student.percent < 85
                  ? 'var(--pay-aviso)'
                  : 'var(--pay-serie-cobrado)';
              return (
                <div
                  key={student.enrollmentId}
                  className="grid grid-cols-[36px_minmax(0,1fr)_180px_150px] items-center gap-3.5 border-b border-border-color/50 px-5 py-3 last:border-b-0"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary/12 text-[13px] font-semibold text-secondary">
                    {initials(student.name)}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="flex items-center gap-2 text-[14.5px] font-semibold text-text-primary">
                      {student.name}
                      {risky && <Pill color="var(--pay-critico)">En riesgo</Pill>}
                    </span>
                    <span className="truncate text-[12.5px] text-text-muted">{student.email}</span>
                  </span>
                  <span className="flex flex-col gap-1.5">
                    {student.percent == null ? (
                      <span className="text-[12.5px] text-text-muted">Sin registro</span>
                    ) : (
                      <>
                        <span className="text-[12.5px]" style={{ color }}>
                          {student.percent}% · {student.present} de {student.tracked}
                        </span>
                        <span className="block h-[5px] overflow-hidden rounded-[2px] bg-border-color">
                          <span
                            className="block h-full rounded-[2px]"
                            style={{ width: `${student.percent}%`, background: color }}
                          />
                        </span>
                      </>
                    )}
                  </span>
                  <span className="flex flex-col gap-px">
                    <span className="text-sm font-semibold text-text-primary">
                      {formatGrade(student.average)}
                    </span>
                    <span className="text-xs text-text-muted">
                      {student.gradedModules} de {modules.length} módulos
                    </span>
                  </span>
                </div>
              );
            })
          )}
        </section>
      )}

      {tab === 'notas' && (
        <div className="flex flex-col gap-3">
          {pendingGrades > 0 && modules.length > 0 && (
            <p className="rounded-xl border border-border-color bg-bg-secondary px-4 py-3 text-[13px] text-text-muted">
              Faltan {pendingGrades} {pendingGrades === 1 ? 'nota' : 'notas'} por poner en esta cohorte.
            </p>
          )}
          <InstructorGrades
            enrollments={students.map((student) => ({
              id: student.enrollmentId,
              student_id: student.studentId,
              profile: { first_name: student.name, last_name: '', email: student.email },
            }))}
            modules={modules}
            grades={grades}
            onDataChange={fetchData}
          />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function MaterialPanel({
  materials,
  onAdd,
  onRemove,
  onClose,
}: {
  materials: SessionMaterial[];
  onAdd: (material: SessionMaterial) => void;
  onRemove: (index: number) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<SessionMaterial['type']>('link');

  const submit = () => {
    if (!title.trim() || !url.trim()) return;
    onAdd({ title: title.trim(), url: url.trim(), type });
    setTitle('');
    setUrl('');
  };

  return (
    <div className="mb-[18px] ml-[62px] mr-5 flex flex-col gap-3 rounded-[10px] border border-border-color bg-bg-secondary p-[16px_18px]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[13.5px] font-semibold text-text-primary">Material de la clase</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {materials.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {materials.map((material, index) => {
            const Icon = MATERIAL_ICON[material.type] ?? LinkIcon;
            return (
              <li
                key={index}
                className="flex items-center gap-2.5 rounded-lg border border-border-color bg-[var(--card-background)] px-3 py-2"
              >
                <Icon className="h-4 w-4 shrink-0 text-secondary" />
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grow truncate text-[13px] text-text-primary hover:text-secondary"
                >
                  {material.title}
                </a>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  aria-label={`Quitar ${material.title}`}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:text-[color:var(--pay-critico)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_120px_auto]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Cómo se llama"
          className="h-9 rounded-lg border border-border-color bg-[var(--card-background)] px-3 text-[13px] text-text-primary placeholder:text-text-muted focus:border-secondary focus:outline-none"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="h-9 rounded-lg border border-border-color bg-[var(--card-background)] px-3 text-[13px] text-text-primary placeholder:text-text-muted focus:border-secondary focus:outline-none"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as SessionMaterial['type'])}
          className="h-9 rounded-lg border border-border-color bg-[var(--card-background)] px-2 text-[13px] text-text-primary focus:border-secondary focus:outline-none"
        >
          {MATERIAL_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={submit}
          disabled={!title.trim() || !url.trim()}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-secondary px-3.5 text-[13px] font-bold text-[#0E1116] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Añadir
        </button>
      </div>
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

function StatCard({
  label,
  children,
  alert = false,
  alertColor = 'var(--pay-critico)',
}: {
  label: string;
  children: React.ReactNode;
  alert?: boolean;
  alertColor?: string;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border bg-[var(--card-background)] p-[18px_20px]"
      style={{ borderColor: alert ? tint(alertColor, 32) : 'var(--border-color)' }}
    >
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</span>
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 items-center rounded-lg border px-3.5 text-sm font-medium transition-colors ${
        active
          ? 'border-secondary/30 bg-secondary/10 text-text-secondary'
          : 'border-transparent text-text-muted hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  );
}

function HeadCell({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">{children}</span>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-border-color bg-[var(--card-background)] px-5 py-10 text-center text-[13.5px] text-text-muted">
      {children}
    </p>
  );
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function shortDate(value: string | null): string {
  if (!value) return '';
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
