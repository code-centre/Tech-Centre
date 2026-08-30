'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Program } from '@/types/programs';

interface Props {
  program: Program;
}

const KIND_OPTIONS = [
  { value: 'curso', label: 'Curso' },
  { value: 'diplomado', label: 'Diplomado' },
  { value: 'certificación', label: 'Certificación' },
];

const DIFFICULTY_OPTIONS = ['Principiante', 'Intermedio', 'Avanzado'];

const FIELD =
  'w-full px-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all';

/** `start_date` puede venir como fecha o timestamp; el input pide YYYY-MM-DD. */
function toDateInput(value?: string | null): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function Group({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 p-5 sm:p-6 rounded-xl bg-[var(--card-background)] border border-border-color">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <p className="text-xs text-text-muted">{hint}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? 'md:col-span-2' : ''}`}>
      <span className="text-[13px] font-medium text-text-primary">{label}</span>
      {children}
      {hint && <span className="text-xs text-text-muted">{hint}</span>}
    </label>
  );
}

export default function ProgramInfoForm({ program }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const build = () => ({
    name: program.name || '',
    code: program.code || '',
    slug: program.slug || '',
    subtitle: program.subtitle || '',
    kind: program.kind || '',
    difficulty: String(program.difficulty || ''),
    total_hours: program.total_hours ?? 0,
    duration: program.duration || '',
    schedule: program.schedule || '',
    start_date: toDateInput(program.start_date),
    default_price: program.default_price ?? 0,
    discount: program.discount ?? 0,
    currency: program.currency || 'COP',
  });

  const [form, setForm] = useState(build);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof ReturnType<typeof build>, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('programs')
        .update({
          name: form.name.trim(),
          code: form.code.trim(),
          slug: form.slug.trim() || null,
          subtitle: form.subtitle.trim() || null,
          kind: form.kind || null,
          difficulty: form.difficulty || null,
          total_hours: Number(form.total_hours) || null,
          duration: form.duration.trim() || null,
          schedule: form.schedule.trim() || null,
          start_date: form.start_date || null,
          default_price: Number(form.default_price) || null,
          discount: Number(form.discount) || null,
          currency: form.currency || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', program.id);

      if (updateError) throw updateError;
      setDirty(false);
      router.refresh();
    } catch (err) {
      console.error('Error al guardar el programa:', err);
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm(build());
    setDirty(false);
    setError('');
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {error && (
        <p className="flex items-center gap-2 p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}

      <Group title="Identidad" hint="Lo que ve el estudiante en el encabezado de la página.">
        <Field label="Nombre">
          <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={FIELD} />
        </Field>
        <Field label="Código" hint={form.code ? `Es la URL: /programas-academicos/${form.code}` : 'Define la URL pública.'}>
          <input type="text" value={form.code} onChange={(e) => set('code', e.target.value)} className={FIELD} />
        </Field>
        <Field label="Tipo">
          <select value={form.kind} onChange={(e) => set('kind', e.target.value)} className={FIELD}>
            <option value="">—</option>
            {KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nivel">
          <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)} className={FIELD}>
            <option value="">—</option>
            {DIFFICULTY_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Subtítulo" wide hint="Una línea bajo el título. Se lee antes que la descripción.">
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => set('subtitle', e.target.value)}
            placeholder="Ej: Claude API · MCP · sandboxes · evals"
            className={FIELD}
          />
        </Field>
        <Field label="Slug" wide hint="Opcional. Solo si necesitas una URL distinta al código.">
          <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)} className={FIELD} />
        </Field>
      </Group>

      <Group title="Logística" hint="Duración y horario del programa. Las fechas de cada grupo van en Cohortes.">
        <Field label="Horas totales">
          <input
            type="number"
            min={0}
            value={form.total_hours}
            onChange={(e) => set('total_hours', Number(e.target.value) || 0)}
            className={FIELD}
          />
        </Field>
        <Field label="Duración">
          <input
            type="text"
            value={form.duration}
            onChange={(e) => set('duration', e.target.value)}
            placeholder="Ej: 8 semanas"
            className={FIELD}
          />
        </Field>
        <Field label="Horario">
          <input
            type="text"
            value={form.schedule}
            onChange={(e) => set('schedule', e.target.value)}
            placeholder="Ej: Lunes a miércoles, 7 a 9 p. m."
            className={FIELD}
          />
        </Field>
        <Field label="Fecha de inicio del programa">
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => set('start_date', e.target.value)}
            className={FIELD}
          />
        </Field>
      </Group>

      <Group title="Precio" hint="Deja el precio en oferta en cero si no hay descuento.">
        <Field label="Precio">
          <input
            type="number"
            min={0}
            value={form.default_price}
            onChange={(e) => set('default_price', Number(e.target.value) || 0)}
            className={FIELD}
          />
        </Field>
        <Field label="Precio en oferta" hint="0 = sin oferta">
          <input
            type="number"
            min={0}
            value={form.discount}
            onChange={(e) => set('discount', Number(e.target.value) || 0)}
            className={FIELD}
          />
        </Field>
        <Field label="Moneda">
          <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={FIELD}>
            <option value="COP">COP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </Field>
      </Group>

      {/* Aparece sola al primer cambio: no hay que entrar en «modo edición». */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 flex items-center justify-between gap-4 px-6 lg:px-8 py-3.5 bg-[var(--card-background)]/97 backdrop-blur-sm border-t border-secondary shadow-[0_-14px_34px_-20px_rgba(0,0,0,0.85)]">
          <span className="inline-flex items-center gap-2.5 text-[13.5px] text-text-muted">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" aria-hidden />
            Tienes cambios sin guardar en <strong className="font-semibold text-text-primary">Información</strong>
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="px-4 py-2.5 rounded-lg border border-border-color text-[13.5px] font-medium text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-50"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-[#0E1116] text-[13.5px] font-bold shadow-lg shadow-secondary/25 disabled:opacity-60 transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
