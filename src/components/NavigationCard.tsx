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

  return (
    <div className="sticky top-4 lg:sticky lg:top-4 rounded-2xl shadow-lg overflow-hidden max-w-sm w-full h-fit py-4 relative">
      {/* Background image covering the entire card */}
      <Image
        src="/SmokeBg.webp"
        alt="Background"
        fill
        className="object-cover"
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-900/80 via-blue-800/80 to-purple-900/80"></div>

      <div className="px-6 pb-1 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            Inscripciones abiertas
          </div> 
          <h3 className="text-2xl mb-1 font-semibold tracking-wide text-white">{programData?.name}</h3>
          <h4 className="text-lg font-semibold text-gray-300 mb-3 line-clamp-2 leading-snug">
            {programData?.subtitle}
          </h4>
         
          {programData?.discount ? (
            <div className="text-xl font-bold text-white flex flex-col items-center justify-center">
              <span>¡Precio en oferta!</span>
              {formatPrice(programData.discount)}
            </div>
          ) : (
            <div className="text-xl font-bold text-white flex flex-col items-center justify-center">
              <span>Precio</span>
              {formatPrice(programData?.default_price || 0, programData?.currency || "COP")}
            </div>
          )}

          {cohort && cohort.maximum_payments >= 2 && programData && (() => {
            const basePrice = programData.discount || programData.default_price || 0;
            const installmentPrice = Math.round(basePrice / cohort.maximum_payments);
            return (
              <div className="text-sm text-white/80">
                Hasta {cohort.maximum_payments} cuotas de {formatPrice(installmentPrice, programData.currency || "COP")}
              </div>
            );
          })()}

          <button
            onClick={handleBuyClick}
            className="w-full cursor-pointer bg-white text-secondary py-4 px-6 my-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
              <span>Quiero inscribirme</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

        </div>
      </div>
    </div>
  );
}