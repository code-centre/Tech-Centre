'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Pencil, Save, X } from 'lucide-react';
import type { Program } from '@/types/programs';

interface ProgramDetailsProps {
  program: Program;
}

const KIND_OPTIONS = [
  { value: 'diplomado', label: 'Diplomado' },
  { value: 'curso', label: 'Curso' },
  { value: 'certificación', label: 'Certificación' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'BÁSICO', label: 'Básico' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'INTERMEDIO', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
  { value: 'AVANZADO', label: 'Avanzado' },
];

function formatPrice(price?: number): string {
  if (price == null || price === 0) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProgramDetails({ program: initialProgram }: ProgramDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: initialProgram.name,
    code: initialProgram.code,
    kind: initialProgram.kind || '',
    difficulty: initialProgram.difficulty || '',
    total_hours: initialProgram.total_hours ?? 0,
    default_price: initialProgram.default_price ?? 0,
    audience: initialProgram.audience || '',
  });

  const supabase = createClient();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numFields = ['total_hours', 'default_price'];
    setFormData((prev) => ({
      ...prev,
      [name]: numFields.includes(name) ? Number(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('programs')
        .update({
          name: formData.name,
          code: formData.code,
          kind: formData.kind || null,
          difficulty: formData.difficulty || null,
          total_hours: formData.total_hours || null,
          default_price: formData.default_price || null,
          audience: formData.audience || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initialProgram.id);

      if (updateError) throw updateError;
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error('Error al guardar:', err);
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: initialProgram.name,
      code: initialProgram.code,
      kind: initialProgram.kind || '',
      difficulty: initialProgram.difficulty || '',
      total_hours: initialProgram.total_hours ?? 0,
      default_price: initialProgram.default_price ?? 0,
      audience: initialProgram.audience || '',
    });
    setError('');
    setIsEditing(false);
  };

  return (
    <section
      className="bg-[var(--card-background)] rounded-lg shadow border border-border-color overflow-hidden"
      aria-labelledby="program-info-heading"
    >
      <div className="p-4 border-b border-border-color flex items-center justify-between">
        <h2 id="program-info-heading" className="text-xl font-semibold text-text-primary">
          Información del programa
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:border-secondary/50 hover:bg-bg-primary transition-colors text-sm font-medium"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:bg-bg-primary font-medium text-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        {error && (
          <p className="mb-4 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</p>
        )}

        {isEditing ? (
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Código</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Tipo</label>
                <select
                  name="kind"
                  value={formData.kind}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                >
                  <option value="">—</option>
                  {KIND_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Dificultad
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                >
                  <option value="">—</option>
                  {DIFFICULTY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Horas totales
                </label>
                <input
                  type="number"
                  name="total_hours"
                  min="0"
                  value={formData.total_hours}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Precio por defecto (COP)
                </label>
                <input
                  type="number"
                  name="default_price"
                  min="0"
                  value={formData.default_price}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Público objetivo
              </label>
              <input
                type="text"
                name="audience"
                value={formData.audience}
                onChange={handleChange}
                placeholder="Para quién es este programa"
                className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary"
              />
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Nombre</p>
              <p className="text-text-primary font-medium mt-0.5">{initialProgram.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Código</p>
              <p className="text-text-primary mt-0.5">{initialProgram.code || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Tipo</p>
              <p className="text-text-primary mt-0.5 capitalize">{initialProgram.kind || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Dificultad
              </p>
              <p className="text-text-primary mt-0.5 capitalize">
                {String(initialProgram.difficulty || '—')}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Horas totales
              </p>
              <p className="text-text-primary mt-0.5">{initialProgram.total_hours ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Precio por defecto
              </p>
              <p className="text-text-primary mt-0.5">
                {formatPrice(initialProgram.default_price)}
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Público objetivo
              </p>
              <p className="text-text-primary mt-0.5">
                {initialProgram.audience || '—'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
