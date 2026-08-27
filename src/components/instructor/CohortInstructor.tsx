"use client";

import { useSupabaseClient, useUser } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, ChevronRight, SearchX } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPageSkeleton from "@/components/admin/AdminPageSkeleton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { adminMobileCardClass, adminMobileListClass } from "@/components/admin/admin-table";

interface Cohort {
  id: number;
  name: string;
  slug: string;
  role: string;
  program?: { id: number; name: string } | null | undefined;
}

export default function CohortInstructor() {
  const supabase = useSupabaseClient();
  const { user, loading } = useUser();
  const router = useRouter();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loadingCohorts, setLoadingCohorts] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (!["admin", "instructor"].includes(user.role)) {
        router.push("/unauthorized");
      } else {
        fetchInstructorCohorts();
      }
    }
  }, [user, loading, router, supabase]);

  const fetchInstructorCohorts = async () => {
    if (!user) return;

    try {
      setLoadingCohorts(true);

      const { data: instructorCohorts, error } = await supabase
        .from("cohort_instructors")
        .select(`
          role,
          cohorts:cohort_id (
            id,
            name,
            slug,
            programs:program_id (id, name)
          )
        `)
        .eq("instructor_id", user.id);

      if (error) throw error;

      const formattedCohorts = (instructorCohorts || [])
        .map(
          (item: {
            cohorts:
              | {
                  id: number;
                  name: string;
                  slug?: string;
                  programs?:
                    | { id: number; name: string }
                    | { id: number; name: string }[]
                    | null;
                }
              | {
                  id: number;
                  name: string;
                  slug?: string;
                  programs?:
                    | { id: number; name: string }
                    | { id: number; name: string }[]
                    | null;
                }[];
            role: string;
          }) => {
            const cohort = Array.isArray(item.cohorts) ? item.cohorts[0] : item.cohorts;
            if (!cohort) return null;
            const programRaw = cohort.programs;
            const program = Array.isArray(programRaw) ? programRaw[0] ?? null : programRaw;
            return {
              id: cohort.id,
              name: cohort.name,
              slug:
                cohort.slug ||
                `${String(cohort.name).toLowerCase().replace(/\s+/g, "-")}-${cohort.id}`,
              role: item.role,
              program: program ?? null,
            };
          }
        )
        .filter(Boolean) as Cohort[];

      setCohorts(formattedCohorts);
    } catch (error) {
      console.error("Error al cargar los cohorts:", error);
    } finally {
      setLoadingCohorts(false);
    }
  };

  if (loading || loadingCohorts) {
    return (
      <main className="space-y-6">
        <AdminPageSkeleton rows={3} />
      </main>
    );
  }

  if (!user || !["admin", "instructor"].includes(user.role)) {
    return null;
  }

  const subtitle = cohorts.length
    ? `${cohorts.length} ${cohorts.length === 1 ? "cohorte asignada" : "cohortes asignadas"} · Rol: ${user.role}`
    : `Rol: ${user.role}`;

  return (
    <main className="space-y-6">
      <AdminPageHeader
        icon={BookOpen}
        title={`Hola, ${user.first_name}`}
        subtitle={subtitle}
      />

      {cohorts.length === 0 ? (
        <AdminEmptyState
          icon={SearchX}
          title="No estás asignado a ninguna cohorte"
          description="Cuando un administrador te asigne a una cohorte, aparecerá aquí para que puedas gestionarla."
        />
      ) : (
        <section aria-label="Cohortes asignadas">
          <ul className={adminMobileListClass}>
            {cohorts.map((cohort) => (
              <li key={cohort.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/perfil/instructor/${cohort.slug}`)}
                  className={`${adminMobileCardClass} flex w-full items-center justify-between gap-3 text-left transition-colors hover:bg-bg-secondary/40`}
                >
                  <span>
                    <span className="block font-medium text-text-primary">{cohort.name}</span>
                    {cohort.program && (
                      <span className="mt-0.5 block text-sm text-secondary">{cohort.program.name}</span>
                    )}
                    <span className="mt-1 block text-xs text-text-muted">Rol: {cohort.role}</span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-text-muted" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
