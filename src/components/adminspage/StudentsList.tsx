'use client';

import { useSupabaseClient, useUser } from '@/lib/supabase';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  GraduationCap,
  BookOpen,
  Filter,
  Loader2,
  Search,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

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

export type RoleFilter = ('student' | 'lead' | 'instructor' | 'admin')[];

interface StudentsListProps {
  roleFilter?: RoleFilter;
  title?: string;
  subtitle?: string;
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
  roleFilter,
  title = 'Usuarios',
  subtitle = 'Gestiona estudiantes, leads y exalumnos',
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

  useEffect(() => {
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
        setEnrollmentData((enrollmentsRes.data as EnrollmentWithCohort[]) || []);
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
  }, [supabase, roleFilter]);

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

  const isInstructorView =
    roleFilter?.length === 1 && roleFilter[0] === 'instructor';

  const roleFilteredProfiles = useMemo(() => {
    if (!roleFilter || roleFilter.length === 0) return profiles;
    if (isInstructorView) {
      return profiles.filter(
        (p) => (instructorCohortCount.get(p.user_id) ?? 0) > 0
      );
    }
    return profiles.filter((p) => roleFilter.includes(p.role));
  }, [profiles, roleFilter, isInstructorView, instructorCohortCount]);

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
        cmp =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return cmp * mult;
    });
    return arr;
  }, [filteredProfiles, sortKey, sortDir, enrollmentStats, instructorCohortCount]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'created_at' ? 'desc' : 'asc');
    }
  };

  const showStudentFilters = roleFilter?.includes('student') || roleFilter?.includes('lead');
  const filterTabs = showStudentFilters
    ? [
        { id: 'all' as FilterType, label: 'Todos' },
        { id: 'leads' as FilterType, label: 'Leads' },
        { id: 'active' as FilterType, label: 'En curso' },
        { id: 'alumni' as FilterType, label: 'Exalumnos' },
      ]
    : [{ id: 'all' as FilterType, label: 'Todos' }];

  if (!user || (user?.role !== 'admin' && user?.role !== 'instructor')) {
    return (
      <div className="p-8 text-center text-text-primary">
        No tienes permisos para ver esta sección
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Users className="text-secondary" size={28} />
            </div>
            {title}
          </h1>
          <p className="text-text-muted mt-2">{subtitle}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
          />
        </div>
      </div>

      {/* Stats cards */}
      <div
        className={`grid gap-4 ${
          showStudentFilters
            ? 'grid-cols-1 md:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-1 max-w-xs'
        }`}
      >
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Total</p>
              <p className="text-3xl font-bold text-text-primary">{stats.total}</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Users className="text-secondary" size={24} />
            </div>
          </div>
        </div>
        {showStudentFilters && (
          <>
            <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm mb-1">Leads</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.leads}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <UserPlus className="text-blue-400" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm mb-1">En curso activo</p>
                  <p className="text-3xl font-bold text-green-400">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <GraduationCap className="text-green-400" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm mb-1">Exalumnos</p>
                  <p className="text-3xl font-bold text-amber-400">{stats.alumni}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <BookOpen className="text-amber-400" size={24} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="text-text-muted" size={20} />
        <div className="flex flex-wrap gap-2">
          {filterTabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === id
                  ? 'btn-primary'
                  : 'bg-bg-secondary text-text-primary border border-border-color hover:bg-bg-secondary/80 hover:border-secondary/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--card-background)] rounded-xl border border-border-color overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-secondary" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted text-lg">
              No hay usuarios {filter !== 'all' ? 'en esta categoría' : ''}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead className="bg-bg-secondary/50 border-b border-border-color">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-12"
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                  >
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
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                  >
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
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                  >
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
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-1 hover:text-text-primary transition-colors"
                    >
                      Registro
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
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color bg-[var(--card-background)]">
                {sortedProfiles.map((profile, index) => {
                  const courseCount =
                    profile.role === 'instructor'
                      ? instructorCohortCount.get(profile.user_id) ?? 0
                      : enrollmentStats.get(profile.user_id)?.count ?? 0;
                  const detailHref =
                    profile.role === 'instructor'
                      ? `/admin/instructores/${profile.user_id}`
                      : `/admin/estudiantes/${profile.user_id}`;
                  return (
                    <tr
                      key={profile.user_id}
                      className="hover:bg-bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-text-muted font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-text-primary">
                            {profile.first_name} {profile.last_name}
                          </p>
                          <p className="text-sm text-text-muted">{profile.email}</p>
                        </div>
                      </td>
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
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {new Date(profile.created_at).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={detailHref}
                          className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2"
                        >
                          Ver detalles
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
