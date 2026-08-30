'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Search, Check, Loader2, AlertCircle } from 'lucide-react';
import { useSupabaseClient } from '@/lib/supabase';
import { createInvoiceAdmin } from '@/app/admin/pagos/actions';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface EnrollmentOption {
  id: number;
  student: string;
  email: string;
  program: string;
  cohort: string;
}

const FIELD =
  'w-full px-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all';

const METHODS = [
  { value: 'transfer', label: 'Transferencia' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
];

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

/** Hoy en formato YYYY-MM-DD, en hora local. */
function today(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

/**
 * Registra una factura suelta. El checkout crea la cobranza normal; esto es
 * para lo acordado por fuera: una cuota extra, un pago en efectivo, una
 * corrección.
 */
export default function NewInvoiceModal({ open, onClose, onCreated }: Props) {
  const supabase = useSupabaseClient();

  const [enrollments, setEnrollments] = useState<EnrollmentOption[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<EnrollmentOption | null>(null);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(today);
  const [markPaid, setMarkPaid] = useState(false);
  const [method, setMethod] = useState('transfer');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const load = async () => {
      setLoadingList(true);
      try {
        const { data, error: listError } = await supabase
          .from('enrollments')
          .select(
            `id, profile:profiles(first_name, last_name, email), cohort:cohorts(name, program:programs(name))`
          )
          .order('id', { ascending: false })
          .limit(400);

        if (listError) throw listError;

        const options = (data ?? []).map((row: Record<string, unknown>) => {
          const profile = unwrap(row.profile as { first_name?: string; last_name?: string; email?: string });
          const cohort = unwrap(row.cohort as { name?: string; program?: unknown });
          const program = unwrap(cohort?.program as { name?: string });
          return {
            id: row.id as number,
            student: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Sin nombre',
            email: profile?.email ?? '',
            program: program?.name ?? 'Sin programa',
            cohort: cohort?.name ?? '',
          };
        });

        if (!cancelled) setEnrollments(options);
      } catch (err) {
        console.error('Error al cargar matrículas:', err);
        if (!cancelled) setError('No se pudieron cargar las matrículas.');
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, supabase]);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return enrollments.slice(0, 6);
    return enrollments
      .filter((option) =>
        `${option.student} ${option.email} ${option.program} ${option.cohort}`.toLowerCase().includes(term)
      )
      .slice(0, 6);
  }, [enrollments, query]);

  if (!open) return null;

  const reset = () => {
    setQuery('');
    setSelected(null);
    setLabel('');
    setAmount('');
    setDueDate(today());
    setMarkPaid(false);
    setMethod('transfer');
    setNotes('');
    setError('');
  };

  const close = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (!selected) {
      setError('Elige la matrícula a la que va la factura.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await createInvoiceAdmin({
        enrollmentId: selected.id,
        label,
        amount: Number(amount),
        dueDate,
        markPaid,
        paymentMethod: markPaid ? method : undefined,
        notes,
      });
      if (!result.success) throw new Error(result.error ?? 'No se pudo registrar el pago');
      reset();
      onCreated();
      onClose();
    } catch (err) {
      const detail = (err as { message?: string } | null)?.message;
      setError(detail || 'No se pudo registrar el pago.');
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = Boolean(selected && label.trim() && Number(amount) > 0 && dueDate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nuevo-pago-titulo"
      onClick={close}
    >
      <div
        className="w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-2xl bg-[var(--card-background)] border border-border-color shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border-color">
          <div className="flex flex-col gap-1">
            <h2 id="nuevo-pago-titulo" className="text-lg font-semibold text-text-primary">
              Registrar un pago
            </h2>
            <p className="text-xs text-text-muted">
              Para lo que no pasa por el checkout: una cuota acordada aparte, un pago en efectivo,
              una corrección.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={saving}
            aria-label="Cerrar"
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {error && (
            <p className="flex items-center gap-2 p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          )}

          {/* Estudiante */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-primary">Estudiante</span>
            {selected ? (
              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-bg-secondary border border-secondary/40">
                <div className="flex flex-col gap-px min-w-0 grow">
                  <span className="text-sm font-medium text-text-primary truncate">{selected.student}</span>
                  <span className="text-xs text-text-muted truncate">
                    {[selected.program, selected.cohort].filter(Boolean).join(' · ')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="shrink-0 text-[13px] text-secondary hover:underline underline-offset-2"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Busca por nombre, correo o programa…"
                    autoFocus
                    className={`${FIELD} pl-[38px]`}
                  />
                </div>
                <ul className="flex flex-col gap-1 mt-1">
                  {loadingList ? (
                    <li className="flex items-center gap-2 px-3 py-2.5 text-[13px] text-text-muted">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cargando matrículas…
                    </li>
                  ) : matches.length === 0 ? (
                    <li className="px-3 py-2.5 text-[13px] text-text-muted">
                      Ninguna matrícula coincide.
                    </li>
                  ) : (
                    matches.map((option) => (
                      <li key={option.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(option)}
                          className="w-full flex flex-col gap-px items-start px-3 py-2 rounded-lg text-left hover:bg-bg-secondary transition-colors"
                        >
                          <span className="text-[13.5px] font-medium text-text-primary">{option.student}</span>
                          <span className="text-xs text-text-muted">
                            {[option.program, option.cohort, option.email].filter(Boolean).join(' · ')}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-primary">Concepto</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Cuota 2 de 3"
              className={FIELD}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-text-primary">Monto (COP)</span>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="466667"
                className={FIELD}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-text-primary">Vence</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={FIELD}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 p-4 rounded-xl bg-bg-secondary border border-border-color">
            <button
              type="button"
              onClick={() => setMarkPaid((value) => !value)}
              aria-pressed={markPaid}
              className="flex items-center gap-2.5 text-left"
            >
              <span
                className={`flex items-center justify-center w-[18px] h-[18px] shrink-0 rounded-[5px] border ${
                  markPaid ? 'bg-secondary border-secondary' : 'border-[var(--border-color)]'
                }`}
              >
                {markPaid && <Check className="w-3 h-3 text-[#0E1116]" strokeWidth={3.2} />}
              </span>
              <span className="flex flex-col gap-px">
                <span className="text-[13.5px] font-medium text-text-primary">Ya está pagada</span>
                <span className="text-xs text-text-muted">
                  Se confirma la matrícula y se le avisa al estudiante, igual que al marcar una factura.
                </span>
              </span>
            </button>

            {markPaid && (
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-text-primary">Medio de pago</span>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className={FIELD}>
                  {METHODS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-primary">Observaciones</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional. Queda guardado en la factura."
              className={`${FIELD} resize-y`}
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-bg-secondary border-t border-border-color">
          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-border-color text-[13.5px] font-medium text-text-primary hover:bg-[var(--card-background)] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canSubmit || saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-[#0E1116] text-[13.5px] font-bold disabled:opacity-50 transition-opacity"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {markPaid ? 'Registrar y marcar pagada' : 'Registrar factura'}
          </button>
        </div>
      </div>
    </div>
  );
}
