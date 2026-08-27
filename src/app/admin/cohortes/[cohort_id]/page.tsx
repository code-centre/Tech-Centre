'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabase';
import { StudentsList } from '@/components/adminspage/StudentsList';
import EnrollmentModal from '@/components/adminspage/EnrollmentModal';
import SessionsList from '@/components/adminspage/SessionsList';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Calendar, BookOpen, Hash, Users, BookMarked, Trash2, TriangleAlert, Loader2, X } from 'lucide-react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors mb-4"
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
                  <Calendar className="w-7 h-7 text-text-secondary" />
                </div>
                {cohortName}
              </h1>
              <div className="flex flex-wrap gap-6 text-sm">
                <span className="flex items-center gap-2 text-text-muted">
                  <Hash className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-primary font-medium">ID:</span>
                  {cohort?.id}
                </span>
                <span className="flex items-center gap-2 text-text-muted">
                  <BookOpen className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-primary font-medium">Programa:</span>
                  {programName || '—'}
                </span>
                <span className="flex items-center gap-2 text-text-muted">
                  <Calendar className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-primary font-medium">Fechas:</span>
                  {cohort?.start_date} — {cohort?.end_date}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
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