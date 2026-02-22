"use client";
import { useSupabaseClient, useUser } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Cohort {
  id: number;
  name: string;
  slug: string;
  role: string;
  program?: { id: number; name: string } | null | undefined;
}

export default function CohortInstructor() {
  const supabase = useSupabaseClient()
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
  }, [user, loading, router, supabase]);

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
            name,
            slug,
            programs:program_id (id, name)
          )
        `)
        .eq('instructor_id', user.id);

      if (error) throw error;

      const formattedCohorts = (instructorCohorts || []).map((item: {
        cohorts: { id: number; name: string; slug?: string; programs?: { id: number; name: string } | { id: number; name: string }[] | null } | { id: number; name: string; slug?: string; programs?: { id: number; name: string } | { id: number; name: string }[] | null }[];
        role: string;
      }) => {
        const cohort = Array.isArray(item.cohorts) ? item.cohorts[0] : item.cohorts;
        if (!cohort) return null;
        const programRaw = cohort.programs;
        const program = Array.isArray(programRaw) ? programRaw[0] ?? null : programRaw;
        return {
          id: cohort.id,
          name: cohort.name,
          slug: cohort.slug || `${String(cohort.name).toLowerCase().replace(/\s+/g, '-')}-${cohort.id}`,
          role: item.role,
          program: program ?? null,
        };
      }).filter(Boolean) as Cohort[];

      setCohorts(formattedCohorts);
    } catch (error) {
      console.error('Error al cargar los cohorts:', error);
    } finally {
      setLoadingCohorts(false);
    }
  };

  if (loading || loadingCohorts) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!user || !['admin', 'instructor'].includes(user.role)) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Panel del Instructor</h1>
      <div className="bg-[var(--card-background)] border border-border-color p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-text-primary">Bienvenido, {user.first_name}</h2>
        <p className="text-text-muted mb-6">Rol: {user.role}</p>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Tus Cohorts</h3>
          {cohorts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cohorts.map((cohort) => (
                <div
                  key={cohort.id}
                  className="border border-border-color rounded-lg p-4 hover:shadow-md hover:bg-bg-secondary/50 transition-all cursor-pointer bg-[var(--card-background)]"
                  onClick={() => router.push(`/perfil/instructor/${cohort.slug}`)}
                >
                  <h4 className="font-medium text-lg text-text-primary">{cohort.name}</h4>
                  {cohort.program && (
                    <p className="text-sm text-secondary font-medium mt-0.5">{cohort.program.name}</p>
                  )}
                  <p className="text-sm text-text-muted mt-1">Rol: {cohort.role}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted">No estás asignado a ningún cohorte actualmente.</p>
          )}
        </div>
      </div>
    </div>
  );
}