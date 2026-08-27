'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, Clock, PlusCircle, Trash2 } from 'lucide-react';
import { useSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export type CohortSchedule = { days?: string[]; hours?: string[] };

export interface CohortForEdit {
  id: string;
  name: string;
  campus: string;
  modality?: 'presencial' | 'virtual' | 'híbrido' | string;
  start_date: string;
  end_date: string;
  capacity?: number;
  program_id: string;
  maximum_payments?: number;
  schedule?: CohortSchedule;
}

type Program = {
  id: string;
  name: string;
  code: string;
};

interface CohortEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohort?: CohortForEdit | null;
  onSaved: () => void;
}

export function CohortEditModal({
  isOpen,
  onClose,
  cohort = null,
  onSaved,
}: CohortEditModalProps) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const isEditing = !!cohort;

  const [programs, setPrograms] = useState<Program[]>([]);
  const [instructors, setInstructors] = useState<
    Array<{ user_id: string; first_name: string; last_name: string; email: string }>
  >([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    campus: '',
    maximum_payments: 1,
    start_date: '',
    end_date: '',
    capacity: 0,
    program_id: '',
    instructor_id: '',
    schedule_days: [] as string[],
    schedule_hours: [''] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    const loadForm = async () => {
      setLoading(true);
      setError(null);
      setErrors({});

      try {
        const [programsRes, instructorsRes] = await Promise.all([
          supabase.from('programs').select('id, name, code').order('name'),
          supabase
            .from('profiles')
            .select('user_id, first_name, last_name, email')
            .in('role', ['instructor', 'admin'])
            .order('first_name', { ascending: true }),
        ]);

        setPrograms((programsRes.data as Program[]) || []);
        setInstructors(instructorsRes.data || []);

        if (cohort) {
          let instructorId = '';
          const { data: instructorData } = await supabase
            .from('cohort_instructors')
            .select('instructor_id')
            .eq('cohort_id', cohort.id)
            .maybeSingle();

          if (instructorData?.instructor_id) {
            instructorId = instructorData.instructor_id;
          }

          const schedule = cohort.schedule;
          setFormData({
            name: cohort.name,
            campus: cohort.campus,
            maximum_payments: cohort.maximum_payments ?? 1,
            start_date: cohort.start_date?.split('T')[0] || '',
            end_date: cohort.end_date?.split('T')[0] || '',
            capacity: cohort.capacity || 0,
            program_id: cohort.program_id,
            instructor_id: instructorId,
            schedule_days: Array.isArray(schedule?.days) ? schedule.days : [],
            schedule_hours:
              Array.isArray(schedule?.hours) && schedule.hours.length > 0
                ? schedule.hours
                : [''],
          });
        } else {
          setFormData({
            name: '',
            campus: '',
            maximum_payments: 1,
            start_date: '',
            end_date: '',
            capacity: 0,
            program_id: '',
            instructor_id: '',
            schedule_days: [],
            schedule_hours: [''],
          });
        }
      } catch (err) {
        console.error('Error loading cohort form:', err);
        setError('No se pudo cargar el formulario.');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [isOpen, cohort, supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter((d) => d !== day)
        : [...prev.schedule_days, day],
    }));
  };

  const handleScheduleHourChange = (index: number, value: string) => {
    setFormData((prev) => {
      const next = [...prev.schedule_hours];
      next[index] = value;
      return { ...prev, schedule_hours: next };
    });
  };

  const addScheduleHour = () => {
    setFormData((prev) => ({ ...prev, schedule_hours: [...prev.schedule_hours, ''] }));
  };

  const removeScheduleHour = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      schedule_hours: prev.schedule_hours.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.campus.trim()) newErrors.campus = 'El campus es requerido';
    if (!formData.start_date) newErrors.start_date = 'La fecha de inicio es requerida';
    if (!formData.end_date) newErrors.end_date = 'La fecha de finalización es requerida';
    if (!formData.program_id) newErrors.program_id = 'El programa es requerido';
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = 'La fecha de finalización debe ser posterior a la fecha de inicio';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const schedule = {
        days: formData.schedule_days,
        hours: formData.schedule_hours.filter((h) => h.trim() !== ''),
      };
      const cohortData: Record<string, unknown> = {
        name: formData.name.trim(),
        campus: formData.campus.trim(),
        modality: cohort?.modality || 'presencial',
        maximum_payments: Number(formData.maximum_payments) || 1,
        start_date: formData.start_date,
        end_date: formData.end_date,
        capacity: Number(formData.capacity) || 0,
        program_id: formData.program_id,
        schedule,
      };

      let savedCohortId: string | number | null = cohort?.id ?? null;

      if (isEditing && cohort) {
        const { error: updateError } = await supabase
          .from('cohorts')
          .update(cohortData)
          .eq('id', cohort.id);

        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from('cohorts')
          .insert([cohortData])
          .select('id')
          .single();

        if (insertError) throw insertError;
        savedCohortId = data?.id ?? null;
      }

      if (savedCohortId) {
        if (formData.instructor_id) {
          await supabase.from('cohort_instructors').delete().eq('cohort_id', savedCohortId);
          await supabase.from('cohort_instructors').insert({
            cohort_id: Number(savedCohortId),
            instructor_id: formData.instructor_id,
            role: 'instructor',
          });
        } else {
          await supabase.from('cohort_instructors').delete().eq('cohort_id', savedCohortId);
        }
      }

      onClose();
      onSaved();
      router.refresh();
    } catch (err) {
      console.error('Error saving cohort:', err);
      setError('Error al guardar la cohorte. Por favor, inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cohort-edit-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border-color bg-[var(--card-background)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="cohort-edit-title" className="text-lg font-semibold text-text-primary">
            {isEditing ? 'Editar cohorte' : 'Nueva cohorte'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-text-muted transition-colors hover:text-text-primary"
            title="Cerrar"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="cohort-name" className="mb-1 block text-sm font-medium text-text-primary">
                  Nombre de la cohorte
                </label>
                <input
                  id="cohort-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="cohort-campus" className="mb-1 block text-sm font-medium text-text-primary">
                  Sede/Ciudad
                </label>
                <input
                  id="cohort-campus"
                  type="text"
                  name="campus"
                  value={formData.campus}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary"
                />
                {errors.campus && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.campus}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="cohort-program" className="mb-1 block text-sm font-medium text-text-primary">
                  Programa
                </label>
                <select
                  id="cohort-program"
                  name="program_id"
                  value={formData.program_id}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary"
                >
                  <option value="">Seleccionar programa</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name} ({program.code})
                    </option>
                  ))}
                </select>
                {errors.program_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.program_id}</p>
                )}
              </div>
              <div>
                <label htmlFor="cohort-payments" className="mb-1 block text-sm font-medium text-text-primary">
                  Máximo de cuotas
                </label>
                <input
                  id="cohort-payments"
                  type="number"
                  name="maximum_payments"
                  min="1"
                  value={formData.maximum_payments}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="cohort-start" className="mb-1 block text-sm font-medium text-text-primary">
                  Fecha de inicio
                </label>
                <input
                  id="cohort-start"
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary"
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.start_date}</p>
                )}
              </div>
              <div>
                <label htmlFor="cohort-end" className="mb-1 block text-sm font-medium text-text-primary">
                  Fecha de finalización
                </label>
                <input
                  id="cohort-end"
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary"
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.end_date}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="cohort-capacity" className="mb-1 block text-sm font-medium text-text-primary">
                  Capacidad (opcional)
                </label>
                <input
                  id="cohort-capacity"
                  type="number"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary"
                  placeholder="Sin límite si queda en 0"
                />
              </div>
              <div>
                <label htmlFor="cohort-instructor" className="mb-1 block text-sm font-medium text-text-primary">
                  Instructor
                </label>
                <select
                  id="cohort-instructor"
                  name="instructor_id"
                  value={formData.instructor_id}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary"
                >
                  <option value="">Sin asignar</option>
                  {instructors.map((inst) => (
                    <option key={inst.user_id} value={inst.user_id}>
                      {inst.first_name} {inst.last_name} ({inst.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset className="space-y-3 rounded-lg border border-border-color bg-bg-secondary/30 p-4">
              <legend className="flex items-center gap-2 px-2 text-sm font-medium text-text-primary">
                <Clock className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                Horario
              </legend>
              <div>
                <p className="mb-2 text-sm font-medium text-text-primary">Días</p>
                <div className="flex flex-wrap gap-3">
                  {DIAS_SEMANA.map((dia) => (
                    <label key={dia} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.schedule_days.includes(dia)}
                        onChange={() => handleScheduleDayToggle(dia)}
                        className="rounded border-border-color text-text-secondary focus:ring-secondary"
                      />
                      <span className="text-sm text-text-primary">{dia}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-text-primary">Horas</p>
                <div className="space-y-2">
                  {formData.schedule_hours.map((hora, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={hora}
                        onChange={(e) => handleScheduleHourChange(idx, e.target.value)}
                        placeholder="Ej: 7pm - 9pm"
                        className="flex-1 rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary"
                      />
                      <button
                        type="button"
                        onClick={() => removeScheduleHour(idx)}
                        disabled={formData.schedule_hours.length <= 1}
                        className="p-2 text-text-muted hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Quitar horario"
                        aria-label="Quitar horario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addScheduleHour}
                    className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-secondary/80"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Agregar otro horario
                  </button>
                </div>
              </div>
            </fieldset>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border-color px-4 py-2 text-text-primary transition-colors hover:bg-bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar cohorte
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export const COHORT_DIA_CORTO: Record<string, string> = {
  Lunes: 'Lun',
  Martes: 'Mar',
  Miércoles: 'Mié',
  Jueves: 'Jue',
  Viernes: 'Vie',
  Sábado: 'Sáb',
  Domingo: 'Dom',
};

export function formatCohortSchedule(schedule?: CohortSchedule): string {
  const days = (schedule?.days ?? []).map((d) => COHORT_DIA_CORTO[d] ?? d);
  const hours = (schedule?.hours ?? []).filter((h) => h.trim() !== '');
  const parts: string[] = [];
  if (days.length) parts.push(days.join(', '));
  if (hours.length) parts.push(hours.join(' y '));
  return parts.join(' · ') || '—';
}
