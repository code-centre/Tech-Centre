import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/require-role';
import StudentDetail, {
  type DetailEnrollment,
  type DetailInvoice,
  type DetailLead,
  type DetailProfile,
} from '@/components/adminspage/StudentDetail';
import { formatLeadOrigin, parseLeadNotes } from '@/lib/students';

export const metadata: Metadata = {
  title: 'Ficha del estudiante',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ user_id: string }>;
  searchParams: Promise<{ matricular?: string }>;
}

const STAGE_INTENT: Record<string, string> = {
  diagnostico: 'Pidió un diagnóstico',
  apartar: 'Quiso apartar cupo',
  dudas: 'Escribió con dudas',
  pagos: 'Preguntó por formas de pago',
};

/** PostgREST devuelve las relaciones como objeto o como arreglo. */
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

interface RawEnrollment {
  id: number;
  agreed_price: number | null;
  cohort:
    | {
        id: number;
        name: string | null;
        start_date: string | null;
        end_date: string | null;
        modality: string | null;
        program: { name: string } | { name: string }[] | null;
      }
    | null;
}

export default async function StudentDetailPage({ params, searchParams }: Props) {
  await requireRole(['admin', 'instructor']);
  const { user_id } = await params;
  const { matricular } = await searchParams;
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const callerProfile = authUser
    ? (await supabase.from('profiles').select('role').eq('user_id', authUser.id).single()).data
    : null;
  const canEditRole = (callerProfile as { role?: string } | null)?.role === 'admin';

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (!profileData) {
    return (
      <div className="py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">Usuario no encontrado</h1>
        <p className="mb-4 text-text-muted">El usuario que buscas no existe o fue eliminado.</p>
        <Link href="/admin/estudiantes" className="btn-primary inline-flex items-center gap-2">
          Volver a estudiantes
        </Link>
      </div>
    );
  }

  const profile = profileData as DetailProfile & { id_type: string | null };

  const { data: enrollmentsData } = await supabase
    .from('enrollments')
    .select(
      'id, agreed_price, created_at, cohort:cohorts(id, name, start_date, end_date, modality, program:programs(name))'
    )
    .eq('student_id', user_id)
    .order('created_at', { ascending: false });

  const rawEnrollments = (enrollmentsData ?? []) as unknown as RawEnrollment[];
  const enrollmentIds = rawEnrollments.map((e) => e.id);
  const cohortIds = rawEnrollments.map((e) => e.cohort?.id).filter((id): id is number => id != null);

  // Facturas, sesiones ya dictadas y asistencia: lo que hace falta para
  // responder «cómo va» sin abrir otras pantallas.
  const [invoicesRes, sessionsRes, attendanceRes] = await Promise.all([
    enrollmentIds.length > 0
      ? supabase
          .from('invoices')
          .select('id, enrollment_id, label, amount, due_date, status, paid_at, url_recipe, meta')
          .in('enrollment_id', enrollmentIds)
          .order('due_date', { ascending: true })
      : Promise.resolve({ data: [] }),
    cohortIds.length > 0
      ? supabase.from('sessions').select('id, cohort_id, starts_at').in('cohort_id', cohortIds)
      : Promise.resolve({ data: [] }),
    enrollmentIds.length > 0
      ? supabase
          .from('attendance')
          .select('session_id, enrollment_id, status')
          .in('enrollment_id', enrollmentIds)
      : Promise.resolve({ data: [] }),
  ]);

  const now = Date.now();
  const sessions = (sessionsRes.data ?? []) as { id: number; cohort_id: number; starts_at: string }[];
  const heldByCohort = new Map<number, Set<number>>();
  for (const session of sessions) {
    // Solo cuentan las sesiones que ya ocurrieron: las futuras no son faltas.
    if (session.starts_at && new Date(session.starts_at).getTime() > now) continue;
    const set = heldByCohort.get(session.cohort_id) ?? new Set<number>();
    set.add(session.id);
    heldByCohort.set(session.cohort_id, set);
  }

  const attendanceRows = (attendanceRes.data ?? []) as {
    session_id: number;
    enrollment_id: number;
    status: string;
  }[];
  const presentByEnrollment = new Map<number, Set<number>>();
  for (const row of attendanceRows) {
    if (row.status !== 'present' && row.status !== 'excused') continue;
    const set = presentByEnrollment.get(row.enrollment_id) ?? new Set<number>();
    set.add(row.session_id);
    presentByEnrollment.set(row.enrollment_id, set);
  }

  const enrollments: DetailEnrollment[] = rawEnrollments.map((raw) => {
    const cohort = raw.cohort;
    const program = one(cohort?.program ?? null);
    const held = cohort?.id ? heldByCohort.get(cohort.id) ?? new Set<number>() : new Set<number>();
    const present = presentByEnrollment.get(raw.id) ?? new Set<number>();

    return {
      id: raw.id,
      agreedPrice: raw.agreed_price,
      cohortId: cohort?.id ?? 0,
      cohortName: cohort?.name ?? 'Sin cohorte',
      programName: program?.name ?? 'Sin programa',
      startDate: cohort?.start_date ?? null,
      endDate: cohort?.end_date ?? null,
      modality: cohort?.modality ?? null,
      attendance:
        held.size > 0
          ? {
              total: held.size,
              present: Array.from(present).filter((id) => held.has(id)).length,
            }
          : null,
    };
  });

  const enrollmentById = new Map(enrollments.map((e) => [e.id, e]));

  const invoices: DetailInvoice[] = ((invoicesRes.data ?? []) as DetailInvoice[]).map((invoice) => {
    const enrollment = enrollmentById.get(invoice.enrollment_id);
    return {
      ...invoice,
      programName: enrollment?.programName ?? 'Sin programa',
      cohortName: enrollment?.cohortName ?? 'Sin cohorte',
    };
  });

  // Si esta persona llegó por un formulario, su registro sigue en `leads` y
  // explica de dónde salió.
  let lead: DetailLead | null = null;
  if (profile.email) {
    const { data: leadData } = await supabase
      .from('leads')
      .select('full_name, source, stage, notes, created_at')
      .eq('email', profile.email)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (leadData) {
      const row = leadData as { source: string; stage: string | null; notes: string | null; created_at: string };
      const notes = parseLeadNotes(row.notes);
      lead = {
        createdAt: row.created_at,
        origin: formatLeadOrigin(row.source, notes),
        message: notes.message ?? null,
        interest: notes.program ?? null,
        intent: row.stage ? STAGE_INTENT[row.stage] ?? null : null,
      };
    }
  }

  return (
    <StudentDetail
      profile={profile}
      enrollments={enrollments}
      invoices={invoices}
      lead={lead}
      canEditRole={canEditRole}
      openEnroll={matricular === '1'}
    />
  );
}
