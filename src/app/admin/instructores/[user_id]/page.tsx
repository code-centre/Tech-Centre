import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';
import StudentProfileEditor from '@/components/adminspage/StudentProfileEditor';

export const metadata: Metadata = {
  title: 'Detalles del Instructor',
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

type CohortWithProgram = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  modality?: string;
  program: { id: number; name: string; code?: string } | null;
};

export default async function InstructorDetailPage({ params }: Props) {
  const { user_id } = await params;
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const callerProfile = authUser
    ? (await supabase.from('profiles').select('role').eq('user_id', authUser.id).single()).data
    : null;
  const canEditRole = (callerProfile as { role?: string } | null)?.role === 'admin';

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (!profile) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Instructor no encontrado
        </h1>
        <p className="text-text-muted mb-4">
          El instructor que buscas no existe o fue eliminado.
        </p>
        <Link
          href="/admin/instructores"
          className="btn-primary inline-flex items-center gap-2"
        >
          Volver a instructores
        </Link>
      </div>
    );
  }

  const { data: cohortInstructors } = await supabase
    .from('cohort_instructors')
    .select(
      `
      cohort_id,
      role,
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
    .eq('instructor_id', user_id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cohortsRaw = (cohortInstructors || [])
    .map((row: { cohort: unknown }) => row.cohort as CohortWithProgram | null)
    .filter((c): c is CohortWithProgram => !!c?.id);
  const seen = new Set<number>();
  const cohorts = cohortsRaw
    .filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    })
    .map((c) => {
      const programRaw = c?.program;
      const program = Array.isArray(programRaw) ? programRaw[0] : programRaw;
      return { ...c, program };
    })
    .sort(
      (a, b) =>
        new Date(b.end_date || 0).getTime() -
        new Date(a.end_date || 0).getTime()
    );

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
        aria-labelledby="instructor-header-title"
      >
        <div className="p-6">
          <Link
            href="/admin/instructores"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-secondary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a instructores
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1
                id="instructor-header-title"
                className="text-2xl font-bold text-text-primary"
              >
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
                  Registro:{' '}
                  {new Date(typedProfile.created_at).toLocaleDateString('es-CO')}
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

      {/* Cohorts section */}
      <section
        className="bg-[var(--card-background)] rounded-lg shadow border border-border-color overflow-hidden"
        aria-labelledby="cohorts-heading"
      >
        <div className="p-4 border-b border-border-color">
          <h2
            id="cohorts-heading"
            className="text-xl font-semibold text-text-primary"
          >
            Cohortes como instructor
          </h2>
        </div>
        <div className="p-4">
          {!cohorts || cohorts.length === 0 ? (
            <p className="text-text-muted py-8 text-center">
              No hay cohortes asignadas como instructor.
            </p>
          ) : (
            <ul className="space-y-3">
              {cohorts.map((cohort) => {
                const program = cohort.program;
                const endDate = cohort?.end_date
                  ? new Date(cohort.end_date)
                  : null;
                if (endDate) endDate.setHours(0, 0, 0, 0);
                const isActive = endDate ? endDate >= today : false;
                return (
                  <li
                    key={cohort.id}
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
                        {isActive ? 'Activa' : 'Finalizada'}
                      </span>
                      <Link
                        href={`/admin/programas/${program?.id}`}
                        className="text-sm text-secondary hover:underline"
                      >
                        Ver programa
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Profile editor */}
      <StudentProfileEditor profile={typedProfile} canEditRole={canEditRole} />
    </div>
  );
}
