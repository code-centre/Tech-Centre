'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import {
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  Mail,
  MessageSquare,
  Plus,
  Search,
  SearchX,
  UserPlus,
  Users,
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import NewLeadModal from './NewLeadModal';
import { createProfileFromLead } from '@/app/admin/estudiantes/actions';
import {
  buildLeadRow,
  buildProfileRow,
  buildStudentsOverview,
  formatDate,
  formatMoney,
  formatRegistered,
  formatShortDate,
  mergePeople,
  type LeadRow,
  type PersonRow,
  type PersonStatus,
  type ProfileRow,
  type StudentEnrollment,
  type StudentInvoice,
} from '@/lib/students';

type Segment = 'all' | 'active' | 'alumni' | 'lead' | 'overdue';

const PAGE_SIZE = 15;

const GRID =
  'grid grid-cols-[36px_minmax(0,1.45fr)_108px_minmax(0,1.35fr)_152px_100px_20px] gap-3.5 items-center';

const STATUS: Record<PersonStatus, { label: string; color: string; avatar: string }> = {
  active: { label: 'En curso', color: 'var(--pay-serie-cobrado)', avatar: 'var(--secondary)' },
  alumni: { label: 'Exalumno', color: 'var(--pay-serie-porcobrar)', avatar: 'var(--pay-serie-porcobrar)' },
  lead: { label: 'Lead', color: 'var(--pay-aviso)', avatar: 'var(--pay-aviso)' },
};

const SEGMENT_COLOR: Record<'paid' | 'overdue' | 'pending', string> = {
  paid: 'var(--pay-serie-cobrado)',
  overdue: 'var(--pay-critico)',
  pending: 'var(--border-color)',
};

/** Un tinte del color de estado, para fondos de badge y avatar. */
function tint(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/** PostgREST devuelve las relaciones como objeto o como arreglo según el caso. */
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default function EstudiantesAdmin() {
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const router = useRouter();

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [segment, setSegment] = useState<Segment>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [cohortFilter, setCohortFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [creatingLead, setCreatingLead] = useState(false);
  const [converting, setConverting] = useState<number | null>(null);
  const [convertError, setConvertError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesRes, enrollmentsRes, invoicesRes, leadsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email, phone, role, created_at')
          .in('role', ['student', 'lead'])
          .order('created_at', { ascending: false }),
        supabase
          .from('enrollments')
          .select(
            'id, student_id, status, agreed_price, created_at, cohort:cohorts(id, name, start_date, end_date, modality, program:programs(id, name))'
          ),
        supabase.from('invoices').select('id, enrollment_id, amount, due_date, status, paid_at'),
        supabase
          .from('leads')
          .select('id, full_name, email, phone, source, stage, notes, created_at')
          .order('created_at', { ascending: false }),
      ]);

      setProfiles((profilesRes.data ?? []) as ProfileRow[]);
      setEnrollments(
        ((enrollmentsRes.data ?? []) as unknown[]).map((raw) => {
          const row = raw as StudentEnrollment & { cohort: unknown };
          const cohort = one(row.cohort as never) as
            | (StudentEnrollment['cohort'] & { program: unknown })
            | null;
          return {
            ...row,
            cohort: cohort
              ? { ...cohort, program: one(cohort.program as never) }
              : null,
          } as StudentEnrollment;
        })
      );
      setInvoices((invoicesRes.data ?? []) as StudentInvoice[]);
      setLeads((leadsRes.data ?? []) as LeadRow[]);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    setPage(1);
  }, [segment, searchTerm, programFilter, cohortFilter]);

  const today = useMemo(() => new Date(), []);

  const people = useMemo(() => {
    const byStudent = new Map<string, StudentEnrollment[]>();
    for (const enrollment of enrollments) {
      const list = byStudent.get(enrollment.student_id) ?? [];
      list.push(enrollment);
      byStudent.set(enrollment.student_id, list);
    }

    const byEnrollment = new Map<number, StudentInvoice[]>();
    for (const invoice of invoices) {
      const list = byEnrollment.get(invoice.enrollment_id) ?? [];
      list.push(invoice);
      byEnrollment.set(invoice.enrollment_id, list);
    }

    const profileRows = profiles.map((profile) =>
      buildProfileRow(profile, byStudent.get(profile.user_id) ?? [], byEnrollment, today)
    );
    const leadRows = leads.map((lead) => buildLeadRow(lead, today));

    return mergePeople(profileRows, leadRows).sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );
  }, [profiles, enrollments, invoices, leads, today]);

  const overview = useMemo(
    () => buildStudentsOverview(people, enrollments, today),
    [people, enrollments, today]
  );

  const programs = useMemo(() => {
    const set = new Set<string>();
    for (const person of people) if (person.programLabel) set.add(person.programLabel);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [people]);

  const cohorts = useMemo(() => {
    const set = new Set<string>();
    for (const enrollment of enrollments) {
      const cohort = enrollment.cohort;
      if (!cohort?.name) continue;
      if (programFilter !== 'all' && cohort.program?.name !== programFilter) continue;
      set.add(cohort.name);
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [enrollments, programFilter]);

  useEffect(() => {
    if (cohortFilter !== 'all' && !cohorts.includes(cohortFilter)) setCohortFilter('all');
  }, [cohorts, cohortFilter]);

  /** Cohortes de cada persona, para poder filtrar por cohorte. */
  const cohortsByStudent = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const enrollment of enrollments) {
      if (!enrollment.cohort?.name) continue;
      const set = map.get(enrollment.student_id) ?? new Set<string>();
      set.add(enrollment.cohort.name);
      map.set(enrollment.student_id, set);
    }
    return map;
  }, [enrollments]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return people.filter((person) => {
      if (segment === 'overdue') {
        if (!person.payments || person.payments.overdueCount === 0) return false;
      } else if (segment !== 'all' && person.status !== segment) {
        return false;
      }

      if (programFilter !== 'all' && person.programLabel !== programFilter) return false;

      if (cohortFilter !== 'all') {
        const set = person.userId ? cohortsByStudent.get(person.userId) : null;
        if (!set?.has(cohortFilter)) return false;
      }

      if (term) {
        const haystack = `${person.name} ${person.email} ${person.phone ?? ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      return true;
    });
  }, [people, segment, programFilter, cohortFilter, cohortsByStudent, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const tabs: { value: Segment; label: string; count: number; dot?: string }[] = [
    { value: 'all', label: 'Todos', count: overview.total },
    { value: 'active', label: 'En curso', count: overview.activeCount },
    { value: 'alumni', label: 'Exalumnos', count: overview.alumniCount },
    { value: 'lead', label: 'Leads', count: overview.leadCount },
    { value: 'overdue', label: 'En mora', count: overview.overdueCount, dot: 'var(--pay-critico)' },
  ];

  const handleExportCsv = () => {
    const header = ['Nombre', 'Correo', 'Teléfono', 'Estado', 'Programa', 'Cohorte', 'Pagado', 'Pendiente', 'Registro'];
    const rows = filtered.map((person) => [
      person.name,
      person.email,
      person.phone ?? '',
      STATUS[person.status].label,
      person.programLabel ?? '',
      person.cohortLabel ?? '',
      person.payments ? String(person.payments.paid) : '',
      person.payments ? String(person.payments.pending) : '',
      formatDate(person.createdAt),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `estudiantes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConvert = async (leadId: number) => {
    setConverting(leadId);
    setConvertError('');
    try {
      const result = await createProfileFromLead(leadId);
      if (!result.success || !result.userId) throw new Error(result.error || 'No se pudo crear el perfil');
      router.push(`/admin/estudiantes/${result.userId}?matricular=1`);
    } catch (err) {
      setConvertError((err as { message?: string })?.message ?? 'No se pudo crear el perfil');
      setConverting(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8 text-center text-text-primary">
        No tienes permisos para ver esta sección
      </div>
    );
  }

  if (loading) return <AdminPageSkeleton />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Users}
        title="Estudiantes"
        subtitle={`${overview.total} personas · ${overview.activeCount} en curso · ${overview.alumniCount} exalumnos · ${overview.leadCount} leads`}
        action={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm font-medium text-text-primary hover:border-secondary/50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={() => setCreatingLead(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Registrar lead
            </button>
          </div>
        }
      />

      {/* Lo que hay que atender esta semana */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi
          dot="var(--pay-serie-cobrado)"
          label="En curso"
          value={String(overview.activeCount)}
          note={
            overview.activeCohorts > 0
              ? `Repartidos en ${overview.activeCohorts} ${overview.activeCohorts === 1 ? 'cohorte activa' : 'cohortes activas'}`
              : 'Ninguna cohorte activa'
          }
        />
        <Kpi
          dot="var(--pay-serie-porcobrar)"
          label="Nuevos esta semana"
          value={String(overview.newLeads + overview.newEnrollments)}
          note={`${overview.newLeads} ${overview.newLeads === 1 ? 'lead' : 'leads'} y ${overview.newEnrollments} ${overview.newEnrollments === 1 ? 'matrícula nueva' : 'matrículas nuevas'}`}
        />
        <Kpi
          dot="var(--pay-critico)"
          label="Con pagos vencidos"
          value={String(overview.overdueCount)}
          note={
            overview.overdueCount > 0
              ? `${formatMoney(overview.overdueAmount)} vencidos, el más viejo hace ${overview.worstDaysLate} días`
              : 'Nadie con cuotas vencidas'
          }
          alert={overview.overdueCount > 0}
        />
        <Kpi
          dot="var(--pay-aviso)"
          label="Terminan en 30 días"
          value={String(overview.endingSoon)}
          note={
            overview.nextClosing
              ? `${overview.nextClosing.name} cierra el ${formatShortDate(overview.nextClosing.endDate)}`
              : 'Ninguna cohorte cierra pronto'
          }
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          className="flex items-center gap-1 overflow-x-auto rounded-[10px] border border-border-color bg-[var(--card-background)] p-1"
          role="tablist"
          aria-label="Filtrar personas"
        >
          {tabs.map((tab) => {
            const isActive = segment === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSegment(tab.value)}
                className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-secondary/30 bg-secondary/10 text-text-secondary'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {tab.dot && (
                  <span
                    className="h-[7px] w-[7px] rounded-full"
                    style={{ background: tab.dot }}
                    aria-hidden
                  />
                )}
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    isActive ? 'bg-secondary/20' : 'bg-text-muted/15'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o correo"
              className="h-9 w-60 rounded-lg border border-border-color bg-bg-secondary pl-9 pr-3 text-sm text-text-primary placeholder-text-muted focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            aria-label="Filtrar por programa"
            className="h-9 rounded-lg border border-border-color bg-bg-secondary px-3 text-sm text-text-muted focus:border-secondary focus:outline-none"
          >
            <option value="all">Programa</option>
            {programs.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
          <select
            value={cohortFilter}
            onChange={(e) => setCohortFilter(e.target.value)}
            aria-label="Filtrar por cohorte"
            className="h-9 rounded-lg border border-border-color bg-bg-secondary px-3 text-sm text-text-muted focus:border-secondary focus:outline-none"
          >
            <option value="all">Cohorte</option>
            {cohorts.map((cohort) => (
              <option key={cohort} value={cohort}>
                {cohort}
              </option>
            ))}
          </select>
        </div>
      </div>

      {convertError && (
        <p
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: tint('var(--pay-critico)', 32),
            background: tint('var(--pay-critico)', 8),
            color: 'var(--pay-critico)',
          }}
        >
          {convertError}
        </p>
      )}

      {filtered.length === 0 ? (
        <AdminEmptyState
          icon={SearchX}
          title={
            searchTerm
              ? `Ningún resultado para “${searchTerm}”`
              : 'No hay personas en esta categoría'
          }
          description="Prueba con otro término o cambia los filtros."
          actions={
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSegment('all');
                setProgramFilter('all');
                setCohortFilter('all');
              }}
              className="inline-flex h-9 items-center rounded-lg border border-border-color px-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              Limpiar filtros
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
          <div className={`${GRID} border-b border-border-color bg-bg-secondary px-4 py-3`}>
            <span />
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">Persona</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">Estado</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">Programa y cohorte</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">Pagos</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">Registro</span>
            <span />
          </div>

          {pageRows.map((person) =>
            person.kind === 'lead' ? (
              <LeadRowView
                key={person.key}
                person={person}
                open={expanded === person.key}
                converting={converting === person.leadId}
                onToggle={() => setExpanded(expanded === person.key ? null : person.key)}
                onConvert={() => person.leadId && handleConvert(person.leadId)}
              />
            ) : (
              <ProfileRowView key={person.key} person={person} />
            )
          )}

          <div className="flex items-center justify-between gap-4 border-t border-border-color bg-bg-secondary px-4 py-3.5">
            <span className="text-[13px] text-text-muted">
              Mostrando {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} de{' '}
              {filtered.length} personas
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  className="inline-flex h-8 items-center rounded-lg border border-border-color bg-[var(--card-background)] px-3 text-[13px] text-text-muted transition-colors hover:text-text-primary disabled:opacity-40"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                  .map((n, index, list) => (
                    <span key={n} className="flex items-center gap-1.5">
                      {index > 0 && list[index - 1] !== n - 1 && (
                        <span className="text-[13px] text-text-muted">…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setPage(n)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-[13px] transition-colors ${
                          n === safePage
                            ? 'border-secondary/30 bg-secondary/10 font-semibold text-text-secondary'
                            : 'border-border-color bg-[var(--card-background)] text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex h-8 items-center rounded-lg border border-border-color bg-[var(--card-background)] px-3 text-[13px] text-text-primary transition-colors disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <NewLeadModal
        open={creatingLead}
        onClose={() => setCreatingLead(false)}
        onCreated={() => {
          setCreatingLead(false);
          fetchAll();
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

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
      className="flex flex-col gap-2 p-5 rounded-xl bg-[var(--card-background)] border"
      style={{ borderColor: alert ? tint('var(--pay-critico)', 32) : 'var(--border-color)' }}
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} aria-hidden />
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
          {label}
        </span>
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

function Avatar({ person }: { person: PersonRow }) {
  const color = STATUS[person.status].avatar;
  return (
    <span
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold"
      style={{ background: tint(color, 13), color }}
      aria-hidden
    >
      {person.initials}
    </span>
  );
}

function StatusBadge({ status }: { status: PersonStatus }) {
  const { label, color } = STATUS[status];
  return (
    <span
      className="inline-flex h-6 w-fit items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap"
      style={{ background: tint(color, 14), color }}
    >
      {label}
    </span>
  );
}

/** Una barrita por cuota: verde pagada, roja vencida, gris pendiente. */
function PaymentCell({ person }: { person: PersonRow }) {
  const payments = person.payments;

  if (!payments || payments.count === 0) {
    return <span className="text-[13px] text-text-muted">Sin facturas</span>;
  }

  const late = payments.overdueCount > 0;
  const caption = late
    ? person.status === 'alumni'
      ? `Debe ${formatMoney(payments.pending)}`
      : `${payments.overdueCount} ${payments.overdueCount === 1 ? 'vencida' : 'vencidas'} hace ${payments.worstDaysLate} días`
    : payments.pending === 0
      ? 'Pagó completo'
      : `${payments.paidCount} de ${payments.count}${payments.nextDue ? ` · vence ${formatShortDate(payments.nextDue)}` : ''}`;

  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex gap-[3px]">
        {payments.segments.slice(0, 8).map((state, index) => (
          <span
            key={index}
            className="h-[5px] grow rounded-[2px]"
            style={{ background: SEGMENT_COLOR[state] }}
            aria-hidden
          />
        ))}
      </div>
      <span
        className={`text-[12.5px] ${late ? 'font-semibold' : ''}`}
        style={{ color: late ? 'var(--pay-critico)' : 'var(--text-muted)' }}
      >
        {caption}
      </span>
    </div>
  );
}

function ProfileRowView({ person }: { person: PersonRow }) {
  return (
    <Link
      href={`/admin/estudiantes/${person.userId}`}
      className={`${GRID} border-b border-border-color/50 px-4 py-3 transition-colors last:border-b-0 hover:bg-bg-secondary/40`}
    >
      <Avatar person={person} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[14.5px] font-semibold text-text-primary">{person.name}</span>
        <span className="truncate text-[12.5px] text-text-muted">
          {person.email}
          {person.phone ? ` · ${person.phone}` : ''}
        </span>
      </div>
      <StatusBadge status={person.status} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[13.5px] text-text-primary">
          {person.programLabel ?? 'Sin programa'}
        </span>
        <span className="truncate text-[12.5px] text-text-muted">
          {person.cohortLabel ?? 'Sin cohorte'}
        </span>
      </div>
      <PaymentCell person={person} />
      <span className="text-[13px] tabular-nums text-text-muted">
        {formatDate(person.createdAt)}
      </span>
      <ChevronRight className="h-[18px] w-[18px] text-text-muted" aria-hidden />
    </Link>
  );
}

function LeadRowView({
  person,
  open,
  converting,
  onToggle,
  onConvert,
}: {
  person: PersonRow;
  open: boolean;
  converting: boolean;
  onToggle: () => void;
  onConvert: () => void;
}) {
  const fresh = person.ageInDays <= 7;
  const whatsapp = person.phone ? `https://wa.me/${person.phone.replace(/\D/g, '')}` : null;

  return (
    <div
      className="border-b border-border-color/50 last:border-b-0"
      style={open ? { background: tint('var(--pay-aviso)', 5) } : undefined}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`${GRID} w-full px-4 py-3 text-left transition-colors hover:bg-bg-secondary/40`}
      >
        <Avatar person={person} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[14.5px] font-semibold text-text-primary">{person.name}</span>
          <span className="truncate text-[12.5px] text-text-muted">
            {person.email}
            {person.phone ? ` · ${person.phone}` : ''}
          </span>
        </div>
        <StatusBadge status={person.status} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[13.5px] text-text-primary">
            {person.interest ? `Interés: ${person.interest}` : 'Interés: sin definir'}
          </span>
          <span className="truncate text-[12.5px] text-text-muted">
            {person.intent ?? 'Dejó sus datos'}
          </span>
        </div>
        <span className="text-[13px] text-text-muted">Sin matrícula</span>
        <span
          className="text-[13px] tabular-nums"
          style={{ color: fresh ? 'var(--pay-aviso)' : 'var(--text-muted)' }}
        >
          {formatRegistered(person.createdAt, person.ageInDays)}
        </span>
        {open ? (
          <ChevronDown className="h-[18px] w-[18px] text-text-primary" aria-hidden />
        ) : (
          <ChevronRight className="h-[18px] w-[18px] text-text-muted" aria-hidden />
        )}
      </button>

      {open && (
        <div className="mb-4 ml-[66px] mr-4 flex flex-col gap-3.5 rounded-[10px] border border-border-color bg-bg-secondary p-4">
          {person.message && (
            <p className="text-[13.5px] leading-relaxed text-text-primary">«{person.message}»</p>
          )}
          <div className="flex flex-wrap gap-2">
            {person.origin && <Chip>Origen: {person.origin}</Chip>}
            {person.interest && <Chip>Interés: {person.interest}</Chip>}
            <Chip>{formatDate(person.createdAt)}</Chip>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-[7px] rounded-lg bg-secondary px-3.5 text-[13.5px] font-semibold text-[#0E1116] transition-colors hover:bg-secondary/90"
              >
                <MessageSquare className="h-4 w-4" />
                Escribir por WhatsApp
              </a>
            )}
            {person.email && (
              <a
                href={`mailto:${person.email}`}
                className="inline-flex h-9 items-center gap-[7px] rounded-lg border border-border-color bg-[var(--card-background)] px-3.5 text-[13.5px] font-medium text-text-primary transition-colors hover:border-secondary/50"
              >
                <Mail className="h-4 w-4" />
                Enviar correo
              </a>
            )}
            <button
              type="button"
              onClick={onConvert}
              disabled={converting}
              className="inline-flex h-9 items-center gap-[7px] rounded-lg border border-border-color bg-[var(--card-background)] px-3.5 text-[13.5px] font-medium text-text-primary transition-colors hover:border-secondary/50 disabled:opacity-50"
            >
              {converting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Crear perfil y matricular
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[26px] items-center rounded-md border border-border-color bg-[var(--card-background)] px-2.5 text-[12.5px] text-text-muted">
      {children}
    </span>
  );
}
