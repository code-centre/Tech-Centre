'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabase';

interface Profile {
  user_id: string;
  first_name: string;
  email: string;
  phone?: string;
}

interface Program {
  id: string;
  name: string;
}

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  program: Program | null;  // Program is a single object, not an array
}

export interface Enrollment {
  id: number;
  cohort_id: number;
  student_id: string;
  status: string;
  agreed_price: number;
  created_at: string;
  profile: Profile | null;  // Ahora puede ser null
  cohort: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    program: Program | null;  // Ahora puede ser null
  } | null;  // Ahora puede ser null
}

interface EnrollmentListProps {
  onEnrollmentSelect?: (enrollment: Enrollment) => void;
}

export function EnrollmentList({ onEnrollmentSelect }: EnrollmentListProps) {
  const supabase = useSupabaseClient()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
        .from('enrollments')
        .select(`
            id,
            cohort_id,
            student_id,
            status,
            agreed_price,
            created_at,
            profile:profiles!enrollments_student_id_fkey(
            user_id,
            first_name,
            email,
            phone
            ),
            cohort:cohorts!cohort_id(
            id,
            name,
            start_date,
            end_date,
            program:programs!inner(
                id,
                name
            )
            )
        `)
        .order('created_at', { ascending: false })
        
        if (error) throw error;

        const formattedData: Enrollment[] = data.map(item => {
        // Add type for the raw data item
        type RawItem = typeof item & {
            cohort: {
            id: string;
            name: string;
            start_date: string;
            end_date: string;
            program: Program | null;
            } | null;
        };

        const rawItem = item as any;
        
        // Handle the case where cohort might be null or undefined
        const cohort = rawItem?.cohort ? {
            id: rawItem.cohort.id,
            name: rawItem.cohort.name,
            start_date: rawItem.cohort.start_date,
            end_date: rawItem.cohort.end_date,
            program: rawItem.cohort.program
        } : null;

        return {
            id: rawItem.id,
            cohort_id: rawItem.cohort_id,
            student_id: rawItem.student_id,
            status: rawItem.status,
            agreed_price: rawItem.agreed_price,
            created_at: rawItem.created_at,
            // Handle profile which could be an array or an object
            profile: Array.isArray(rawItem.profile) 
            ? rawItem.profile[0] || null 
            : rawItem.profile || null,
            cohort
        };
        });

        console.log("Datos después de formatear:", formattedData); // <-- Y esta línea
        setEnrollments(formattedData);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError('Error al cargar las inscripciones');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [supabase]);

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    // return (
    //   enrollment.profile.first_name.toLowerCase().includes(term) ||
    //   enrollment.profile.email.toLowerCase().includes(term) ||
    //   enrollment.cohort.program.name.toLowerCase().includes(term) ||
    //   enrollment.status.toLowerCase().includes(term)
    // );
  });

  const handlePaymentClick = (enrollment: Enrollment) => {
    if (onEnrollmentSelect) {
      onEnrollmentSelect(enrollment);
    }
  };

  if (loading) return <div className="text-text-primary">Cargando inscripciones...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, email o programa..."
          className="w-full p-2 border border-border-color rounded bg-bg-secondary text-text-primary placeholder-text-muted"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-color">
        <table className="min-w-full bg-bg-card">
          <thead>
            <tr className="bg-bg-secondary">
              <th className="py-2 px-4 border border-border-color text-text-primary">Estudiante</th>
              <th className="py-2 px-4 border border-border-color text-text-primary">Email</th>
              <th className="py-2 px-4 border border-border-color text-text-primary">Programa</th>
              <th className="py-2 px-4 border border-border-color text-text-primary">Cohorte</th>
              <th className="py-2 px-4 border border-border-color text-text-primary">Estado</th>
              <th className="py-2 px-4 border border-border-color text-text-primary">Precio Acordado</th>
              <th className="py-2 px-4 border border-border-color text-text-primary">Fecha de Inscripción</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnrollments.map((enrollment) => (
              <tr key={enrollment.id} className="hover:bg-bg-secondary">
                <td className="py-2 px-4 border border-border-color text-text-primary">{enrollment.profile?.first_name || 'N/A'}</td>
                <td className="py-2 px-4 border border-border-color text-text-muted">{enrollment.profile?.email || 'N/A'}</td>
                <td className="py-2 px-4 border border-border-color text-text-muted">{enrollment.cohort?.program?.name || 'N/A'}</td>
                <td className="py-2 px-4 border border-border-color text-text-muted">{enrollment.cohort?.name || 'N/A'}</td>
                <td className="py-2 px-4 border border-border-color">
                  <button
                    onClick={() => handlePaymentClick(enrollment)}
                    className={`px-2 py-1 rounded-full text-xs ${
                        enrollment.status === 'pagado' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 cursor-default' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-yellow-200 dark:hover:bg-amber-900/50'
                    }`}
                    >
                    {enrollment.status}
                    </button>
                </td>
                <td className="py-2 px-4 border border-border-color text-text-primary">${enrollment.agreed_price.toLocaleString()}</td>
                <td className="py-2 px-4 border border-border-color text-text-muted">
                  {new Date(enrollment.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}