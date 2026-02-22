'use client';

import { useParams } from 'next/navigation';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  Hash,
  Users,
  BookMarked,
  Award,
  Loader2,
} from 'lucide-react';
import CohortListInstructor from '@/components/instructor/CohortListInstructor';
import InstructorSessions from '@/components/instructor/InstructorSessions';
import InstructorGrades from '@/components/instructor/InstructorGrades';
import type { Session, ProgramModule, Grade } from '@/types/supabase';

interface ProfileInfo {
  user_id: string;
  first_name: string;
  last_name?: string;
  email: string;
  profile_image?: string | null;
}

interface EnrollmentWithProfile {
  id: number;
  cohort_id: number;
  student_id: string;
  status: string;
  profiles?: ProfileInfo | ProfileInfo[] | null;
  profile?: ProfileInfo | null;
}

interface CohortData {
  id: number;
  name: string;
  slug: string;
  program_id: number;
  start_date: string | null;
  end_date: string | null;
  programs?: { id: number; name: string } | { id: number; name: string }[] | null;
}

type TabType = 'students' | 'sessions' | 'grades';

export default function InstructorCohortPage() {
  const params = useParams();
  const supabase = useSupabaseClient();
  const { user, loading: userLoading } = useUser();
  const [cohort, setCohort] = useState<CohortData | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentWithProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<{ session_id: number; enrollment_id: number; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('students');

  const cohortSlug = params.cohortSlug as string;

  useEffect(() => {
    if (!user?.id || !cohortSlug) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: cohortData, error: cohortError } = await supabase
          .from('cohorts')
          .select(`
            id,
            name,
            slug,
            program_id,
            start_date,
            end_date,
            programs:program_id (id, name)
          `)
          .eq('slug', cohortSlug)
          .single();

        if (cohortError || !cohortData) {
          setError('Cohorte no encontrado');
          setLoading(false);
          return;
        }

        const cohortTyped = cohortData as unknown as CohortData;
        const programsRaw = cohortTyped.programs;
        cohortTyped.programs = Array.isArray(programsRaw) ? programsRaw[0] ?? null : programsRaw;
        setCohort(cohortTyped);

        const cohortId = cohortTyped.id;
        const programId = cohortTyped.program_id;

        const [enrollmentsRes, sessionsRes, modulesRes, gradesRes] = await Promise.all([
          supabase
            .from('enrollments')
            .select(`
              id,
              cohort_id,
              student_id,
              status,
              profiles:student_id (user_id, first_name, last_name, email, profile_image)
            `)
            .eq('cohort_id', cohortId)
            .order('created_at', { ascending: false }),
          supabase
            .from('sessions')
            .select('*')
            .eq('cohort_id', cohortId)
            .order('starts_at', { ascending: true }),
          supabase
            .from('program_modules')
            .select('*')
            .eq('program_id', programId)
            .order('order_index', { ascending: true }),
          supabase.from('grades').select('*'),
        ]);

        const sessionsData = (sessionsRes.data as Session[]) || [];
        const sessionIds = sessionsData.map((s) => s.id);

        if (sessionIds.length > 0) {
          const { data: attData } = await supabase
            .from('attendance')
            .select('session_id, enrollment_id, status')
            .in('session_id', sessionIds);
          setAttendance((attData as { session_id: number; enrollment_id: number; status: string }[]) || []);
        } else {
          setAttendance([]);
        }

        if (enrollmentsRes.data) {
          setEnrollments((enrollmentsRes.data as EnrollmentWithProfile[]) || []);
        }
        if (sessionsRes.data) {
          setSessions(sessionsData);
        }
        if (modulesRes.data) {
          setModules((modulesRes.data as ProgramModule[]) || []);
        }
        if (gradesRes.data) {
          setGrades((gradesRes.data as Grade[]) || []);
        }
      } catch (err) {
        console.error('Error fetching cohort data:', err);
        setError('Error al cargar el cohorte');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, cohortSlug, supabase]);

  const onDataChange = () => {
    if (!cohort) return;
    supabase
      .from('sessions')
      .select('*')
      .eq('cohort_id', cohort.id)
      .order('starts_at', { ascending: true })
      .then(({ data }) => {
        const sessionsData = (data as Session[]) || [];
        setSessions(sessionsData);
        const sessionIds = sessionsData.map((s) => s.id);
        if (sessionIds.length > 0) {
          supabase
            .from('attendance')
            .select('session_id, enrollment_id, status')
            .in('session_id', sessionIds)
            .then(({ data: attData }) =>
              setAttendance((attData as { session_id: number; enrollment_id: number; status: string }[]) || [])
            );
        } else {
          setAttendance([]);
        }
      });
    supabase.from('grades').select('*').then(({ data }) => data && setGrades(data as Grade[]));
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="w-12 h-12 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user || !['admin', 'instructor'].includes(user.role)) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p>No tienes permiso para ver esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="w-12 h-12 animate-spin text-secondary" />
      </div>
    );
  }

  if (error || !cohort) {
    return (
      <div className="p-6">
        <Link
          href="/perfil/instructor"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-secondary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al panel
        </Link>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p>{error || 'Cohorte no encontrado'}</p>
        </div>
      </div>
    );
  }

  const programName =
    Array.isArray(cohort.programs) ? cohort.programs?.[0]?.name : cohort.programs?.name;

  return (
    <div className="space-y-6">
      <article
        className="bg-[var(--card-background)] rounded-xl border border-border-color shadow-lg overflow-hidden"
        aria-labelledby="cohort-header-title"
      >
        <header className="p-6">
          <Link
            href="/perfil/instructor"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-secondary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </Link>

          <h1
            id="cohort-header-title"
            className="text-2xl md:text-3xl font-bold text-text-primary mb-4 flex items-center gap-3"
          >
            <div className="p-2.5 bg-secondary/10 rounded-xl">
              <Calendar className="w-7 h-7 text-secondary" />
            </div>
            {cohort.name}
          </h1>
          <div className="flex flex-wrap gap-6 text-sm">
            <span className="flex items-center gap-2 text-text-muted">
              <Hash className="w-4 h-4 text-secondary" />
              <span className="text-text-primary font-medium">ID:</span>
              {cohort.id}
            </span>
            <span className="flex items-center gap-2 text-text-muted">
              <BookOpen className="w-4 h-4 text-secondary" />
              <span className="text-text-primary font-medium">Programa:</span>
              {programName || '—'}
            </span>
            <span className="flex items-center gap-2 text-text-muted">
              <Calendar className="w-4 h-4 text-secondary" />
              <span className="text-text-primary font-medium">Fechas:</span>
              {cohort.start_date} — {cohort.end_date}
            </span>
          </div>
        </header>

        <nav className="flex border-t border-border-color" aria-label="Tabs del cohorte">
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'students'
                ? 'text-secondary border-b-2 border-secondary bg-bg-secondary/30'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary/20'
            }`}
          >
            <Users className="w-4 h-4" />
            Estudiantes ({enrollments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'sessions'
                ? 'text-secondary border-b-2 border-secondary bg-bg-secondary/30'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary/20'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            Sesiones y Material
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grades')}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'grades'
                ? 'text-secondary border-b-2 border-secondary bg-bg-secondary/30'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary/20'
            }`}
          >
            <Award className="w-4 h-4" />
            Calificaciones
          </button>
        </nav>
      </article>

      {activeTab === 'students' && (
        <section aria-labelledby="students-heading">
          <h2 id="students-heading" className="sr-only">
            Lista de estudiantes
          </h2>
          <CohortListInstructor
            cohortId={cohort.id}
            enrollments={enrollments}
            sessions={sessions}
            attendance={attendance}
            grades={grades}
          />
        </section>
      )}

      {activeTab === 'sessions' && (
        <section aria-labelledby="sessions-heading">
          <h2 id="sessions-heading" className="sr-only">
            Sesiones y material
          </h2>
          <InstructorSessions
            cohortId={String(cohort.id)}
            sessions={sessions}
            modules={modules}
            enrollments={enrollments}
            onDataChange={onDataChange}
          />
        </section>
      )}

      {activeTab === 'grades' && (
        <section aria-labelledby="grades-heading">
          <h2 id="grades-heading" className="sr-only">
            Calificaciones por módulo
          </h2>
          <InstructorGrades
            enrollments={enrollments}
            modules={modules}
            grades={grades}
            onDataChange={onDataChange}
          />
        </section>
      )}
    </div>
  );
}
