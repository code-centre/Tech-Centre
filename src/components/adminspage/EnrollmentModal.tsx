'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { XIcon } from 'lucide-react';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohortId: string;
  onEnrollmentCreated: () => void;
}

interface Student {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function EnrollmentModal({ isOpen, onClose, cohortId, onEnrollmentCreated }: EnrollmentModalProps) {
  const supabase = useSupabaseClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableStudents();
    }
  }, [isOpen, cohortId]);

  const fetchAvailableStudents = async () => {
    try {
      setLoading(true);
      
      // Obtener estudiantes ya matriculados en esta cohorte
      const { data: enrolledStudents } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('cohort_id', cohortId);

      const enrolledStudentIds = enrolledStudents?.map(e => e.student_id) || [];

      // Obtener todos los estudiantes que no estén ya matriculados
      const { data: availableStudentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .eq('role', 'student')
        .not('user_id', 'in', `(${enrolledStudentIds.join(',')})`)
        .order('first_name');

      if (studentsError) {
        console.error('Error fetching available students:', studentsError);
        setError('Error al cargar estudiantes disponibles');
      } else {
        setStudents(availableStudentsData || []);
      }
    } catch (error) {
      console.error('Error in fetchAvailableStudents:', error);
      setError('Error al cargar estudiantes disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      setError('Por favor selecciona un estudiante');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: insertError } = await supabase
        .from('enrollments')
        .insert({
          cohort_id: parseInt(cohortId), // Convert to bigint
          student_id: selectedStudent, // Keep as uuid
          status: 'pending_payment', // Always pending_payment
          agreed_price: agreedPrice ? parseFloat(agreedPrice) : 0, // Convert to numeric
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating enrollment:', insertError);
        setError('Error al crear la matrícula');
        return;
      }

      console.log('Enrollment created:', data);
      
      // Limpiar formulario y cerrar modal
      setSelectedStudent('');
      setAgreedPrice('');
      onClose();
      
      // Refrescar la lista de enrollments
      onEnrollmentCreated();
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError('Error al crear la matrícula');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Añadir Estudiante a la Cohorte</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estudiante
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona un estudiante...</option>
              {students.map((student) => (
                <option key={student.user_id} value={student.user_id}>
                  {student.first_name} {student.last_name} - {student.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Acordado
            </label>
            <input
              type="text"
              value={agreedPrice}
              onChange={(e) => setAgreedPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {/* <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Estado:</strong> Pago Pendiente (configurado automáticamente)
            </p>
          </div> */}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedStudent}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Añadiendo...' : 'Añadir Estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
