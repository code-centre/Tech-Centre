"use client";
import { useUser } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Definimos los tipos para los datos
interface Cohort {
  id: number;
  name: string;
  role: string;
}

export default function CohortInstructor() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loadingCohorts, setLoadingCohorts] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (!['admin', 'instructor'].includes(user.role)) {
        router.push('/unauthorized');
      } else {
        fetchInstructorCohorts();
      }
    }
  }, [user, loading, router]);

  const fetchInstructorCohorts = async () => {
    try {
      setLoadingCohorts(true);
      
      // Primero obtenemos los cohort_instructors del usuario actual
      const { data: instructorCohorts, error } = await supabase
        .from('cohort_instructors')
        .select(`
          role,
          cohorts:cohort_id (
            id,
            name
          )
        `)
        .eq('instructor_id', user.id);

      if (error) throw error;

      // Mapeamos los resultados al formato que necesitamos
      const formattedCohorts = instructorCohorts.map((item: any) => ({
        id: item.cohorts.id,
        name: item.cohorts.name,
        role: item.role
      }));

      setCohorts(formattedCohorts);
    } catch (error) {
      console.error('Error al cargar los cohorts:', error);
    } finally {
      setLoadingCohorts(false);
    }
  };

  if (loading || loadingCohorts) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!user || !['admin', 'instructor'].includes(user.role)) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Panel del Instructor</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Bienvenido, {user.name || user.email}</h2>
        <p className="text-gray-600 mb-6">Rol: {user.role}</p>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Tus Cohorts</h3>
          {cohorts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cohorts.map((cohort) => (
                <div 
                  key={cohort.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/instructor/${encodeURIComponent(cohort.name)}`)}
                >
                  <h4 className="font-medium text-lg">{cohort.name}</h4>
                  <p className="text-sm text-gray-500">Rol: {cohort.role}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No estás asignado a ningún cohorte actualmente.</p>
          )}
        </div>
      </div>
    </div>
  );
}