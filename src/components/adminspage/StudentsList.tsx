'use client';

import { useSupabaseClient, useUser } from '@/lib/supabase';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  UserMinus,
  GraduationCap,
  BookOpen,
  Loader2,
  Search,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CreditCard,
  SearchX,
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminFilterTabs from '@/components/admin/AdminFilterTabs';
import AdminSearchInput from '@/components/admin/AdminSearchInput';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import AddInstructorModal from '@/components/adminspage/AddInstructorModal';
import {
  adminTableShellClass,
  adminTableHeadCellClass,
  adminTableRowClass,
  adminTableFooterClass,
} from '@/components/admin/admin-table';
import { formatPrice } from '../../../utils/formatCurrency';

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin' | 'lead';
  created_at: string;
  phone?: string;
  professional_title?: string;
  linkedin_url?: string;
}

interface EnrollmentWithCohort {
  student_id: string;
  cohort: { end_date: string } | null;
}

interface CohortInstructorRow {
  instructor_id: string;
}

type FilterType = 'all' | 'leads' | 'active' | 'alumni' | 'admin';

type SortKey = 'name' | 'email' | 'role' | 'courses' | 'created_at';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 15;

export type RoleFilter = ('student' | 'lead' | 'instructor' | 'admin')[];

type PaymentSummary = {
  paidCount: number;
  totalCount: number;
  paidAmount: number;
  totalAmount: number;
};

interface StudentsListProps {
  filters?: {
    searchTerm?: string;
    startDate?: string;
    endDate?: string;
  };
  enrollments?: any[];
  showCohortInfo?: boolean;
  roleFilter?: RoleFilter;
  title?: string;
  subtitle?: string;
  cohortId?: string;
  onUserExpelled?: () => void;
  absencesByEnrollmentId?: Record<number, number>;
  paymentsByEnrollmentId?: Record<number, PaymentSummary>;
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

export function StudentsList({
  filters = {},
  enrollments,
  showCohortInfo = true,
  roleFilter,
  title = 'Usuarios',
  subtitle = 'Gestiona estudiantes, leads y exalumnos',
  cohortId,
  onUserExpelled,
  absencesByEnrollmentId = {},
  paymentsByEnrollmentId = {},
}: StudentsListProps = {}) {
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentWithCohort[]>([]);
  const [cohortInstructorData, setCohortInstructorData] = useState<CohortInstructorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expellingId, setExpellingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [addingInstructor, setAddingInstructor] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const enrollmentIdMap = useMemo(() => {
    if (!enrollments?.length) return new Map<string, number>();
    const map = new Map<string, number>();
    enrollments.forEach((e: { student_id: string; id?: number }) => {
      if (e.id != null && e.student_id) map.set(e.student_id, e.id);
    });
    return map;
  }, [enrollments]);

  useEffect(() => {
    if (enrollments && enrollments.length > 0) {
      const extractedProfiles = enrollments
        .map((e: { profiles?: Profile; profile?: Profile }) => e.profiles ?? e.profile)
        .filter(Boolean) as Profile[];
      setProfiles(extractedProfiles);
      const enrollmentItems: EnrollmentWithCohort[] = enrollments.map((e: { student_id: string; cohort?: { end_date: string } | null }) => ({
        student_id: e.student_id,
        cohort: e.cohort ?? null,
      }));
      setEnrollmentData(enrollmentItems);
      setLoading(false);
    }
  }, [enrollments]);

  useEffect(() => {
    if (enrollments && enrollments.length > 0) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profilesRes, enrollmentsRes, cohortInstructorsRes] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase
            .from('enrollments')
            .select('student_id, cohort:cohorts(end_date)')
            .order('created_at', { ascending: false }),
          roleFilter?.includes('instructor')
            ? supabase.from('cohort_instructors').select('instructor_id')
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (profilesRes.error) throw profilesRes.error;
        if (enrollmentsRes.error) throw enrollmentsRes.error;

        setProfiles((profilesRes.data as Profile[]) || []);
        const rawEnrollments = (enrollmentsRes.data || []) as Array<{
          student_id: string;
          cohort: { end_date: string } | { end_date: string }[] | null;
        }>;
        const normalized: EnrollmentWithCohort[] = rawEnrollments.map((e) => ({
          student_id: e.student_id,
          cohort: Array.isArray(e.cohort) ? e.cohort[0] ?? null : e.cohort,
        }));
        setEnrollmentData(normalized);
        setCohortInstructorData(
          (cohortInstructorsRes.data as CohortInstructorRow[]) || []
        );
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, roleFilter, enrollments, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [filter, searchTerm, roleFilter]);

  const enrollmentStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const map = new Map<
      string,
      { count: number; hasActive: boolean; hasAlumni: boolean }
    >();

    enrollmentData.forEach((e) => {
      const endDate = e.cohort?.end_date ? new Date(e.cohort.end_date) : null;
      endDate?.setHours(0, 0, 0, 0);
      const isActive = endDate ? endDate >= today : false;
      const isAlumni = endDate ? endDate < today : false;

      const current = map.get(e.student_id) || {
        count: 0,
        hasActive: false,
        hasAlumni: false,
      };
      map.set(e.student_id, {
        count: current.count + 1,
        hasActive: current.hasActive || isActive,
        hasAlumni: current.hasAlumni || isAlumni,
      });
    });

    return map;
  }, [enrollmentData]);

  const instructorCohortCount = useMemo(() => {
    const map = new Map<string, number>();
    cohortInstructorData.forEach((row) => {
      map.set(row.instructor_id, (map.get(row.instructor_id) ?? 0) + 1);
    });
    return map;
  }, [cohortInstructorData]);

  const isCohortContext = !!enrollments && enrollments.length > 0;

  const enrollmentDateMap = useMemo(() => {
    if (!enrollments?.length) return new Map<string, string>();
    const map = new Map<string, string>();
    enrollments.forEach((e: { student_id: string; created_at?: string }) => {
      if (e.created_at) map.set(e.student_id, e.created_at);
    });
    return map;
  }, [enrollments]);

  const isInstructorView =
    roleFilter?.length === 1 && roleFilter[0] === 'instructor';

  const roleFilteredProfiles = useMemo(() => {
    if (!roleFilter || roleFilter.length === 0) return profiles;
    return profiles.filter((p) => roleFilter.includes(p.role));
  }, [profiles, roleFilter]);

  const stats = useMemo(() => {
    const leads = roleFilteredProfiles.filter((p) => p.role === 'lead').length;
    let active = 0;
    let alumni = 0;
    roleFilteredProfiles.forEach((p) => {
      const s = enrollmentStats.get(p.user_id);
      if (s) {
        if (s.hasActive) active++;
        if (s.hasAlumni) alumni++;
      }
    });
    const admins = roleFilteredProfiles.filter((p) => p.role === 'admin').length;
    return {
      total: roleFilteredProfiles.length,
      leads,
      active,
      alumni,
      admins,
    };
  }, [roleFilteredProfiles, enrollmentStats]);

  const filteredProfiles = useMemo(() => {
    return roleFilteredProfiles.filter((p) => {
      if (filter === 'leads' && p.role !== 'lead') return false;
      if (filter === 'admin' && p.role !== 'admin') return false;
      if (filter === 'active') {
        const s = enrollmentStats.get(p.user_id);
        if (!s?.hasActive) return false;
      }
      if (filter === 'alumni') {
        const s = enrollmentStats.get(p.user_id);
        if (!s?.hasAlumni) return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
        if (
          !fullName.includes(term) &&
          !(p.email || '').toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [roleFilteredProfiles, filter, searchTerm, enrollmentStats]);

  const sortedProfiles = useMemo(() => {
    const arr = [...filteredProfiles];
    const mult = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') {
        const na = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nb = `${b.first_name} ${b.last_name}`.toLowerCase();
        cmp = na.localeCompare(nb);
      } else if (sortKey === 'email') {
        cmp = (a.email || '').localeCompare(b.email || '');
      } else if (sortKey === 'role') {
        cmp = (a.role || '').localeCompare(b.role || '');
      } else if (sortKey === 'courses') {
        const ca =
          a.role === 'instructor'
            ? instructorCohortCount.get(a.user_id) ?? 0
            : enrollmentStats.get(a.user_id)?.count ?? 0;
        const cb =
          b.role === 'instructor'
            ? instructorCohortCount.get(b.user_id) ?? 0
            : enrollmentStats.get(b.user_id)?.count ?? 0;
        cmp = ca - cb;
      } else {
        const dateA = isCohortContext
          ? enrollmentDateMap.get(a.user_id) ?? a.created_at
          : a.created_at;
        const dateB = isCohortContext
          ? enrollmentDateMap.get(b.user_id) ?? b.created_at
          : b.created_at;
        cmp = new Date(dateA).getTime() - new Date(dateB).getTime();
      }
      return cmp * mult;
    });
    return arr;
  }, [filteredProfiles, sortKey, sortDir, enrollmentStats, instructorCohortCount, isCohortContext, enrollmentDateMap]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'created_at' ? 'desc' : 'asc');
    }
  };

  const handleExpelUser = async (enrollmentId: number, studentName: string) => {
    if (!confirm(`¿Estás seguro de que deseas expulsar a ${studentName} de la cohorte?`)) return;
    setExpellingId(enrollmentId);
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;
      onUserExpelled?.();
    } catch (err) {
      console.error('Error al expulsar usuario:', err);
      alert('No se pudo expulsar al usuario. Por favor intenta de nuevo.');
    } finally {
      setExpellingId(null);
    }
  };

  const showStudentFilters =
    !isCohortContext && (roleFilter?.includes('student') || roleFilter?.includes('lead'));
  const filterTabs = showStudentFilters
    ? [
        { value: 'all' as FilterType, label: 'Todos', count: stats.total },
        { value: 'leads' as FilterType, label: 'Leads', count: stats.leads },
        { value: 'active' as FilterType, label: 'En curso', count: stats.active },
        { value: 'alumni' as FilterType, label: 'Exalumnos', count: stats.alumni },
      ]
    : [{ value: 'all' as FilterType, label: 'Todos', count: stats.total }];

  const headerSubtitle = showStudentFilters
    ? `${stats.total} ${stats.total === 1 ? 'usuario' : 'usuarios'} · ${stats.leads} leads · ${stats.active} en curso · ${stats.alumni} exalumnos`
    : isInstructorView
      ? `${stats.total} ${stats.total === 1 ? 'instructor' : 'instructores'}`
      : roleFilter?.includes('admin')
        ? `${stats.total} ${stats.total === 1 ? 'administrador' : 'administradores'}`
        : `${stats.total} ${stats.total === 1 ? 'usuario' : 'usuarios'}`;

  const totalPages = Math.max(1, Math.ceil(sortedProfiles.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageProfiles = sortedProfiles.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (!user || user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-text-primary">
        No tienes permisos para ver esta sección
      </div>
    );
  }

  if (loading) {
    return <AdminPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Users}
        title={title}
        subtitle={headerSubtitle}
        action={
          isInstructorView ? (
            <button
              type="button"
              onClick={() => setAddingInstructor(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <UserPlus className="h-5 w-5" aria-hidden="true" />
              Añadir profesor
            </button>
          ) : undefined
        }
      />

      {!isCohortContext && (
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <AdminFilterTabs
            tabs={filterTabs}
            value={filter}
            onChange={(value) => setFilter(value as FilterType)}
            ariaLabel="Filtrar usuarios"
          />
          <AdminSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre o email"
          />
        </div>
      )}

      {isCohortContext && (
        <AdminSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre o email"
          className="w-full sm:max-w-xs"
        />
      )}

      {filteredProfiles.length === 0 ? (
        <AdminEmptyState
          icon={SearchX}
          title={
            searchTerm
              ? `Ningún resultado para “${searchTerm}”`
              : filter !== 'all'
                ? 'No hay usuarios en esta categoría'
                : 'No hay usuarios registrados'
          }
          description="Prueba con otro término o cambia los filtros."
          actions={
            <>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="inline-flex h-9 items-center rounded-lg border border-border-color px-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
                >
                  Limpiar búsqueda
                </button>
              )}
              {filter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className="inline-flex h-9 items-center rounded-lg border border-border-color px-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
                >
                  Ver todos
                </button>
              )}
            </>
          }
        />
      ) : (
        <div className={adminTableShellClass}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color bg-bg-secondary">
                  <th scope="col" className={`${adminTableHeadCellClass} w-12`}>
                    #
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-text-primary transition-colors"
                    >
                      Usuario
                      {sortKey === 'name' ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-50" />
                      )}
                    </button>
                  </th>
                  {!isCohortContext && (
                    <>
                  <th scope="col" className={adminTableHeadCellClass}>
                    <button
                      type="button"
                      onClick={() => handleSort('role')}
                      className="flex items-center gap-1 hover:text-text-primary transition-colors"
                    >
                      Rol
                      {sortKey === 'role' ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-50" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    <button
                      type="button"
                      onClick={() => handleSort('courses')}
                      className="flex items-center gap-1 hover:text-text-primary transition-colors"
                    >
                      {roleFilter?.includes('instructor') &&
                      !roleFilter?.includes('student') &&
                      !roleFilter?.includes('lead')
                        ? 'Cohortes'
                        : 'Cursos'}
                      {sortKey === 'courses' ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-50" />
                      )}
                    </button>
                  </th>
                    </>
                  )}
                  {isCohortContext && (
                    <>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      Faltas
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                    >
                      Pagos
                    </th>
                    </>
                  )}
                  <th scope="col" className={adminTableHeadCellClass}>
                    <button
                      type="button"
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-1 hover:text-text-primary transition-colors"
                    >
                      {isCohortContext ? 'Inscripción' : 'Registro'}
                      {sortKey === 'created_at' ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-50" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className={`${adminTableHeadCellClass} text-right`}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageProfiles.map((profile, index) => {
                  const courseCount =
                    profile.role === 'instructor'
                      ? instructorCohortCount.get(profile.user_id) ?? 0
                      : enrollmentStats.get(profile.user_id)?.count ?? 0;
                  const detailHref =
                    profile.role === 'instructor'
                      ? `/admin/instructores/${profile.user_id}`
                      : `/admin/estudiantes/${profile.user_id}`;
                  return (
                    <tr key={profile.user_id} className={adminTableRowClass}>
                      <td className="px-4 py-3.5 text-text-muted font-medium">
                        {(safePage - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-text-primary">
                            {profile.first_name} {profile.last_name}
                          </p>
                          <p className="text-sm text-text-muted">{profile.email}</p>
                        </div>
                      </td>
                      {!isCohortContext && (
                        <>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${getRoleBadgeClass(
                            profile.role
                          )}`}
                        >
                          {profile.role === 'lead'
                            ? 'Lead'
                            : profile.role === 'student'
                              ? 'Estudiante'
                              : profile.role === 'instructor'
                                ? 'Instructor'
                                : profile.role === 'admin'
                                  ? 'Admin'
                                  : profile.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-secondary/20 text-secondary border border-secondary/30">
                          <BookOpen className="w-4 h-4" />
                          {courseCount}
                        </span>
                      </td>
                        </>
                      )}
                      {isCohortContext && (
                        <>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                            {absencesByEnrollmentId[enrollmentIdMap.get(profile.user_id) ?? -1] ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            const enrollmentId = enrollmentIdMap.get(profile.user_id);
                            const payments =
                              enrollmentId != null ? paymentsByEnrollmentId[enrollmentId] : undefined;

                            if (!payments || payments.totalCount === 0) {
                              return <span className="text-sm text-text-muted">Sin pagos</span>;
                            }

                            const isFullyPaid =
                              payments.paidCount >= payments.totalCount &&
                              payments.totalAmount > 0 &&
                              payments.paidAmount >= payments.totalAmount;

                            return (
                              <div className="space-y-1">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    isFullyPaid
                                      ? 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30'
                                      : payments.paidCount > 0
                                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                  }`}
                                >
                                  <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                                  {payments.paidCount} de {payments.totalCount} pagos
                                </span>
                                <p className="text-sm text-text-primary">
                                  <span className="font-semibold">{formatPrice(payments.paidAmount)}</span>
                                  {payments.totalAmount > 0 && (
                                    <span className="text-text-muted">
                                      {' '}
                                      de {formatPrice(payments.totalAmount)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            );
                          })()}
                        </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {new Date(
                          isCohortContext
                            ? (enrollmentDateMap.get(profile.user_id) ?? profile.created_at)
                            : profile.created_at
                        ).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isCohortContext && cohortId && (() => {
                            const enrollmentId = enrollmentIdMap.get(profile.user_id);
                            if (enrollmentId == null) return null;
                            const isExpelling = expellingId === enrollmentId;
                            return (
                              <button
                                type="button"
                                onClick={() =>
                                  handleExpelUser(
                                    enrollmentId,
                                    `${profile.first_name} ${profile.last_name}`.trim() || profile.email
                                  )
                                }
                                disabled={isExpelling}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-500/50 text-red-600 hover:bg-red-500/10 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Expulsar de la cohorte"
                                aria-label="Expulsar de la cohorte"
                              >
                                {isExpelling ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <UserMinus className="w-4 h-4" />
                                )}
                              </button>
                            );
                          })()}
                          <Link
                            href={detailHref}
                            className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2"
                          >
                            Ver detalles
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={adminTableFooterClass}>
            <p className="text-xs text-text-muted">
              {sortedProfiles.length}{' '}
              {sortedProfiles.length === 1 ? 'usuario' : 'usuarios'}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((n) => Math.max(1, n - 1))}
                  disabled={safePage === 1}
                  className="inline-flex h-8 items-center rounded-lg border border-border-color px-3 text-xs font-medium text-text-primary transition-colors hover:bg-[var(--card-background)] disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="px-1 text-xs text-text-muted">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex h-8 items-center rounded-lg border border-border-color px-3 text-xs font-medium text-text-primary transition-colors hover:bg-[var(--card-background)] disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AddInstructorModal
        open={addingInstructor}
        onClose={() => setAddingInstructor(false)}
        onAdded={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  );
}
