'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2, X } from 'lucide-react';
import { setInstructorRate } from '@/app/admin/pagos/actions';
import { formatMoney } from '@/lib/students';
import { PAY_MODE_TITLE, type InstructorRate, type PayMode } from '@/lib/instructorPay';

const MODES: { value: PayMode; hint: string }[] = [
  { value: 'per_session', hint: 'Se acumula cada clase dictada' },
  { value: 'per_cohort', hint: 'Un solo pago al cerrar' },
  { value: 'monthly', hint: 'Lo mismo cada mes' },
];

const AMOUNT_LABEL: Record<PayMode, string> = {
  per_session: 'Cuánto por clase (COP)',
  per_cohort: 'Cuánto por toda la cohorte (COP)',
  monthly: 'Cuánto al mes (COP)',
};

interface Props {
  open: boolean;
  instructorId: string;
  instructorName: string;
  cohortId: number;
  cohortLabel: string;
  totalSessions: number;
  months: number;
  rate: InstructorRate | null;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Lo acordado con un profesor en una cohorte. La forma de pago se elige aquí y
 * no está fija en el sistema, porque en la práctica se mezclan: un titular
 * suele ir por cohorte y un monitor por clase.
 */
export default function InstructorRateModal({
  open,
  instructorId,
  instructorName,
  cohortId,
  cohortLabel,
  totalSessions,
  months,
  rate,
  onClose,
  onSaved,
}: Props) {
  const [mode, setMode] = useState<PayMode>('per_session');
  const [amount, setAmount] = useState('');
  const [requiresAttendance, setRequiresAttendance] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setMode(rate?.mode ?? 'per_session');
    setAmount(rate ? String(rate.amount) : '');
    setRequiresAttendance(rate?.requires_attendance ?? true);
    setError('');
  }, [open, rate]);

  if (!open) return null;

  const value = Number(amount.replace(/[.,\s]/g, ''));
  const valid = Number.isFinite(value) && value > 0;

  const preview = !valid
    ? null
    : mode === 'per_session'
      ? `${totalSessions} clases × ${formatMoney(value)} = ${formatMoney(value * totalSessions)} si dicta la cohorte completa.`
      : mode === 'monthly'
        ? `${months} ${months === 1 ? 'mes' : 'meses'} × ${formatMoney(value)} = ${formatMoney(value * months)} mientras dure la cohorte.`
        : `${formatMoney(value)} en un solo pago cuando la cohorte cierre.`;

  const close = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await setInstructorRate({
        instructorId,
        cohortId,
        mode,
        amount: value,
        requiresAttendance,
      });
      if (!result.success) throw new Error(result.error);
      onSaved();
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'No se pudo guardar la tarifa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tarifa-titulo"
      onClick={close}
    >
      <div
        className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-border-color bg-[var(--card-background)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-color px-6 py-[22px]">
          <div className="flex flex-col gap-1">
            <h2 id="tarifa-titulo" className="text-lg font-semibold text-text-primary">
              Cómo se le paga a {instructorName}
            </h2>
            <p className="text-[12.5px] text-text-muted">
              {cohortLabel} · {totalSessions} {totalSessions === 1 ? 'clase programada' : 'clases programadas'}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={saving}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-secondary hover:text-text-primary disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-[18px] px-6 py-[22px]">
          {error && (
            <p className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex flex-col gap-[9px]">
            <span className="text-[13px] font-medium text-text-primary">Forma de pago</span>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {MODES.map((option) => {
                const active = mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMode(option.value)}
                    className={`flex flex-col items-start gap-[3px] rounded-[9px] border p-[12px_14px] text-left transition-colors ${
                      active
                        ? 'border-secondary/35 bg-secondary/10'
                        : 'border-border-color bg-bg-secondary hover:border-secondary/30'
                    }`}
                  >
                    <span
                      className={`text-[13.5px] font-semibold ${active ? 'text-secondary' : 'text-text-primary'}`}
                    >
                      {PAY_MODE_TITLE[option.value]}
                    </span>
                    <span className="text-xs text-text-muted">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex flex-col gap-[9px]">
            <span className="text-[13px] font-medium text-text-primary">{AMOUNT_LABEL[mode]}</span>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="150000"
              autoFocus
              className="h-[42px] rounded-lg border border-border-color bg-bg-secondary px-3.5 text-[15px] text-text-primary placeholder:text-text-muted focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {preview && <span className="text-[12.5px] text-text-muted">{preview}</span>}
          </label>

          <button
            type="button"
            onClick={() => setRequiresAttendance((value) => !value)}
            aria-pressed={requiresAttendance}
            className="flex items-start gap-[11px] rounded-[10px] border border-border-color bg-bg-secondary p-[14px_16px] text-left"
          >
            <span
              className={`mt-px flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[5px] border ${
                requiresAttendance ? 'border-secondary bg-secondary' : 'border-border-color'
              }`}
            >
              {requiresAttendance && <Check className="h-3 w-3 text-[#0E1116]" strokeWidth={3.2} />}
            </span>
            <span className="flex flex-col gap-[3px]">
              <span className="text-[13.5px] font-medium text-text-primary">
                Solo contar clases con asistencia pasada
              </span>
              <span className="text-[12.5px] leading-relaxed text-text-muted">
                Una clase entra al pago cuando el profesor pasó su lista. Es lo que mantiene la
                asistencia al día sin tener que perseguir a nadie.
              </span>
            </span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-border-color bg-bg-secondary px-6 py-4">
          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="rounded-lg border border-border-color px-4 py-2.5 text-[13.5px] font-medium text-text-primary transition-colors hover:bg-[var(--card-background)] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!valid || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-[13.5px] font-bold text-[#0E1116] transition-opacity disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
