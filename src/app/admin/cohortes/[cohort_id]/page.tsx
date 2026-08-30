'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabase';
import EnrollmentModal from '@/components/adminspage/EnrollmentModal';
import SessionsList from '@/components/adminspage/SessionsList';
import InstructorGrades from '@/components/instructor/InstructorGrades';
import { CohortEditModal, formatCohortSchedule } from '@/components/adminspage/CohortEditModal';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
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
import type { Session, ProgramModule, Grade } from '@/types/supabase';
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
  const [activeTab, setActiveTab] = useState<'students' | 'classes' | 'grades'>('students');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [attendanceRows, setAttendanceRows] = useState<{ session_id: number; enrollment_id: number; status: string }[]>([]);
  const [gradeRows, setGradeRows] = useState<Grade[]>([]);
  const [invoiceRows, setInvoiceRows] = useState<{ enrollment_id: number; amount: number; status: string; due_date: string }[]>([]);

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
          const [{ data: invoicesData }, attendanceRes, gradesRes] = await Promise.all([
            supabase
              .from('invoices')
              .select('enrollment_id, amount, status, due_date')
              .in('enrollment_id', enrollmentIds),
            supabase
              .from('attendance')
              .select('session_id, enrollment_id, status')
              .in('enrollment_id', enrollmentIds),
            supabase.from('grades').select('*').in('enrollment_id', enrollmentIds),
          ]);

          setInvoiceRows(
            (invoicesData ?? []) as { enrollment_id: number; amount: number; status: string; due_date: string }[]
          );
          setAttendanceRows(
            (attendanceRes.data ?? []) as { session_id: number; enrollment_id: number; status: string }[]
          );
          setGradeRows((gradesRes.data ?? []) as Grade[]);

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

  const enrolled = enrollments.length;
  const doneSessions = sessions.filter((s) => {
    const endsAt = new Date(s.ends_at || s.starts_at).getTime();
    return !isNaN(endsAt) && endsAt < Date.now();
  });
  const doneSessionIds = new Set(doneSessions.map((s) => s.id));

  const markedAttendance = attendanceRows.filter((row) => doneSessionIds.has(row.session_id));
  const presentCount = markedAttendance.filter(
    (row) => row.status === 'present' || row.status === 'excused'
  ).length;
  const groupAttendance =
    markedAttendance.length > 0 ? Math.round((presentCount / markedAttendance.length) * 100) : null;

  const collected = invoiceRows
    .filter((row) => row.status === 'paid')
    .reduce((sum, row) => sum + (row.amount ?? 0), 0);
  const billed = invoiceRows.reduce((sum, row) => sum + (row.amount ?? 0), 0);
  const overdue = invoiceRows
    .filter((row) => row.status !== 'paid' && row.due_date && new Date(`${row.due_date}T23:59:59`) < new Date())
    .reduce((sum, row) => sum + (row.amount ?? 0), 0);

  /** Por estudiante: asistencia, notas y cómo va de pagos. */
  const studentRows = enrollments.map((enrollment) => {
    const profile = Array.isArray(enrollment.profiles) ? enrollment.profiles[0] : enrollment.profiles;
    const name = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Sin nombre';
    const mine = markedAttendance.filter((row) => row.enrollment_id === enrollment.id);
    const present = mine.filter((row) => row.status === 'present' || row.status === 'excused').length;
    const grades = gradeRows.filter((row) => row.enrollment_id === enrollment.id);
    const invoices = invoiceRows.filter((row) => row.enrollment_id === enrollment.id);
    const paidInvoices = invoices.filter((row) => row.status === 'paid');
    const overdueInvoices = invoices.filter(
      (row) => row.status !== 'paid' && row.due_date && new Date(`${row.due_date}T23:59:59`) < new Date()
    );
    const pending = invoices
      .filter((row) => row.status !== 'paid')
      .reduce((sum, row) => sum + (row.amount ?? 0), 0);

    return {
      id: enrollment.id as number,
      userId: profile?.user_id as string | undefined,
      name,
      email: profile?.email ?? '',
      percent: mine.length > 0 ? Math.round((present / mine.length) * 100) : null,
      present,
      tracked: mine.length,
      average:
        grades.length > 0
          ? Math.round((grades.reduce((sum, g) => sum + g.value, 0) / grades.length) * 100) / 100
          : null,
      gradedModules: grades.length,
      invoices,
      paidCount: paidInvoices.length,
      overdueCount: overdueInvoices.length,
      pending,
    };
  });

  const atRisk = studentRows.filter((row) => row.percent != null && row.percent < 70);

  return (
    <div className="space-y-5">
      <Link
        href="/admin/cohortes"
        className="inline-flex w-fit items-center gap-2 text-[13.5px] text-text-muted transition-colors hover:text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Cohortes
      </Link>

      {/* Encabezado */}
      <div className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
        <div className="flex flex-wrap items-start justify-between gap-5 px-6 py-[22px]">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span className="inline-flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-secondary/10 p-3 text-text-secondary">
              <Calendar className="h-[26px] w-[26px]" />
            </span>
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[27px] font-bold tracking-tight text-text-primary">{cohortName}</h1>
                {programName && <span className="text-[15px] text-text-muted">{programName}</span>}
                {statusBadge && (
                  <span
                    className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold ${statusBadge.className}`}
                  >
                    {statusBadge.label}
                  </span>
                )}
                <span
                  className="inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold"
                  style={
                    cohort?.offering
                      ? {
                          background: 'color-mix(in srgb, var(--pay-serie-porcobrar) 14%, transparent)',
                          color: 'var(--pay-serie-porcobrar)',
                        }
                      : {
                          background: 'color-mix(in srgb, var(--pay-neutro) 14%, transparent)',
                          color: 'var(--pay-neutro)',
                        }
                  }
                >
                  {cohort?.offering ? 'Visible en el sitio' : 'Oculta del sitio'}
                </span>
              </div>
              {paceLabel && <span className="text-[13.5px] text-text-muted">{paceLabel}.</span>}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border-color bg-bg-secondary px-4 text-sm font-medium text-text-primary transition-colors hover:border-secondary/50"
            >
              <Pencil className="h-4 w-4" />
              Editar cohorte
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-secondary px-[18px] text-sm font-semibold text-[#0E1116] transition-colors hover:bg-secondary/90"
            >
              <UserPlus className="h-4 w-4" />
              Añadir estudiante
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 border-t border-border-color bg-bg-secondary sm:grid-cols-2 xl:grid-cols-4">
          <Fact label="Cuándo">
            {cohort?.start_date && cohort?.end_date
              ? formatDateRange(cohort.start_date, cohort.end_date)
              : '—'}
          </Fact>
          <Fact label="Horario" sub={getModalityLabel(cohort?.modality)}>
            {scheduleText || 'Sin horario'}
          </Fact>
          <Fact label="Ocupación" sub={capacity ? `${Math.max(0, capacity - enrolled)} libres` : undefined}>
            {capacity ? `${enrolled} de ${capacity} cupos` : `${enrolled} matriculados`}
          </Fact>
          <Fact label="Instructor" last>
            {instructorName ?? 'Sin asignar'}
          </Fact>
        </div>
      </div>

      {/* Cómo va */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          dot="var(--pay-serie-cobrado)"
          label="Asistencia promedio"
          value={groupAttendance == null ? '—' : `${groupAttendance}%`}
          note={
            doneSessions.length > 0
              ? `Sobre ${doneSessions.length} ${doneSessions.length === 1 ? 'clase dictada' : 'clases dictadas'}`
              : 'Todavía no hay clases dictadas'
          }
        />
        <Kpi
          dot="var(--secondary)"
          label="Clases dictadas"
          value={`${doneSessions.length} de ${sessions.length}`}
          note={
            sessions.length === 0
              ? 'Sin clases programadas'
              : nextSessionLabel(sessions) ?? 'Todas las clases dictadas'
          }
        />
        <Kpi
          dot="var(--pay-serie-porcobrar)"
          label="Cobrado"
          value={money(collected)}
          note={`De ${money(billed)}${overdue > 0 ? ` · ${money(overdue)} vencidos` : ''}`}
        />
        <Kpi
          dot="var(--pay-critico)"
          label="Estudiantes en riesgo"
          value={String(atRisk.length)}
          note="Asistencia por debajo del 70%"
          alert={atRisk.length > 0}
        />
      </div>

      {/* Pestañas */}
      <div className="flex w-fit items-center gap-1 rounded-[10px] border border-border-color bg-[var(--card-background)] p-1">
        <Tab active={activeTab === 'students'} onClick={() => setActiveTab('students')} count={enrolled}>
          Estudiantes
        </Tab>
        <Tab active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} count={sessions.length}>
          Clases y material
        </Tab>
        <Tab active={activeTab === 'grades'} onClick={() => setActiveTab('grades')} count={modules.length}>
          Notas
        </Tab>
      </div>

      {activeTab === 'students' && (
        <section className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
          <div className="hidden grid-cols-[36px_minmax(0,1fr)_176px_132px_156px_20px] items-center gap-3.5 border-b border-border-color bg-bg-secondary px-4 py-3 lg:grid">
            <span />
            <HeadCell>Estudiante</HeadCell>
            <HeadCell>Asistencia</HeadCell>
            <HeadCell>Notas</HeadCell>
            <HeadCell>Pagos</HeadCell>
            <span />
          </div>

          {studentRows.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13.5px] text-text-muted">
              Todavía no hay estudiantes matriculados en esta cohorte.
            </p>
          ) : (
            studentRows.map((student) => {
              const risky = student.percent != null && student.percent < 70;
              const color = risky
                ? 'var(--pay-critico)'
                : student.percent != null && student.percent < 85
                  ? 'var(--pay-aviso)'
                  : 'var(--pay-serie-cobrado)';

              return (
                <Link
                  key={student.id}
                  href={student.userId ? `/admin/estudiantes/${student.userId}` : '#'}
                  className="grid grid-cols-[36px_minmax(0,1fr)_176px_132px_156px_20px] gap-3.5 items-center border-b border-border-color/50 px-4 py-3 transition-colors last:border-b-0 hover:bg-bg-secondary/40 max-lg:flex max-lg:flex-col max-lg:items-start max-lg:gap-2"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary/12 text-[13px] font-semibold text-secondary">
                    {initialsOf(student.name)}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="flex items-center gap-2 text-[14.5px] font-semibold text-text-primary">
                      {student.name}
                      {risky && (
                        <span
                          className="inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold"
                          style={{
                            background: 'color-mix(in srgb, var(--pay-critico) 14%, transparent)',
                            color: 'var(--pay-critico)',
                          }}
                        >
                          En riesgo
                        </span>
                      )}
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
                      {student.average == null ? '—' : student.average.toFixed(2).replace(/0$/, '')}
                    </span>
                    <span className="text-xs text-text-muted">
                      {student.gradedModules} de {modules.length} módulos
                    </span>
                  </span>

                  <span className="flex flex-col gap-[5px]">
                    <span className="flex gap-[3px]">
                      {student.invoices.length === 0 ? (
                        <span className="text-[12.5px] text-text-muted">Sin facturas</span>
                      ) : (
                        student.invoices.slice(0, 8).map((invoice, index) => (
                          <span
                            key={index}
                            className="h-[5px] grow rounded-[2px]"
                            style={{
                              background:
                                invoice.status === 'paid'
                                  ? 'var(--pay-serie-cobrado)'
                                  : invoice.due_date && new Date(`${invoice.due_date}T23:59:59`) < new Date()
                                    ? 'var(--pay-critico)'
                                    : 'var(--border-color)',
                            }}
                          />
                        ))
                      )}
                    </span>
                    {student.invoices.length > 0 && (
                      <span
                        className="text-[12.5px]"
                        style={{
                          color: student.overdueCount > 0 ? 'var(--pay-critico)' : 'var(--text-muted)',
                        }}
                      >
                        {student.overdueCount > 0
                          ? `${student.overdueCount} vencida${student.overdueCount === 1 ? '' : 's'}`
                          : student.pending === 0
                            ? 'Pagó completo'
                            : `${student.paidCount} de ${student.invoices.length}`}
                      </span>
                    )}
                  </span>

                  <ChevronRight className="h-[18px] w-[18px] text-text-muted" aria-hidden="true" />
                </Link>
              );
            })
          )}
        </section>
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

      {activeTab === 'grades' && (
        <InstructorGrades
          enrollments={enrollments.map((enrollment) => {
            const profile = Array.isArray(enrollment.profiles) ? enrollment.profiles[0] : enrollment.profiles;
            return {
              id: enrollment.id as number,
              student_id: enrollment.student_id,
              profile: {
                first_name: profile?.first_name ?? '',
                last_name: profile?.last_name ?? '',
                email: profile?.email ?? '',
              },
            };
          })}
          modules={modules}
          grades={gradeRows}
          onDataChange={fetchCohortAndStudents}
        />
      )}

      <button
        type="button"
        onClick={() => {
          setDeleteError(null);
          setIsDeleteOpen(true);
        }}
        className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors"
        style={{
          borderColor: 'color-mix(in srgb, var(--pay-critico) 40%, transparent)',
          color: 'var(--pay-critico)',
        }}
      >
        <Trash2 className="h-4 w-4" />
        Eliminar cohorte
      </button>


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
    </div>
  );
}

function money(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CO')}`;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '··';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** «La próxima es el 5 de septiembre», si queda alguna por dictar. */
function nextSessionLabel(sessions: Session[]): string | null {
  const now = Date.now();
  const upcoming = [...sessions]
    .filter((s) => new Date(s.ends_at || s.starts_at).getTime() >= now)
    .sort((a, b) => (a.starts_at || '').localeCompare(b.starts_at || ''))[0];
  if (!upcoming) return null;
  const date = new Date(upcoming.starts_at);
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `La próxima es el ${date.getDate()} de ${months[date.getMonth()]}`;
}

function Fact({
  label,
  children,
  sub,
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  sub?: string;
  last?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-[3px] border-border-color px-6 py-3.5 ${last ? '' : 'xl:border-r'}`}>
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</span>
      <span className="text-[15px] font-semibold text-text-primary">
        {children}
        {sub && <span className="font-normal text-text-muted"> · {sub}</span>}
      </span>
    </div>
  );
}

function Kpi({
  dot,
  label,
  value,
  note,
  alert = false,
}: {
  dot: string;
  label: string;
  value: string;
  note: string;
  alert?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border bg-[var(--card-background)] p-5"
      style={{
        borderColor: alert
          ? 'color-mix(in srgb, var(--pay-critico) 32%, transparent)'
          : 'var(--border-color)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} aria-hidden="true" />
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</span>
      </div>
      <span
        className="text-[26px] font-bold tracking-tight tabular-nums"
        style={{ color: alert ? 'var(--pay-critico)' : 'var(--text-primary)' }}
      >
        {value}
      </span>
      <span className="text-[13px] leading-snug text-text-muted">{note}</span>
    </div>
  );
}

function Tab({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-medium transition-colors ${
        active
          ? 'border-secondary/30 bg-secondary/10 text-text-secondary'
          : 'border-transparent text-text-muted hover:text-text-primary'
      }`}
    >
      {children}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
          active ? 'bg-secondary/20' : 'bg-text-muted/15'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function HeadCell({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">{children}</span>
  );
}
