'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabase';
import { StudentsList } from '@/components/adminspage/StudentsList';
import EnrollmentModal from '@/components/adminspage/EnrollmentModal';
import SessionsList from '@/components/adminspage/SessionsList';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Calendar, BookOpen, Hash, Users, BookMarked } from 'lucide-react';
import type { Session, ProgramModule } from '@/types/supabase';

interface Profile {
  user_id: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
}

interface Enrollment {
  id: number;
  cohort_id: number;
  student_id: string;
  status: string;
  agreed_price: number;
  created_at: string;
  profiles?: Profile | null;
  profile?: Profile | null;
  cohort: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    program: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export default function CohortStudentsPage() {
  const params = useParams();
  const supabase = useSupabaseClient();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [cohort, setCohort] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'classes'>('students');

  const cohortId = params.cohort_id as string;

  useEffect(() => {
    fetchCohortAndStudents();
  }, [cohortId]);

  const fetchCohortAndStudents = async () => {
    try {
      setLoading(true);

      const { data: cohortData, error: cohortError } = await supabase
        .from('cohorts')
        .select(`
          *,
          programs:program_id (
            id,
            name
          )
        `)
        .eq('id', cohortId)
        .single();

      if (cohortError) {
        console.error('Error fetching cohort:', cohortError);
        setLoading(false);
        return;
      }

      setCohort(cohortData);

      const programId = cohortData?.program_id ?? (Array.isArray(cohortData?.programs)
        ? cohortData?.programs?.[0]?.id
        : cohortData?.programs?.id);

      const [enrollmentsRes, sessionsRes, modulesRes] = await Promise.all([
        supabase
          .from('enrollments')
          .select(`
            *,
            profiles:student_id (
              user_id,
              first_name,
              last_name,
              email,
              phone,
              role
            )
          `)
          .eq('cohort_id', cohortId)
          .order('created_at', { ascending: false }),
        supabase
          .from('sessions')
          .select('*')
          .eq('cohort_id', cohortId)
          .order('starts_at', { ascending: true }),
        programId
          ? supabase
              .from('program_modules')
              .select('*')
              .eq('program_id', programId)
              .order('order_index', { ascending: true })
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (enrollmentsRes.error) {
        console.error('Error fetching enrollments:', enrollmentsRes.error);
      } else {
        setEnrollments((enrollmentsRes.data as Enrollment[]) || []);
      }

      if (sessionsRes.error) {
        console.error('Error fetching sessions:', sessionsRes.error);
      } else {
        setSessions((sessionsRes.data as Session[]) || []);
      }

      if (modulesRes.error) {
        console.error('Error fetching modules:', modulesRes.error);
      } else {
        setModules((modulesRes.data as ProgramModule[]) || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in fetchCohortAndStudents:', error);
      setLoading(false);
    }
  };

  const handleEnrollmentCreated = () => {
    fetchCohortAndStudents();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  const programName = Array.isArray(cohort?.programs)
    ? cohort?.programs?.[0]?.name
    : cohort?.programs?.name;
  const cohortName = cohort?.name || `Cohorte ${cohortId}`;

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <article
        className="bg-[var(--card-background)] rounded-xl border border-border-color shadow-lg overflow-hidden"
        aria-labelledby="cohort-header-title"
      >
        <div className="p-6">
          <Link
            href="/admin/cohortes"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-secondary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Cohortes
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <h1
                id="cohort-header-title"
                className="text-2xl md:text-3xl font-bold text-text-primary mb-4 flex items-center gap-3"
              >
                <div className="p-2.5 bg-secondary/10 rounded-xl">
                  <Calendar className="w-7 h-7 text-secondary" />
                </div>
                {cohortName}
              </h1>
              <div className="flex flex-wrap gap-6 text-sm">
                <span className="flex items-center gap-2 text-text-muted">
                  <Hash className="w-4 h-4 text-secondary" />
                  <span className="text-text-primary font-medium">ID:</span>
                  {cohort?.id}
                </span>
                <span className="flex items-center gap-2 text-text-muted">
                  <BookOpen className="w-4 h-4 text-secondary" />
                  <span className="text-text-primary font-medium">Programa:</span>
                  {programName || '—'}
                </span>
                <span className="flex items-center gap-2 text-text-muted">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span className="text-text-primary font-medium">Fechas:</span>
                  {cohort?.start_date} — {cohort?.end_date}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-primary inline-flex items-center gap-2 shrink-0"
            >
              <UserPlus className="w-5 h-5" />
              Añadir Estudiante
            </button>
          </div>
        </div>

        <nav
          className="flex border-t border-border-color"
          aria-label="Tabs de cohorte"
        >
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
            Estudiantes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'classes'
                ? 'text-secondary border-b-2 border-secondary bg-bg-secondary/30'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary/20'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            Clases y Material
          </button>
        </nav>
      </article>

      {activeTab === 'students' && (
        <StudentsList
          enrollments={enrollments}
          showCohortInfo={false}
        />
      )}

      {activeTab === 'classes' && (
        <SessionsList
          sessions={sessions}
          modules={modules}
          enrollments={enrollments}
          cohortId={cohortId}
          onDataChange={fetchCohortAndStudents}
        />
      )}

      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cohortId={cohortId}
        cohortName={cohort?.name}
        onEnrollmentCreated={handleEnrollmentCreated}
      />
    </main>
  );
}