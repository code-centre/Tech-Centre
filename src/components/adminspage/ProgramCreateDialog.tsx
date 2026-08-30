'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, Link2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { generateSlug } from '@/../utils/generateSlug';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FIELD =
  'w-full px-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all';

/**
 * Crear pide lo mínimo y lleva a configurar. Antes eran siete campos en un
 * formulario dentro del listado, los mismos que después se vuelven a editar
 * en el detalle.
 */
export default function ProgramCreateDialog({ open, onClose }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState('');
  const [kind, setKind] = useState('curso');
  const [difficulty, setDifficulty] = useState('Principiante');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const code = name.trim() ? generateSlug(name.trim()) : '';

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { data: existing } = await supabase
        .from('programs')
        .select('code')
        .eq('code', code)
        .maybeSingle();

      if (existing) {
        setError('Ya existe un programa con un nombre parecido. Usa uno más específico.');
        return;
      }

      const { data: created, error: insertError } = await supabase
        .from('programs')
        .insert([
          {
            name: name.trim(),
            code,
            kind,
            difficulty,
            syllabus: { modules: [] },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .single();

      if (insertError) throw insertError;

      // El resto se llena en el detalle, que ya dice qué falta.
      router.push(`/admin/programas/${(created as { id: number }).id}`);
    } catch (err) {
      console.error('Error al crear el programa:', err);
      setError('No se pudo crear el programa. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crear-programa-titulo"
    >
      <div className="w-full max-w-[560px] rounded-2xl bg-[var(--card-background)] border border-border-color shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border-color">
          <div className="flex flex-col gap-1">
            <h2 id="crear-programa-titulo" className="text-lg font-semibold text-text-primary">
              Nuevo programa
            </h2>
            <p className="text-xs text-text-muted">
              Solo lo mínimo para crearlo. Todo lo demás se llena después, en un solo sitio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-50"
            aria-label="Cerrar"
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
            <span className="text-[13px] font-medium text-text-primary">Nombre del programa</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Harness y Agentes de IA"
              autoFocus
              className={FIELD}
            />
          </label>

          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-bg-secondary border border-dashed border-border-color">
            <Link2 className="w-4 h-4 shrink-0 text-text-muted" aria-hidden />
            <span className="text-xs text-text-muted">La URL se genera sola:</span>
            <span className="font-mono text-xs text-text-primary truncate">
              {code ? `/${code}` : '/…'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-text-primary">Tipo</span>
              <select value={kind} onChange={(e) => setKind(e.target.value)} className={FIELD}>
                <option value="curso">Curso</option>
                <option value="diplomado">Diplomado</option>
                <option value="certificación">Certificación</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-text-primary">Nivel</span>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={FIELD}>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-bg-secondary border-t border-border-color">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-border-color text-[13.5px] font-medium text-text-primary hover:bg-[var(--card-background)] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-[#0E1116] text-[13.5px] font-bold disabled:opacity-50 transition-all"
          >
            {saving ? 'Creando…' : 'Crear y configurar'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
