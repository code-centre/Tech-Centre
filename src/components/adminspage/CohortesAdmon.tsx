'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, X, Save, Loader2, Search, SearchX, CalendarDays, CalendarPlus, Clock, PlusCircle, Trash2, Pencil, ChevronRight, ChevronDown } from 'lucide-react';
import { useSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  parseDateBogota,
  formatDateRange,
  formatDateCompact,
  weeksBetween,
  currentWeek,
} from '@/utils/formatDate';

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
  offering?: boolean;
  schedule?: { days?: string[]; hours?: string[] };
};

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Abreviatura de cada día para la fila de la tabla. */
const DIA_CORTO: Record<string, string> = {
  Lunes: 'Lun',
  Martes: 'Mar',
  Miércoles: 'Mié',
  Jueves: 'Jue',
  Viernes: 'Vie',
  Sábado: 'Sáb',
  Domingo: 'Dom',
};

/** Cuántas cohortes se listan por página. */
const PAGE_SIZE = 15;

type StatusFilterType = 'all' | 'por_iniciar' | 'en_curso' | 'terminada';

export default function CohortesAdmon() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [instructors, setInstructors] = useState<Array<{ user_id: string; first_name: string; last_name: string; email: string }>>([]);
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
    maximum_payments: 1,
    start_date: '',
    end_date: '',
    capacity: 0,
    program_id: '',
    instructor_id: '',
    schedule_days: [] as string[],
    schedule_hours: [''] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [togglingOffering, setTogglingOffering] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const handleToggleOffering = async (cohortId: string, currentStatus: boolean) => {
    try {
      setTogglingOffering(cohortId);
      setError(null);
      const { error } = await supabase
        .from('cohorts')
        .update({ offering: !currentStatus })
        .eq('id', cohortId);

      if (error) throw error;
      setCohorts(cohorts.map(c =>
        c.id === cohortId ? { ...c, offering: !currentStatus } : c
      ));
      router.refresh();
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Error desconocido';
      console.error('Error al cambiar visibilidad:', err);
      setError(`Error al cambiar la visibilidad: ${message}`);
    } finally {
      setTogglingOffering(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, selectedProgram]);

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

  const openModal = async (cohort: Cohort | null = null) => {
    // Cargar instructores
    const { data: instructorsData } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, email')
      .in('role', ['instructor', 'admin'])
      .order('first_name', { ascending: true });
    setInstructors(instructorsData || []);

    if (cohort) {
      setEditingCohort(cohort);
      // Obtener instructor actual de la cohorte
      let instructorId = '';
      const { data: instructorData } = await supabase
        .from('cohort_instructors')
        .select('instructor_id')
        .eq('cohort_id', cohort.id)
        .single();
      if (instructorData?.instructor_id) {
        instructorId = instructorData.instructor_id;
      }
      const schedule = (cohort as Cohort).schedule;
      setFormData({
        name: cohort.name,
        campus: cohort.campus,
        maximum_payments: (cohort as { maximum_payments?: number }).maximum_payments ?? 1,
        start_date: cohort.start_date?.split('T')[0] || '',
        end_date: cohort.end_date?.split('T')[0] || '',
        capacity: cohort.capacity || 0,
        program_id: cohort.program_id,
        instructor_id: instructorId,
        schedule_days: Array.isArray(schedule?.days) ? schedule.days : [],
        schedule_hours: Array.isArray(schedule?.hours) && schedule.hours.length > 0 ? schedule.hours : ['']
      });
    } else {
      setEditingCohort(null);
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
        schedule_hours: ['']
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

  const handleScheduleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter(d => d !== day)
        : [...prev.schedule_days, day]
    }));
  };

  const handleScheduleHourChange = (index: number, value: string) => {
    setFormData(prev => {
      const next = [...prev.schedule_hours];
      next[index] = value;
      return { ...prev, schedule_hours: next };
    });
  };

  const addScheduleHour = () => {
    setFormData(prev => ({ ...prev, schedule_hours: [...prev.schedule_hours, ''] }));
  };

  const removeScheduleHour = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule_hours: prev.schedule_hours.filter((_, i) => i !== index)
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
      const schedule = {
        days: formData.schedule_days,
        hours: formData.schedule_hours.filter(h => h.trim() !== '')
      };
      const cohortData: Record<string, unknown> = {
        name: formData.name.trim(),
        campus: formData.campus.trim(),
        modality: editingCohort?.modality || 'presencial',
        maximum_payments: Number(formData.maximum_payments) || 1,
        start_date: formData.start_date,
        end_date: formData.end_date,
        capacity: Number(formData.capacity) || 0,
        program_id: formData.program_id,
        schedule
      };

      let savedCohort: { id: string | number } | null = null;
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
        savedCohort = data;
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
        savedCohort = data;
        setCohorts([data, ...cohorts]);
      }

      const cohortIdToUse = editingCohort ? editingCohort.id : savedCohort?.id;
      if (cohortIdToUse && formData.instructor_id) {
        // Eliminar instructor previo y asignar el nuevo
        await supabase.from('cohort_instructors').delete().eq('cohort_id', cohortIdToUse);
        await supabase.from('cohort_instructors').insert({
          cohort_id: Number(cohortIdToUse),
          instructor_id: formData.instructor_id,
          role: 'instructor'
        });
      } else if (cohortIdToUse && !formData.instructor_id) {
        // Quitar instructor si se deseleccionó
        await supabase.from('cohort_instructors').delete().eq('cohort_id', cohortIdToUse);
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

  /** Días y horas del schedule en una línea: "Sáb · 8:00 a.m. a 12:00 m." */
  const scheduleLabel = (schedule?: { days?: string[]; hours?: string[] }) => {
    const days = (schedule?.days ?? []).map((d) => DIA_CORTO[d] ?? d);
    const hours = (schedule?.hours ?? []).filter((h) => h.trim() !== '');
    const parts: string[] = [];
    if (days.length) parts.push(days.join(', '));
    if (hours.length) parts.push(hours.join(' y '));
    return parts.join(' · ');
  };

  /** Segunda línea del calendario: duración, o en qué semana va si está en curso. */
  const paceLabel = (cohort: Cohort) => {
    if (!cohort.start_date || !cohort.end_date) return '';
    const total = weeksBetween(cohort.start_date, cohort.end_date);
    if (!total) return '';
    const status = getCohortStatus(cohort.start_date, cohort.end_date);
    if (status === 'en_curso') return `semana ${currentWeek(cohort.start_date, cohort.end_date)} de ${total}`;
    if (status === 'terminada') return 'cerrada';
    return `${total} semanas`;
  };

  /** Matriculados sobre capacidad, con el color de la barra. */
  const getOccupancy = (cohort: Cohort) => {
    const enrolled = cohort.enrollments_count ?? 0;
    const capacity = cohort.capacity && cohort.capacity > 0 ? cohort.capacity : null;
    const pct = capacity ? Math.min(100, Math.round((enrolled / capacity) * 100)) : null;
    const tone =
      pct === null || pct < 25
        ? 'bg-text-muted'
        : pct >= 85 && pct < 100
          ? 'bg-amber-500'
          : 'bg-[var(--text-secondary)]';
    return { enrolled, capacity, pct, tone };
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

  const programNameOf = (cohort: Cohort) =>
    (Array.isArray(cohort.programs) ? cohort.programs[0]?.name : cohort.programs?.name) || '';

  /** Búsqueda y programa: sobre esto se cuentan los tabs de estatus. */
  const scopedCohorts = cohorts.filter((cohort) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      cohort.name.toLowerCase().includes(term) ||
      cohort.campus.toLowerCase().includes(term) ||
      programNameOf(cohort).toLowerCase().includes(term);
    const matchesProgram =
      selectedProgram === 'all' || String(cohort.program_id) === String(selectedProgram);
    return matchesSearch && matchesProgram;
  });

  const statusCounts = scopedCohorts.reduce(
    (acc, cohort) => {
      if (cohort.start_date && cohort.end_date) {
        acc[getCohortStatus(cohort.start_date, cohort.end_date)] += 1;
      }
      return acc;
    },
    { por_iniciar: 0, en_curso: 0, terminada: 0 } as Record<'por_iniciar' | 'en_curso' | 'terminada', number>
  );

  const filteredCohorts = scopedCohorts.filter((cohort) => {
    if (statusFilter === 'all') return true;
    const status =
      cohort.start_date && cohort.end_date
        ? getCohortStatus(cohort.start_date, cohort.end_date)
        : null;
    return status === statusFilter;
  });

  const totalEnrolled = cohorts.reduce((sum, c) => sum + (c.enrollments_count ?? 0), 0);
  const enCursoTotal = cohorts.filter(
    (c) => c.start_date && c.end_date && getCohortStatus(c.start_date, c.end_date) === 'en_curso'
  ).length;

  const totalPages = Math.max(1, Math.ceil(filteredCohorts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageCohorts = filteredCohorts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const STATUS_TABS: { value: StatusFilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Todas', count: scopedCohorts.length },
    { value: 'en_curso', label: 'En curso', count: statusCounts.en_curso },
    { value: 'por_iniciar', label: 'Por iniciar', count: statusCounts.por_iniciar },
    { value: 'terminada', label: 'Terminadas', count: statusCounts.terminada },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-11 w-64 rounded-lg bg-[var(--card-background)] animate-pulse" />
        <div className="h-12 rounded-xl bg-[var(--card-background)] animate-pulse" />
        <div className="rounded-xl border border-border-color bg-[var(--card-background)] p-4 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-secondary/10 text-text-secondary">
            <CalendarDays size={24} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-[27px]">
              Cohortes
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {cohorts.length} {cohorts.length === 1 ? 'cohorte' : 'cohortes'} · {enCursoTotal} en curso ·{' '}
              {totalEnrolled} {totalEnrolled === 1 ? 'estudiante matriculado' : 'estudiantes matriculados'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="btn-primary shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nueva cohorte
        </button>
      </div>

      {/* Tabs de estatus + filtros */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div
          className="flex items-center gap-1 overflow-x-auto rounded-[10px] border border-border-color bg-[var(--card-background)] p-1"
          role="tablist"
          aria-label="Filtrar por estatus"
        >
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setStatusFilter(tab.value)}
                className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-secondary/30 bg-secondary/10 text-text-secondary'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    isActive ? 'bg-secondary/20' : 'bg-text-muted/15'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, sede o programa"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-lg border border-border-color bg-bg-secondary pl-9 pr-3 text-sm text-text-primary placeholder-text-muted focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary sm:w-[268px]"
            />
          </div>
          <div className="relative">
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-border-color bg-transparent pl-3 pr-9 text-sm font-medium text-text-primary focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary sm:w-auto"
              aria-label="Filtrar por programa"
            >
              <option value="all">Todos los programas</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {filteredCohorts.length === 0 ? (
        cohorts.length === 0 ? (
          /* Primera vez: nunca se ha creado una cohorte */
          <div className="rounded-xl border border-border-color bg-[var(--card-background)] px-10 py-14 text-center shadow-lg">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-[14px] bg-secondary/10 text-text-secondary">
              <CalendarPlus size={28} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-text-primary">
              Crea tu primera cohorte
            </h2>
            <p className="mx-auto mt-2.5 max-w-[420px] text-[14.5px] leading-relaxed text-text-muted">
              Una cohorte agrupa a los estudiantes de un programa en unas fechas y un horario.
              Al publicarla aparece en el sitio como cupo disponible.
            </p>
            <button
              type="button"
              onClick={() => openModal()}
              className="btn-primary mt-6"
            >
              <Plus className="h-4 w-4" />
              Nueva cohorte
            </button>
          </div>
        ) : (
          /* Los filtros no devolvieron nada: no ofrecer crear */
          <div className="rounded-xl border border-border-color bg-[var(--card-background)] px-10 py-11 text-center shadow-lg">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-text-muted/10 text-text-muted">
              <SearchX size={24} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h2 className="mt-4.5 text-lg font-semibold text-text-primary">
              {searchTerm
                ? `Ningún resultado para “${searchTerm}”`
                : 'Ninguna cohorte con estos filtros'}
            </h2>
            <p className="mx-auto mt-2 max-w-[400px] text-sm leading-relaxed text-text-muted">
              Prueba con otro término o quita los filtros para ver todas las cohortes.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="inline-flex h-9 items-center rounded-lg border border-border-color px-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
                >
                  Limpiar búsqueda
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSelectedProgram('all');
                }}
                className="inline-flex h-9 items-center rounded-lg border border-border-color px-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
              >
                Ver todas las cohortes
              </button>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Tabla, de lg hacia arriba */}
          <div className="hidden overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)] shadow-lg lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color bg-bg-secondary">
                  <th className="w-[25%] px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">
                    Cohorte
                  </th>
                  <th className="w-[17%] px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">
                    Programa
                  </th>
                  <th className="w-[21%] px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">
                    Calendario
                  </th>
                  <th className="w-[14%] px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">
                    Ocupación
                  </th>
                  <th className="w-[11%] px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">
                    Estatus
                  </th>
                  <th className="w-[7%] px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">
                    Visible
                  </th>
                  <th className="w-[5%] px-4 py-3 text-right">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageCohorts.map((cohort) => {
                  const status =
                    cohort.start_date && cohort.end_date
                      ? getCohortStatus(cohort.start_date, cohort.end_date)
                      : null;
                  const terminada = status === 'terminada';
                  const { enrolled, capacity, pct, tone } = getOccupancy(cohort);
                  const schedule = scheduleLabel(cohort.schedule);
                  const pace = paceLabel(cohort);
                  return (
                    <tr
                      key={cohort.id}
                      className="border-b border-border-color/50 transition-colors last:border-b-0 hover:bg-bg-secondary/40"
                    >
                      <td className="px-4 py-3.5">
                        <Link href={`/admin/cohortes/${cohort.id}`} className="group block">
                          <span
                            className={`block text-[15px] font-semibold ${
                              terminada
                                ? 'text-text-primary'
                                : 'text-text-secondary group-hover:underline'
                            }`}
                          >
                            {cohort.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-text-muted">
                            {cohort.campus}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        {programNameOf(cohort) ? (
                          <span
                            className={`inline-flex rounded-md border border-border-color bg-bg-secondary px-2.5 py-1 text-xs ${
                              terminada ? 'text-text-muted' : 'text-text-primary'
                            }`}
                          >
                            {programNameOf(cohort)}
                          </span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`block text-[13.5px] ${
                            terminada ? 'text-text-muted' : 'text-text-primary'
                          }`}
                        >
                          {cohort.start_date && cohort.end_date
                            ? formatDateRange(cohort.start_date, cohort.end_date)
                            : formatDateCompact(cohort.start_date || cohort.end_date || '') || '—'}
                        </span>
                        {(schedule || pace) && (
                          <span className="mt-0.5 block text-xs text-text-muted">
                            {[schedule, pace].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-baseline gap-1.5">
                          <span
                            className={`text-[15px] font-semibold ${
                              terminada ? 'text-text-muted' : 'text-text-primary'
                            }`}
                          >
                            {enrolled}
                          </span>
                          <span className="text-xs text-text-muted">
                            {capacity ? `de ${capacity}` : 'sin límite'}
                          </span>
                        </span>
                        {pct !== null && (
                          <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-text-muted/20">
                            <span
                              className={`block h-full rounded-full ${tone} ${terminada ? 'opacity-50' : ''}`}
                              style={{ width: `${pct}%` }}
                            />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {status && (() => {
                          const { label, className } = getStatusLabelAndClass(status);
                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
                            >
                              {status === 'en_curso' && (
                                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                              )}
                              {label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={cohort.offering ?? false}
                          onClick={() => handleToggleOffering(cohort.id, cohort.offering ?? false)}
                          disabled={togglingOffering === cohort.id}
                          title={cohort.offering ? 'Visible en el sitio' : 'Oculta en el sitio'}
                          aria-label={cohort.offering ? 'Ocultar en el sitio' : 'Mostrar en el sitio'}
                          className={`relative inline-flex h-[22px] w-[38px] items-center rounded-full border transition-colors disabled:opacity-50 ${
                            cohort.offering
                              ? 'border-secondary/50 bg-secondary/25'
                              : 'border-text-muted/45 bg-text-muted/30'
                          }`}
                        >
                          {togglingOffering === cohort.id ? (
                            <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin text-text-muted" />
                          ) : (
                            <span
                              className={`absolute top-[2px] h-4 w-4 rounded-full shadow-sm transition-all ${
                                cohort.offering
                                  ? 'right-[2px] bg-[var(--text-secondary)]'
                                  : 'left-[2px] bg-text-primary/80'
                              }`}
                            />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openModal(cohort)}
                            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border-color text-text-muted transition-colors hover:text-text-primary"
                            title="Editar cohorte"
                            aria-label={`Editar ${cohort.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/admin/cohortes/${cohort.id}`}
                            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg text-text-muted transition-colors hover:text-text-primary"
                            title="Ver alumnos"
                            aria-label={`Ver alumnos de ${cohort.name}`}
                          >
                            <ChevronRight className="h-[17px] w-[17px]" />
                          </Link>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex items-center justify-between gap-4 border-t border-border-color bg-bg-secondary px-4 py-3.5">
              <p className="text-xs text-text-muted">
                {filteredCohorts.length === cohorts.length
                  ? `${filteredCohorts.length} ${filteredCohorts.length === 1 ? 'cohorte' : 'cohortes'}`
                  : `${filteredCohorts.length} de ${cohorts.length} cohortes`}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((n) => Math.max(1, n - 1))}
                    disabled={safePage === 1}
                    className="inline-flex h-8 items-center rounded-lg border border-border-color px-3 text-xs font-medium text-text-primary transition-colors hover:bg-[var(--card-background)] disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="px-1 text-xs text-text-muted">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
                    disabled={safePage === totalPages}
                    className="inline-flex h-8 items-center rounded-lg border border-border-color px-3 text-xs font-medium text-text-primary transition-colors hover:bg-[var(--card-background)] disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tarjetas, por debajo de lg */}
          <ul className="flex flex-col gap-3 lg:hidden">
            {pageCohorts.map((cohort) => {
              const status =
                cohort.start_date && cohort.end_date
                  ? getCohortStatus(cohort.start_date, cohort.end_date)
                  : null;
              const terminada = status === 'terminada';
              const { enrolled, capacity, pct, tone } = getOccupancy(cohort);
              const schedule = scheduleLabel(cohort.schedule);
              const pace = paceLabel(cohort);
              return (
                <li
                  key={cohort.id}
                  className="rounded-xl border border-border-color bg-[var(--card-background)] p-4 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/admin/cohortes/${cohort.id}`} className="min-w-0">
                      <span
                        className={`block text-base font-semibold ${
                          terminada ? 'text-text-primary' : 'text-text-secondary'
                        }`}
                      >
                        {cohort.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-text-muted">{cohort.campus}</span>
                    </Link>
                    {status && (() => {
                      const { label, className } = getStatusLabelAndClass(status);
                      return (
                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
                        >
                          {status === 'en_curso' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                          )}
                          {label}
                        </span>
                      );
                    })()}
                  </div>

                  {programNameOf(cohort) && (
                    <p className="mt-3.5">
                      <span className="inline-flex rounded-md border border-border-color bg-bg-secondary px-2.5 py-1 text-xs text-text-primary">
                        {programNameOf(cohort)}
                      </span>
                    </p>
                  )}

                  <div className="mt-3.5 flex flex-col gap-2 border-t border-border-color/50 pt-3.5">
                    <p className="flex items-center gap-2.5 text-[13.5px] text-text-primary">
                      <CalendarDays className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                      {cohort.start_date && cohort.end_date
                        ? formatDateRange(cohort.start_date, cohort.end_date)
                        : '—'}
                    </p>
                    {(schedule || pace) && (
                      <p className="flex items-center gap-2.5 text-[13px] text-text-muted">
                        <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {[schedule, pace].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-3.5">
                    <div className="flex items-baseline justify-between gap-2.5">
                      <span className="text-xs text-text-muted">Ocupación</span>
                      <span className="text-[13.5px] text-text-primary">
                        <strong className="font-semibold">{enrolled}</strong>{' '}
                        <span className="text-text-muted">
                          {capacity ? `de ${capacity}` : 'sin límite'}
                        </span>
                      </span>
                    </div>
                    {pct !== null && (
                      <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-text-muted/20">
                        <span
                          className={`block h-full rounded-full ${tone} ${terminada ? 'opacity-50' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border-color/50 pt-3.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={cohort.offering ?? false}
                      onClick={() => handleToggleOffering(cohort.id, cohort.offering ?? false)}
                      disabled={togglingOffering === cohort.id}
                      className="flex items-center gap-2.5 disabled:opacity-50"
                      aria-label={cohort.offering ? 'Ocultar en el sitio' : 'Mostrar en el sitio'}
                    >
                      <span
                        className={`relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full border transition-colors ${
                          cohort.offering
                            ? 'border-secondary/50 bg-secondary/25'
                            : 'border-text-muted/45 bg-text-muted/30'
                        }`}
                      >
                        {togglingOffering === cohort.id ? (
                          <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin text-text-muted" />
                        ) : (
                          <span
                            className={`absolute top-[2px] h-4 w-4 rounded-full shadow-sm transition-all ${
                              cohort.offering
                                ? 'right-[2px] bg-[var(--text-secondary)]'
                                : 'left-[2px] bg-text-primary/80'
                            }`}
                          />
                        )}
                      </span>
                      <span className="text-xs text-text-muted">
                        {cohort.offering ? 'Visible' : 'Oculta'}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openModal(cohort)}
                        className="inline-flex h-11 items-center rounded-lg border border-border-color px-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
                      >
                        Editar
                      </button>
                      <Link
                        href={`/admin/cohortes/${cohort.id}`}
                        className="inline-flex h-11 items-center gap-1 rounded-lg border border-secondary/30 px-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-secondary/10"
                      >
                        Alumnos
                        <ChevronRight className="h-[15px] w-[15px]" />
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}

            {totalPages > 1 && (
              <li className="flex items-center justify-between gap-3 rounded-xl border border-border-color bg-[var(--card-background)] px-4 py-3">
                <span className="text-xs text-text-muted">
                  {safePage} / {totalPages}
                </span>
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((n) => Math.max(1, n - 1))}
                    disabled={safePage === 1}
                    className="inline-flex h-11 items-center rounded-lg border border-border-color px-3.5 text-sm font-medium text-text-primary disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
                    disabled={safePage === totalPages}
                    className="inline-flex h-11 items-center rounded-lg border border-border-color px-3.5 text-sm font-medium text-text-primary disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </span>
              </li>
            )}
          </ul>
        </>
      )}

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
                    Máximo de cuotas
                  </label>
                  <input
                    type="number"
                    name="maximum_payments"
                    min="1"
                    value={formData.maximum_payments}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
                    placeholder="Ej: 1, 2, 3..."
                  />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Instructor
                  </label>
                  <select
                    name="instructor_id"
                    value={formData.instructor_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
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

              <fieldset className="space-y-3 p-4 rounded-lg border border-border-color bg-bg-secondary/30">
                <legend className="flex items-center gap-2 text-sm font-medium text-text-primary px-2">
                  <Clock className="w-4 h-4 text-text-secondary" />
                  Horario
                </legend>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Días
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {DIAS_SEMANA.map((dia) => (
                      <label
                        key={dia}
                        className="flex items-center gap-2 cursor-pointer"
                      >
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
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Horas
                  </label>
                  <div className="space-y-2">
                    {formData.schedule_hours.map((hora, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={hora}
                          onChange={(e) => handleScheduleHourChange(idx, e.target.value)}
                          placeholder="Ej: 7pm - 9pm"
                          className="flex-1 px-3 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
                        />
                        <button
                          type="button"
                          onClick={() => removeScheduleHour(idx)}
                          disabled={formData.schedule_hours.length <= 1}
                          className="p-2 text-text-muted hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Quitar horario"
                          aria-label="Quitar horario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addScheduleHour}
                      className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-secondary/80"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Agregar otro horario
                    </button>
                  </div>
                </div>
              </fieldset>

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
