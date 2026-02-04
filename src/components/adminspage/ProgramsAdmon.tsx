'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, XCircle, GraduationCap, Users, Clock, DollarSign, TrendingUp, Eye, EyeOff, Filter, Loader2, Calendar, BookOpen, Save } from 'lucide-react';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

type Program = {
  id: number;
  name: string;
  syllabus: any;
  code: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  kind: string;
  total_hours: number;
  default_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  const [currentProgram, setCurrentProgram] = useState<Omit<Program, 'id' | 'created_at' | 'updated_at' | 'cohorts'>>({
    name: '',
    syllabus: {},
    kind: 'diplomado',
    code: '',
    difficulty: 'beginner',
    total_hours: 0,
    default_price: 0,
    is_active: true,
    image: '',
    description: '',
    schedule: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [viewingSyllabus, setViewingSyllabus] = useState<{isOpen: boolean, content: any}>({isOpen: false, content: null});
  const [togglingActive, setTogglingActive] = useState<number | null>(null);

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
    const { id, created_at, updated_at, cohorts, ...rest } = program;
    setCurrentProgram(rest);
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

    // Validar que el syllabus sea un objeto válido
    let validSyllabus = currentProgram.syllabus;
    if (typeof currentProgram.syllabus === 'string') {
      try {
        validSyllabus = JSON.parse(currentProgram.syllabus);
      } catch (e) {
        alert('El formato del syllabus no es válido. Por favor, verifica que sea JSON válido.');
        return;
      }
    }

    setSaving(true);
    setError(null);
    
    try {
      const programData = {
        ...currentProgram,
        syllabus: validSyllabus,
        updated_at: new Date().toISOString()
      };
      
      if (editingId) {
        // Actualizar programa existente
        const { data: updatedProgram, error: updateError } = await supabase
          .from('programs')
          .update(programData)
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
              ...programData,
              created_at: new Date().toISOString()
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
        syllabus: {},
        kind: 'diplomado',
        code: '',
        difficulty: 'beginner',
        total_hours: 0,
        default_price: 0,
        is_active: true,
        image: '',
        description: '',
        schedule: '',
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

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este programa? Esta acción no se puede deshacer.')) {
      try {
        const { error } = await supabase
          .from('programs')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
      setPrograms(programs.filter(program => program.id !== id));
        alert('Programa eliminado exitosamente');
      } catch (err) {
        console.error('Error al eliminar:', err);
        alert('Error al eliminar el programa');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setSaving(false);
    setError(null);
    setCurrentProgram({
      name: '',
      syllabus: {},
      kind: 'diplomado',
      code: '',
      difficulty: 'beginner',
      total_hours: 0,
      default_price: 0,
      is_active: true,
      image: '',
      description: '',
      schedule: '',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-500';
      case 'intermediate':
        return 'bg-amber-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Básico';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return difficulty;
    }
  };

  const { user } = useUser();

  if (!user || (user?.role !== 'admin' && user?.role !== 'instructor')) {
    return <div className="p-8 text-center">No tienes permisos para ver esta sección</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <GraduationCap className="text-secondary" size={28} />
            </div>
            Dashboard de Programas
          </h1>
          <p className="text-gray-400 mt-2">Gestiona tus programas académicos y sus cohortes</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-secondary hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-secondary/20 hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Programa
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Programas</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <GraduationCap className="text-secondary" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Activos</p>
              <p className="text-3xl font-bold text-green-400">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Eye className="text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Inactivos</p>
              <p className="text-3xl font-bold text-red-400">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <EyeOff className="text-red-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Con Cohortes</p>
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
        <Filter className="text-gray-400" size={20} />
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as FilterType[]).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === filterType
                  ? 'bg-secondary text-white shadow-lg'
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              {filterType === 'all' ? 'Todos' : filterType === 'active' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>
      </div>

      {/* Formulario para agregar/editar */}
      {(isAdding || editingId) && (
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {editingId ? 'Editar Programa' : 'Nuevo Programa'}
            </h3>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
                    <input
                        type="text"
                        value={currentProgram.name}
                        onChange={(e) => setCurrentProgram({...currentProgram, name: e.target.value})}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Nombre del programa"
                        required
                    />
                    </div>
            
                    <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Código</label>
                    <input
                        type="text"
                        value={currentProgram.code}
                        onChange={(e) => setCurrentProgram({...currentProgram, code: e.target.value})}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Código del programa"
                    />
                    </div>
            
                    <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dificultad</label>
                    <select
                        value={currentProgram.difficulty}
                onChange={(e) => setCurrentProgram({...currentProgram, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced'})}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="beginner">Principiante</option>
                        <option value="intermediate">Intermedio</option>
                        <option value="advanced">Avanzado</option>
                    </select>
                    </div>
            
                    <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                    <input
                        type="text"
                        value={currentProgram.kind}
                        onChange={(e) => setCurrentProgram({...currentProgram, kind: e.target.value})}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Tipo de programa"
                    />
                    </div>
            
                    <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duración (horas)</label>
                    <input
                        type="number"
                        value={currentProgram.total_hours}
                onChange={(e) => setCurrentProgram({...currentProgram, total_hours: parseInt(e.target.value) || 0})}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Duración del programa en horas"
                    />
                    </div>
            
                    <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Precio por defecto</label>
                    <input
                        type="number"
                        value={currentProgram.default_price}
                onChange={(e) => setCurrentProgram({...currentProgram, default_price: parseInt(e.target.value) || 0})}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Precio por defecto del programa"
                    />
                    </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">URL de Imagen</label>
              <input
                type="url"
                value={currentProgram.image || ''}
                onChange={(e) => setCurrentProgram({...currentProgram, image: e.target.value})}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Horario</label>
              <input
                type="text"
                value={currentProgram.schedule || ''}
                onChange={(e) => setCurrentProgram({...currentProgram, schedule: e.target.value})}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Ej: Lunes a jueves 7pm a 9pm"
              />
            </div>
            
                    <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                    <select
                        value={currentProgram.is_active.toString()}
                        onChange={(e) => setCurrentProgram({...currentProgram, is_active: e.target.value === 'true'})}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                    </select>
                    </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
              <textarea
                value={currentProgram.description || ''}
                onChange={(e) => setCurrentProgram({...currentProgram, description: e.target.value})}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                rows={3}
                placeholder="Descripción del programa"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Syllabus (JSON)</label>
              <textarea
                value={typeof currentProgram.syllabus === 'string' 
                  ? currentProgram.syllabus 
                  : JSON.stringify(currentProgram.syllabus, null, 2)}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir edición libre del texto
                  setCurrentProgram({...currentProgram, syllabus: value});
                }}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                rows={5}
                placeholder='Syllabus del programa en formato JSON, ej: {"modules": []}'
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa un JSON válido. Se validará al guardar.
              </p>
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-all duration-200"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-secondary hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            <p className="text-gray-400">Cargando programas...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 p-12 text-center">
              <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No hay programas {filter !== 'all' ? (filter === 'active' ? 'activos' : 'inactivos') : ''}</p>
            </div>
          ) : (
            filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 overflow-hidden shadow-lg hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Imagen */}
                {program.image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={program.image}
                      alt={program.name}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <button 
                        onClick={() => handleToggleActive(program.id, program.is_active)}
                        disabled={togglingActive === program.id}
                        className={`p-2 rounded-lg backdrop-blur-sm border transition-all duration-200 ${
                          program.is_active
                            ? 'bg-green-500/90 border-green-400/50 text-white'
                            : 'bg-red-500/90 border-red-400/50 text-white'
                        } hover:scale-110 disabled:opacity-50`}
                        title={program.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {togglingActive === program.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : program.is_active ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
                      </button>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getDifficultyColor(program.difficulty)}`}>
                        {getDifficultyLabel(program.difficulty)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Contenido */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{program.name}</h3>
                      {program.code && (
                        <p className="text-sm text-gray-400">Código: {program.code}</p>
                      )}
                    </div>
                    {!program.image && (
                      <button 
                        onClick={() => handleToggleActive(program.id, program.is_active)}
                        disabled={togglingActive === program.id}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          program.is_active
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        } hover:scale-110 disabled:opacity-50`}
                        title={program.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {togglingActive === program.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : program.is_active ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Información del programa */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="w-4 h-4 text-secondary" />
                      <span>{program.total_hours} horas</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <DollarSign className="w-4 h-4 text-secondary" />
                      <span>${program.default_price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <BookOpen className="w-4 h-4 text-secondary" />
                      <span>{program.kind}</span>
                    </div>
                  </div>

                  {/* Cohortes */}
                  {program.cohorts && program.cohorts.length > 0 && (
                    <div className="mb-4 pb-4 border-t border-zinc-700/50 pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-semibold text-white">
                          {program.cohorts.length} {program.cohorts.length === 1 ? 'Cohorte' : 'Cohortes'}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {program.cohorts.map((cohort) => (
                          <div key={cohort.id} className="bg-zinc-800/50 rounded-lg p-2 text-xs">
                            <p className="text-white font-medium">{cohort.name}</p>
                            <p className="text-gray-400">
                              {cohort.modality} • {cohort.campus}
                            </p>
                            {cohort.start_date && (
                              <p className="text-gray-500 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(cohort.start_date).toLocaleDateString('es-ES')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="mt-auto pt-4 border-t border-zinc-700/50 flex items-center gap-2">
                    <Link
                      href={`/admin/programas/${program.id}`}
                      className="flex-1 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary font-medium rounded-lg transition-all duration-200 text-center text-sm"
                    >
                      Ver Detalles
                    </Link>
                    <button
                      onClick={() => handleEdit(program)}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all duration-200"
                      title="Editar"
                    >
                      <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(program.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-200"
                      title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                  </div>
                </div>
              </div>
                ))
              )}
        </div>
      )}

      {/* Modal para ver el syllabus */}
      {viewingSyllabus.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-zinc-700/50">
            <div className="flex justify-between items-center border-b border-zinc-700/50 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Contenido del Syllabus</h3>
              <button
                onClick={closeSyllabusModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-grow">
              <pre className="bg-zinc-900 p-4 rounded-lg text-sm overflow-auto max-h-[60vh] text-gray-300">
                {JSON.stringify(viewingSyllabus.content, null, 2)}
              </pre>
            </div>
            <div className="bg-zinc-800/50 px-6 py-4 flex justify-end rounded-b-xl">
              <button
                type="button"
                onClick={closeSyllabusModal}
                className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
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
