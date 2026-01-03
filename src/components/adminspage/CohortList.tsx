'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Cohort {
  id?: string;
  name: string;
  campus: string;
  modality: string;
  start_date: string;
  end_date: string;
  capacity?: number;
  // Add any other properties that a cohort might have
}

export default function CohortList({ cohorts: initialCohorts, programId }: { cohorts: Cohort[], programId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    campus: '',
    modality: 'presencial',
    start_date: '',
    end_date: '',
    capacity: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cohorts, setCohorts] = useState(initialCohorts);
  const router = useRouter();
  const supabase = createClient();

  const openModal = (cohort: Cohort | null = null) => {
    if (cohort) {
      setEditingCohort(cohort);
      setFormData({
        name: cohort.name,
        campus: cohort.campus,
        modality: cohort.modality,
        start_date: cohort.start_date?.split('T')[0] || '',
        end_date: cohort.end_date?.split('T')[0] || '',
        capacity: cohort.capacity || 0
      });
    } else {
      setEditingCohort(null);
      setFormData({
        name: '',
        campus: '',
        modality: 'presencial',
        start_date: '',
        end_date: '',
        capacity: 0
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCohort(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
  if (new Date(formData.start_date) >= new Date(formData.end_date)) {
    newErrors.end_date = 'La fecha de finalización debe ser posterior a la fecha de inicio';
  }
  
  return newErrors;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
    console.error('Supabase client is not initialized');
    return;
    }
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    
    let cohortData;
    try {
      cohortData = {
        name: formData.name.trim(),
        campus: formData.campus.trim(),
        modality: formData.modality,
        start_date: formData.start_date,
        end_date: formData.end_date,
        capacity: Number(formData.capacity) || 0,
        program_id: programId,
        created_at: new Date().toISOString()  // Añade esta línea
};

      if (editingCohort) {
        // Actualizar cohorte existente
        const { data, error } = await (supabase as any)
          .from('cohorts')
          .update(cohortData)
          .eq('id', editingCohort.id)
          .select('*')
          .single();

        if (error) {
            console.error('Error al actualizar la cohorte:', {
            error,
            cohortData,
            editingCohortId: editingCohort.id
            });
            throw error;
        }

        setCohorts(cohorts.map(c => c.id === editingCohort.id ? data : c));
      } else {
        // Crear nueva cohorte
        const { data, error } = await (supabase as any)
          .from('cohorts')
          .insert([cohortData])
          .select('*')
          .single();

        if (error) {
            console.error('Error al crear la cohorte:', {
            error,
            cohortData
            });
            throw error;
        }

        setCohorts([...cohorts, data]);
      }
        console.log('Enviando datos a Supabase:', {
        table: 'cohorts',
        method: editingCohort ? 'update' : 'insert',
        data: cohortData,
        id: editingCohort?.id
        });
      closeModal();
      router.refresh();
    } catch (error) {
      console.error('Error al guardar la cohorte:', {
    error,
    message: error instanceof Error ? error.message : 'Unknown error',
    cohortData  : cohortData,
    editingCohort : editingCohort
  });
  setErrors({
    submit: 'Ocurrió un error al guardar la cohorte. Por favor, inténtalo de nuevo.'
  });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (cohorts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay cohortes registradas para este programa.</p>
        <button 
          onClick={() => openModal()}
          className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Crear Nueva Cohorte
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-bgCard rounded-lg">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-xl font-semibold text-blueApp">Cohortes</h2>
        <button 
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Nueva Cohorte
        </button>
      </div>

      <div className="space-y-2">
        {cohorts.map((cohort) => (
          <div 
            key={cohort.id} 
            className="p-4 flex justify-between border bg-white rounded-lg"
          >
            <div>
              <div className="flex justify-start items-center gap-8">
                <h3 className="font-medium">{cohort.name}</h3>
                <p className="text-sm text-gray-500">{cohort.id}</p>
              </div>
              <p className="text-sm text-gray-500">
                {cohort.start_date} - {cohort.end_date} • {cohort.modality} • {cohort.campus} • Capacidad: {cohort.capacity}
              </p>  
            </div>
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
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingCohort ? 'Editar Cohorte' : 'Nueva Cohorte'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la cohorte</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sede/Ciudad</label>
                <input
                  type="text"
                  name="campus"
                  value={formData.campus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.campus && <p className="mt-1 text-sm text-red-600">{errors.campus}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Modalidad</label>
                <select
                  name="modality"
                  value={formData.modality}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="híbrido">Híbrido</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de finalización (opcional)</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Capacidad (opcional)</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cohorte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}