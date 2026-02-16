'use client';

import { useSupabaseClient, useUser } from '@/lib/supabase';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Filter,
  Loader2,
  Search,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  FileText,
  Percent,
  Clock,
  Trash2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Profile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Program {
  id: number;
  name: string;
}

interface Cohort {
  name: string;
  program: Program | Program[] | null;
}

interface Enrollment {
  id: number;
  student_id: string;
  agreed_price: number;
  profile: Profile | Profile[] | null;
  cohort: Cohort | null;
}

interface InvoiceRow {
  id: number;
  label: string;
  amount: number;
  due_date: string;
  status: string;
  paid_at: string | null;
  url_recipe: string | null;
  created_at: string;
  enrollment: Enrollment | null;
}

type FilterType = 'all' | 'paid' | 'pending';
type PeriodType = 'year' | 'quarter' | 'month';
type SortKey =
  | 'student'
  | 'program'
  | 'label'
  | 'amount'
  | 'due_date'
  | 'status'
  | 'paid_at';
type SortDir = 'asc' | 'desc';

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

function getPeriodKey(date: Date, period: PeriodType): string {
  const y = date.getFullYear();
  const m = date.getMonth();
  if (period === 'year') return `${y}`;
  if (period === 'quarter') return `Q${Math.floor(m / 3) + 1} ${y}`;
  return `${MONTH_NAMES[m]} ${y}`;
}

function getPeriodLabel(key: string, period: PeriodType): string {
  return key;
}

export function PagosAdmin() {
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [period, setPeriod] = useState<PeriodType>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('due_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select(
            `
            id,
            label,
            amount,
            due_date,
            status,
            paid_at,
            url_recipe,
            created_at,
            enrollment:enrollments(
              id,
              student_id,
              agreed_price,
              profile:profiles(user_id, first_name, last_name, email),
              cohort:cohorts(name, program:programs(id, name))
            )
          `
          )
          .order('due_date', { ascending: false });

        if (error) throw error;

        const rows: InvoiceRow[] = (data || []).map((item: Record<string, unknown>) => ({
          id: item.id as number,
          label: item.label as string,
          amount: item.amount as number,
          due_date: item.due_date as string,
          status: item.status as string,
          paid_at: item.paid_at as string | null,
          url_recipe: item.url_recipe as string | null,
          created_at: item.created_at as string,
          enrollment: item.enrollment as Enrollment | null,
        }));

        setInvoices(rows);
      } catch (err) {
        console.error('Error al cargar facturas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [supabase]);

  const stats = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'paid');
    const pending = invoices.filter((i) => i.status === 'pending');
    const totalPaid = paid.reduce((s, i) => s + i.amount, 0);
    const totalPending = pending.reduce((s, i) => s + i.amount, 0);
    const totalAmount = totalPaid + totalPending;
    const collectionRate =
      totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

    return {
      totalPaid,
      totalPending,
      count: invoices.length,
      collectionRate,
    };
  }, [invoices]);

  const chartData = useMemo(() => {
    const paidByPeriod = new Map<string, number>();
    const pendingByPeriod = new Map<string, number>();

    invoices.forEach((inv) => {
      if (inv.status === 'paid' && inv.paid_at) {
        const key = getPeriodKey(new Date(inv.paid_at), period);
        paidByPeriod.set(key, (paidByPeriod.get(key) ?? 0) + inv.amount);
      } else if (inv.status === 'pending') {
        const key = getPeriodKey(new Date(inv.due_date), period);
        pendingByPeriod.set(key, (pendingByPeriod.get(key) ?? 0) + inv.amount);
      }
    });

    const allKeys = new Set([
      ...paidByPeriod.keys(),
      ...pendingByPeriod.keys(),
    ]);
    const parsePeriodKey = (k: string) => {
      const qMatch = k.match(/^Q(\d+)\s+(\d+)$/);
      if (qMatch) {
        const q = parseInt(qMatch[1], 10);
        const y = parseInt(qMatch[2], 10);
        return new Date(y, (q - 1) * 3).getTime();
      }
      const mMatch = k.match(/^([A-Za-záéíóú]+)\s+(\d+)$/);
      if (mMatch) {
        const monthIdx = MONTH_NAMES.findIndex(
          (m) => m.toLowerCase() === mMatch[1].toLowerCase()
        );
        if (monthIdx >= 0) {
          return new Date(parseInt(mMatch[2], 10), monthIdx).getTime();
        }
      }
      const y = parseInt(k, 10);
      return isNaN(y) ? 0 : new Date(y, 0).getTime();
    };

    const sorted = Array.from(allKeys).sort((a, b) => parsePeriodKey(a) - parsePeriodKey(b));

    return sorted.map((key) => ({
      period: getPeriodLabel(key, period),
      recaudado: paidByPeriod.get(key) ?? 0,
      porCobrar: pendingByPeriod.get(key) ?? 0,
    }));
  }, [invoices, period]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (filter === 'paid' && inv.status !== 'paid') return false;
      if (filter === 'pending' && inv.status !== 'pending') return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const profile = Array.isArray(inv.enrollment?.profile)
          ? inv.enrollment?.profile[0]
          : inv.enrollment?.profile;
        const cohort = inv.enrollment?.cohort;
        const programRaw = cohort?.program;
        const program = Array.isArray(programRaw) ? programRaw[0] : programRaw;
        const studentName = profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase()
          : '';
        const email = (profile?.email || '').toLowerCase();
        const programName = (program?.name || '').toLowerCase();
        const label = (inv.label || '').toLowerCase();
        if (
          !studentName.includes(term) &&
          !email.includes(term) &&
          !programName.includes(term) &&
          !label.includes(term)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [invoices, filter, searchTerm]);

  const sortedInvoices = useMemo(() => {
    const arr = [...filteredInvoices];
    const mult = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let cmp = 0;
      const getProfile = (i: InvoiceRow) =>
        Array.isArray(i.enrollment?.profile)
          ? i.enrollment?.profile[0]
          : i.enrollment?.profile;
      const getProgram = (i: InvoiceRow) => {
        const p = i.enrollment?.cohort?.program;
        return Array.isArray(p) ? p[0] : p;
      };

      if (sortKey === 'student') {
        const na = (getProfile(a)?.first_name || '') + (getProfile(a)?.last_name || '');
        const nb = (getProfile(b)?.first_name || '') + (getProfile(b)?.last_name || '');
        cmp = na.localeCompare(nb);
      } else if (sortKey === 'program') {
        const pa = getProgram(a)?.name || '';
        const pb = getProgram(b)?.name || '';
        cmp = pa.localeCompare(pb);
      } else if (sortKey === 'label') {
        cmp = (a.label || '').localeCompare(b.label || '');
      } else if (sortKey === 'amount') {
        cmp = a.amount - b.amount;
      } else if (sortKey === 'due_date') {
        cmp =
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (sortKey === 'status') {
        cmp = (a.status || '').localeCompare(b.status || '');
      } else if (sortKey === 'paid_at') {
        const ta = a.paid_at ? new Date(a.paid_at).getTime() : 0;
        const tb = b.paid_at ? new Date(b.paid_at).getTime() : 0;
        cmp = ta - tb;
      }
      return cmp * mult;
    });
    return arr;
  }, [filteredInvoices, sortKey, sortDir]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedInvoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedInvoices.map((i) => i.id)));
    }
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`¿Eliminar ${ids.length} factura(s) seleccionada(s)?`)) return;
    setDeletingId(-1);
    try {
      const { error } = await supabase.from('invoices').delete().in('id', ids);
      if (error) throw error;
      setInvoices((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error al eliminar facturas:', err);
      alert('No se pudieron eliminar las facturas. Intenta de nuevo.');
    } finally {
      setDeletingId(null);
    }
  };

  const isBulkDeleting = deletingId === -1;

  const handleDeleteInvoice = async (inv: InvoiceRow) => {
    if (!confirm(`¿Eliminar la factura "${inv.label}" de $${inv.amount.toLocaleString()}?`)) return;
    setDeletingId(inv.id);
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', inv.id);
      if (error) throw error;
      setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(inv.id);
        return next;
      });
    } catch (err) {
      console.error('Error al eliminar factura:', err);
      alert('No se pudo eliminar la factura. Intenta de nuevo.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'due_date' || key === 'paid_at' ? 'desc' : 'asc');
    }
  };

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) {
      el.indeterminate =
        selectedIds.size > 0 && selectedIds.size < sortedInvoices.length;
    }
  }, [selectedIds.size, sortedInvoices.length]);

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === 'asc' ? (
        <ArrowUp className="w-4 h-4" />
      ) : (
        <ArrowDown className="w-4 h-4" />
      )
    ) : (
      <ArrowUpDown className="w-4 h-4 opacity-50" />
    );

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
              <DollarSign className="text-secondary" size={28} />
            </div>
            Gestión de Pagos
          </h1>
          <p className="text-text-muted mt-2">
            Dashboard de facturas y recaudación
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por estudiante, programa o concepto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Total recaudado</p>
              <p className="text-3xl font-bold text-green-400">
                ${stats.totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="text-green-400" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Pendiente por cobrar</p>
              <p className="text-3xl font-bold text-amber-400">
                ${stats.totalPending.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <Clock className="text-amber-400" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Total facturas</p>
              <p className="text-3xl font-bold text-text-primary">
                {stats.count}
              </p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <FileText className="text-secondary" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Tasa de cobro</p>
              <p className="text-3xl font-bold text-blue-400">
                {stats.collectionRate}%
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Percent className="text-blue-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <TrendingUp className="text-secondary" size={22} />
            Recaudación por período
          </h2>
          <div className="flex gap-2">
            {(['month', 'quarter', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  period === p
                    ? 'btn-primary'
                    : 'bg-bg-secondary text-text-primary border border-border-color hover:bg-bg-secondary/80 hover:border-secondary/50'
                }`}
              >
                {p === 'month' ? 'Mes' : p === 'quarter' ? 'Trimestre' : 'Año'}
              </button>
            ))}
          </div>
        </div>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-text-muted">
            No hay datos para mostrar
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border-color" />
                <XAxis
                  dataKey="period"
                  className="text-text-muted text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  className="text-text-muted text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: 'var(--card-background)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend
                  formatter={(value) => (value === 'recaudado' ? 'Pagado' : value === 'porCobrar' ? 'Pendiente' : value)}
                />
                <Bar dataKey="recaudado" name="recaudado" fill="rgb(34 197 94)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="porCobrar" name="porCobrar" fill="rgb(245 158 11)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Selection bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-secondary/50 bg-secondary/5">
          <span className="text-text-primary font-medium">
            {selectedIds.size} factura(s) seleccionada(s)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary"
            >
              Deseleccionar
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={isBulkDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-red-500/50 text-red-500 hover:bg-red-500/10 font-medium disabled:opacity-50"
            >
              {isBulkDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Eliminar seleccionadas
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="text-text-muted" size={20} />
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all' as FilterType, label: 'Todos' },
            { id: 'paid' as FilterType, label: 'Pagados' },
            { id: 'pending' as FilterType, label: 'Pendientes' },
          ].map(({ id, label }) => (
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
        ) : sortedInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted text-lg">
              No hay facturas {filter !== 'all' ? 'en esta categoría' : ''}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead className="bg-bg-secondary/50 border-b border-border-color">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      ref={selectAllRef}
                      checked={
                        sortedInvoices.length > 0 &&
                        selectedIds.size === sortedInvoices.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border-color text-secondary focus:ring-secondary"
                      aria-label="Seleccionar todas"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('student')}
                      className="flex items-center gap-1 hover:text-text-primary transition-colors"
                    >
                      Estudiante
                      <SortIcon k="student" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('program')}
                      className="flex items-center gap-1 hover:text-text-primary transition-colors"
                    >
                      Programa
                      <SortIcon k="program" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('label')}
                      className="flex items-center gap-1 hover:text-text-primary transition-colors"
                    >
                      Concepto
                      <SortIcon k="label" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-1 hover:text-text-primary transition-colors"
                    >
                      Monto
                      <SortIcon k="amount" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('due_date')}
                      className="flex items-center gap-1 hover:text-text-primary transition-colors"
                    >
                      Vencimiento
                      <SortIcon k="due_date" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-text-primary transition-colors"
                    >
                      Estado
                      <SortIcon k="status" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('paid_at')}
                      className="flex items-center gap-1 hover:text-text-primary transition-colors"
                    >
                      Fecha pago
                      <SortIcon k="paid_at" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color bg-[var(--card-background)]">
                {sortedInvoices.map((inv, index) => {
                  const profile = Array.isArray(inv.enrollment?.profile)
                    ? inv.enrollment?.profile[0]
                    : inv.enrollment?.profile;
                  const programRaw = inv.enrollment?.cohort?.program;
                  const program = Array.isArray(programRaw) ? programRaw[0] : programRaw;
                  const studentName = profile
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                    : '—';
                  const studentHref = profile?.user_id
                    ? `/admin/estudiantes/${profile.user_id}`
                    : null;

                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-bg-secondary/30 transition-colors ${
                        selectedIds.has(inv.id) ? 'bg-secondary/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(inv.id)}
                          onChange={() => toggleSelect(inv.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-border-color text-secondary focus:ring-secondary"
                          aria-label={`Seleccionar factura ${inv.label}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-text-muted font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        {studentHref ? (
                          <Link
                            href={studentHref}
                            className="font-medium text-text-primary hover:text-secondary"
                          >
                            {studentName || '—'}
                          </Link>
                        ) : (
                          <span className="text-text-primary">{studentName}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {program?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary max-w-[200px] truncate">
                        {inv.label || '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        ${inv.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {new Date(inv.due_date).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${
                            inv.status === 'paid'
                              ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
                              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
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
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {inv.url_recipe && (
                            <a
                              href={inv.url_recipe}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-secondary hover:underline"
                            >
                              Recibo
                            </a>
                          )}
                          {studentHref && (
                            <Link
                              href={studentHref}
                              title="Ver detalles"
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-secondary text-secondary hover:bg-secondary/10 transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv)}
                            disabled={deletingId === inv.id}
                            title="Eliminar factura"
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            {deletingId === inv.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
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
