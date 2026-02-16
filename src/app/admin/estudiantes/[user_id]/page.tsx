import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';
import StudentProfileEditor from '@/components/adminspage/StudentProfileEditor';

export const metadata: Metadata = {
  title: 'Detalles del Estudiante',
};

interface Props {
  params: Promise<{ user_id: string }>;
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'student':
      return 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30';
    case 'instructor':
      return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30';
    case 'admin':
      return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30';
    case 'lead':
      return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30';
    default:
      return 'bg-bg-secondary text-text-muted border border-border-color';
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'student':
      return 'Estudiante';
    case 'instructor':
      return 'Instructor';
    case 'admin':
      return 'Admin';
    case 'lead':
      return 'Lead';
    default:
      return role;
  }
}

export default async function StudentDetailPage({ params }: Props) {
  const { user_id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (!profile) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Usuario no encontrado</h1>
        <p className="text-text-muted mb-4">
          El usuario que buscas no existe o fue eliminado.
        </p>
        <Link href="/admin/estudiantes" className="btn-primary inline-flex items-center gap-2">
          Volver a usuarios
        </Link>
      </div>
    );
  }

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(
      `
      id,
      status,
      agreed_price,
      created_at,
      cohort:cohorts(
        id,
        name,
        start_date,
        end_date,
        modality,
        program:programs(id, name, code)
      )
    `
    )
    .eq('student_id', user_id)
    .order('created_at', { ascending: false });

  const enrollmentIds = (enrollments || []).map((e: { id: number }) => e.id);
  let invoices: Array<{
    id: number;
    enrollment_id: number;
    label: string;
    amount: number;
    due_date: string;
    status: string;
    paid_at: string | null;
    url_recipe: string | null;
  }> = [];

  if (enrollmentIds.length > 0) {
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('id, enrollment_id, label, amount, due_date, status, paid_at, url_recipe')
      .in('enrollment_id', enrollmentIds)
      .order('due_date', { ascending: true });
    invoices = invoicesData || [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const typedProfile = profile as {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    role: string;
    professional_title?: string;
    linkedin_url?: string;
    created_at: string;
  };

  return (
    <div className="space-y-8">
      {/* Header card */}
      <article
        className="bg-[var(--card-background)] rounded-lg shadow-lg border border-border-color overflow-hidden"
        aria-labelledby="student-header-title"
      >
        <div className="p-6">
          <Link
            href={
              typedProfile.role === 'instructor'
                ? '/admin/instructores'
                : typedProfile.role === 'admin'
                  ? '/admin/admins'
                  : '/admin/estudiantes'
            }
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-secondary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a{' '}
            {typedProfile.role === 'instructor'
              ? 'instructores'
              : typedProfile.role === 'admin'
                ? 'admins'
                : 'estudiantes'}
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 id="student-header-title" className="text-2xl font-bold text-text-primary">
                {typedProfile.first_name} {typedProfile.last_name}
              </h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-secondary" />
                  {typedProfile.email}
                </span>
                {typedProfile.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-secondary" />
                    {typedProfile.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-secondary" />
                  Registro: {new Date(typedProfile.created_at).toLocaleDateString('es-CO')}
                </span>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass(
                typedProfile.role
              )}`}
            >
              {getRoleLabel(typedProfile.role)}
            </span>
          </div>
        </div>
      </article>

      {/* Enrollments section */}
      <section
        className="bg-[var(--card-background)] rounded-lg shadow border border-border-color overflow-hidden"
        aria-labelledby="enrollments-heading"
      >
        <div className="p-4 border-b border-border-color">
          <h2 id="enrollments-heading" className="text-xl font-semibold text-text-primary">
            Cursos inscritos
          </h2>
        </div>
        <div className="p-4">
          {!enrollments || enrollments.length === 0 ? (
            <p className="text-text-muted py-8 text-center">
              No hay inscripciones registradas.
            </p>
          ) : (
            <ul className="space-y-3">
              {(enrollments as Array<{
                id: number;
                status: string;
                agreed_price: number;
                created_at: string;
                cohort: {
                  id: string;
                  name: string;
                  start_date: string;
                  end_date: string;
                  modality?: string;
                  program: { id: number; name: string; code?: string } | null;
                } | null;
              }>).map((enrollment) => {
                const cohort = enrollment.cohort;
                const programRaw = cohort?.program;
                const program = Array.isArray(programRaw) ? programRaw[0] : programRaw;
                const endDate = cohort?.end_date ? new Date(cohort.end_date) : null;
                endDate?.setHours(0, 0, 0, 0);
                const isActive = endDate ? endDate >= today : false;
                return (
                  <li
                    key={enrollment.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border-2 ${
                      isActive
                        ? 'bg-green-500/10 border-green-500/50'
                        : 'bg-amber-500/5 border-amber-700/30'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {program?.name || 'Programa'}
                      </p>
                      <p className="text-sm text-text-muted">
                        Cohorte: {cohort?.name || '—'} •{' '}
                        {cohort?.start_date && cohort?.end_date
                          ? `${new Date(cohort.start_date).toLocaleDateString('es-CO')} – ${new Date(cohort.end_date).toLocaleDateString('es-CO')}`
                          : '—'}
                        {cohort?.modality && ` • ${cohort.modality}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${
                          isActive
                            ? 'bg-green-500 text-white'
                            : 'bg-amber-600/90 text-white'
                        }`}
                      >
                        {isActive ? 'Activa' : 'Pasada'}
                      </span>
                      <span className="text-sm text-text-muted">
                        ${enrollment.agreed_price?.toLocaleString() || '—'}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Invoices section */}
      <section
        className="bg-[var(--card-background)] rounded-lg shadow border border-border-color overflow-hidden"
        aria-labelledby="invoices-heading"
      >
        <div className="p-4 border-b border-border-color">
          <h2 id="invoices-heading" className="text-xl font-semibold text-text-primary">
            Historial de pagos
          </h2>
        </div>
        <div className="p-4 overflow-x-auto">
          {invoices.length === 0 ? (
            <p className="text-text-muted py-8 text-center">No hay facturas registradas.</p>
          ) : (
            <table className="min-w-full divide-y divide-border-color">
              <thead className="bg-bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">
                    Concepto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">
                    Vence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">
                    Pagado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-bg-secondary/30">
                    <td className="px-4 py-3 text-sm text-text-primary">{inv.label}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">
                      {new Date(inv.due_date).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary font-medium">
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          inv.status === 'paid'
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {inv.status === 'paid' ? 'Pagada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">
                      {inv.paid_at
                        ? new Date(inv.paid_at).toLocaleDateString('es-CO')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Profile editor */}
      <StudentProfileEditor profile={typedProfile} />
    </div>
  );
}
