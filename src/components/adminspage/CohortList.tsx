'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Users, X } from 'lucide-react';
import { formatDateShort, parseDateBogota } from '@/utils/formatDate';

interface Cohort {
  id?: string | number;
  name: string;
  campus?: string;
  modality: string;
  start_date: string;
  end_date: string;
  capacity?: number;
  offering?: boolean;
}

type CohortTab = 'active' | 'past';

function isActiveCohort(cohort: Cohort): boolean {
  try {
    const endDate = parseDateBogota(cohort.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  } catch {
    return false;
  }
}

export default function CohortList({
  cohorts: initialCohorts,
  programId,
}: {
  cohorts: Cohort[];
  programId: string;
}) {
  const [activeTab, setActiveTab] = useState<CohortTab>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    campus: '',
    modality: 'presencial',
    start_date: '',
    end_date: '',
    capacity: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cohorts, setCohorts] = useState(initialCohorts);
  const router = useRouter();
  const supabase = createClient();

  const { activeCohorts, pastCohorts } = useMemo(() => {
    const active: Cohort[] = [];
    const past: Cohort[] = [];
    cohorts.forEach((c) => {
      if (isActiveCohort(c)) active.push(c);
      else past.push(c);
    });
    active.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    past.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
    return { activeCohorts: active, pastCohorts: past };
  }, [cohorts]);

  const displayedCohorts = activeTab === 'active' ? activeCohorts : pastCohorts;

  const openModal = (cohort: Cohort | null = null) => {
    if (cohort) {
      setEditingCohort(cohort);
      setFormData({
        name: cohort.name,
        campus: cohort.campus || '',
        modality: cohort.modality || 'presencial',
        start_date: cohort.start_date?.split('T')[0] || '',
        end_date: cohort.end_date?.split('T')[0] || '',
        capacity: cohort.capacity || 0,
      });
    } else {
      setEditingCohort(null);
      setFormData({
        name: '',
        campus: '',
        modality: 'presencial',
        start_date: '',
        end_date: '',
        capacity: 0,
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCohort(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.campus?.trim()) newErrors.campus = 'El campus es requerido';
    if (!formData.start_date) newErrors.start_date = 'La fecha de inicio es requerida';
    if (!formData.end_date) newErrors.end_date = 'La fecha de finalización es requerida';
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = 'La fecha de finalización debe ser posterior a la fecha de inicio';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    const cohortData = {
      name: formData.name.trim(),
      campus: formData.campus.trim(),
      modality: formData.modality,
      start_date: formData.start_date,
      end_date: formData.end_date,
      capacity: Number(formData.capacity) || 0,
      program_id: programId,
    };

    try {
      if (editingCohort) {
        const { data, error } = await supabase
          .from('cohorts')
          .update({ ...cohortData, updated_at: new Date().toISOString() })
          .eq('id', editingCohort.id)
          .select('*')
          .single();

        if (error) throw error;
        setCohorts(cohorts.map((c) => (String(c.id) === String(editingCohort.id) ? data : c)));
      } else {
        const { data, error } = await supabase
          .from('cohorts')
          .insert([{ ...cohortData }])
          .select('*')
          .single();

        if (error) throw error;
        setCohorts([...cohorts, data]);
      }
      closeModal();
      router.refresh();
    } catch (error) {
      console.error('Error al guardar la cohorte:', error);
      setErrors({
        submit: 'Ocurrió un error al guardar la cohorte. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const emptyState = (
    <div className="text-center py-12 border border-dashed border-border-color rounded-lg bg-bg-secondary/50">
      <p className="text-text-muted mb-4">
        {activeTab === 'active'
          ? 'No hay cohortes activas para este programa.'
          : 'No hay cohortes pasadas.'}
      </p>
      {activeTab === 'active' && (
        <button onClick={() => openModal()} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Cohorte
        </button>
      )}
    </div>
  );

  return (
    <section
      className="bg-[var(--card-background)] rounded-lg shadow border border-border-color overflow-hidden"
      aria-labelledby="cohorts-heading"
    >
      <div className="p-4 border-b border-border-color flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 id="cohorts-heading" className="text-xl font-semibold text-text-primary">
          Cohortes
        </h2>
        <div className="flex items-center gap-2">
          <div
            role="tablist"
            className="inline-flex rounded-lg border-2 border-border-color bg-bg-secondary p-1"
          >
            <button
              role="tab"
              aria-selected={activeTab === 'active'}
              aria-controls="cohorts-active-panel"
              id="cohorts-active-tab"
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === 'active'
                  ? 'bg-green-500 text-white border-2 border-green-500 shadow-md'
                  : 'text-text-muted bg-transparent border-2 border-transparent hover:text-text-primary hover:bg-bg-primary'
              }`}
            >
              Activas ({activeCohorts.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'past'}
              aria-controls="cohorts-past-panel"
              id="cohorts-past-tab"
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === 'past'
                  ? 'bg-amber-600 text-white border-2 border-amber-600 shadow-md'
                  : 'text-text-muted bg-transparent border-2 border-transparent hover:text-text-primary hover:bg-bg-primary'
              }`}
            >
              Pasadas ({pastCohorts.length})
            </button>
          </div>
          <button
            onClick={() => openModal()}
            className="btn-primary inline-flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nueva Cohorte
          </button>
        </div>
      </div>

      <div
        role="tabpanel"
        id={activeTab === 'active' ? 'cohorts-active-panel' : 'cohorts-past-panel'}
        aria-labelledby={activeTab === 'active' ? 'cohorts-active-tab' : 'cohorts-past-tab'}
        className="p-4"
      >
        {displayedCohorts.length === 0 ? (
          emptyState
        ) : (
          <ul className="space-y-3">
            {displayedCohorts.map((cohort) => {
              const active = isActiveCohort(cohort);
              return (
                <li
                  key={cohort.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border-2 ${
                    active
                      ? 'bg-green-500/10 border-green-500/50 dark:bg-green-500/15'
                      : 'bg-amber-500/5 border-amber-700/30 dark:bg-amber-500/10'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-medium text-text-primary">{cohort.name}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                          active
                            ? 'bg-green-500 text-white border border-green-600'
                            : 'bg-amber-600/90 text-white border border-amber-700'
                        }`}
                      >
                        {active ? 'Activa' : 'Pasada'}
                      </span>
                      {cohort.offering && (
                        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-secondary/30 text-secondary border border-secondary/50">
                          En oferta
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-muted">
                      {formatDateShort(cohort.start_date)} – {formatDateShort(cohort.end_date)}
                      {cohort.modality && ` • ${cohort.modality}`}
                      {cohort.campus && ` • ${cohort.campus}`}
                      {cohort.capacity != null && cohort.capacity > 0 && (
                        <>
                          {' • '}
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {cohort.capacity}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openModal(cohort)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        active
                          ? 'btn-primary'
                          : 'border-2 border-amber-600/50 bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/30 hover:border-amber-600'
                      }`}
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      disabled
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border-color bg-bg-secondary text-text-muted cursor-not-allowed text-sm font-medium opacity-50"
                      title="Próximamente"
                    >
                      <Users className="w-4 h-4" />
                      Ver Alumnos
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cohort-modal-title"
        >
          <div className="bg-[var(--card-background)] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border-color">
            <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-[var(--card-background)]">
              <h3 id="cohort-modal-title" className="text-lg font-semibold text-text-primary">
                {editingCohort ? 'Editar Cohorte' : 'Nueva Cohorte'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                title="Cerrar"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errors.submit && (
                <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">{errors.submit}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Nombre de la cohorte
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Sede/Ciudad
                </label>
                <input
                  type="text"
                  name="campus"
                  value={formData.campus}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
                {errors.campus && <p className="mt-1 text-sm text-red-500">{errors.campus}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Modalidad
                </label>
                <select
                  name="modality"
                  value={formData.modality}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="híbrido">Híbrido</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Fecha de finalización
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                  {errors.end_date && <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Capacidad (opcional)
                </label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-border-color bg-bg-secondary px-4 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:bg-bg-primary font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cohorte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
