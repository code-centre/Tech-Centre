'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { XIcon, Loader2 } from 'lucide-react';
import type { Session, ProgramModule } from '@/types/supabase';

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohortId: string;
  modules: ProgramModule[];
  session?: Session | null;
  onDataChange: () => void;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SessionFormModal({
  isOpen,
  onClose,
  cohortId,
  modules,
  session,
  onDataChange,
}: SessionFormModalProps) {
  const supabase = useSupabaseClient();
  const [title, setTitle] = useState('');
  const [moduleId, setModuleId] = useState<string>('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [room, setRoom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!session;

  useEffect(() => {
    if (!isOpen) return;
    if (session) {
      setTitle(session.title ?? '');
      setModuleId(session.module_id != null ? String(session.module_id) : '');
      setStartsAt(toDatetimeLocal(session.starts_at));
      setEndsAt(toDatetimeLocal(session.ends_at));
      setRoom(session.room ?? '');
    } else {
      const now = new Date();
      const start = new Date(now);
      start.setMinutes(0, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 2, 0, 0, 0);
      setTitle('');
      setModuleId('');
      setStartsAt(toDatetimeLocal(start.toISOString()));
      setEndsAt(toDatetimeLocal(end.toISOString()));
      setRoom('');
    }
    setError(null);
  }, [isOpen, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startsAt || !endsAt) {
      setError('Las fechas de inicio y fin son obligatorias');
      return;
    }
    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    if (endDate <= startDate) {
      setError('La fecha de fin debe ser posterior a la de inicio');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        cohort_id: parseInt(cohortId, 10),
        module_id: moduleId ? parseInt(moduleId, 10) : null,
        title: title.trim() || null,
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
        room: room.trim() || null,
      };

      if (isEdit) {
        const { error: updateError } = await supabase
          .from('sessions')
          .update(payload)
          .eq('id', session.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('sessions')
          .insert(payload)
          .select();

        if (insertError) throw insertError;
      }

      onClose();
      onDataChange();
    } catch (err) {
      console.error('Error saving session:', err);
      setError('Error al guardar la clase');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputBase =
    'w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary';
  const labelBase = 'block text-sm font-medium text-text-primary mb-1';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            {isEdit ? 'Editar clase' : 'Agregar clase'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
            type="button"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className={labelBase}>
              Título
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Introducción a React"
              className={inputBase}
            />
          </div>

          <div>
            <label htmlFor="module" className={labelBase}>
              Módulo
            </label>
            <select
              id="module"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className={inputBase}
            >
              <option value="">Sin módulo</option>
              {modules
                .sort((a, b) => a.order_index - b.order_index)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="starts_at" className={labelBase}>
              Inicio
            </label>
            <input
              id="starts_at"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={inputBase}
              required
            />
          </div>

          <div>
            <label htmlFor="ends_at" className={labelBase}>
              Fin
            </label>
            <input
              id="ends_at"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={inputBase}
              required
            />
          </div>

          <div>
            <label htmlFor="room" className={labelBase}>
              Sala / Ubicación
            </label>
            <input
              id="room"
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Ej: Sala A, Zoom"
              className={inputBase}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
