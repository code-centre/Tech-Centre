'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import {
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  BookOpen,
  Home,
  MapPin,
  FileText,
  Video,
  Github,
  Link as LinkIcon,
  ExternalLink,
  Plus,
  Trash2,
  Users,
  BookMarked,
} from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import type {
  Session,
  ProgramModule,
  SessionMaterial,
  AttendanceStatus,
} from '@/types/supabase';

interface CohortCourseDetailProps {
  cohortId: string;
}

interface ProfileInfo {
  first_name: string;
  last_name?: string;
  email: string;
}

interface EnrollmentWithProfile {
  id: number;
  student_id: string;
  created_at?: string;
  profiles?: ProfileInfo | ProfileInfo[] | null;
  profile?: ProfileInfo | null;
}

function getEnrollmentProfile(e: EnrollmentWithProfile): ProfileInfo | null {
  const p = e.profiles ?? e.profile;
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

interface CohortData {
  id: number;
  name: string;
  program_id: number;
  start_date: string | null;
  end_date: string | null;
  modality: string | null;
  schedule: { days?: string[]; hours?: string[] } | null;
  programs?: {
    id: number;
    name: string;
    total_hours: number | null;
    difficulty?: string;
  } | null;
}

type CourseStatus = 'upcoming' | 'in-progress' | 'completed';

const MATERIAL_TYPES: { value: SessionMaterial['type']; label: string; Icon: typeof Github }[] = [
  { value: 'github', label: 'GitHub', Icon: Github },
  { value: 'youtube', label: 'YouTube', Icon: Video },
  { value: 'file', label: 'Archivo', Icon: FileText },
  { value: 'link', label: 'Enlace', Icon: LinkIcon },
];

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: 'Presente',
  late: 'Tarde',
  absent: 'Ausente',
  excused: 'Justificado',
};

const ATTENDANCE_COLORS: Record<AttendanceStatus, string> = {
  present: 'bg-green-500/90 text-white',
  late: 'bg-amber-500/90 text-white',
  absent: 'bg-red-500/90 text-white',
  excused: 'bg-blue-500/90 text-white',
};

function formatSessionDate(startsAt: string, endsAt: string): string {
  const s = new Date(startsAt);
  const e = new Date(endsAt);
  const opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return `${s.toLocaleDateString('es-CO', opts)} — ${e.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
}

function MaterialIcon({ type }: { type: SessionMaterial['type'] }) {
  const item = MATERIAL_TYPES.find((t) => t.value === type);
  const Icon = item?.Icon ?? LinkIcon;
  return <Icon className="w-4 h-4 shrink-0" />;
}

function getCourseStatus(startDate: string | null, endDate: string | null): CourseStatus {
  if (!startDate) return 'upcoming';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    if (end < today) return 'completed';
    if (start <= today && end >= today) return 'in-progress';
  } else {
    if (start <= today) return 'in-progress';
  }
  return 'upcoming';
}

function formatSchedule(schedule: { days?: string[]; hours?: string[] } | null): string {
  if (!schedule || !schedule.days || schedule.days.length === 0) return 'No disponible';
  const days = schedule.days.join(' y ');
  const hours = schedule.hours?.length ? schedule.hours[0] : '';
  return `${days}${hours ? `, ${hours}` : ''}`;
}

export default function CohortCourseDetail({ cohortId }: CohortCourseDetailProps) {
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noAccess, setNoAccess] = useState(false);

  const [cohort, setCohort] = useState<CohortData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentWithProfile[]>([]);
  const [isInstructor, setIsInstructor] = useState(false);
  const [userEnrollmentId, setUserEnrollmentId] = useState<number | null>(null);
  const [attendanceBySession, setAttendanceBySession] = useState<
    Record<number, { enrollment_id: number; status: AttendanceStatus; notes: string | null }[]>
  >({});

  const [activeTab, setActiveTab] = useState<'classes' | 'students'>('classes');
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState<Record<number, boolean>>({});
  const [loadingMaterials, setLoadingMaterials] = useState<Record<number, boolean>>({});

  const program = cohort?.programs;
  const cohortIdNum = parseInt(cohortId, 10);
  const courseStatus = getCourseStatus(cohort?.start_date ?? null, cohort?.end_date ?? null);
  const scheduleText = formatSchedule(cohort?.schedule ?? null);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    setNoAccess(false);
    try {
      const [
        cohortRes,
        sessionsRes,
        instructorRes,
        enrollmentRes,
      ] = await Promise.all([
        supabase
          .from('cohorts')
          .select('id, name, program_id, start_date, end_date, modality, schedule, programs:program_id(id, name, total_hours, difficulty)')
          .eq('id', cohortIdNum)
          .single(),
        supabase
          .from('sessions')
          .select('*')
          .eq('cohort_id', cohortIdNum)
          .order('starts_at', { ascending: true }),
        supabase
          .from('cohort_instructors')
          .select('instructor_id')
          .eq('cohort_id', cohortIdNum)
          .eq('instructor_id', user.id)
          .maybeSingle(),
        supabase
          .from('enrollments')
          .select('id, student_id, created_at, profiles:student_id(first_name, last_name, email)')
          .eq('cohort_id', cohortIdNum)
          .order('created_at', { ascending: false }),
      ]);

      if (cohortRes.error) throw cohortRes.error;
      if (!cohortRes.data) {
        setNoAccess(true);
        setLoading(false);
        return;
      }

      const cohortData = cohortRes.data as unknown as CohortData;
      const programsRaw = cohortData.programs;
      cohortData.programs = Array.isArray(programsRaw) ? programsRaw[0] ?? null : programsRaw;
      setCohort(cohortData);

      const sessionsData = (sessionsRes.data ?? []) as Session[];
      setSessions(sessionsData);

      const isAdmin = user?.role === 'admin';
      const isInstr = !!instructorRes.data || isAdmin;
      setIsInstructor(isInstr);

      const enrollmentsData = (enrollmentRes.data ?? []) as EnrollmentWithProfile[];
      setEnrollments(enrollmentsData);

      const myEnrollment = enrollmentsData.find((e) => e.student_id === user.id);
      setUserEnrollmentId(myEnrollment?.id ?? null);

      if (!isInstr && !myEnrollment) {
        setNoAccess(true);
        setLoading(false);
        return;
      }

      if (cohortData.program_id) {
        const { data: modulesData } = await supabase
          .from('program_modules')
          .select('*')
          .eq('program_id', cohortData.program_id)
          .order('order_index', { ascending: true });
        setModules((modulesData as ProgramModule[]) ?? []);
      }

      if (myEnrollment && !isInstr) {
        const { data: attData } = await supabase
          .from('attendance')
          .select('session_id, enrollment_id, status, notes')
          .eq('enrollment_id', myEnrollment.id);
        const bySession: Record<number, { enrollment_id: number; status: AttendanceStatus; notes: string | null }[]> = {};
        (attData ?? []).forEach((r: { session_id: number; enrollment_id: number; status: AttendanceStatus; notes: string | null }) => {
          if (!bySession[r.session_id]) bySession[r.session_id] = [];
          bySession[r.session_id].push({ enrollment_id: r.enrollment_id, status: r.status, notes: r.notes });
        });
        setAttendanceBySession(bySession);
      }
    } catch (err) {
      console.error('Error fetching cohort detail:', err);
      setError('Error al cargar el curso. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, cohortId, supabase]);

  const fetchAttendance = async (sessionId: number) => {
    setLoadingAttendance((prev) => ({ ...prev, [sessionId]: true }));
    const { data } = await supabase
      .from('attendance')
      .select('enrollment_id, status, notes')
      .eq('session_id', sessionId);
    const map: Record<number, { enrollment_id: number; status: AttendanceStatus; notes: string | null }> = {};
    (data ?? []).forEach((r: { enrollment_id: number; status: AttendanceStatus; notes: string | null }) => {
      map[r.enrollment_id] = r;
    });
    const list = enrollments.map((e) => ({
      enrollment_id: e.id,
      status: (map[e.id]?.status ?? 'absent') as AttendanceStatus,
      notes: map[e.id]?.notes ?? null,
    }));
    setAttendanceBySession((prev) => ({ ...prev, [sessionId]: list }));
    setLoadingAttendance((prev) => ({ ...prev, [sessionId]: false }));
  };

  const saveAttendance = async (
    sessionId: number,
    enrollmentId: number,
    status: AttendanceStatus,
    notes: string | null
  ) => {
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('session_id', sessionId)
      .eq('enrollment_id', enrollmentId)
      .maybeSingle();

    const payload = {
      session_id: sessionId,
      enrollment_id: enrollmentId,
      status,
      notes,
      marked_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from('attendance').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('attendance').insert(payload);
    }

    setAttendanceBySession((prev) => {
      const list = prev[sessionId] ?? [];
      const idx = list.findIndex((r) => r.enrollment_id === enrollmentId);
      const next = [...list];
      if (idx >= 0) next[idx] = { enrollment_id: enrollmentId, status, notes };
      else next.push({ enrollment_id: enrollmentId, status, notes });
      return { ...prev, [sessionId]: next };
    });
  };

  const addMaterial = async (sessionId: number, mat: SessionMaterial) => {
    setLoadingMaterials((prev) => ({ ...prev, [sessionId]: true }));
    const session = sessions.find((s) => s.id === sessionId);
    const current = (session?.materials ?? []) as SessionMaterial[];
    const next = [...current, mat];
    const { error: err } = await supabase.from('sessions').update({ materials: next }).eq('id', sessionId);
    setLoadingMaterials((prev) => ({ ...prev, [sessionId]: false }));
    if (!err) {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, materials: next } : s))
      );
    }
  };

  const removeMaterial = async (sessionId: number, index: number) => {
    setLoadingMaterials((prev) => ({ ...prev, [sessionId]: true }));
    const session = sessions.find((s) => s.id === sessionId);
    const current = (session?.materials ?? []) as SessionMaterial[];
    const next = current.filter((_, i) => i !== index);
    const { error: err } = await supabase.from('sessions').update({ materials: next }).eq('id', sessionId);
    setLoadingMaterials((prev) => ({ ...prev, [sessionId]: false }));
    if (!err) {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, materials: next } : s))
      );
    }
  };

  const getAttendanceSummary = (sessionId: number) => {
    const list = attendanceBySession[sessionId];
    if (!list) return null;
    const present = list.filter((r) => r.status === 'present' || r.status === 'excused').length;
    return `${present}/${enrollments.length}`;
  };

  const getUserAttendanceStatus = (sessionId: number): AttendanceStatus | null => {
    if (!userEnrollmentId) return null;
    const list = attendanceBySession[sessionId];
    const rec = list?.find((r) => r.enrollment_id === userEnrollmentId);
    return rec?.status ?? null;
  };

  const sortedModules = [...modules].sort((a, b) => a.order_index - b.order_index);
  const moduleIds = new Set(sortedModules.map((m) => m.id));
  const sessionsByModule = new Map<number | 'none', Session[]>();
  for (const m of sortedModules) {
    sessionsByModule.set(
      m.id,
      sessions
        .filter((s) => s.module_id === m.id)
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    );
  }
  const ungrouped = sessions
    .filter(
      (s) =>
        s.module_id == null ||
        (s.module_id != null && !moduleIds.has(s.module_id))
    )
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  if (ungrouped.length > 0) sessionsByModule.set('none', ungrouped);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/perfil/cursos"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Mis cursos
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-secondary" />
          <p className="text-text-muted text-sm">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          href="/perfil/cursos"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mis cursos
        </Link>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-500">{error}</p>
          <Link href="/perfil/cursos" className="mt-4 inline-block text-secondary hover:underline">
            Volver a Mis cursos
          </Link>
        </div>
      </div>
    );
  }

  if (noAccess || !cohort) {
    return (
      <div className="space-y-6">
        <Link
          href="/perfil/cursos"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mis cursos
        </Link>
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-8 text-center">
          <p className="text-text-muted mb-4">No tienes acceso a este curso.</p>
          <Link
            href="/perfil/cursos"
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mis cursos
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel =
    courseStatus === 'upcoming' ? 'Inicio próximo' : courseStatus === 'in-progress' ? 'En curso' : 'Finalizado';
  const statusBadgeClass =
    courseStatus === 'upcoming' ? 'bg-amber-500/90' : courseStatus === 'in-progress' ? 'bg-green-500/90' : 'bg-blue-500/90';

  return (
    <article className="space-y-6">
      <nav aria-label="Miga de pan">
        <Link
          href="/perfil/cursos"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-secondary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Mis cursos
        </Link>
      </nav>

      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{program?.name || 'Curso'}</h1>
            <p className="text-text-muted mt-1">{cohort.name}</p>
          </div>
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold text-white ${statusBadgeClass}`}>
            {statusLabel}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-text-muted">
          {(cohort.start_date || cohort.end_date) && (
            <span className="inline-flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary" />
              {cohort.start_date && formatDate(cohort.start_date)}
              {cohort.start_date && cohort.end_date && ' — '}
              {cohort.end_date && formatDate(cohort.end_date)}
            </span>
          )}
          {cohort.modality && (
            <span className="inline-flex items-center gap-2">
              <Home className="w-4 h-4 text-secondary" />
              {cohort.modality}
            </span>
          )}
          {scheduleText !== 'No disponible' && (
            <span className="inline-flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary" />
              {scheduleText}
            </span>
          )}
          {program?.total_hours && (
            <span className="inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-secondary" />
              {program.total_hours} horas
            </span>
          )}
        </div>
      </header>

      {isInstructor && (
        <nav className="flex border-t border-border-color" aria-label="Tabs del curso">
          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'classes'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            Clases y Material
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'students'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Users className="w-4 h-4" />
            Estudiantes
          </button>
        </nav>
      )}

      {isInstructor && activeTab === 'students' && (
        <section
          className="bg-[var(--card-background)] rounded-xl border border-border-color overflow-hidden"
          aria-labelledby="students-heading"
        >
          <h2 id="students-heading" className="sr-only">
            Lista de estudiantes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="text-left py-3 px-4 text-text-muted font-medium">Estudiante</th>
                  <th className="text-left py-3 px-4 text-text-muted font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-text-muted font-medium">Inscripción</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const prof = getEnrollmentProfile(e);
                  const name = prof
                    ? `${prof.first_name} ${prof.last_name || ''}`.trim() || prof.email
                    : e.student_id;
                  return (
                    <tr key={e.id} className="border-b border-border-color/50">
                      <td className="py-3 px-4 text-text-primary">{name}</td>
                      <td className="py-3 px-4 text-text-muted">{prof?.email ?? e.student_id}</td>
                      <td className="py-3 px-4 text-text-muted">
                        {e.created_at
                          ? new Date(e.created_at).toLocaleDateString('es-CO')
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {enrollments.length === 0 && (
            <p className="p-8 text-center text-text-muted">No hay estudiantes inscritos.</p>
          )}
        </section>
      )}

      {(isInstructor && activeTab === 'classes') || !isInstructor ? (
        <section
          className="space-y-4"
          aria-labelledby="sessions-heading"
        >
          <h2 id="sessions-heading" className="sr-only">
            Clases y material
          </h2>

          {sortedModules.map((mod) => {
            const modSessions = sessionsByModule.get(mod.id) ?? [];
            if (modSessions.length === 0) return null;
            return (
              <ProfileModuleSection
                key={mod.id}
                moduleName={mod.name}
                hours={mod.hours}
                sessions={modSessions}
                enrollments={enrollments}
                isInstructor={isInstructor}
                userEnrollmentId={userEnrollmentId}
                expandedSessionId={expandedSessionId}
                onToggleSession={(id) => setExpandedSessionId((prev) => (prev === id ? null : id))}
                fetchAttendance={fetchAttendance}
                attendanceBySession={attendanceBySession}
                saveAttendance={saveAttendance}
                loadingAttendance={loadingAttendance}
                addMaterial={addMaterial}
                removeMaterial={removeMaterial}
                loadingMaterials={loadingMaterials}
                getAttendanceSummary={getAttendanceSummary}
                getUserAttendanceStatus={getUserAttendanceStatus}
              />
            );
          })}

          {sessionsByModule.has('none') && (
            <ProfileModuleSection
              moduleName="Sin módulo"
              hours={null}
              sessions={sessionsByModule.get('none')!}
              enrollments={enrollments}
              isInstructor={isInstructor}
              userEnrollmentId={userEnrollmentId}
              expandedSessionId={expandedSessionId}
              onToggleSession={(id) => setExpandedSessionId((prev) => (prev === id ? null : id))}
              fetchAttendance={fetchAttendance}
              attendanceBySession={attendanceBySession}
              saveAttendance={saveAttendance}
              loadingAttendance={loadingAttendance}
              addMaterial={addMaterial}
              removeMaterial={removeMaterial}
              loadingMaterials={loadingMaterials}
              getAttendanceSummary={getAttendanceSummary}
              getUserAttendanceStatus={getUserAttendanceStatus}
            />
          )}

          {sessions.length === 0 && (
            <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-8 text-center text-text-muted">
              No hay clases registradas aún.
            </div>
          )}
        </section>
      ) : null}
    </article>
  );
}

interface ProfileModuleSectionProps {
  moduleName: string;
  hours: number | null;
  sessions: Session[];
  enrollments: EnrollmentWithProfile[];
  isInstructor: boolean;
  userEnrollmentId: number | null;
  expandedSessionId: number | null;
  onToggleSession: (sessionId: number) => void;
  fetchAttendance: (sessionId: number) => void;
  attendanceBySession: Record<
    number,
    { enrollment_id: number; status: AttendanceStatus; notes: string | null }[]
  >;
  saveAttendance: (
    sessionId: number,
    enrollmentId: number,
    status: AttendanceStatus,
    notes: string | null
  ) => void;
  loadingAttendance: Record<number, boolean>;
  addMaterial: (sessionId: number, mat: SessionMaterial) => void;
  removeMaterial: (sessionId: number, index: number) => void;
  loadingMaterials: Record<number, boolean>;
  getAttendanceSummary: (sessionId: number) => string | null;
  getUserAttendanceStatus: (sessionId: number) => AttendanceStatus | null;
}

function ProfileModuleSection({
  moduleName,
  hours,
  sessions,
  enrollments,
  isInstructor,
  userEnrollmentId,
  expandedSessionId,
  onToggleSession,
  fetchAttendance,
  attendanceBySession,
  saveAttendance,
  loadingAttendance,
  addMaterial,
  removeMaterial,
  loadingMaterials,
  getAttendanceSummary,
  getUserAttendanceStatus,
}: ProfileModuleSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section
      className="bg-[var(--card-background)] rounded-xl border border-border-color overflow-hidden"
      aria-labelledby={`module-${moduleName.replace(/\s/g, '-')}`}
    >
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-bg-secondary/50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5 text-text-muted shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
        )}
        <h2
          id={`module-${moduleName.replace(/\s/g, '-')}`}
          className="text-lg font-semibold text-text-primary"
        >
          {moduleName}
        </h2>
        {hours != null && <span className="text-sm text-text-muted">{hours} h</span>}
        <span className="text-sm text-text-muted">
          {sessions.length} {sessions.length === 1 ? 'clase' : 'clases'}
        </span>
      </button>

      {!collapsed && (
        <div className="border-t border-border-color divide-y divide-border-color">
          {sessions.map((session) => (
            <ProfileSessionRow
              key={session.id}
              session={session}
              enrollments={enrollments}
              isInstructor={isInstructor}
              userEnrollmentId={userEnrollmentId}
              isExpanded={expandedSessionId === session.id}
              onToggleExpand={() => onToggleSession(session.id)}
              onExpand={() => {
                if (!attendanceBySession[session.id] && isInstructor) fetchAttendance(session.id);
              }}
              attendanceList={attendanceBySession[session.id]}
              saveAttendance={saveAttendance}
              loadingAttendance={loadingAttendance[session.id] ?? false}
              addMaterial={addMaterial}
              removeMaterial={removeMaterial}
              loadingMaterials={loadingMaterials[session.id] ?? false}
              attendanceSummary={getAttendanceSummary(session.id)}
              userAttendanceStatus={getUserAttendanceStatus(session.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface ProfileSessionRowProps {
  session: Session;
  enrollments: EnrollmentWithProfile[];
  isInstructor: boolean;
  userEnrollmentId: number | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onExpand: () => void;
  attendanceList?: { enrollment_id: number; status: AttendanceStatus; notes: string | null }[];
  saveAttendance: (
    sessionId: number,
    enrollmentId: number,
    status: AttendanceStatus,
    notes: string | null
  ) => void;
  loadingAttendance: boolean;
  addMaterial: (sessionId: number, mat: SessionMaterial) => void;
  removeMaterial: (sessionId: number, index: number) => void;
  loadingMaterials: boolean;
  attendanceSummary: string | null;
  userAttendanceStatus: AttendanceStatus | null;
}

function ProfileSessionRow({
  session,
  enrollments,
  isInstructor,
  userEnrollmentId,
  isExpanded,
  onToggleExpand,
  onExpand,
  attendanceList,
  saveAttendance,
  loadingAttendance,
  addMaterial,
  removeMaterial,
  loadingMaterials,
  attendanceSummary,
  userAttendanceStatus,
}: ProfileSessionRowProps) {
  const materials = (session.materials ?? []) as SessionMaterial[];
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatUrl, setNewMatUrl] = useState('');
  const [newMatType, setNewMatType] = useState<SessionMaterial['type']>('link');

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim() || !newMatUrl.trim()) return;
    addMaterial(session.id, {
      title: newMatTitle.trim(),
      url: newMatUrl.trim(),
      type: newMatType,
    });
    setNewMatTitle('');
    setNewMatUrl('');
  };

  const handleToggle = () => {
    onToggleExpand();
    if (!isExpanded) onExpand();
  };

  return (
    <div>
      <div className="flex items-center gap-4 px-6 py-4 hover:bg-bg-secondary/30 transition-colors">
        <button
          type="button"
          onClick={handleToggle}
          className="text-text-muted hover:text-text-primary shrink-0"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary truncate">{session.title || 'Sin título'}</p>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatSessionDate(session.starts_at, session.ends_at)}
            </span>
            {session.room && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {session.room}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30">
            <FileText className="w-3.5 h-3.5" />
            {materials.length}
          </span>
          {isInstructor && attendanceSummary != null ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-bg-secondary text-text-muted border border-border-color">
              {attendanceSummary} asistieron
            </span>
          ) : !isInstructor && userAttendanceStatus ? (
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${ATTENDANCE_COLORS[userAttendanceStatus]}`}
            >
              {ATTENDANCE_LABELS[userAttendanceStatus]}
            </span>
          ) : null}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-bg-secondary/20 px-6 py-4 space-y-6 border-t border-border-color">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Material</h3>
            <ul className="space-y-2 mb-4">
              {materials.map((mat, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-[var(--card-background)] border border-border-color"
                >
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-secondary hover:underline truncate"
                  >
                    <MaterialIcon type={mat.type} />
                    {mat.title}
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  {isInstructor && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(session.id, i)}
                      className="p-1.5 text-text-muted hover:text-red-500 transition-colors shrink-0"
                      title="Quitar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {isInstructor && (
              <form onSubmit={handleAddMaterial} className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Título"
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  className="flex-1 min-w-[120px] rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder-text-muted"
                />
                <input
                  type="url"
                  placeholder="URL"
                  value={newMatUrl}
                  onChange={(e) => setNewMatUrl(e.target.value)}
                  className="flex-1 min-w-[160px] rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder-text-muted"
                />
                <select
                  value={newMatType}
                  onChange={(e) => setNewMatType(e.target.value as SessionMaterial['type'])}
                  className="rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-sm text-text-primary"
                >
                  {MATERIAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loadingMaterials}
                  className="btn-primary px-4 py-2 text-sm inline-flex items-center gap-1"
                >
                  {loadingMaterials ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Añadir
                </button>
              </form>
            )}
          </div>

          {isInstructor && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Asistencia</h3>
              {loadingAttendance ? (
                <div className="flex items-center gap-2 text-text-muted py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cargando...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-color">
                        <th className="text-left py-2 px-3 text-text-muted font-medium">Estudiante</th>
                        <th className="text-left py-2 px-3 text-text-muted font-medium">Estatus</th>
                        <th className="text-left py-2 px-3 text-text-muted font-medium">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((e) => {
                        const prof = getEnrollmentProfile(e);
                        const name = prof
                          ? `${prof.first_name} ${prof.last_name || ''}`.trim() || prof.email
                          : e.student_id;
                        const rec = attendanceList?.find((r) => r.enrollment_id === e.id);
                        const status = (rec?.status ?? 'absent') as AttendanceStatus;
                        return (
                          <tr key={e.id} className="border-b border-border-color/50">
                            <td className="py-2 px-3 text-text-primary">{name}</td>
                            <td className="py-2 px-3">
                              <select
                                value={status}
                                onChange={(ev) =>
                                  saveAttendance(
                                    session.id,
                                    e.id,
                                    ev.target.value as AttendanceStatus,
                                    rec?.notes ?? null
                                  )
                                }
                                className="rounded border border-border-color bg-bg-secondary px-2 py-1 text-text-primary text-sm"
                              >
                                {(Object.entries(ATTENDANCE_LABELS) as [AttendanceStatus, string][]).map(
                                  ([val, label]) => (
                                    <option key={val} value={val}>
                                      {label}
                                    </option>
                                  )
                                )}
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Opcional"
                                defaultValue={rec?.notes ?? ''}
                                onBlur={(ev) => {
                                  const v = ev.target.value.trim() || null;
                                  if (v !== (rec?.notes ?? null)) {
                                    saveAttendance(session.id, e.id, status, v);
                                  }
                                }}
                                className="w-full max-w-[140px] rounded border border-border-color bg-bg-secondary px-2 py-1 text-text-primary text-sm"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!isInstructor && userAttendanceStatus && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">Mi asistencia</h3>
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${ATTENDANCE_COLORS[userAttendanceStatus]}`}
              >
                {ATTENDANCE_LABELS[userAttendanceStatus]}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
