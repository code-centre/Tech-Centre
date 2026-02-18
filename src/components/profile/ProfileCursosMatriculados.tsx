'use client';

import { GraduationCap, Clock, BookOpen, Calendar, Sparkles, ArrowRight, Loader2, TrendingUp, CheckCircle2, Circle, Info, User, MessageCircle, Home, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { formatDate } from '../../../utils/formatDate';
import InstructorPanel from './InstructorPanel';

interface ProfileCursosMatriculadosProps {
  user: any;
}

interface EnrolledCourse {
  id: string;
  cohort_id: string;
  student_id: string;
  status: string;
  agreed_price: number;
  cohorts: {
    id: string;
    program_id: string;
    name: string;
    modality: string;
    start_date: string | null;
    end_date: string | null;
    schedule: {
      days: string[];
      hours: string[];
    } | null;
    programs: {
      id: string;
      name: string;
      total_hours: number;
      difficulty: string;
      image: string;
      code: string;
      slug: string | null;
    } | null;
  } | null;
}

type CourseStatus = 'upcoming' | 'in-progress' | 'completed';

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

function formatSchedule(schedule: { days: string[]; hours: string[] } | null): string {
  if (!schedule || !schedule.days || !schedule.hours || schedule.days.length === 0) {
    return 'No disponible';
  }

  const days = schedule.days.join(' y ');
  const hours = schedule.hours.length > 0 ? schedule.hours[0] : '';

  return `${days}${hours ? `, ${hours}` : ''}`;
}

function CourseCard({ course, isAdminView = false }: { course: EnrolledCourse; isAdminView?: boolean }) {
  const [showDetails, setShowDetails] = useState(false);
  const program = course.cohorts?.programs;
  const difficulty = program?.difficulty || 'BÁSICO';
  const startDate = course.cohorts?.start_date ? formatDate(course.cohorts.start_date) : null;
  const endDate = course.cohorts?.end_date ? formatDate(course.cohorts.end_date) : null;
  const courseStatus = getCourseStatus(course.cohorts?.start_date || null, course.cohorts?.end_date || null);
  const scheduleText = formatSchedule(course.cohorts?.schedule || null);

  const linkHref = isAdminView ? `/admin/cohortes/${course.cohort_id}` : `/perfil/cursos/${course.cohort_id}`;

  return (
    <div className="bg-[var(--card-background)] rounded-xl border border-border-color overflow-hidden shadow-lg">
      <div className="flex flex-col md:flex-row">
        {/* Image + main content */}
        <Link href={linkHref} className="group flex-1 flex flex-col md:flex-row min-w-0">
          <div className="relative w-full md:w-64 h-40 md:h-auto flex-shrink-0 overflow-hidden">
            {program?.image ? (
              <Image
                src={program.image}
                alt={program.name || 'Curso'}
                width={400}
                height={200}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-blue-600/20 flex items-center justify-center">
                <GraduationCap className="w-16 h-16 text-secondary/50" />
              </div>
            )}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <div
                className={`${
                  difficulty === 'BÁSICO'
                    ? 'bg-emerald-500/90'
                    : difficulty === 'INTERMEDIO'
                      ? 'bg-amber-500/90'
                      : difficulty === 'AVANZADO'
                        ? 'bg-red-500/90'
                        : 'bg-secondary/90'
                } text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1`}
              >
                <TrendingUp className="h-3 w-3" />
                {difficulty}
              </div>
              <div
                className={`${
                  courseStatus === 'upcoming'
                    ? 'bg-amber-500/90'
                    : courseStatus === 'in-progress'
                      ? 'bg-green-500/90'
                      : 'bg-blue-500/90'
                } text-white text-xs font-bold px-2.5 py-1 rounded-full`}
              >
                {courseStatus === 'upcoming' ? 'Inicio próximo' : courseStatus === 'in-progress' ? 'En curso' : 'Finalizado'}
              </div>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col min-w-0">
            <h3 className="text-xl font-bold text-text-primary mb-1 group-hover:text-secondary transition-colors line-clamp-2">
              {program?.name || 'Curso sin nombre'}
            </h3>
            {course.cohorts?.name && (
              <p className="text-sm text-text-muted mb-4">{course.cohorts.name}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              {(startDate || endDate) && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Calendar className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>{startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate}</span>
                </div>
              )}
              {course.cohorts?.modality && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Home className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>{course.cohorts.modality}</span>
                </div>
              )}
              {scheduleText !== 'No disponible' && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>{scheduleText}</span>
                </div>
              )}
              {program?.total_hours && (
                <div className="flex items-center gap-2 text-text-muted">
                  <BookOpen className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>{program.total_hours} horas</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 text-secondary text-sm font-medium group-hover:gap-3 transition-all">
              <span>Ver programa</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Collapsible section: admin gets "Gestionar cohorte", students get "¿Qué sigue ahora?" */}
      <div className="border-t border-border-color">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-medium text-text-muted hover:text-text-primary hover:bg-bg-secondary/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            {isAdminView ? 'Gestionar cohorte' : '¿Qué sigue ahora?'}
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showDetails && (
          <div className="px-6 pb-6 pt-2 space-y-4 bg-bg-secondary/30">
            {isAdminView ? (
              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  href={linkHref}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Ir al panel de administración
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-text-primary">Inscripción confirmada</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Circle className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <span className="text-sm text-text-muted">Acceso a la comunidad</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Circle className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <span className="text-sm text-text-muted">Material de bienvenida</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Circle className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <span className="text-sm text-text-muted">Calendario de clases</span>
                  </div>
                </div>
                <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text-primary leading-relaxed">
                      El seguimiento de clases y materiales estará disponible cuando inicie el programa.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    href={linkHref}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-bg-secondary hover:bg-bg-primary rounded-lg transition-colors border border-border-color"
                  >
                    <BookOpen className="w-4 h-4" />
                    Ver detalles del programa
                  </Link>
                  <Link
                    href="/perfil/datos-personales"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-bg-secondary hover:bg-bg-primary rounded-lg transition-colors border border-border-color"
                  >
                    <User className="w-4 h-4" />
                    Actualizar mis datos
                  </Link>
                  <a
                    href="https://wa.me/573005523872?text=Hola%2C%20necesito%20soporte%20con%20mi%20curso"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-bg-secondary hover:bg-bg-primary rounded-lg transition-colors border border-border-color"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contactar soporte
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfileCursosMatriculados({ user }: ProfileCursosMatriculadosProps) {
  const supabase = useSupabaseClient();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isInstructorInCohort, setIsInstructorInCohort] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        if (isAdmin) {
          const today = new Date().toISOString().split('T')[0];
          const [cohortsRes, instructorCohortsRes] = await Promise.all([
            supabase
              .from('cohorts')
              .select(
                `
                *,
                schedule,
                programs:program_id (*)
              `
              )
              .gte('end_date', today)
              .order('start_date', { ascending: true }),
            supabase
              .from('cohort_instructors')
              .select(
                `
                cohort:cohorts (
                  *,
                  schedule,
                  programs:program_id (*)
                )
              `
              )
              .eq('instructor_id', user.id),
          ]);

          if (cohortsRes.error) throw cohortsRes.error;

          const toCourse = (row: any, prefix: string): EnrolledCourse => {
            const cohort = row;
            const programs = cohort?.programs
              ? Array.isArray(cohort.programs)
                ? cohort.programs[0]
                : cohort.programs
              : null;
            return {
              id: `${prefix}-${cohort.id}`,
              cohort_id: String(cohort.id),
              student_id: '',
              status: '',
              agreed_price: 0,
              cohorts: cohort
                ? { ...cohort, programs, schedule: cohort.schedule || null }
                : null,
            };
          };

          const activeCourses = (cohortsRes.data || []).map((row: any) => toCourse(row, 'admin'));
          const seenIds = new Set(activeCourses.map((c) => c.cohort_id));

          const instructorRaw = (instructorCohortsRes.data || []) as Array<{ cohort: any }>;
          const instructorCourses: EnrolledCourse[] = instructorRaw
            .map((r) => {
              const c = r.cohort;
              const cohort = Array.isArray(c) ? c[0] : c;
              return cohort ? toCourse(cohort, 'instructor') : null;
            })
            .filter((c): c is EnrolledCourse => !!c && !seenIds.has(c.cohort_id));

          const merged = [...activeCourses, ...instructorCourses].sort(
            (a, b) =>
              new Date(a.cohorts?.start_date || 0).getTime() -
              new Date(b.cohorts?.start_date || 0).getTime()
          );

          setEnrolledCourses(merged);
          setIsInstructorInCohort(instructorRaw.length > 0);
        } else {
          const [enrollmentsRes, cohortInstructorsRes] = await Promise.all([
            supabase
              .from('enrollments')
              .select(
                `
              *,
              cohorts (
              *,
              schedule,
              programs (*)
            )
          `
              )
              .eq('student_id', user.id),
            supabase
              .from('cohort_instructors')
              .select('instructor_id')
              .eq('instructor_id', user.id)
              .limit(1),
          ]);

          if (enrollmentsRes.error) throw enrollmentsRes.error;

          const transformedEnrollments = (enrollmentsRes.data || []).map((enrollment: any) => {
            const cohort = Array.isArray(enrollment.cohorts) ? enrollment.cohorts[0] : enrollment.cohorts;
            const programs = cohort?.programs ? (Array.isArray(cohort.programs) ? cohort.programs[0] : cohort.programs) : null;

            return {
              ...enrollment,
              cohorts: cohort ? { ...cohort, programs, schedule: cohort.schedule || null } : null,
            };
          });

          setEnrolledCourses(transformedEnrollments);
          setIsInstructorInCohort((cohortInstructorsRes.data?.length ?? 0) > 0);
        }
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError('Error al cargar los cursos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, isAdmin, supabase]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <GraduationCap className="text-secondary" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Mis Cursos Matriculados</h2>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-secondary" />
            <p className="text-text-muted text-sm">Cargando tus cursos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <GraduationCap className="text-secondary" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Mis Cursos Matriculados</h2>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isInstructorInCohort && (
        <InstructorPanel />
      )}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <GraduationCap className="text-secondary" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              {isAdmin ? 'Cursos activos' : 'Mis Cursos Matriculados'}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {enrolledCourses.length > 0
                ? isAdmin
                  ? `${enrolledCourses.length} ${enrolledCourses.length === 1 ? 'curso activo' : 'cursos activos'}`
                  : `${enrolledCourses.length} ${enrolledCourses.length === 1 ? 'curso matriculado' : 'cursos matriculados'}`
                : isAdmin
                  ? 'No hay cursos activos en este momento'
                  : 'Gestiona tus cursos y avanza en tu aprendizaje'}
            </p>
          </div>
        </div>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color overflow-hidden shadow-lg">
          <div className="px-8 py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 mb-6">
              <Sparkles className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-3">
              {isAdmin ? 'No hay cursos activos' : '¡Comienza tu viaje de aprendizaje!'}
            </h3>
            <p className="text-lg text-text-muted mb-2 max-w-md mx-auto">
              {isAdmin
                ? 'No hay cohortes con fechas vigentes en este momento.'
                : 'Aún no te has matriculado en ningún curso, pero eso está a punto de cambiar.'}
            </p>
            {!isAdmin && (
              <>
                <p className="text-base text-text-muted opacity-80 mb-8 max-w-md mx-auto">
                  Explora nuestra oferta académica y encuentra el programa perfecto para impulsar tu carrera profesional.
                </p>
                <Link
                  href="/programas-academicos"
                  className="btn-primary inline-flex items-center gap-2 px-8 py-4"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Explorar Cursos Disponibles</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {enrolledCourses.map((course) => (
            <CourseCard key={course.id} course={course} isAdminView={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}
