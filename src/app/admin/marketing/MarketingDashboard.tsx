'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { BarChart3, Plus } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
import { adminTableClass, adminTableHeadCellClass, adminTableRowClass } from '@/components/admin/admin-table';
import { addMarketingSpend, getMarketingDashboard } from './actions';
import type { MarketingReport } from '@/lib/analytics/meta/dashboard';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function money(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CO')}`;
}

function pct(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${Math.round(value * 100)}%`;
}

function metric(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toLocaleString('es-CO', { maximumFractionDigits: 2 });
}

const FIELD =
  'h-10 rounded-lg border border-border-color bg-bg-secondary px-3 text-sm text-text-primary focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary';

export default function MarketingDashboard() {
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(todayIso());
  const [campaign, setCampaign] = useState('');
  const [programId, setProgramId] = useState('');
  const [routeSlug, setRouteSlug] = useState('');
  const [audienceInput, setAudienceInput] = useState('');
  const [audience, setAudience] = useState('');
  const [report, setReport] = useState<MarketingReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [spendOpen, setSpendOpen] = useState(false);
  const [spendSaving, setSpendSaving] = useState(false);
  const [spendForm, setSpendForm] = useState({
    campaignName: '',
    utmCampaign: '',
    utmContent: '',
    startsOn: daysAgo(7),
    endsOn: todayIso(),
    spend: '',
    notes: '',
  });
  const [spendError, setSpendError] = useState<string | null>(null);

  const loadSeq = useRef(0);

  useEffect(() => {
    const next = audienceInput.trim();
    const timer = window.setTimeout(() => {
      setAudience((prev) => (prev === next ? prev : next));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [audienceInput]);

  const filters = useMemo(
    () => ({
      from,
      to,
      campaign: campaign || undefined,
      programId: programId ? Number(programId) : null,
      routeSlug: routeSlug || undefined,
      audience: audience || undefined,
    }),
    [from, to, campaign, programId, routeSlug, audience]
  );

  function load() {
    const seq = ++loadSeq.current;
    startTransition(async () => {
      try {
        setError(null);
        const next = await getMarketingDashboard(filters);
        if (seq !== loadSeq.current) return;
        setReport(next);
      } catch (err) {
        if (seq !== loadSeq.current) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el reporte');
      }
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, campaign, programId, routeSlug, audience]);

  async function handleSpend(e: React.FormEvent) {
    e.preventDefault();
    if (spendSaving) return;
    setSpendSaving(true);
    setSpendError(null);
    try {
      const result = await addMarketingSpend({
        campaignName: spendForm.campaignName,
        utmCampaign: spendForm.utmCampaign,
        utmContent: spendForm.utmContent,
        startsOn: spendForm.startsOn,
        endsOn: spendForm.endsOn,
        spend: Number(spendForm.spend),
        notes: spendForm.notes,
      });
      if (!result.success) {
        setSpendError(result.error || 'No se pudo guardar el gasto');
        return;
      }
      setSpendOpen(false);
      setSpendForm((prev) => ({ ...prev, campaignName: '', spend: '', notes: '' }));
      load();
    } finally {
      setSpendSaving(false);
    }
  }

  if (!report && pending) {
    return <AdminPageSkeleton />;
  }

  const cards = report
    ? [
        { label: 'Gasto en ads', value: money(report.spend) },
        { label: 'Leads', value: String(report.leads) },
        { label: 'Diagnósticos agendados', value: String(report.diagnosticsScheduled) },
        { label: 'Diagnósticos completados', value: String(report.diagnosticsCompleted) },
        { label: 'Reservas', value: String(report.reservations) },
        { label: 'Matrículas', value: String(report.enrollments) },
        { label: 'Ingreso atribuido', value: money(report.attributedRevenue) },
        { label: 'CPL', value: report.cpl == null ? '—' : money(report.cpl) },
        { label: 'CAC', value: report.cac == null ? '—' : money(report.cac) },
        { label: 'ROAS', value: metric(report.roas) },
      ]
    : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={BarChart3}
        title="Marketing"
        subtitle="Atribución Meta Ads, funnel y resultado por campaña y programa."
        action={
          <button
            type="button"
            onClick={() => setSpendOpen((v) => !v)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Registrar gasto
          </button>
        }
      />

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <section className="grid gap-3 rounded-xl border border-border-color bg-[var(--card-background)] p-4 md:grid-cols-3 lg:grid-cols-6">
        <label className="flex flex-col gap-1 text-[12px] text-text-muted">
          Desde
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={FIELD} />
        </label>
        <label className="flex flex-col gap-1 text-[12px] text-text-muted">
          Hasta
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={FIELD} />
        </label>
        <label className="flex flex-col gap-1 text-[12px] text-text-muted">
          Campaña
          <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className={FIELD}>
            <option value="">Todas</option>
            {(report?.campaignOptions ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[12px] text-text-muted">
          Ruta
          <select value={routeSlug} onChange={(e) => setRouteSlug(e.target.value)} className={FIELD}>
            <option value="">Todas</option>
            {(report?.routeOptions ?? []).map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[12px] text-text-muted">
          Programa
          <select value={programId} onChange={(e) => setProgramId(e.target.value)} className={FIELD}>
            <option value="">Todos</option>
            {(report?.programOptions ?? []).map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[12px] text-text-muted">
          Audiencia / ad
          <input
            value={audienceInput}
            onChange={(e) => setAudienceInput(e.target.value)}
            placeholder="utm_content"
            className={FIELD}
          />
        </label>
      </section>

      {spendOpen && (
        <form
          onSubmit={handleSpend}
          className="grid gap-3 rounded-xl border border-border-color bg-[var(--card-background)] p-4 md:grid-cols-3"
        >
          <label className="flex flex-col gap-1 text-[12px] text-text-muted">
            Campaña
            <input
              required
              value={spendForm.campaignName}
              onChange={(e) => setSpendForm((s) => ({ ...s, campaignName: e.target.value }))}
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-text-muted">
            utm_campaign
            <input
              value={spendForm.utmCampaign}
              onChange={(e) => setSpendForm((s) => ({ ...s, utmCampaign: e.target.value }))}
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-text-muted">
            utm_content
            <input
              value={spendForm.utmContent}
              onChange={(e) => setSpendForm((s) => ({ ...s, utmContent: e.target.value }))}
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-text-muted">
            Desde
            <input
              type="date"
              value={spendForm.startsOn}
              onChange={(e) => setSpendForm((s) => ({ ...s, startsOn: e.target.value }))}
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-text-muted">
            Hasta
            <input
              type="date"
              value={spendForm.endsOn}
              onChange={(e) => setSpendForm((s) => ({ ...s, endsOn: e.target.value }))}
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-text-muted">
            Gasto (COP)
            <input
              required
              type="number"
              min="0"
              value={spendForm.spend}
              onChange={(e) => setSpendForm((s) => ({ ...s, spend: e.target.value }))}
              className={FIELD}
            />
          </label>
          <label className="md:col-span-3 flex flex-col gap-1 text-[12px] text-text-muted">
            Notas
            <input
              value={spendForm.notes}
              onChange={(e) => setSpendForm((s) => ({ ...s, notes: e.target.value }))}
              className={FIELD}
            />
          </label>
          {spendError && <p className="md:col-span-3 text-sm text-red-400">{spendError}</p>}
          <div className="md:col-span-3">
            <button type="submit" className="btn-primary" disabled={spendSaving}>
              {spendSaving ? 'Guardando…' : 'Guardar gasto'}
            </button>
          </div>
        </form>
      )}

      {report && (
        <>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {cards.map((card) => (
              <article
                key={card.label}
                className="rounded-xl border border-border-color bg-[var(--card-background)] px-4 py-3"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">
                  {card.label}
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-text-primary">{card.value}</p>
              </article>
            ))}
          </section>

          <section className={adminTableClass}>
            <header className="border-b border-border-color px-4 py-3">
              <h2 className="text-sm font-semibold text-text-primary">Funnel</h2>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={adminTableHeadCellClass}>Paso</th>
                    <th className={adminTableHeadCellClass}>Conteo</th>
                    <th className={adminTableHeadCellClass}>Conversión</th>
                  </tr>
                </thead>
                <tbody>
                  {report.funnel.map((step) => (
                    <tr key={step.key} className={adminTableRowClass}>
                      <td className="px-4 py-3 text-text-primary">{step.label}</td>
                      <td className="px-4 py-3 tabular-nums text-text-primary">{step.count}</td>
                      <td className="px-4 py-3 tabular-nums text-text-muted">{pct(step.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={adminTableClass}>
            <header className="border-b border-border-color px-4 py-3">
              <h2 className="text-sm font-semibold text-text-primary">Campañas</h2>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {[
                      'Campaña',
                      'Ad',
                      'Programa',
                      'Leads',
                      'Diagnósticos',
                      'Reservas',
                      'Matrículas',
                      'Ingresos',
                      'Gasto',
                      'CPL',
                      'CAC',
                      'ROAS',
                    ].map((label) => (
                      <th key={label} className={adminTableHeadCellClass}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-6 text-center text-text-muted">
                        Aún no hay campañas atribuidas en este rango.
                      </td>
                    </tr>
                  ) : (
                    report.campaigns.map((row) => (
                      <tr key={`${row.campaign}-${row.ad}-${row.program}`} className={adminTableRowClass}>
                        <td className="px-4 py-3 text-text-primary">{row.campaign}</td>
                        <td className="px-4 py-3 text-text-muted">{row.ad}</td>
                        <td className="px-4 py-3 text-text-muted">{row.program}</td>
                        <td className="px-4 py-3 tabular-nums">{row.leads}</td>
                        <td className="px-4 py-3 tabular-nums">{row.diagnostics}</td>
                        <td className="px-4 py-3 tabular-nums">{row.reservations}</td>
                        <td className="px-4 py-3 tabular-nums">{row.enrollments}</td>
                        <td className="px-4 py-3 tabular-nums">{money(row.revenue)}</td>
                        <td className="px-4 py-3 tabular-nums">{money(row.spend)}</td>
                        <td className="px-4 py-3 tabular-nums">{row.cpl == null ? '—' : money(row.cpl)}</td>
                        <td className="px-4 py-3 tabular-nums">{row.cac == null ? '—' : money(row.cac)}</td>
                        <td className="px-4 py-3 tabular-nums">{metric(row.roas)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className={adminTableClass}>
            <header className="border-b border-border-color px-4 py-3">
              <h2 className="text-sm font-semibold text-text-primary">Resultados por programa</h2>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {[
                      'Programa',
                      'Leads',
                      'Diagnósticos',
                      'Reservas',
                      'Matrículas',
                      'Cupos',
                      'Ocupación',
                      'Ingresos',
                      'CAC',
                    ].map((label) => (
                      <th key={label} className={adminTableHeadCellClass}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.programs.map((row) => (
                    <tr key={row.programId} className={adminTableRowClass}>
                      <td className="px-4 py-3 text-text-primary">{row.name}</td>
                      <td className="px-4 py-3 tabular-nums">{row.leads}</td>
                      <td className="px-4 py-3 tabular-nums">{row.diagnostics}</td>
                      <td className="px-4 py-3 tabular-nums">{row.reservations}</td>
                      <td className="px-4 py-3 tabular-nums">{row.enrollments}</td>
                      <td className="px-4 py-3 tabular-nums">
                        {row.enrollments}/{row.seats}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {pct(row.occupancy)} · {row.seatsRemaining} libres
                      </td>
                      <td className="px-4 py-3 tabular-nums">{money(row.revenue)}</td>
                      <td className="px-4 py-3 tabular-nums">{row.cac == null ? '—' : money(row.cac)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
