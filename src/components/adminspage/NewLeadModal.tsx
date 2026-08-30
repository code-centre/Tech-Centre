'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { useSupabaseClient } from '@/lib/supabase';
import { createLeadAdmin } from '@/app/admin/estudiantes/actions';

const FIELD =
  'w-full px-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all';

const STAGES = [
  { value: 'diagnostico', label: 'Pidió diagnóstico' },
  { value: 'apartar', label: 'Quiere apartar cupo' },
  { value: 'dudas', label: 'Tiene dudas' },
  { value: 'pagos', label: 'Preguntó por formas de pago' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

/**
 * Para meter a mano a quien escribió por fuera del sitio: WhatsApp, una feria,
 * una recomendación. Queda en la misma lista que los leads del formulario.
 */
export default function NewLeadModal({ open, onClose, onCreated }: Props) {
  const supabase = useSupabaseClient();

  const [programs, setPrograms] = useState<string[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [stage, setStage] = useState('dudas');
  const [program, setProgram] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.from('programs').select('name').order('name');
      if (!cancelled) {
        setPrograms(((data ?? []) as { name: string }[]).map((row) => row.name).filter(Boolean));
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, supabase]);

  if (!open) return null;

  const reset = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setStage('dudas');
    setProgram('');
    setMessage('');
    setError('');
  };

  const close = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await createLeadAdmin({
        fullName,
        email,
        phone,
        stage,
        program: program || undefined,
        message,
      });
      if (!result.success) throw new Error(result.error ?? 'No se pudo registrar el lead');
      reset();
      onCreated();
    } catch (err) {
      const detail = (err as { message?: string } | null)?.message;
      setError(detail || 'No se pudo registrar el lead.');
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = Boolean(fullName.trim() && email.trim().includes('@'));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nuevo-lead-titulo"
      onClick={close}
    >
      <div
        className="w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-2xl bg-[var(--card-background)] border border-border-color shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border-color">
          <div className="flex flex-col gap-1">
            <h2 id="nuevo-lead-titulo" className="text-lg font-semibold text-text-primary">
              Registrar un lead
            </h2>
            <p className="text-xs text-text-muted">
              Para quien escribió por fuera del sitio y todavía no está en ninguna lista.
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
            <span className="text-[13px] font-medium text-text-primary">Nombre completo</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Andrés Vélez"
              autoFocus
              className={FIELD}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-text-primary">Correo</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@correo.com"
                className={FIELD}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-text-primary">Teléfono</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="300 000 0000"
                className={FIELD}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-text-primary">Qué quiere</span>
              <select value={stage} onChange={(e) => setStage(e.target.value)} className={FIELD}>
                {STAGES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-text-primary">Programa de interés</span>
              <select value={program} onChange={(e) => setProgram(e.target.value)} className={FIELD}>
                <option value="">Sin definir</option>
                {programs.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-primary">Qué dijo</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Opcional. Queda visible al abrir el lead en la lista."
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
            Registrar lead
          </button>
        </div>
      </div>
    </div>
  );
}
