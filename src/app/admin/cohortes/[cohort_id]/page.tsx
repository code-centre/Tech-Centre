'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabase';
import { StudentsList } from '@/components/adminspage/StudentsList';
import EnrollmentModal from '@/components/adminspage/EnrollmentModal';
import SessionsList from '@/components/adminspage/SessionsList';
import { CohortEditModal, formatCohortSchedule } from '@/components/adminspage/CohortEditModal';
import Link from 'next/link';
import {
  ArrowLeft,
  UserPlus,
  Calendar,
  BookOpen,
  Hash,
  Users,
  BookMarked,
  Trash2,
  TriangleAlert,
  Loader2,
  X,
  Pencil,
  MapPin,
  Clock,
  GraduationCap,
  Eye,
  CreditCard,
} from 'lucide-react';
import type { Session, ProgramModule } from '@/types/supabase';
import {
  formatDateRange,
  parseDateBogota,
  weeksBetween,
  currentWeek,
} from '@/utils/formatDate';

interface InstructorProfile {
  first_name: string;
  last_name?: string;
  email: string;
}

function getCohortStatus(startDate: string, endDate: string): 'por_iniciar' | 'en_curso' | 'terminada' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseDateBogota(startDate);
  start.setHours(0, 0, 0, 0);
  const end = parseDateBogota(endDate);
  end.setHours(0, 0, 0, 0);
  if (today < start) return 'por_iniciar';
  if (today > end) return 'terminada';
  return 'en_curso';
}

function getStatusLabel(status: 'por_iniciar' | 'en_curso' | 'terminada') {
  switch (status) {
    case 'por_iniciar':
      return { label: 'Por iniciar', className: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' };
    case 'terminada':
      return { label: 'Terminada', className: 'bg-text-muted/20 text-text-muted border border-border-color' };
    case 'en_curso':
      return { label: 'En curso', className: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' };
  }
}

function getModalityLabel(modality?: string) {
  switch (modality) {
    case 'virtual':
      return 'Virtual';
    case 'híbrido':
      return 'Híbrido';
    case 'presencial':
    default:
      return 'Presencial';
  }
}

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
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [absencesByEnrollmentId, setAbsencesByEnrollmentId] = useState<Record<number, number>>({});
  const [paymentsByEnrollmentId, setPaymentsByEnrollmentId] = useState<
    Record<number, { paidCount: number; totalCount: number; paidAmount: number; totalAmount: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [cohort, setCohort] = useState<any>(null);
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'classes'>('students');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
            name,
            code,
            default_price
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

      const { data: instructorRow } = await supabase
        .from('cohort_instructors')
        .select(`
          instructor_id,
          profiles:instructor_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('cohort_id', cohortId)
        .maybeSingle();

      const profileData = instructorRow?.profiles;
      const instructorProfile = Array.isArray(profileData) ? profileData[0] : profileData;
      setInstructor(
        instructorProfile
          ? {
              first_name: instructorProfile.first_name,
              last_name: instructorProfile.last_name,
              email: instructorProfile.email,
            }
          : null
      );

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
        setPaymentsByEnrollmentId({});
      } else {
        const enrollmentRows = (enrollmentsRes.data as Enrollment[]) || [];
        setEnrollments(enrollmentRows);

        const enrollmentIds = enrollmentRows
          .map((e) => e.id)
          .filter((id): id is number => id != null);

        if (enrollmentIds.length > 0) {
          const { data: invoicesData } = await supabase
            .from('invoices')
            .select('enrollment_id, amount, status')
            .in('enrollment_id', enrollmentIds);

          const paymentsMap: Record<
            number,
            { paidCount: number; totalCount: number; paidAmount: number; totalAmount: number; invoiceTotal: number }
          > = {};

          enrollmentRows.forEach((e) => {
            if (e.id == null) return;
            paymentsMap[e.id] = {
              paidCount: 0,
              totalCount: 0,
              paidAmount: 0,
              totalAmount: e.agreed_price ?? 0,
              invoiceTotal: 0,
            };
          });

          (invoicesData || []).forEach((inv: { enrollment_id: number; amount: number; status: string }) => {
            const summary = paymentsMap[inv.enrollment_id];
            if (!summary) return;
            summary.totalCount += 1;
            summary.invoiceTotal += inv.amount ?? 0;
            if (inv.status === 'paid') {
              summary.paidCount += 1;
              summary.paidAmount += inv.amount ?? 0;
            }
          });

          const finalPayments: Record<
            number,
            { paidCount: number; totalCount: number; paidAmount: number; totalAmount: number }
          > = {};

          Object.entries(paymentsMap).forEach(([id, summary]) => {
            finalPayments[Number(id)] = {
              paidCount: summary.paidCount,
              totalCount: summary.totalCount,
              paidAmount: summary.paidAmount,
              totalAmount: summary.totalAmount > 0 ? summary.totalAmount : summary.invoiceTotal,
            };
          });

          setPaymentsByEnrollmentId(finalPayments);
        } else {
          setPaymentsByEnrollmentId({});
        }
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

      const sessionIds = ((sessionsRes.data as Session[]) || []).map((s) => s.id);
      if (sessionIds.length > 0) {
        const { data: attData } = await supabase
          .from('attendance')
          .select('enrollment_id')
          .in('session_id', sessionIds)
          .eq('status', 'absent');
        const counts: Record<number, number> = {};
        (attData || []).forEach((r: { enrollment_id: number }) => {
          counts[r.enrollment_id] = (counts[r.enrollment_id] ?? 0) + 1;
        });
        setAbsencesByEnrollmentId(counts);
      } else {
        setAbsencesByEnrollmentId({});
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

  /**
   * Borra la cohorte. Se bloquea si tiene matriculados: con estudiantes de por
   * medio hay pagos y notas colgando, y no vamos a borrarlos en cascada desde aquí.
   */
  const handleDeleteCohort = async () => {
    if (enrollments.length > 0) return;
    try {
      setDeleting(true);
      setDeleteError(null);

      // La asignación de instructor es una fila puente: se puede limpiar.
      await supabase.from('cohort_instructors').delete().eq('cohort_id', cohortId);

      const { error } = await supabase.from('cohorts').delete().eq('id', cohortId);
      if (error) throw error;

      router.push('/admin/cohortes');
      router.refresh();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Error desconocido';
      console.error('Error al eliminar la cohorte:', err);
      setDeleteError(message);
      setDeleting(false);
    }
  };

  const programName = Array.isArray(cohort?.programs)
    ? cohort?.programs?.[0]?.name
    : cohort?.programs?.name;
  const programCode = Array.isArray(cohort?.programs)
    ? cohort?.programs?.[0]?.code
    : cohort?.programs?.code;
  const cohortName = cohort?.name || `Cohorte ${cohortId}`;
  const cohortStatus =
    cohort?.start_date && cohort?.end_date
      ? getCohortStatus(cohort.start_date, cohort.end_date)
      : null;
  const statusBadge = cohortStatus ? getStatusLabel(cohortStatus) : null;
  const totalWeeks =
    cohort?.start_date && cohort?.end_date
      ? weeksBetween(cohort.start_date, cohort.end_date)
      : null;
  const paceLabel =
    cohortStatus === 'en_curso' && cohort?.start_date && cohort?.end_date && totalWeeks
      ? `Semana ${currentWeek(cohort.start_date, cohort.end_date)} de ${totalWeeks}`
      : totalWeeks
        ? `${totalWeeks} semanas`
        : null;
  const scheduleText = formatCohortSchedule(cohort?.schedule);
  const instructorName = instructor
    ? `${instructor.first_name}${instructor.last_name ? ` ${instructor.last_name}` : ''}`
    : null;
  const capacity = cohort?.capacity && cohort.capacity > 0 ? cohort.capacity : null;

  const detailItems = [
    { label: 'ID', value: String(cohort?.id ?? '—'), icon: Hash },
    { label: 'Programa', value: programName ? `${programName}${programCode ? ` (${programCode})` : ''}` : '—', icon: BookOpen },
    { label: 'Sede', value: cohort?.campus || '—', icon: MapPin },
    { label: 'Modalidad', value: getModalityLabel(cohort?.modality), icon: GraduationCap },
    {
      label: 'Calendario',
      value:
        cohort?.start_date && cohort?.end_date
          ? formatDateRange(cohort.start_date, cohort.end_date)
          : '—',
      hint: paceLabel ?? undefined,
      icon: Calendar,
    },
    { label: 'Horario', value: scheduleText, icon: Clock },
    {
      label: 'Capacidad',
      value: capacity ? `${enrollments.length} matriculados de ${capacity}` : `${enrollments.length} matriculados · sin límite`,
      icon: Users,
    },
    {
      label: 'Cuotas máximas',
      value: String(cohort?.maximum_payments ?? 1),
      icon: CreditCard,
    },
    {
      label: 'Instructor',
      value: instructorName ?? 'Sin asignar',
      hint: instructor?.email,
      icon: GraduationCap,
    },
    {
      label: 'Visible en el sitio',
      value: cohort?.offering ? 'Sí, aparece en oferta' : 'No, oculta',
      icon: Eye,
    },
  ];

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <article
        className="bg-[var(--card-background)] rounded-xl border border-border-color shadow-lg overflow-hidden"
        aria-labelledby="cohort-header-title"
      >
        <div className="p-6">
          <Link
            href="/admin/cohortes"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Cohortes
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <h1
                id="cohort-header-title"
                className="text-2xl md:text-3xl font-bold text-text-primary mb-3 flex flex-wrap items-center gap-3"
              >
                <span className="inline-flex items-center gap-3">
                  <span className="p-2.5 bg-secondary/10 rounded-xl">
                    <Calendar className="w-7 h-7 text-text-secondary" />
                  </span>
                  {cohortName}
                </span>
                {statusBadge && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${statusBadge.className}`}
                  >
                    {cohortStatus === 'en_curso' && (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                    )}
                    {statusBadge.label}
                  </span>
                )}
              </h1>

              <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {detailItems.map(({ label, value, hint, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border-color bg-bg-secondary/30 px-4 py-3.5"
                  >
                    <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                      <Icon className="h-3.5 w-3.5 text-text-secondary" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="mt-1.5 text-sm font-semibold text-text-primary">{value}</dd>
                    {hint && <dd className="mt-0.5 text-xs text-text-muted">{hint}</dd>}
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border-color px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
              >
                <Pencil className="h-4 w-4" />
                Editar cohorte
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setIsDeleteOpen(true);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-red-500/40 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar cohorte
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Añadir Estudiante
              </button>
            </div>
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
                ? 'text-text-secondary border-b-2 border-secondary bg-bg-secondary/30'
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
                ? 'text-text-secondary border-b-2 border-secondary bg-bg-secondary/30'
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
          cohortId={cohortId}
          onUserExpelled={fetchCohortAndStudents}
          absencesByEnrollmentId={absencesByEnrollmentId}
          paymentsByEnrollmentId={paymentsByEnrollmentId}
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

      <CohortEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        cohort={
          cohort
            ? {
                id: String(cohort.id),
                name: cohort.name,
                campus: cohort.campus,
                modality: cohort.modality,
                start_date: cohort.start_date,
                end_date: cohort.end_date,
                capacity: cohort.capacity,
                program_id: String(cohort.program_id),
                maximum_payments: cohort.maximum_payments,
                schedule: cohort.schedule,
              }
            : null
        }
        onSaved={fetchCohortAndStudents}
      />

      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cohortId={cohortId}
        cohortName={cohort?.name}
        programDefaultPrice={
          cohort?.programs
            ? (Array.isArray(cohort.programs)
                ? cohort.programs[0]?.default_price
                : cohort.programs?.default_price) ?? undefined
            : undefined
        }
        onEnrollmentCreated={handleEnrollmentCreated}
      />

      {isDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-cohort-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-border-color bg-[var(--card-background)] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-red-500/10 text-red-600 dark:text-red-400">
                  <TriangleAlert className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="delete-cohort-title"
                    className="text-lg font-semibold text-text-primary"
                  >
                    {enrollments.length > 0
                      ? 'Esta cohorte no se puede eliminar'
                      : '¿Eliminar esta cohorte?'}
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">{cohortName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="p-1 text-text-muted transition-colors hover:text-text-primary"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {enrollments.length > 0 ? (
              <>
                <p className="mt-5 text-[14.5px] leading-relaxed text-text-muted">
                  Tiene{' '}
                  <strong className="font-semibold text-text-primary">
                    {enrollments.length}{' '}
                    {enrollments.length === 1 ? 'estudiante matriculado' : 'estudiantes matriculados'}
                  </strong>
                  , con sus pagos y notas asociados. Saca a los estudiantes desde la
                  pestaña Estudiantes antes de eliminarla, o déjala oculta en el sitio
                  si solo quieres que deje de aparecer.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(false)}
                    className="inline-flex h-11 items-center rounded-lg border border-border-color px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
                  >
                    Entendido
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-5 text-[14.5px] leading-relaxed text-text-muted">
                  No tiene estudiantes matriculados, así que se puede eliminar. Esta
                  acción no se puede deshacer: se borra la cohorte y la asignación de
                  su instructor.
                </p>

                {deleteError && (
                  <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
                    No se pudo eliminar: {deleteError}
                  </p>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(false)}
                    disabled={deleting}
                    className="inline-flex h-11 items-center rounded-lg border border-border-color px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCohort}
                    disabled={deleting}
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Eliminar cohorte
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}