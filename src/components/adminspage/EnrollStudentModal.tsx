'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { useSupabaseClient } from '@/lib/supabase';
import { formatShortDate, parseLocalDate } from '@/lib/students';

const FIELD =
  'w-full px-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all';

interface CohortOption {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  modality: string | null;
  program: string;
  defaultPrice: number | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onEnrolled: () => void;
  studentId: string;
  studentName: string;
  /** Cohortes en las que ya está, para no ofrecerlas dos veces. */
  enrolledCohortIds: number[];
}

function today(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

/** Reparte el total en cuotas mensuales; la última absorbe el redondeo. */
function splitInstallments(total: number, count: number, firstDue: string) {
  if (count <= 1) return [{ number: 1, amount: total, dueDate: firstDue }];

  const base = Math.floor(total / count);
  const start = parseLocalDate(firstDue) ?? new Date();

  return Array.from({ length: count }, (_, index) => {
    const due = new Date(start);
    due.setMonth(due.getMonth() + index);
    due.setMinutes(due.getMinutes() - due.getTimezoneOffset());
    return {
      number: index + 1,
      amount: index === count - 1 ? total - base * (count - 1) : base,
      dueDate: due.toISOString().slice(0, 10),
    };
  });
}

/**
 * Matricular desde la ficha de la persona: la persona ya está elegida y lo que
 * falta por decidir es la cohorte y cómo va a pagar.
 */
export default function EnrollStudentModal({
  open,
  onClose,
  onEnrolled,
  studentId,
  studentName,
  enrolledCohortIds,
}: Props) {
  const supabase = useSupabaseClient();

  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [cohortId, setCohortId] = useState('');
  const [price, setPrice] = useState('');
  const [installments, setInstallments] = useState('1');
  const [firstDue, setFirstDue] = useState(today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const load = async () => {
      setLoadingList(true);
      try {
        const { data, error: listError } = await supabase
          .from('cohorts')
          .select('id, name, start_date, end_date, modality, program:programs(name, default_price)')
          .gte('end_date', today())
          .order('start_date', { ascending: true });

        if (listError) throw listError;

        const options: CohortOption[] = (data ?? []).map((raw: Record<string, unknown>) => {
          const programRaw = raw.program as { name?: string; default_price?: number } | { name?: string; default_price?: number }[] | null;
          const program = Array.isArray(programRaw) ? programRaw[0] : programRaw;
          return {
            id: raw.id as number,
            name: (raw.name as string) ?? 'Cohorte',
            startDate: (raw.start_date as string) ?? null,
            endDate: (raw.end_date as string) ?? null,
            modality: (raw.modality as string) ?? null,
            program: program?.name ?? 'Sin programa',
            defaultPrice: program?.default_price ?? null,
          };
        });

        if (!cancelled) setCohorts(options.filter((c) => !enrolledCohortIds.includes(c.id)));
      } catch (err) {
        console.error('Error al cargar cohortes:', err);
        if (!cancelled) setError('No se pudieron cargar las cohortes abiertas.');
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, supabase, enrolledCohortIds]);

  const selected = useMemo(
    () => cohorts.find((c) => String(c.id) === cohortId) ?? null,
    [cohorts, cohortId]
  );

  // Al elegir cohorte se propone el precio de lista del programa; el admin lo
  // cambia si acordó otra cosa.
  useEffect(() => {
    if (selected?.defaultPrice && !price) setPrice(String(selected.defaultPrice));
  }, [selected, price]);

  if (!open) return null;

  const reset = () => {
    setCohortId('');
    setPrice('');
    setInstallments('1');
    setFirstDue(today());
    setError('');
  };

  const close = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const handleEnroll = async () => {
    const amount = Number(price.replace(/[.,\s]/g, ''));
    const count = Math.max(1, parseInt(installments, 10) || 1);

    if (!selected) {
      setError('Elige la cohorte.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('El precio acordado debe ser mayor que cero.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { data: enrollment, error: insertError } = await supabase
        .from('enrollments')
        .insert({
          cohort_id: selected.id,
          student_id: studentId,
          status: 'pending_payment',
          agreed_price: amount,
        } as never)
        .select('id')
        .single();

      if (insertError) throw insertError;

      const rows = splitInstallments(amount, count, firstDue).map((part) => ({
        enrollment_id: (enrollment as { id: number }).id,
        label: count === 1 ? `Pago único - ${selected.name}` : `Cuota ${part.number} de ${count}`,
        amount: part.amount,
        due_date: part.dueDate,
        status: 'pending',
      }));

      const { error: invoiceError } = await supabase.from('invoices').insert(rows as never);
      if (invoiceError) throw invoiceError;

      reset();
      onEnrolled();
    } catch (err) {
      const detail = (err as { message?: string } | null)?.message;
      setError(detail || 'No se pudo matricular.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="matricular-titulo"
      onClick={close}
    >
      <div
        className="w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-2xl bg-[var(--card-background)] border border-border-color shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border-color">
          <div className="flex flex-col gap-1">
            <h2 id="matricular-titulo" className="text-lg font-semibold text-text-primary">
              Matricular a {studentName}
            </h2>
            <p className="text-xs text-text-muted">
              Se crea la matrícula y sus cuotas, listas para cobrar desde Pagos.
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

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-primary">Cohorte</span>
            {loadingList ? (
              <span className="flex items-center gap-2 text-[13px] text-text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando cohortes abiertas…
              </span>
            ) : cohorts.length === 0 ? (
              <span className="text-[13px] text-text-muted">
                No hay cohortes abiertas en las que no esté ya matriculada esta persona.
              </span>
            ) : (
              <select value={cohortId} onChange={(e) => setCohortId(e.target.value)} className={FIELD}>
                <option value="">Elige una cohorte…</option>
                {cohorts.map((cohort) => (
                  <option key={cohort.id} value={String(cohort.id)}>
                    {cohort.program} · {cohort.name}
                    {cohort.startDate ? ` · empieza ${formatShortDate(cohort.startDate)}` : ''}
                  </option>
                ))}
              </select>
            )}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-text-primary">Precio acordado (COP)</span>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2400000"
                className={FIELD}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-text-primary">Número de cuotas</span>
              <input
                type="number"
                min={1}
                max={12}
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                className={FIELD}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-primary">Primera cuota vence</span>
            <input
              type="date"
              value={firstDue}
              onChange={(e) => setFirstDue(e.target.value)}
              className={FIELD}
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
            onClick={handleEnroll}
            disabled={!cohortId || saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-[#0E1116] text-[13.5px] font-bold disabled:opacity-50 transition-opacity"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Matricular
          </button>
        </div>
      </div>
    </div>
  );
}
