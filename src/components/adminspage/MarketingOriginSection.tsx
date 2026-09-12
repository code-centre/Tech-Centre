'use client';

import { useState, useTransition } from 'react';
import { markDiagnosticCompleted } from '@/app/admin/marketing/actions';

export interface MarketingOriginData {
  leadId?: number | null;
  source?: string | null;
  campaign?: string | null;
  creative?: string | null;
  firstLanding?: string | null;
  firstTouchAt?: string | null;
  lastCampaign?: string | null;
  lastTouchAt?: string | null;
  diagnosticStatus: 'none' | 'scheduled' | 'completed';
  reservationAmount: number;
  totalPaid: number;
  attributableCac: number | null;
}

function money(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CO')}`;
}

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

const DIAG: Record<MarketingOriginData['diagnosticStatus'], string> = {
  none: 'Sin diagnóstico',
  scheduled: 'Agendado',
  completed: 'Completado',
};

export default function MarketingOriginSection({
  data,
  onUpdated,
  canMarkDiagnostic = false,
}: {
  data: MarketingOriginData;
  onUpdated?: () => void;
  canMarkDiagnostic?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(data.diagnosticStatus);
  const [error, setError] = useState<string | null>(null);

  function complete() {
    if (!data.leadId) return;
    startTransition(async () => {
      const result = await markDiagnosticCompleted(data.leadId as number);
      if (!result.success) {
        setError(result.error || 'No se pudo marcar el diagnóstico');
        return;
      }
      setStatus('completed');
      onUpdated?.();
    });
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
      <header className="border-b border-border-color px-5 py-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          Origen / Marketing
        </h2>
      </header>
      <dl className="grid grid-cols-1 gap-px bg-border-color sm:grid-cols-2">
        <Item label="Fuente" value={data.source || 'orgánico / directo'} />
        <Item label="Campaña" value={data.campaign || '—'} />
        <Item label="Creativo / ad" value={data.creative || '—'} />
        <Item label="Primera landing" value={data.firstLanding || '—'} />
        <Item label="First touch" value={formatWhen(data.firstTouchAt)} />
        <Item label="Last touch" value={`${data.lastCampaign || '—'} · ${formatWhen(data.lastTouchAt)}`} />
        <Item label="Diagnóstico" value={DIAG[status]} />
        <Item label="Apartado" value={money(data.reservationAmount)} />
        <Item label="Total pagado" value={money(data.totalPaid)} />
        <Item label="CAC atribuible" value={data.attributableCac == null ? '—' : money(data.attributableCac)} />
      </dl>
      {canMarkDiagnostic && data.leadId && status !== 'completed' && (
        <div className="px-5 py-3">
          <button
            type="button"
            onClick={complete}
            disabled={pending}
            className="inline-flex h-9 items-center rounded-lg border border-border-color bg-bg-secondary px-3.5 text-[13.5px] font-medium text-text-primary hover:border-secondary/50 disabled:opacity-50"
          >
            Marcar diagnóstico completado
          </button>
          {error && <p className="mt-2 text-[12.5px] text-red-400">{error}</p>}
        </div>
      )}
    </section>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--card-background)] px-5 py-3">
      <dt className="text-[11px] uppercase tracking-[0.06em] text-text-muted">{label}</dt>
      <dd className="mt-1 break-all text-[13.5px] text-text-primary">{value}</dd>
    </div>
  );
}
