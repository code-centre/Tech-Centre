'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, XCircle, GraduationCap, Users, Eye, EyeOff, Filter, Loader2, Calendar, Save } from 'lucide-react';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

type Program = {
  id: number;
  name: string;
  syllabus?: any;
  code: string;
  difficulty: string;
  kind: string;
  total_hours: number;
  default_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  audience?: string;
  image?: string;
  description?: string;
  schedule?: string;
  cohorts?: Array<{
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    modality: string;
    campus: string;
  }>;
};

type FilterType = 'all' | 'active' | 'inactive';

export default function ProgramsAdmon() {
  const supabase = useSupabaseClient()
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentProgram, setCurrentProgram] = useState({
    name: '',
    code: '',
    kind: 'curso',
    difficulty: 'Principiante',
    total_hours: 0,
    default_price: 0,
    audience: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [viewingSyllabus, setViewingSyllabus] = useState<{isOpen: boolean, content: any}>({isOpen: false, content: null});
  const [togglingActive, setTogglingActive] = useState<number | null>(null);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openSyllabusModal = (syllabus: any) => {
    setViewingSyllabus({
      isOpen: true,
      content: syllabus
    });
  };

  const closeSyllabusModal = () => {
    setViewingSyllabus({isOpen: false, content: null});
  };

  // Función para cargar los programas con sus cohortes
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;
      
      // Obtener cohortes para cada programa
      const programsWithCohorts = await Promise.all(
        (programsData || []).map(async (program: any) => {
          const { data: cohortsData } = await supabase
            .from('cohorts')
            .select('id, name, start_date, end_date, modality, campus')
            .eq('program_id', program.id);
          
          return {
            ...program,
            cohorts: cohortsData || []
          };
        })
      );

      setPrograms(programsWithCohorts);
    } catch (err) {
      console.error('Error al cargar los programas:', err);
      setError('Error al cargar los programas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Estadísticas
  const stats = {
    total: programs.length,
    active: programs.filter(p => p.is_active).length,
    inactive: programs.filter(p => !p.is_active).length,
    withCohorts: programs.filter(p => p.cohorts && p.cohorts.length > 0).length,
  };

  // Filtrar programas
  const filteredPrograms = programs.filter(program => {
    if (filter === 'active') return program.is_active;
    if (filter === 'inactive') return !program.is_active;
    return true;
  });

  const handleEdit = (program: Program) => {
    setEditingId(program.id);
    setCurrentProgram({
      name: program.name,
      code: program.code,
      kind: program.kind || 'curso',
      difficulty: (program.difficulty as string) || 'Principiante',
      total_hours: program.total_hours ?? 0,
      default_price: program.default_price ?? 0,
      audience: program.audience || '',
    });
    setIsAdding(false);
  };

  const handleToggleActive = async (programId: number, currentStatus: boolean) => {
    try {
      setTogglingActive(programId);
      const { error } = await supabase
        .from('programs')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', programId);

      if (error) throw error;

      setPrograms(programs.map(p => 
        p.id === programId ? { ...p, is_active: !currentStatus } : p
      ));
    } catch (err) {
      console.error('Error al cambiar el estado:', err);
      alert('Error al cambiar el estado del programa');
    } finally {
      setTogglingActive(null);
    }
  };

  const handleSave = async () => {
    if (currentProgram.name.trim() === '') {
      alert('El nombre del programa es requerido');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const baseData = {
        name: currentProgram.name.trim(),
        code: currentProgram.code.trim(),
        kind: currentProgram.kind ?? null,
        difficulty: currentProgram.difficulty ?? null,
        total_hours: currentProgram.total_hours ?? null,
        default_price: currentProgram.default_price ?? null,
        audience: currentProgram.audience?.trim() || null,
      };
      
      if (editingId) {
        // Actualizar programa existente
        const { data: updatedProgram, error: updateError } = await supabase
          .from('programs')
          .update({ ...baseData, updated_at: new Date().toISOString() })
          .eq('id', editingId)
          .select()
          .single();

        if (updateError) {
          throw new Error(updateError.message || 'Error al actualizar el programa');
        }
        
        // Recargar cohortes
        const { data: cohortsData, error: cohortsError } = await supabase
          .from('cohorts')
          .select('id, name, start_date, end_date, modality, campus')
          .eq('program_id', editingId);
        
        if (cohortsError) {
          console.warn('Error al cargar cohortes:', cohortsError);
        }
        
        setPrograms(programs.map(p => 
          p.id === updatedProgram.id ? { ...updatedProgram, cohorts: cohortsData || [] } : p
        ));
        
        setEditingId(null);
        alert('Programa actualizado exitosamente');
      } else {
        // Crear nuevo programa
        const { data: newProgram, error: insertError } = await supabase
          .from('programs')
          .insert([
            {
              ...baseData,
              is_active: false,
              syllabus: {},
              image: null,
              description: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ])
          .select()
          .single();

        if (insertError) {
          throw new Error(insertError.message || 'Error al crear el programa');
        }
        
        setPrograms([{ ...newProgram, cohorts: [] }, ...programs]);
        setIsAdding(false);
        alert('Programa creado exitosamente');
      }
      
      // Resetear formulario solo si todo fue exitoso
      setCurrentProgram({
        name: '',
        code: '',
        kind: 'curso',
        difficulty: 'Principiante',
        total_hours: 0,
        default_price: 0,
        audience: '',
      });
      
    } catch (err: any) {
      console.error('Error al guardar el programa:', err);
      const errorMessage = err?.message || 'Ocurrió un error al guardar el programa. Por favor, inténtalo de nuevo.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      // Asegurar que siempre se resetee el estado de guardado
      setSaving(false);
    }
  };

  const openDeleteModal = (program: Program) => {
    setDeleteError(null);
    setProgramToDelete(program);
  };

  const closeDeleteModal = () => {
    if (!deleting) {
      setProgramToDelete(null);
      setDeleteError(null);
    }
  };

  const confirmDelete = async () => {
    if (!programToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const { data: cohortsData, error: cohortsSelectError } = await supabase
        .from('cohorts')
        .select('id')
        .eq('program_id', programToDelete.id);

      if (cohortsSelectError) throw cohortsSelectError;

      const cohortIds = (cohortsData || []).map((c) => c.id);

      if (cohortIds.length > 0) {
        const { data: enrollments, error: enrollmentsSelectError } = await supabase
          .from('enrollments')
          .select('id')
          .in('cohort_id', cohortIds);

        if (enrollmentsSelectError) throw enrollmentsSelectError;

        const enrollmentIds = (enrollments || []).map((e) => e.id);

        if (enrollmentIds.length > 0) {
          const { error: invoicesError } = await supabase
            .from('invoices')
            .delete()
            .in('enrollment_id', enrollmentIds);

          if (invoicesError) throw invoicesError;
        }

        const { error: enrollmentsError } = await supabase
          .from('enrollments')
          .delete()
          .in('cohort_id', cohortIds);

        if (enrollmentsError) throw enrollmentsError;
      }

      const { error: cohortsError } = await supabase
        .from('cohorts')
        .delete()
        .eq('program_id', programToDelete.id);

      if (cohortsError) throw cohortsError;

      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', programToDelete.id);

      if (error) throw error;

      setPrograms(programs.filter((p) => p.id !== programToDelete.id));
      closeDeleteModal();
    } catch (err) {
      console.error('Error al eliminar:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'No se pudo eliminar el programa. Verifica que no tenga datos asociados.';
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setSaving(false);
    setError(null);
    setCurrentProgram({
      name: '',
      code: '',
      kind: 'curso',
      difficulty: 'Principiante',
      total_hours: 0,
      default_price: 0,
      audience: '',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    const d = (difficulty || '').toLowerCase();
    if (d.includes('principiante') || d.includes('básico') || d.includes('beginner')) return 'bg-emerald-500';
    if (d.includes('intermedio') || d.includes('intermediate')) return 'bg-amber-500';
    if (d.includes('avanzado') || d.includes('advanced')) return 'bg-red-500';
    return 'bg-blue-500';
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty || '—';
  };

  const { user } = useUser();

  if (!user || user?.role !== 'admin') {
    return <div className="p-8 text-center text-text-primary">No tienes permisos para ver esta sección</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <GraduationCap className="text-secondary" size={28} />
            </div>
            Dashboard de Programas
          </h1>
          <p className="text-text-muted mt-2">Gestiona tus programas académicos y sus cohortes</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Programa
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Total Programas</p>
              <p className="text-3xl font-bold text-text-primary">{stats.total}</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <GraduationCap className="text-secondary" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Activos</p>
              <p className="text-3xl font-bold text-green-400">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Eye className="text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Inactivos</p>
              <p className="text-3xl font-bold text-red-400">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <EyeOff className="text-red-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Con Cohortes</p>
              <p className="text-3xl font-bold text-secondary">{stats.withCohorts}</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Users className="text-secondary" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <Filter className="text-text-muted" size={20} />
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as FilterType[]).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === filterType
                  ? 'btn-primary'
                  : 'bg-bg-secondary text-text-primary border border-border-color hover:bg-bg-secondary/80 hover:border-secondary/50'
              }`}
            >
              {filterType === 'all' ? 'Todos' : filterType === 'active' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>
      </div>

      {/* Formulario para agregar/editar */}
      {(isAdding || editingId) && (
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text-primary">
              {editingId ? 'Editar Programa' : 'Nuevo Programa'}
            </h3>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Nombre *</label>
              <input
                type="text"
                value={currentProgram.name}
                onChange={(e) => setCurrentProgram({...currentProgram, name: e.target.value})}
                className="w-full p-3 bg-bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Nombre del programa"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Código</label>
              <input
                type="text"
                value={currentProgram.code}
                onChange={(e) => setCurrentProgram({...currentProgram, code: e.target.value})}
                className="w-full p-3 bg-bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Código del programa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Tipo</label>
              <select
                value={currentProgram.kind}
                onChange={(e) => setCurrentProgram({...currentProgram, kind: e.target.value})}
                className="w-full p-3 bg-bg-secondary border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="diplomado">Diplomado</option>
                <option value="curso">Curso</option>
                <option value="certificación">Certificación</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Dificultad</label>
              <select
                value={currentProgram.difficulty}
                onChange={(e) => setCurrentProgram({...currentProgram, difficulty: e.target.value})}
                className="w-full p-3 bg-bg-secondary border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Horas totales</label>
              <input
                type="number"
                min="0"
                value={currentProgram.total_hours}
                onChange={(e) => setCurrentProgram({...currentProgram, total_hours: parseInt(e.target.value) || 0})}
                className="w-full p-3 bg-bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Horas del programa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Precio por defecto (COP)</label>
              <input
                type="number"
                min="0"
                value={currentProgram.default_price}
                onChange={(e) => setCurrentProgram({...currentProgram, default_price: parseInt(e.target.value) || 0})}
                className="w-full p-3 bg-bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Precio por defecto"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">Público objetivo</label>
              <input
                type="text"
                value={currentProgram.audience}
                onChange={(e) => setCurrentProgram({...currentProgram, audience: e.target.value})}
                className="w-full p-3 bg-bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Para quién es este programa"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                className="px-6 py-3 bg-bg-secondary text-text-primary font-medium rounded-lg border border-border-color hover:bg-bg-secondary/80 hover:border-secondary/50 transition-all duration-200"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {editingId ? 'Actualizar' : 'Guardar'}
                  </>
                )}
              </button>
                    </div>
                </form>
            </div>
      )}

      {/* Lista de programas */}
      {loading && !isAdding && !editingId ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-secondary" />
            <p className="text-text-muted">Cargando programas...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color overflow-hidden">
          {filteredPrograms.length === 0 ? (
            <div className="p-12 text-center">
              <GraduationCap className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted text-lg">No hay programas {filter !== 'all' ? (filter === 'active' ? 'activos' : 'inactivos') : ''}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-color">
                <thead className="bg-bg-secondary/50 border-b border-border-color">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Programa
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Cohortes activas
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Cohortes pasadas
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color bg-[var(--card-background)]">
                  {filteredPrograms.map((program) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const activeCohorts = (program.cohorts || []).filter(
                      (c) => c.end_date && new Date(c.end_date) >= today
                    );
                    const pastCohorts = (program.cohorts || []).filter(
                      (c) => !c.end_date || new Date(c.end_date) < today
                    );
                    return (
                      <tr key={program.id} className="hover:bg-bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-bg-secondary border border-border-color">
                              {program.image ? (
                                <Image
                                  src={program.image}
                                  alt={program.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <GraduationCap className="w-6 h-6 text-text-muted" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">{program.name}</p>
                              {program.code && (
                                <p className="text-sm text-text-muted">{program.code}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            <Users className="w-4 h-4" />
                            {activeCohorts.length}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-text-muted/20 text-text-muted border border-border-color">
                            <Calendar className="w-4 h-4" />
                            {pastCohorts.length}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleActive(program.id, program.is_active)}
                              disabled={togglingActive === program.id}
                              className={`p-2 rounded-lg transition-all border ${
                                program.is_active
                                  ? 'bg-green-500/30 text-green-400 border-green-500/50 hover:bg-green-500/40'
                                  : 'bg-red-500/30 text-red-400 border-red-500/50 hover:bg-red-500/40'
                              } disabled:opacity-50`}
                              title={program.is_active ? 'Desactivar' : 'Activar'}
                            >
                              {togglingActive === program.id ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                              ) : program.is_active ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                            <Link
                              href={`/admin/programas/${program.id}`}
                              className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2"
                            >
                              Ver detalles
                            </Link>
                            <button
                              onClick={() => openDeleteModal(program)}
                              className="p-2 bg-red-500/30 text-red-400 border border-red-500/50 hover:bg-red-500/40 rounded-lg transition-all"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {programToDelete && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="bg-[var(--card-background)] rounded-xl shadow-xl w-full max-w-md border border-border-color">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 id="delete-modal-title" className="text-lg font-semibold text-text-primary">
                    Eliminar programa
                  </h3>
                  <p className="mt-2 text-text-muted">
                    ¿Estás seguro de que deseas eliminar <strong className="text-text-primary">{programToDelete.name}</strong>? Esta acción no se puede deshacer y se eliminarán todas las cohortes, inscripciones y facturas asociadas.
                  </p>
                  {deleteError && (
                    <p className="mt-3 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
                      {deleteError}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:bg-bg-primary font-medium text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver el syllabus */}
      {viewingSyllabus.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card-background)] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-border-color">
            <div className="flex justify-between items-center border-b border-border-color px-6 py-4">
              <h3 className="text-lg font-bold text-text-primary">Contenido del Syllabus</h3>
              <button
                onClick={closeSyllabusModal}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-auto grow">
              <pre className="bg-bg-secondary p-4 rounded-lg text-sm overflow-auto max-h-[60vh] text-text-primary">
                {JSON.stringify(viewingSyllabus.content, null, 2)}
              </pre>
            </div>
            <div className="bg-bg-secondary px-6 py-4 flex justify-end rounded-b-xl">
              <button
                type="button"
                onClick={closeSyllabusModal}
                className="btn-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
