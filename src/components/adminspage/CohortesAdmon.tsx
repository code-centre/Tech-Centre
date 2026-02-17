'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Users, Clock, Calendar, BookOpen, Save, Filter, Loader2, Search, MapPin, Monitor } from 'lucide-react';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
};

type FilterType = 'all' | 'presencial' | 'virtual' | 'híbrido';

export default function CohortesAdmon() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
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
      setCohorts(cohortsData || []);
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

  const filteredCohorts = cohorts.filter(cohort => {
    const matchesSearch = cohort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cohort.campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cohort.programs?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || cohort.modality === filter;
    const matchesProgram = selectedProgram === 'all' || cohort.program_id === selectedProgram;
    
    return matchesSearch && matchesFilter && matchesProgram;
  });

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'presencial': return <MapPin className="w-4 h-4" />;
      case 'virtual': return <Monitor className="w-4 h-4" />;
      case 'híbrido': return <Users className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Administración de Cohortes</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Cohorte
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar cohortes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Program Filter */}
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los programas</option>
            {programs.map(program => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>

          {/* Modality Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas las modalidades</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="híbrido">Híbrido</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Cohorts List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredCohorts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {cohorts.length === 0 ? 'No hay cohortes registradas' : 'No se encontraron cohortes con los filtros aplicados'}
            </p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear Primera Cohorte
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cohorte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacidad
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCohorts.map((cohort) => (
                  <tr 
                    key={cohort.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/cohortes/${cohort.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex justify-start items-center gap-8">
                          <h3 className="font-medium text-blue-600 hover:text-blue-800">{cohort.name}</h3>
                          <p className="text-sm text-gray-500">{cohort.id}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {cohort.start_date} - {cohort.end_date} • {cohort.modality} • {cohort.campus} • Capacidad: {cohort.capacity}
                      </p>  
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-end items-center gap-4">
                        <button 
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={true}
                        >
                          Ver Alumnos
                        </button>
                        <button 
                          onClick={() => openModal(cohort)}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Editar Cohorte
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCohort ? 'Editar Cohorte' : 'Nueva Cohorte'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la cohorte
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sede/Ciudad
                  </label>
                  <input
                    type="text"
                    name="campus"
                    value={formData.campus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.campus && <p className="mt-1 text-sm text-red-600">{errors.campus}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Programa
                  </label>
                  <select
                    name="program_id"
                    value={formData.program_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar programa</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>
                        {program.name} ({program.code})
                      </option>
                    ))}
                  </select>
                  {errors.program_id && <p className="mt-1 text-sm text-red-600">{errors.program_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modalidad
                  </label>
                  <select
                    name="modality"
                    value={formData.modality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="híbrido">Híbrido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de finalización
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidad (opcional)
                </label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dejar en blanco para sin límite"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
