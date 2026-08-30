'use client';

import { useSupabaseClient, useUser } from '@/lib/supabase';
import { useState, useEffect, useMemo } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
import {
  FileText,
  Search,
  SearchX,
  Check,
  X,
  Download,
  ArrowRight,
  Trash2,
  MessageSquare,
  FileCheck2,
  Loader2,
} from 'lucide-react';
import { MarkAsPaidModal } from './MarkAsPaidModal';
import { markInvoicePaidAdmin } from '@/app/admin/pagos/actions';
import {
  buildOverview,
  buildPeriodSeries,
  daysLate,
  derivedStatus,
  type DerivedStatus,
  type PeriodType,
} from '@/lib/payments';

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
  meta?: Record<string, unknown> | null;
  enrollment: Enrollment | null;
}

type FilterType = 'all' | 'overdue' | 'review' | 'pending' | 'paid';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'overdue', label: 'Vencidas' },
  { id: 'review', label: 'Por revisar' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'paid', label: 'Pagadas' },
];

const PERIODS: { id: PeriodType; label: string }[] = [
  { id: 'month', label: 'Mes' },
  { id: 'quarter', label: 'Trimestre' },
  { id: 'year', label: 'Año' },
];

const BUCKET_COLOR: Record<string, string> = {
  current: 'var(--pay-neutro)',
  d1_30: 'var(--pay-aviso)',
  d31_60: 'var(--pay-serio)',
  d60_plus: 'var(--pay-critico)',
};

const STATUS_STYLE: Record<DerivedStatus, { label: string; color: string; bg: string; border: string }> = {
  paid: { label: 'Pagada', color: 'var(--pay-serie-cobrado)', bg: 'color-mix(in srgb, var(--pay-serie-cobrado) 12%, transparent)', border: 'color-mix(in srgb, var(--pay-serie-cobrado) 34%, transparent)' },
  review: { label: 'Por revisar', color: 'var(--pay-aviso)', bg: 'color-mix(in srgb, var(--pay-aviso) 12%, transparent)', border: 'color-mix(in srgb, var(--pay-aviso) 34%, transparent)' },
  overdue: { label: 'Vencida', color: 'var(--pay-critico)', bg: 'color-mix(in srgb, var(--pay-critico) 12%, transparent)', border: 'color-mix(in srgb, var(--pay-critico) 34%, transparent)' },
  pending: { label: 'Pendiente', color: 'var(--pay-neutro)', bg: 'color-mix(in srgb, var(--pay-neutro) 10%, transparent)', border: 'color-mix(in srgb, var(--pay-neutro) 26%, transparent)' },
};

/** Columnas de la tabla: una sola definición para encabezado y filas. */
const GRID = 'grid grid-cols-[42px_minmax(0,1.5fr)_minmax(0,1.3fr)_130px_120px_150px_92px] gap-3.5';

function money(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

/** Etiquetas cortas del eje: $1,2M, $450k. */
function shortMoney(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}k`;
  return `$${Math.round(amount)}`;
}

function shortDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function studentName(inv: InvoiceRow): string {
  const profile = unwrap(inv.enrollment?.profile);
  if (!profile) return 'Sin estudiante';
  return `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'Sin nombre';
}

function studentEmail(inv: InvoiceRow): string {
  return unwrap(inv.enrollment?.profile)?.email ?? '—';
}

function programName(inv: InvoiceRow): string {
  return unwrap(inv.enrollment?.cohort?.program)?.name ?? 'Sin programa';
}

/** Cómo se pagó, para la columna de comprobante. */
function paymentLabel(inv: InvoiceRow): string | null {
  if (inv.status !== 'paid' && inv.status !== 'pending_review') return null;
  const method = inv.meta?.admin_payment_method as string | undefined;
  if (method === 'transfer') return 'Transferencia';
  if (method === 'cash') return 'Efectivo';
  if (inv.meta?.payment_id) return 'Wompi';
  if (inv.url_recipe) return 'Comprobante';
  return null;
}


export function PagosAdmin() {
  const supabase = useSupabaseClient();
  const { user } = useUser();

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [period, setPeriod] = useState<PeriodType>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [markingInvoice, setMarkingInvoice] = useState<InvoiceRow | null>(null);
  const [observationsInvoice, setObservationsInvoice] = useState<InvoiceRow | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [markingBulk, setMarkingBulk] = useState(false);

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
            meta,
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
        setInvoices((data || []) as unknown as InvoiceRow[]);
      } catch (err) {
        console.error('Error al cargar facturas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [supabase, refreshTrigger]);

  const overview = useMemo(() => buildOverview(invoices), [invoices]);
  const series = useMemo(() => buildPeriodSeries(invoices, period), [invoices, period]);

  const programs = useMemo(() => {
    const names = new Set<string>();
    invoices.forEach((inv) => names.add(programName(inv)));
    return Array.from(names).sort();
  }, [invoices]);

  const reviewQueue = useMemo(
    () => invoices.filter((inv) => inv.status === 'pending_review').slice(0, 3),
    [invoices]
  );

  const counts = useMemo(() => {
    const byStatus = invoices.map((inv) => derivedStatus(inv));
    return {
      all: invoices.length,
      overdue: byStatus.filter((s) => s === 'overdue').length,
      review: byStatus.filter((s) => s === 'review').length,
      pending: byStatus.filter((s) => s === 'pending').length,
      paid: byStatus.filter((s) => s === 'paid').length,
    };
  }, [invoices]);

  const visible = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (filter !== 'all' && derivedStatus(inv) !== filter) return false;
      if (programFilter !== 'all' && programName(inv) !== programFilter) return false;
      if (!term) return true;
      return `${studentName(inv)} ${studentEmail(inv)} ${inv.label ?? ''} ${programName(inv)}`
        .toLowerCase()
        .includes(term);
    });
  }, [invoices, filter, programFilter, searchTerm]);

  const selectedAmount = useMemo(
    () => invoices.filter((inv) => selectedIds.has(inv.id)).reduce((total, inv) => total + inv.amount, 0),
    [invoices, selectedIds]
  );

  const scale = useMemo(() => {
    const peak = series.reduce((max, point) => Math.max(max, point.collected, point.receivable), 0);
    return Math.max(Math.ceil(peak / 2_000_000) * 2_000_000, 2_000_000);
  }, [series]);

  const toggleRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /**
   * Marca en lote reusando la misma acción del modal: confirma la matrícula y
   * avisa al estudiante. No fija medio de pago — para eso está el modal de una
   * sola factura.
   */
  const handleMarkSelectedPaid = async () => {
    const targets = invoices.filter((inv) => selectedIds.has(inv.id) && inv.status !== 'paid');
    if (targets.length === 0) return;
    if (
      !confirm(
        `¿Marcar ${targets.length} factura(s) como pagadas por ${money(
          targets.reduce((total, inv) => total + inv.amount, 0)
        )}? Se confirma la matrícula y se avisa a cada estudiante.`
      )
    ) {
      return;
    }

    setMarkingBulk(true);
    try {
      const paidAt = new Date().toISOString();
      for (const invoice of targets) {
        const result = await markInvoicePaidAdmin(invoice.id, {
          status: 'paid',
          paid_at: paidAt,
          meta: { ...(invoice.meta || {}) },
          url_recipe: invoice.url_recipe,
        });
        if (!result.success) throw new Error(result.error ?? 'Error al marcar como pagada');
      }
      setSelectedIds(new Set());
      setRefreshTrigger((t) => t + 1);
    } catch (err) {
      console.error('Error al marcar facturas como pagadas:', err);
      alert(
        (err as { message?: string } | null)?.message ??
          'No se pudieron marcar todas las facturas. Revisa cuáles quedaron pendientes.'
      );
      setRefreshTrigger((t) => t + 1);
    } finally {
      setMarkingBulk(false);
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

  if (!user || user?.role !== 'admin') {
    return <div className="p-8 text-center text-text-primary">No tienes permisos para ver esta sección</div>;
  }

  if (loading) return <AdminPageSkeleton />;

  const kpis = [
    {
      label: 'Recaudado',
      value: money(overview.collected),
      note: `${overview.paidCount} ${overview.paidCount === 1 ? 'factura pagada' : 'facturas pagadas'}`,
      dot: 'var(--pay-serie-cobrado)',
      alert: false,
    },
    {
      label: 'Por cobrar',
      value: money(overview.receivable),
      note: `${overview.openCount} ${overview.openCount === 1 ? 'factura abierta' : 'facturas abiertas'}`,
      dot: 'var(--pay-serie-porcobrar)',
      alert: false,
    },
    {
      label: 'Vencido',
      value: money(overview.overdue),
      note:
        overview.overdueCount > 0
          ? `${overview.overdueCount} facturas, la más vieja hace ${overview.worstDaysLate} días`
          : 'Nada vencido',
      dot: 'var(--pay-critico)',
      alert: overview.overdue > 0,
    },
    {
      label: 'Tasa de cobro',
      value: `${overview.collectionRate}%`,
      note: 'De todo lo facturado hasta hoy',
      dot: 'var(--pay-neutro)',
      alert: false,
    },
  ];

  const axis = [4, 3, 2, 1, 0].map((step) => shortMoney((scale / 4) * step));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={FileText}
        title="Pagos"
        subtitle={`${invoices.length} facturas · ${money(overview.receivable)} por cobrar · ${money(overview.overdue)} vencido`}
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm font-medium text-text-primary hover:border-secondary/50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        }
      />

      {/* Cifras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`flex flex-col gap-2 p-5 rounded-xl bg-[var(--card-background)] border ${
              kpi.alert ? 'border-[color-mix(in_srgb,var(--pay-critico)_32%,transparent)]' : 'border-border-color'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: kpi.dot }} aria-hidden />
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                {kpi.label}
              </span>
            </div>
            <span
              className="text-[26px] font-bold tracking-tight tabular-nums"
              style={{ color: kpi.alert ? 'var(--pay-critico)' : 'var(--text-primary)' }}
            >
              {kpi.value}
            </span>
            <span className="text-[13px] leading-snug text-text-muted">{kpi.note}</span>
          </div>
        ))}
      </div>

      {/* Antigüedad de la cartera + comprobantes por revisar */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-4 items-stretch">
        <section className="flex flex-col gap-[18px] p-6 rounded-xl bg-[var(--card-background)] border border-border-color">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold text-text-primary">Antigüedad de la cartera</h2>
              <p className="text-xs text-text-muted">
                Cómo se reparte lo que está por cobrar, según hace cuánto venció.
              </p>
            </div>
            <span className="shrink-0 text-[13px] text-text-muted">Total {money(overview.receivable)}</span>
          </div>

          <div className="flex h-3.5 gap-0.5 rounded-[7px] overflow-hidden">
            {overview.buckets.map((bucket) => (
              <span
                key={bucket.id}
                className="block h-full rounded-[3px]"
                style={{ background: BUCKET_COLOR[bucket.id], width: `${bucket.share}%` }}
                aria-hidden
              />
            ))}
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-3">
            {overview.buckets.map((bucket) => (
              <li key={bucket.id} className="flex items-center gap-2.5">
                <span
                  className="h-[9px] w-[9px] shrink-0 rounded-[3px]"
                  style={{ background: BUCKET_COLOR[bucket.id] }}
                  aria-hidden
                />
                <span className="grow text-[13.5px] text-text-primary">{bucket.label}</span>
                <span className="text-[13.5px] font-semibold tabular-nums text-text-primary">
                  {money(bucket.amount)}
                </span>
                <span className="w-[52px] text-right text-[12.5px] tabular-nums text-text-muted">
                  {bucket.share}%
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4 p-6 rounded-xl bg-[var(--card-background)] border border-[color-mix(in_srgb,var(--pay-aviso)_32%,transparent)]">
          <div className="flex items-start gap-3">
            <span
              className="shrink-0 flex items-center justify-center w-9 h-9 rounded-[9px]"
              style={{
                background: 'color-mix(in srgb, var(--pay-aviso) 12%, transparent)',
                color: 'var(--pay-aviso)',
              }}
            >
              <FileCheck2 className="w-[18px] h-[18px]" aria-hidden />
            </span>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold text-text-primary">Comprobantes por revisar</h2>
              <p className="text-xs text-text-muted">Alguien subió el soporte y espera respuesta.</p>
            </div>
          </div>

          {reviewQueue.length === 0 ? (
            <p className="text-[13.5px] text-text-muted py-2">Nada pendiente de revisar.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {reviewQueue.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[9px] bg-bg-secondary border border-border-color"
                >
                  <div className="flex flex-col gap-px min-w-0 grow">
                    <span className="text-[13.5px] font-medium text-text-primary truncate">
                      {studentName(inv)}
                    </span>
                    <span className="text-xs text-text-muted truncate">
                      {[inv.label, paymentLabel(inv)].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <span className="shrink-0 text-[13.5px] font-semibold tabular-nums text-text-primary">
                    {money(inv.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMarkingInvoice(inv)}
                    aria-label={`Confirmar el pago de ${studentName(inv)}`}
                    className="shrink-0 flex items-center justify-center w-[30px] h-[30px] rounded-[7px] bg-secondary/15 border border-secondary/30 text-secondary hover:bg-secondary/25 transition-colors"
                  >
                    <Check className="w-[15px] h-[15px]" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => {
              setFilter('review');
              setSelectedIds(new Set());
            }}
            className="mt-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border border-border-color text-[13.5px] font-medium text-text-primary hover:border-secondary/50 transition-colors"
          >
            Ver {counts.review === 1 ? 'el comprobante' : `los ${counts.review}`} en la tabla
            <ArrowRight className="w-[15px] h-[15px]" />
          </button>
        </section>
      </div>

      {/* Recaudo en el tiempo */}
      <section className="flex flex-col gap-5 p-6 rounded-xl bg-[var(--card-background)] border border-border-color">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-text-primary">Recaudo en el tiempo</h2>
            <p className="text-xs text-text-muted">
              Lo cobrado frente a lo que quedó por cobrar, por su fecha de vencimiento.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <ul className="flex items-center gap-4">
              <li className="flex items-center gap-[7px]">
                <span
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{ background: 'var(--pay-serie-cobrado)' }}
                  aria-hidden
                />
                <span className="text-[12.5px] text-text-primary">Recaudado</span>
              </li>
              <li className="flex items-center gap-[7px]">
                <span
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{ background: 'var(--pay-serie-porcobrar)' }}
                  aria-hidden
                />
                <span className="text-[12.5px] text-text-primary">Por cobrar</span>
              </li>
            </ul>
            <div className="flex gap-1 p-1 rounded-[9px] bg-bg-secondary border border-border-color">
              {PERIODS.map((item) => {
                const isActive = period === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPeriod(item.id)}
                    aria-pressed={isActive}
                    className={`px-3.5 py-[7px] rounded-[7px] text-[13px] transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--card-background)] border border-border-color font-semibold text-text-primary'
                        : 'border border-transparent font-medium text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {series.length === 0 ? (
          <p className="text-[13.5px] text-text-muted py-8 text-center">
            Todavía no hay pagos ni vencimientos que graficar.
          </p>
        ) : (
          <div className="flex gap-3.5">
            <ul className="flex flex-col justify-between h-52 pb-6 shrink-0">
              {axis.map((label) => (
                <li key={label} className="text-[11px] leading-none tabular-nums text-right text-text-muted">
                  {label}
                </li>
              ))}
            </ul>

            <div className="relative grow h-52">
              <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between" aria-hidden>
                {[0, 1, 2, 3, 4].map((line) => (
                  <span key={line} className="h-px bg-border-color" />
                ))}
              </div>

              <div className="absolute inset-0 flex items-end justify-between gap-2.5">
                {series.map((point) => (
                  <div key={point.key} className="flex flex-col items-center gap-2 grow h-full">
                    <div className="group relative flex items-end justify-center gap-0.5 w-full h-[184px]">
                      <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-10 flex flex-col gap-0.5 px-2.5 py-[7px] rounded-lg bg-bg-primary border border-border-color whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[11px] text-text-muted">{point.label}</span>
                        <span className="text-xs" style={{ color: 'var(--pay-serie-cobrado)' }}>
                          Recaudado {money(point.collected)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--pay-serie-porcobrar)' }}>
                          Por cobrar {money(point.receivable)}
                        </span>
                      </span>
                      <span
                        className="block w-[22px] rounded-t"
                        style={{
                          background: 'var(--pay-serie-cobrado)',
                          height: `${(point.collected / scale) * 100}%`,
                        }}
                        aria-hidden
                      />
                      <span
                        className="block w-[22px] rounded-t"
                        style={{
                          background: 'var(--pay-serie-porcobrar)',
                          height: `${(point.receivable / scale) * 100}%`,
                        }}
                        aria-hidden
                      />
                    </div>
                    <span className="text-[11.5px] whitespace-nowrap text-text-muted">{point.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3.5">
        <div className="relative grow min-w-[260px] max-w-[380px]">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Estudiante, correo o concepto…"
            aria-label="Buscar facturas"
            className="w-full pl-[38px] pr-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
          />
        </div>

        <div className="flex gap-1 p-1 rounded-[9px] bg-bg-secondary border border-border-color">
          {FILTERS.map((item) => {
            const isActive = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setFilter(item.id);
                  setSelectedIds(new Set());
                }}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-[7px] px-3.5 py-[7px] rounded-[7px] text-[13px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--card-background)] border border-border-color font-semibold text-text-primary'
                    : 'border border-transparent font-medium text-text-muted hover:text-text-primary'
                }`}
              >
                {item.label}
                <span
                  className={`px-1.5 py-px rounded-full text-[11.5px] font-semibold ${
                    isActive ? 'bg-secondary/15 text-secondary' : 'bg-[var(--card-background)] text-text-muted'
                  }`}
                >
                  {counts[item.id]}
                </span>
              </button>
            );
          })}
        </div>

        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          aria-label="Filtrar por programa"
          className="px-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-[13.5px] text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
        >
          <option value="all">Todos los programas</option>
          {programs.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <span className="ml-auto text-[13px] tabular-nums text-text-muted">
          {visible.length === invoices.length
            ? `Las ${invoices.length} facturas`
            : `${visible.length} de ${invoices.length}`}
        </span>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-border-color bg-[var(--card-background)] overflow-hidden">
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3.5 px-5 py-3 bg-secondary/10 border-b border-secondary/30">
            <span className="text-[13.5px] font-semibold text-secondary">
              {selectedIds.size === 1 ? '1 factura seleccionada' : `${selectedIds.size} facturas seleccionadas`}
            </span>
            <span className="text-[13px] text-text-muted">·</span>
            <span className="text-[13.5px] tabular-nums text-text-primary">{money(selectedAmount)}</span>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkSelectedPaid}
                disabled={markingBulk}
                className="inline-flex items-center gap-[7px] px-3.5 py-2 rounded-lg bg-secondary text-[#0E1116] text-[13.5px] font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {markingBulk ? <Loader2 className="w-[15px] h-[15px] animate-spin" /> : <Check className="w-[15px] h-[15px]" />}
                Marcar como pagadas
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={deletingId === -1}
                className="inline-flex items-center gap-[7px] px-3.5 py-2 rounded-lg border border-red-500/40 bg-red-500/15 text-[13.5px] font-medium text-red-400 hover:bg-red-500/25 disabled:opacity-50 transition-colors"
              >
                {deletingId === -1 ? <Loader2 className="w-[15px] h-[15px] animate-spin" /> : <Trash2 className="w-[15px] h-[15px]" />}
                Eliminar
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                aria-label="Limpiar selección"
                className="flex items-center justify-center w-[30px] h-[30px] rounded-[7px] text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-[15px] h-[15px]" />
              </button>
            </div>
          </div>
        )}

        <div className={`${GRID} px-5 py-[11px] bg-bg-secondary border-b border-border-color text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted`}>
          <span />
          <span>Estudiante</span>
          <span>Programa · concepto</span>
          <span className="text-right">Monto</span>
          <span>Vence</span>
          <span>Estado</span>
          <span className="text-right">Comprobante</span>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 py-14">
            <SearchX className="w-7 h-7 text-text-muted" aria-hidden />
            <span className="text-[14.5px] font-medium text-text-primary">Ninguna factura coincide</span>
            <span className="text-[13px] text-text-muted">Cambia el estado o limpia la búsqueda.</span>
          </div>
        ) : (
          visible.map((inv, index) => {
            const status = derivedStatus(inv);
            const style = STATUS_STYLE[status];
            const late = daysLate(inv);
            const isSelected = selectedIds.has(inv.id);
            const receipt = paymentLabel(inv);

            return (
              <div
                key={inv.id}
                className={`${GRID} px-5 py-[13px] ${index > 0 ? 'border-t border-border-color' : ''} ${
                  isSelected ? 'bg-secondary/5' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleRow(inv.id)}
                  aria-label={`Seleccionar la factura de ${studentName(inv)}`}
                  aria-pressed={isSelected}
                  className="flex items-center justify-start"
                >
                  <span
                    className={`flex items-center justify-center w-[18px] h-[18px] rounded-[5px] border ${
                      isSelected ? 'bg-secondary border-secondary' : 'border-[var(--border-color)]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-[#0E1116]" strokeWidth={3.2} />}
                  </span>
                </button>

                <div className="flex flex-col gap-px min-w-0 self-center">
                  <span className="text-sm font-medium text-text-primary truncate">{studentName(inv)}</span>
                  <span className="text-[12.5px] text-text-muted truncate">{studentEmail(inv)}</span>
                </div>

                <div className="flex flex-col gap-px min-w-0 self-center">
                  <span className="text-[13.5px] text-text-primary truncate">{programName(inv)}</span>
                  <span className="text-[12.5px] text-text-muted truncate">{inv.label}</span>
                </div>

                <span className="self-center text-right text-sm font-semibold tabular-nums text-text-primary">
                  {money(inv.amount)}
                </span>

                <div className="flex flex-col gap-px self-center">
                  <span className="text-[13.5px] tabular-nums text-text-primary">{shortDate(inv.due_date)}</span>
                  <span
                    className="text-xs"
                    style={{ color: late > 0 ? 'var(--pay-critico)' : undefined }}
                  >
                    <span className={late > 0 ? '' : 'text-text-muted'}>
                      {late > 0 ? `hace ${late} días` : status === 'paid' ? 'pagada' : 'a tiempo'}
                    </span>
                  </span>
                </div>

                <div className="self-center">
                  <button
                    type="button"
                    onClick={() => (status === 'paid' ? setObservationsInvoice(inv) : setMarkingInvoice(inv))}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12.5px] font-medium whitespace-nowrap border transition-opacity hover:opacity-80"
                    style={{ background: style.bg, borderColor: style.border, color: style.color }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: style.color }} aria-hidden />
                    {style.label}
                  </button>
                </div>

                <div className="self-center flex items-center justify-end gap-1.5">
                  {inv.url_recipe ? (
                    <a
                      href={inv.url_recipe}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12.5px] text-text-primary underline underline-offset-[3px] hover:text-secondary transition-colors"
                    >
                      {receipt ?? 'Ver'}
                    </a>
                  ) : (
                    <span className="text-[12.5px] text-text-muted">{receipt ?? 'Sin soporte'}</span>
                  )}
                  {(inv.meta?.admin_notes as string | undefined)?.trim() && (
                    <button
                      type="button"
                      onClick={() => setObservationsInvoice(inv)}
                      aria-label="Ver observaciones"
                      className="shrink-0 text-text-muted hover:text-secondary transition-colors"
                    >
                      <MessageSquare className="w-[15px] h-[15px]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <MarkAsPaidModal
        invoice={markingInvoice}
        isOpen={!!markingInvoice}
        onClose={() => setMarkingInvoice(null)}
        onSuccess={() => setRefreshTrigger((t) => t + 1)}
      />

      {observationsInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="observaciones-title"
          onClick={() => setObservationsInvoice(null)}
        >
          <div
            className="bg-[var(--card-background)] rounded-xl border border-border-color shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="observaciones-title" className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-secondary" />
                Observaciones
              </h2>
              <button
                type="button"
                onClick={() => setObservationsInvoice(null)}
                className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-text-muted mb-2">
              {observationsInvoice.label} — {money(observationsInvoice.amount)}
            </p>
            <div className="rounded-lg border border-border-color bg-bg-secondary/50 p-4 min-h-[100px]">
              {(observationsInvoice.meta?.admin_notes as string | undefined)?.trim() ? (
                <p className="text-text-primary whitespace-pre-wrap">
                  {String(observationsInvoice.meta?.admin_notes ?? '')}
                </p>
              ) : (
                <p className="text-text-muted italic">Sin observaciones</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
