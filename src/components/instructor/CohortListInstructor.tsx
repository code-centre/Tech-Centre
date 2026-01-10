'use client';
import { useSupabaseClient } from "@/lib/supabase";
import { useEffect, useState } from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface CohortListInstructorProps {
  cohortName: string;
}

interface Enrollment {
  id: string;
  cohort_id: string;
  student_id: string;
  status: string;
  profiles: {  // Changed from array to direct object
    user_id: string;
    first_name: string;
    email: string;
  };
  user_id: string;
  first_name: string;
  email: string;
}


export default function CohortListInstructor({ cohortName }: CohortListInstructorProps) {
  const supabase = useSupabaseClient()
  const [cohortId, setCohortId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... (código anterior)

useEffect(() => {
  const fetchCohortAndStudents = async () => {
    try {
      setLoading(true);
      console.log('Buscando cohorte con nombre:', cohortName);
      
      // 1. Buscar el ID del cohorte por su nombre
      const { data: cohortData, error: cohortError } = await supabase
        .from('cohorts')
        .select('id')
        .eq('name', cohortName)
        .single();

      console.log('Respuesta de cohorte:', { cohortData, cohortError });

      if (cohortError) throw cohortError;
      if (!cohortData) {
        throw new Error('Cohorte no encontrado');
      }

      const cohortId = (cohortData as any).id;
      console.log('ID del cohorte encontrado:', cohortId);
      setCohortId(cohortId);

      // 2. Buscar los estudiantes inscritos en este cohorte
      console.log('Buscando estudiantes para el cohorte ID:', cohortId);
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          id,
          cohort_id,
          student_id,
          status,
          profiles:student_id (user_id, first_name, email)
        `)
        .eq('cohort_id', cohortId);

      console.log('Respuesta de enrollments:', { enrollmentsData, enrollmentsError });

      if (enrollmentsError) throw enrollmentsError;

      const studentsData = (enrollmentsData || []).map((enrollment: any) => {
        const profile = enrollment.profiles; // profiles es un objeto, no un array
        
        return {
            id: enrollment.student_id,
            name: profile?.first_name || 'Nombre no disponible',
            email: profile?.email || 'Email no disponible',
            status: enrollment.status || 'inactive'
        };
        });

      console.log('Lista de estudiantes procesada:', studentsData);
      setStudents(studentsData);
    } catch (err) {
      console.error('Error en fetchCohortAndStudents:', err);
      setError('Error al cargar los estudiantes del cohorte');
      // Mantener los datos de ejemplo en caso de error
      const fallbackStudents = [
        { id: 'error-1', name: 'Error al cargar', email: 'error@example.com', status: 'inactive' }
      ];
      
      setStudents([]);
    } finally {
      console.log('Finalizando carga de datos');
      setLoading(false);
    }
  };

  fetchCohortAndStudents();
}, [cohortName, supabase]);

  if (loading) {
    return (
      <div className="mt-6 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Estudiantes del cohorte: {cohortName}</h2>
      {cohortId && (
        <p className="text-sm text-gray-500 mb-4">ID del cohorte: {cohortId}</p>
      )}
      
      {students.length === 0 ? (
        <p className="text-gray-500">No hay estudiantes inscritos en este cohorte.</p>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-gray-500">{student.email}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                student.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {student.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}