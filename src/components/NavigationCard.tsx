"use client";
import { formatPrice } from "../../utils/formatCurrency";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase";
import type { Program } from "@/types/programs";

interface NavigationCardProps {
  programData?: Program;
  cohortId?: number | null;
}

interface Cohort {
  maximum_payments: number;
}

export default function NavigationCard({ programData, cohortId }: NavigationCardProps) {
  const supabase = useSupabaseClient()
  const router = useRouter();
  const [cohort, setCohort] = useState<Cohort | null>(null);

  useEffect(() => {
    if (!cohortId) return;

    const fetchCohort = async () => {
      try {
        const { data: cohortData, error } = await supabase
          .from('cohorts')
          .select('maximum_payments')
          .eq('id', cohortId)
          .single();

        if (error) throw error;
        setCohort(cohortData as Cohort);
      } catch (error) {
        console.error('Error al obtener cohorte:', error);
        setCohort(null);
      }
    };

    fetchCohort();
  }, [cohortId, supabase]);

  const handleBuyClick = () => {
    if (cohortId) {
      router.push(`/checkout?cohortId=${cohortId}`);
    }
  }

  const handlePreEnrollClick = () => {
    // TODO: Implementar lógica de pre-inscripción
    console.log('Pre-inscripción para cohort:', cohortId);
  }

  return (
    <section className="sticky top-4 lg:sticky lg:top-4 max-w-sm w-full h-fit bg-(--card-diplomado-bg) rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border [border-color:var(--card-diplomado-border)] dark:border-border-color">
      <article className="p-6 md:p-8 flex flex-col gap-6">
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-secondary/10 dark:bg-secondary/20 text-secondary border border-secondary/30 dark:border-secondary/40 text-xs font-medium mb-4">
            <div className="w-2 h-2 bg-secondary rounded-full mr-2 animate-pulse"></div>
            Inscripciones abiertas
          </div> 
          
          <h3 className="text-xl md:text-2xl mb-2 font-bold card-text-primary">{programData?.name}</h3>
          <h4 className="text-base font-semibold card-text-muted mb-4 line-clamp-2 leading-snug">
            {programData?.subtitle}
          </h4>
         
          {programData?.discount ? (
            <div className="text-xl font-bold card-text-primary flex flex-col items-center justify-center mb-1">
              <span className="text-sm font-medium card-text-muted mb-1">¡Precio en oferta!</span>
              <span className="text-secondary text-2xl">{formatPrice(programData.discount)}</span>
            </div>
          ) : (
            <div className="text-xl font-bold card-text-primary flex flex-col items-center justify-center mb-1">
              <span className="text-sm font-medium card-text-muted mb-1">Precio</span>
              <span className="text-secondary text-2xl">{formatPrice(programData?.default_price || 0, programData?.currency || "COP")}</span>
            </div>
          )}

          {cohort && cohort.maximum_payments >= 2 && programData && (() => {
            const basePrice = programData.discount || programData.default_price || 0;
            const installmentPrice = Math.round(basePrice / cohort.maximum_payments);
            return (
              <div className="text-sm card-text-muted mt-2">
                Hasta {cohort.maximum_payments} cuotas de {formatPrice(installmentPrice, programData.currency || "COP")}
              </div>
            );
          })()}

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleBuyClick}
              className="btn-primary w-full group cursor-pointer"
            >
              <span>Inscribirme</span>
              <svg className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <button
              onClick={handlePreEnrollClick}
              className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent card-text-primary font-semibold rounded-xl border-2 border-secondary/50 dark:border-secondary/40 hover:bg-secondary/10 dark:hover:bg-secondary/20 hover:border-secondary dark:hover:border-secondary/60 transition-all duration-300 cursor-pointer">
              <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Apartar mi cupo</span>
            </button>
            <p className="text-xs card-text-muted text-center mt-1">
              Sin compromiso · Cupos limitados
            </p>
          </div>

        </div>
      </article>
    </section>
  );
}