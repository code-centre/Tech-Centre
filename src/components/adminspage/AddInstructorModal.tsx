'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, Search, X } from 'lucide-react';
import { useSupabaseClient } from '@/lib/supabase';
import { promoteToInstructor } from '@/app/admin/actions';

const FIELD =
  'w-full px-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all';

interface ProfileOption {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

/**
 * Elige un usuario existente y le asigna el rol de instructor.
 */
export default function AddInstructorModal({ open, onClose, onAdded }: Props) {
  const supabase = useSupabaseClient();
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, role')
        .in('role', ['student', 'lead'])
        .order('first_name', { ascending: true });

      if (fetchError) throw fetchError;
      setProfiles((data as ProfileOption[]) ?? []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!open) return;
    setSearchTerm('');
    setSelectedId(null);
    setError('');
    loadProfiles();
  }, [open, loadProfiles]);

  const filteredProfiles = useMemo(() => {
    if (!searchTerm.trim()) return profiles;
    const term = searchTerm.toLowerCase();
    return profiles.filter((profile) => {
      const fullName = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.toLowerCase();
      return fullName.includes(term) || (profile.email ?? '').toLowerCase().includes(term);
    });
  }, [profiles, searchTerm]);

  const selectedProfile = profiles.find((p) => p.user_id === selectedId) ?? null;

  if (!open) return null;

  const close = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedId) {
      setError('Elige un usuario.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const result = await promoteToInstructor(selectedId);
      if (!result.success) {
        setError(result.error ?? 'No se pudo asignar el rol.');
        return;
      }
      onAdded();
      onClose();
    } catch (err) {
      console.error('Error al promover instructor:', err);
      setError('No se pudo asignar el rol de instructor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-instructor-title"
      onClick={close}
    >
      <div
        className="flex w-full max-w-[560px] max-h-[92vh] flex-col overflow-hidden rounded-2xl border border-border-color bg-[var(--card-background)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-color p-6">
          <div className="flex flex-col gap-1">
            <h2 id="add-instructor-title" className="text-lg font-semibold text-text-primary">
              Añadir profesor
            </h2>
            <p className="text-xs text-text-muted">
              Elige un usuario existente para darle el rol de instructor.
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

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {error && (
            <p className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-primary">Buscar usuario</span>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre o email"
                className={`${FIELD} pl-9`}
              />
            </div>
          </label>

          {loading ? (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando usuarios…
            </p>
          ) : filteredProfiles.length === 0 ? (
            <p className="text-sm text-text-muted">
              {searchTerm
                ? 'Ningún usuario coincide con la búsqueda.'
                : 'No hay estudiantes ni leads disponibles para promover.'}
            </p>
          ) : (
            <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto" role="listbox" aria-label="Usuarios disponibles">
              {filteredProfiles.map((profile) => {
                const isSelected = selectedId === profile.user_id;
                const fullName =
                  `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.email;
                return (
                  <li key={profile.user_id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => setSelectedId(profile.user_id)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'border-secondary bg-secondary/10'
                          : 'border-border-color bg-bg-secondary hover:border-secondary/40'
                      }`}
                    >
                      <p className="font-medium text-text-primary">{fullName}</p>
                      <p className="text-sm text-text-muted">{profile.email}</p>
                      <p className="mt-1 text-xs capitalize text-text-muted">{profile.role}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
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
            onClick={handleSubmit}
            disabled={!selectedProfile || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-[13.5px] font-bold text-[#0E1116] transition-opacity disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Asignar rol de instructor
          </button>
        </div>
      </div>
    </div>
  );
}
