'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, X, Users, Save, Loader2, Search, Calendar, CalendarCheck } from 'lucide-react';
import { useSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { formatDate as formatDateBogota, parseDateBogota } from '@/utils/formatDate';

type Program = {
  id: string;
  name: string;
  code: string;
};

type Cohort = {
  id: string;
  name: string;
  campus: string;
  modality: 'presencial' | 'virtual' | 'híbrido';
  start_date: string;
  end_date: string;
  capacity?: number;
  program_id: string;
  programs?: Program;
  created_at: string;
  updated_at: string;
  enrollments_count?: number;
};

type StatusFilterType = 'all' | 'por_iniciar' | 'en_curso' | 'terminada';

export default function CohortesAdmon() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    campus: '',
    modality: 'presencial' as 'presencial' | 'virtual' | 'híbrido',
    start_date: '',
    end_date: '',
    capacity: 0,
    program_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch programs
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('id, name, code')
        .order('name');

      if (programsError) throw programsError;
      setPrograms(programsData || []);

      // Fetch cohorts with program information
      const { data: cohortsData, error: cohortsError } = await supabase
        .from('cohorts')
        .select(`
          *,
          programs:program_id (
            id,
            name,
            code
          )
        `)
        .order('created_at', { ascending: false });

      if (cohortsError) throw cohortsError;

      // Fetch enrollment counts per cohort
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select('cohort_id');

      const countByCohort = (enrollmentsData || []).reduce(
        (acc, e) => {
          const id = String(e.cohort_id);
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const cohortsWithCount = (cohortsData || []).map((c) => ({
        ...c,
        enrollments_count: countByCohort[c.id] ?? 0,
      }));
      setCohorts(cohortsWithCount);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (cohort: Cohort | null = null) => {
    if (cohort) {
      setEditingCohort(cohort);
      setFormData({
        name: cohort.name,
        campus: cohort.campus,
        modality: cohort.modality,
        start_date: cohort.start_date?.split('T')[0] || '',
        end_date: cohort.end_date?.split('T')[0] || '',
        capacity: cohort.capacity || 0,
        program_id: cohort.program_id
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
        program_id: ''
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCohort(null);
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.campus.trim()) {
      newErrors.campus = 'El campus es requerido';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'La fecha de inicio es requerida';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'La fecha de finalización es requerida';
    }
    if (!formData.program_id) {
      newErrors.program_id = 'El programa es requerido';
    }
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
      const cohortData = {
        name: formData.name.trim(),
        campus: formData.campus.trim(),
        modality: formData.modality,
        start_date: formData.start_date,
        end_date: formData.end_date,
        capacity: Number(formData.capacity) || 0,
        program_id: formData.program_id
      };

      if (editingCohort) {
        // Update existing cohort
        const { data, error } = await supabase
          .from('cohorts')
          .update(cohortData)
          .eq('id', editingCohort.id)
          .select(`
            *,
            programs:program_id (
              id,
              name,
              code
            )
          `)
          .single();

        if (error) throw error;
        setCohorts(cohorts.map(c => c.id === editingCohort.id ? data : c));
      } else {
        // Create new cohort
        const { data, error } = await supabase
          .from('cohorts')
          .insert([cohortData])
          .select(`
            *,
            programs:program_id (
              id,
              name,
              code
            )
          `)
          .single();

        if (error) throw error;
        setCohorts([data, ...cohorts]);
      }

      closeModal();
      router.refresh();
    } catch (error) {
      console.error('Error saving cohort:', error);
      setError('Error al guardar la cohorte. Por favor, inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cohortId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cohorte?')) return;

    try {
      const { error } = await supabase
        .from('cohorts')
        .delete()
        .eq('id', cohortId);

      if (error) throw error;
      setCohorts(cohorts.filter(c => c.id !== cohortId));
      router.refresh();
    } catch (error) {
      console.error('Error deleting cohort:', error);
      setError('Error al eliminar la cohorte');
    }
  };

  const formatDateWithMonth = (dateStr: string) => {
    if (!dateStr) return '—';
    const formatted = formatDateBogota(dateStr);
    return formatted || '—';
  };

  const getCohortStatus = (startDate: string, endDate: string): 'por_iniciar' | 'en_curso' | 'terminada' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = parseDateBogota(startDate);
    start.setHours(0, 0, 0, 0);
    const end = parseDateBogota(endDate);
    end.setHours(0, 0, 0, 0);
    if (today < start) return 'por_iniciar';
    if (today > end) return 'terminada';
    return 'en_curso';
  };

  const getStatusLabelAndClass = (status: 'por_iniciar' | 'en_curso' | 'terminada') => {
    switch (status) {
      case 'por_iniciar': return { label: 'Por iniciar', className: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' };
      case 'terminada': return { label: 'Terminada', className: 'bg-text-muted/20 text-text-muted border border-border-color' };
      case 'en_curso': return { label: 'En curso', className: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' };
    }
  };

  const filteredCohorts = cohorts.filter((cohort) => {
    const programName = Array.isArray(cohort.programs) ? cohort.programs[0]?.name : cohort.programs?.name;
    const matchesSearch =
      cohort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cohort.campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (programName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const status = cohort.start_date && cohort.end_date ? getCohortStatus(cohort.start_date, cohort.end_date) : null;
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const programId = cohort.program_id;
    const matchesProgram = selectedProgram === 'all' || String(programId) === String(selectedProgram);
    return matchesSearch && matchesStatus && matchesProgram;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <Users className="text-secondary" size={28} />
          </div>
          Administración de Cohortes
        </h1>
        <button
          onClick={() => openModal()}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Cohorte
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar cohortes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-border-color bg-bg-secondary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
            />
          </div>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
          >
            <option value="all">Todos los programas</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
            className="px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
          >
            <option value="all">Todos los estatus</option>
            <option value="por_iniciar">Por iniciar</option>
            <option value="en_curso">En curso</option>
            <option value="terminada">Terminada</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-[var(--card-background)] rounded-xl border border-border-color shadow-lg overflow-hidden">
        {filteredCohorts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted mb-4">
              {cohorts.length === 0 ? 'No hay cohortes registradas' : 'No se encontraron cohortes con los filtros aplicados'}
            </p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear Primera Cohorte
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-secondary border-b border-border-color">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Cohorte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Programa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Estatus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Alumnos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {filteredCohorts.map((cohort) => (
                  <tr
                    key={cohort.id}
                    className="hover:bg-bg-secondary/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/cohortes/${cohort.id}`}
                        className="block group"
                      >
                        <h3 className="font-medium text-secondary group-hover:text-secondary/80">
                          {cohort.name}
                        </h3>
                        <p className="text-sm text-text-muted">
                          {cohort.campus}
                        </p>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-text-primary">
                      {(Array.isArray(cohort.programs) ? cohort.programs[0]?.name : cohort.programs?.name) || '—'}
                    </td>
                    <td className="px-6 py-4 text-text-muted text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-secondary shrink-0" />
                          Inicio: {formatDateWithMonth(cohort.start_date)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <CalendarCheck className="w-4 h-4 text-secondary shrink-0" />
                          Fin: {formatDateWithMonth(cohort.end_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {cohort.start_date && cohort.end_date && (() => {
                        const status = getCohortStatus(cohort.start_date, cohort.end_date);
                        const { label, className } = getStatusLabelAndClass(status);
                        return (
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
                          >
                            {label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-secondary" />
                        <span className="font-medium text-text-primary">
                          {cohort.enrollments_count ?? 0}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/cohortes/${cohort.id}`}
                          className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2"
                        >
                          Ver Alumnos
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(cohort);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary text-sm font-medium transition-colors"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                {editingCohort ? 'Editar Cohorte' : 'Nueva Cohorte'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-text-muted hover:text-text-primary p-1"
                title="Cerrar"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Nombre de la cohorte
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
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
                    className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
                  />
                  {errors.campus && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.campus}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Programa
                  </label>
                  <select
                    name="program_id"
                    value={formData.program_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
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
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Modalidad
                  </label>
                  <select
                    name="modality"
                    value={formData.modality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="híbrido">Híbrido</option>
                  </select>
                </div>
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
                    className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.start_date}</p>
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
                    className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.end_date}</p>
                  )}
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
                  className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
                  placeholder="Dejar en blanco para sin límite"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Cohorte
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
