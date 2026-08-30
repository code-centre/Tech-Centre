'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CalendarPlus,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Github,
  GraduationCap,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Users,
  Video,
} from 'lucide-react';
import type {
  AttendanceStatus,
  Grade,
  ProgramModule,
  Session,
  SessionMaterial,
} from '@/types/supabase';
import {
  ATTENDANCE_LABEL,
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
  averageGrade,
  type CohortLite,
  type ModuleGroup,
} from '@/lib/cohorts';

interface Props {
  cohortId: string;
}

interface Classmate {
  id: number;
  studentId: string;
  name: string;
  email: string;
}

type Tab = 'clases' | 'material' | 'companeros';

const STATUS_COLOR = {
  upcoming: 'var(--pay-aviso)',
  active: 'var(--pay-serie-cobrado)',
  finished: 'var(--pay-serie-porcobrar)',
} as const;

function tint(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

const MATERIAL_ICON: Record<SessionMaterial['type'], typeof Github> = {
  github: Github,
  youtube: Video,
  file: FileText,
  link: LinkIcon,
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default function CohortCourseDetail({ cohortId }: Props) {
  const supabase = useSupabaseClient();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [noAccess, setNoAccess] = useState(false);
  const [error, setError] = useState('');

  const [cohort, setCohort] = useState<CohortLite | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [instructors, setInstructors] = useState<string[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [grades, setGrades] = useState<Grade[]>([]);
  const [canManage, setCanManage] = useState(false);

  const [tab, setTab] = useState<Tab>('clases');
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [touchedModules, setTouchedModules] = useState(false);

  const cohortIdNum = parseInt(cohortId, 10);
  const now = useMemo(() => new Date(), []);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    setNoAccess(false);

    try {
      const [cohortRes, sessionsRes, enrollmentsRes, instructorsRes] = await Promise.all([
        supabase
          .from('cohorts')
          .select(
            'id, name, slug, program_id, start_date, end_date, modality, campus, capacity, schedule, program:programs!program_id(id, name, total_hours)'
          )
          .eq('id', cohortIdNum)
          .single(),
        supabase.from('sessions').select('*').eq('cohort_id', cohortIdNum).order('starts_at'),
        supabase
          .from('enrollments')
          .select('id, student_id, profile:profiles!student_id(first_name, last_name, email)')
          .eq('cohort_id', cohortIdNum),
        supabase
          .from('cohort_instructors')
          .select('instructor_id, profile:profiles!instructor_id(first_name, last_name)')
          .eq('cohort_id', cohortIdNum),
      ]);

      if (cohortRes.error || !cohortRes.data) {
        setNoAccess(true);
        return;
      }

      const raw = cohortRes.data as Record<string, unknown>;
      setCohort({
        ...(raw as unknown as CohortLite),
        program: one(raw.program as never),
      });

      const sessionList = (sessionsRes.data ?? []) as Session[];
      setSessions(sessionList);

      const enrollmentList = (enrollmentsRes.data ?? []) as {
        id: number;
        student_id: string;
        profile: { first_name?: string; last_name?: string; email?: string } | null;
      }[];

      setClassmates(
        enrollmentList.map((row) => {
          const profile = one(row.profile as never) as
            | { first_name?: string; last_name?: string; email?: string }
            | null;
          return {
            id: row.id,
            studentId: row.student_id,
            name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Sin nombre',
            email: profile?.email ?? '',
          };
        })
      );

      setInstructors(
        ((instructorsRes.data ?? []) as { profile: unknown }[])
          .map((row) => {
            const profile = one(row.profile as never) as
              | { first_name?: string; last_name?: string }
              | null;
            return `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim();
          })
          .filter(Boolean)
      );

      const mine = enrollmentList.find((row) => row.student_id === user.id);
      const isStaff =
        user.role === 'admin' ||
        ((instructorsRes.data ?? []) as { instructor_id: string }[]).some(
          (row) => row.instructor_id === user.id
        );
      setCanManage(isStaff);

      if (!mine && !isStaff) {
        setNoAccess(true);
        return;
      }

      const programId = (raw.program_id as number) ?? null;
      const [modulesRes, attendanceRes, gradesRes] = await Promise.all([
        programId
          ? supabase.from('program_modules').select('*').eq('program_id', programId).order('order_index')
          : Promise.resolve({ data: [] }),
        mine
          ? supabase.from('attendance').select('session_id, status').eq('enrollment_id', mine.id)
          : Promise.resolve({ data: [] }),
        mine
          ? supabase.from('grades').select('*').eq('enrollment_id', mine.id)
          : Promise.resolve({ data: [] }),
      ]);

      setModules((modulesRes.data ?? []) as ProgramModule[]);
      setGrades((gradesRes.data ?? []) as Grade[]);

      const bySession: Record<number, AttendanceStatus> = {};
      for (const row of (attendanceRes.data ?? []) as { session_id: number; status: AttendanceStatus }[]) {
        bySession[row.session_id] = row.status;
      }
      setAttendance(bySession);
    } catch (err) {
      console.error('Error al cargar el curso:', err);
      setError('No pudimos cargar el curso. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [supabase, cohortIdNum, user?.id, user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const groups = useMemo(
    () => groupSessionsByModule(sessions, modules, now),
    [sessions, modules, now]
  );

  const nextSession = useMemo(() => findNextSession(sessions, now), [sessions, now]);

  // Al abrir, se despliega el módulo donde está la próxima clase: es el que la
  // persona vino a mirar. Después manda lo que ella toque.
  useEffect(() => {
    if (touchedModules || groups.length === 0) return;
    const current =
      groups.find((group) => group.sessions.some((s) => s.id === nextSession?.id)) ??
      groups[groups.length - 1];
    setOpenModules(new Set([current.key]));
  }, [groups, nextSession, touchedModules]);

  const toggleModule = (key: string) => {
    setTouchedModules(true);
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const doneSessions = sessions.filter((session) => isSessionDone(session, now));
  const myPresent = doneSessions.filter((session) => countsAsPresent(attendance[session.id])).length;
  const myTracked = doneSessions.filter((session) => attendance[session.id] != null).length;
  const attendancePercent = myTracked > 0 ? Math.round((myPresent / myTracked) * 100) : null;
  const average = averageGrade(grades.map((g) => g.value));

  const allMaterials = useMemo(
    () =>
      groups.flatMap((group) =>
        group.sessions.flatMap((session) =>
          materialsOf(session).map((material) => ({ material, session, group }))
        )
      ),
    [groups]
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (noAccess || !cohort) {
    return (
      <div className="py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">No tienes acceso a este curso</h1>
        <p className="mb-5 text-text-muted">
          Puede que no estés matriculado o que el curso ya no exista.
        </p>
        <Link href="/perfil/cursos" className="btn-primary inline-flex items-center gap-2">
          Volver a mis cursos
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
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
      )}

      <Link
        href="/perfil/cursos"
        className="inline-flex w-fit items-center gap-2 text-[13.5px] text-text-muted transition-colors hover:text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis cursos
      </Link>

      {/* Encabezado */}
      <header className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[27px] font-bold tracking-tight text-text-primary">
            {cohort.program?.name ?? 'Curso'}
          </h1>
          <span className="text-[15px] text-text-muted">{cohort.name}</span>
          <Pill color={STATUS_COLOR[status]}>{COHORT_STATUS_LABEL[status]}</Pill>
        </div>
        <div className="flex flex-wrap gap-2">
          {(cohort.start_date || cohort.end_date) && (
            <Fact icon={<Calendar className="h-[15px] w-[15px]" />}>
              {[cohort.start_date, cohort.end_date].filter(Boolean).map(shortRange).join(' – ')}
            </Fact>
          )}
          {schedule && <Fact icon={<Clock className="h-[15px] w-[15px]" />}>{schedule}</Fact>}
          {place && <Fact icon={<MapPin className="h-[15px] w-[15px]" />}>{place}</Fact>}
          <Fact icon={<BookOpen className="h-[15px] w-[15px]" />}>
            {cohort.program?.total_hours ? `${cohort.program.total_hours} horas · ` : ''}
            {sessions.length} {sessions.length === 1 ? 'clase' : 'clases'}
          </Fact>
          {instructors.length > 0 && (
            <Fact icon={<Users className="h-[15px] w-[15px]" />}>Profe: {instructors.join(', ')}</Fact>
          )}
        </div>
      </header>

      {canManage && (
        <p className="flex flex-wrap items-center gap-2 rounded-xl border border-border-color bg-bg-secondary px-4 py-3 text-[13.5px] text-text-muted">
          <GraduationCap className="h-4 w-4 text-secondary" />
          Estás viendo el curso como lo ve un estudiante.
          {cohort.slug && (
            <Link href={`/perfil/instructor/${cohort.slug}`} className="font-medium text-secondary hover:underline">
              Ir al panel del profesor
            </Link>
          )}
        </p>
      )}

      {/* Próxima clase */}
      {nextSession && (
        <section
          className="flex flex-wrap items-center justify-between gap-6 rounded-xl border p-[20px_22px]"
          style={{ borderColor: tint('var(--secondary)', 30), background: tint('var(--secondary)', 5) }}
          aria-labelledby="proxima-clase"
        >
          <div className="flex min-w-0 flex-col gap-2.5">
            <span
              id="proxima-clase"
              className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-secondary"
            >
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
              {moduleLabelOf(groups, nextSession.id)}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2.5">
            {materialsOf(nextSession).length > 0 && (
              <div className="flex flex-wrap justify-end gap-1.5">
                {materialsOf(nextSession).map((material, index) => (
                  <MaterialChip key={index} material={material} />
                ))}
              </div>
            )}
            <div className="flex gap-2.5">
              <a
                href={buildCalendarLink(nextSession, cohort)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-border-color bg-bg-secondary px-4 text-sm font-medium text-text-primary transition-colors hover:border-secondary/50"
              >
                <CalendarPlus className="h-4 w-4" />
                Añadir a mi calendario
              </a>
              {materialsOf(nextSession)[0] && (
                <a
                  href={materialsOf(nextSession)[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[38px] items-center gap-2 rounded-lg bg-secondary px-[18px] text-sm font-semibold text-[#0E1116] transition-colors hover:bg-secondary/90"
                >
                  Abrir el material
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Cómo vas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Avance del curso">
          <span className="text-2xl font-bold text-text-primary">
            {doneSessions.length}{' '}
            <span className="text-[15px] font-normal text-text-muted">de {sessions.length} clases</span>
          </span>
          <Bar percent={sessions.length ? (doneSessions.length / sessions.length) * 100 : 0} color="var(--secondary)" />
        </StatCard>
        <StatCard label="Tu asistencia">
          {attendancePercent == null ? (
            <span className="text-[15px] text-text-muted">Aún no hay clases con asistencia</span>
          ) : (
            <>
              <span className="text-2xl font-bold text-text-primary">
                {attendancePercent}%{' '}
                <span className="text-[15px] font-normal text-text-muted">
                  · {myPresent} de {myTracked}
                </span>
              </span>
              <Bar percent={attendancePercent} color="var(--pay-serie-cobrado)" />
            </>
          )}
        </StatCard>
        <StatCard label="Tus notas">
          {average == null ? (
            <span className="text-[15px] text-text-muted">Todavía no tienes módulos calificados</span>
          ) : (
            <>
              <span className="text-2xl font-bold text-text-primary">
                {formatGrade(average)} <span className="text-[15px] font-normal text-text-muted">de 5.0</span>
              </span>
              <span className="text-[12.5px] text-text-muted">
                Promedio de {grades.length} {grades.length === 1 ? 'módulo calificado' : 'módulos calificados'}
              </span>
            </>
          )}
        </StatCard>
      </div>

      {/* Pestañas */}
      <div className="flex w-fit items-center gap-1 rounded-[10px] border border-border-color bg-[var(--card-background)] p-1">
        <TabButton active={tab === 'clases'} onClick={() => setTab('clases')}>
          Clases y material
        </TabButton>
        <TabButton active={tab === 'material'} onClick={() => setTab('material')}>
          Todo el material
        </TabButton>
        <TabButton active={tab === 'companeros'} onClick={() => setTab('companeros')}>
          Mis compañeros
        </TabButton>
      </div>

      {tab === 'clases' && (
        <div className="flex flex-col gap-3">
          {groups.length === 0 ? (
            <EmptyCard>Todavía no hay clases programadas.</EmptyCard>
          ) : (
            groups.map((group, index) => {
              const open = openModules.has(group.key);
              const grade = grades.find((g) => g.module_id === group.moduleId);
              const hasNext = group.sessions.some((s) => s.id === nextSession?.id);

              return (
                <section
                  key={group.key}
                  className="overflow-hidden rounded-xl border bg-[var(--card-background)]"
                  style={{ borderColor: hasNext ? tint('var(--secondary)', 28) : 'var(--border-color)' }}
                >
                  <button
                    type="button"
                    onClick={() => toggleModule(group.key)}
                    aria-expanded={open}
                    className={`flex w-full items-center gap-3 px-5 py-[15px] text-left transition-colors hover:bg-bg-secondary/40 ${
                      open ? 'border-b border-border-color' : ''
                    }`}
                  >
                    {open ? (
                      <ChevronDown className="h-[18px] w-[18px] shrink-0 text-text-muted" />
                    ) : (
                      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-text-muted" />
                    )}
                    <span className="text-[15px] font-semibold text-text-primary">
                      {group.moduleId ? `Módulo ${index + 1} · ${group.name}` : group.name}
                    </span>
                    <span className="text-[12.5px] text-text-muted">
                      {group.hours ? `${group.hours} h · ` : ''}
                      {group.sessions.length} {group.sessions.length === 1 ? 'clase' : 'clases'}
                    </span>
                    <span className="grow" />
                    {grade ? (
                      <Pill color="var(--pay-serie-cobrado)">Terminado · nota {formatGrade(grade.value)}</Pill>
                    ) : group.doneCount === group.sessions.length ? (
                      <Pill color="var(--pay-serie-porcobrar)">Terminado</Pill>
                    ) : group.doneCount === 0 ? (
                      <Pill color="var(--pay-neutro)">
                        {group.sessions[0]
                          ? `Empieza el ${sessionDay(group.sessions[0].starts_at)}`
                          : 'Sin fecha'}
                      </Pill>
                    ) : (
                      <span className="flex items-center gap-2.5">
                        <span className="text-[12.5px] text-text-muted">
                          {group.doneCount} de {group.sessions.length}
                        </span>
                        <span className="h-1.5 w-[76px] overflow-hidden rounded-[3px] bg-border-color">
                          <span
                            className="block h-full rounded-[3px] bg-secondary"
                            style={{ width: `${(group.doneCount / group.sessions.length) * 100}%` }}
                          />
                        </span>
                      </span>
                    )}
                  </button>

                  {open &&
                    group.sessions.map((session) => (
                      <ClassRow
                        key={session.id}
                        session={session}
                        isNext={session.id === nextSession?.id}
                        done={isSessionDone(session, now)}
                        status={attendance[session.id]}
                      />
                    ))}
                </section>
              );
            })
          )}
        </div>
      )}

      {tab === 'material' && (
        <section className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
          <div className="flex items-center justify-between gap-4 border-b border-border-color px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold text-text-primary">Todo el material del curso</h2>
              <p className="text-[12.5px] text-text-muted">
                Todo lo que el profe ha subido, en un solo sitio.
              </p>
            </div>
            <span className="shrink-0 text-[13px] text-text-muted">
              {allMaterials.length} {allMaterials.length === 1 ? 'recurso' : 'recursos'}
            </span>
          </div>
          {allMaterials.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13.5px] text-text-muted">
              El profe todavía no ha subido material.
            </p>
          ) : (
            allMaterials.map(({ material, session, group }, index) => {
              const Icon = MATERIAL_ICON[material.type] ?? LinkIcon;
              return (
                <a
                  key={`${session.id}-${index}`}
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-border-color/50 px-5 py-3 transition-colors last:border-b-0 hover:bg-bg-secondary/40"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[14px] text-text-primary">{material.title}</span>
                    <span className="truncate text-[12.5px] text-text-muted">
                      {group.name} · {session.title || 'Clase'} · {sessionDay(session.starts_at)}
                    </span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-text-muted" />
                </a>
              );
            })
          )}
        </section>
      )}

      {tab === 'companeros' && (
        <section className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
          <div className="flex items-center justify-between gap-4 border-b border-border-color px-5 py-4">
            <h2 className="text-base font-semibold text-text-primary">Mis compañeros</h2>
            <span className="text-[13px] text-text-muted">{classmates.length} en la cohorte</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2">
            {classmates.map((mate) => (
              <li
                key={mate.id}
                className="flex items-center gap-3 border-b border-border-color/50 px-5 py-3"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/12 text-[13px] font-semibold text-secondary">
                  {initials(mate.name)}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[14px] text-text-primary">{mate.name}</span>
                  <span className="truncate text-[12.5px] text-text-muted">{mate.email}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ClassRow({
  session,
  isNext,
  done,
  status,
}: {
  session: Session;
  isNext: boolean;
  done: boolean;
  status: AttendanceStatus | undefined;
}) {
  const materials = materialsOf(session);

  return (
    <div className="grid grid-cols-[9px_86px_minmax(0,1fr)_auto_104px] items-center gap-3.5 border-b border-border-color/50 px-5 py-3 last:border-b-0">
      <span
        className="h-[9px] w-[9px] rounded-full"
        style={
          done
            ? { background: 'var(--pay-serie-cobrado)' }
            : isNext
              ? { background: 'var(--secondary)', boxShadow: '0 0 0 4px color-mix(in srgb, var(--secondary) 18%, transparent)' }
              : { border: '2px solid var(--border-color)', boxSizing: 'border-box' }
        }
        aria-hidden
      />
      <span className="flex flex-col gap-px">
        <span className="text-[13px] font-semibold text-text-primary">{sessionDay(session.starts_at)}</span>
        <span className="text-[12px] text-text-muted">{sessionHour(session.starts_at)}</span>
      </span>
      <span className="truncate text-sm text-text-primary">{session.title || 'Clase sin título'}</span>
      <span className="flex gap-1.5">
        {materials.length > 0 ? (
          materials.map((material, index) => <MaterialChip key={index} material={material} small />)
        ) : (
          <span className="text-xs text-text-muted/60">Sin material aún</span>
        )}
      </span>
      <span className="flex justify-end">
        {!done ? (
          <Pill color="var(--pay-neutro)">Aún no</Pill>
        ) : status == null ? (
          <Pill color="var(--pay-neutro)">Sin registro</Pill>
        ) : countsAsPresent(status) ? (
          <Pill color="var(--pay-serie-cobrado)">{ATTENDANCE_LABEL[status]}</Pill>
        ) : status === 'late' ? (
          <Pill color="var(--pay-aviso)">Llegaste tarde</Pill>
        ) : (
          <Pill color="var(--pay-critico)">Faltaste</Pill>
        )}
      </span>
    </div>
  );
}

function MaterialChip({ material, small = false }: { material: SessionMaterial; small?: boolean }) {
  const Icon = MATERIAL_ICON[material.type] ?? LinkIcon;
  return (
    <a
      href={material.url}
      target="_blank"
      rel="noopener noreferrer"
      title={material.title}
      className={`inline-flex max-w-[132px] items-center gap-1.5 rounded-[7px] border border-border-color bg-bg-secondary px-2.5 text-text-primary transition-colors hover:border-secondary/50 ${
        small ? 'h-[26px] text-xs' : 'h-[28px] text-[12.5px]'
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{material.title}</span>
    </a>
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

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border-color bg-[var(--card-background)] p-[18px_20px]">
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</span>
      {children}
    </div>
  );
}

function Bar({ percent, color }: { percent: number; color: string }) {
  return (
    <span className="block h-1.5 overflow-hidden rounded-[3px] bg-border-color">
      <span
        className="block h-full rounded-[3px]"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: color }}
      />
    </span>
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

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-border-color bg-[var(--card-background)] px-5 py-10 text-center text-[13.5px] text-text-muted">
      {children}
    </p>
  );
}

/* -------------------------------------------------------------------------- */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '··';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function shortRange(value: string | null): string {
  if (!value) return '';
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function moduleLabelOf(groups: ModuleGroup[], sessionId: number) {
  for (let i = 0; i < groups.length; i++) {
    const index = groups[i].sessions.findIndex((s) => s.id === sessionId);
    if (index >= 0) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="h-[15px] w-[15px]" />
          {groups[i].moduleId ? `Módulo ${i + 1}` : groups[i].name} · clase {index + 1} de{' '}
          {groups[i].sessions.length}
        </span>
      );
    }
  }
  return null;
}

/** Enlace de Google Calendar con los datos de la clase. */
function buildCalendarLink(session: Session, cohort: CohortLite): string {
  const stamp = (value: string) => new Date(value).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${session.title || 'Clase'} · ${cohort.program?.name ?? ''}`.trim(),
    dates: `${stamp(session.starts_at)}/${stamp(session.ends_at || session.starts_at)}`,
  });
  if (session.room) params.set('location', session.room);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
