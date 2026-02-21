'use client'
import { useState, useEffect } from 'react'
import { ProgramHero } from './ProgramHero'
import { ProgramDescription } from './ProgramDescription'
import ProgramBenefits from './ProgramBenefits'
import ProgramSyllabus from './ProgramSyllabus'
import { ProgramTeacher } from './ProgramTeacher'
import ProgramDetails from './ProgramDetails'
import ProgramFAQs from './ProgramFAQs'
import Location from './Location'
import { useSupabaseClient, useUser } from '@/lib/supabase'
import type { Program } from '@/types/programs'

export interface ProgramProps {
  programData: Program
  initialCohortId?: number | null
  onCohortSelect?: (cohortId: number) => void
}

export default function ProgramContainer({ programData, initialCohortId, onCohortSelect }: ProgramProps) {
  const supabase = useSupabaseClient()
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(initialCohortId ?? null);
  const [currentProgramData, setCurrentProgramData] = useState<Program>(programData);
  const { user } = useUser()

  // Función para obtener las cohortes de un programa específico
  async function getProgramCohorts(programId: number) {
    try {
      const { data, error } = await supabase
        .from('cohorts')
        .select('*')
        .eq('program_id', programId)
        .eq('offering', true)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error en la consulta:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getProgramCohorts:', error);
      return [];
    }
  }

  useEffect(() => {
    async function loadCohorts() {
      try {
        const programCohorts = await getProgramCohorts(programData.id);
        setCohorts(programCohorts);
      } catch (error) {
        console.error('Error en loadCohorts:', error);
        setCohorts([]);
      }
    };

    if (programData?.id) {
      loadCohorts();
    } else {
      setCohorts([]);
    }
  }, [programData?.id, supabase]);

  // Sincronizar selectedCohortId con initialCohortId o primera cohorte disponible
  useEffect(() => {
    if (cohorts.length === 0) return;
    if (initialCohortId != null && cohorts.some((c) => c.id === initialCohortId)) {
      setSelectedCohortId(initialCohortId);
    } else if (!cohorts.some((c) => c.id === selectedCohortId)) {
      setSelectedCohortId(cohorts[0].id);
    }
  }, [initialCohortId, cohorts, selectedCohortId]);

  const handleCohortSelect = (cohortId: number) => {
    setSelectedCohortId(cohortId);
    onCohortSelect?.(cohortId);
  };

  // Actualizar programData cuando cambie desde el componente hijo
  useEffect(() => {
    setCurrentProgramData(programData);
  }, [programData]);

  const handleSyllabusUpdate = (updatedSyllabus: { modules: any[] }) => {
    setCurrentProgramData({
      ...currentProgramData,
      syllabus: updatedSyllabus
    });
  };

  const handleDescriptionUpdate = (updatedDescription: string) => {
    setCurrentProgramData({
      ...currentProgramData,
      description: updatedDescription
    });
  };

  const handleFAQsUpdate = (updatedFAQs: any[]) => {
    setCurrentProgramData({
      ...currentProgramData,
      faqs: updatedFAQs
    });
  };

  const handleDetailsUpdate = (updatedDetails: Partial<Program>) => {
    setCurrentProgramData({
      ...currentProgramData,
      ...updatedDetails
    });
  };

  return (
    <main className="max-w-7xl flex flex-col gap-8 text-white">
      <ProgramHero
        heroImage={currentProgramData?.image || ''} 
        video={currentProgramData?.video || ''}
      />
      <ProgramDetails 
        programData={currentProgramData} 
        cohorts={cohorts} 
        user={user}
        selectedCohortId={selectedCohortId}
        onCohortSelect={handleCohortSelect}
        onDetailsUpdate={handleDetailsUpdate}
      />
      <ProgramDescription 
        programData={currentProgramData?.description || ''}
        programId={currentProgramData.id}
        onDescriptionUpdate={handleDescriptionUpdate}
      />
      <ProgramBenefits />
      <ProgramSyllabus 
        syllabusData={currentProgramData?.syllabus || {modules: []}} 
        programId={currentProgramData.id}
        onSyllabusUpdate={handleSyllabusUpdate}
      />
      {(selectedCohortId ?? cohorts[0]?.id) && (
        <ProgramTeacher cohortId={selectedCohortId ?? cohorts[0].id} />
      )}
      <ProgramFAQs 
        shortCourse={currentProgramData?.faqs || []}
        programId={currentProgramData.id}
        onFAQsUpdate={handleFAQsUpdate}
      />
      <Location/>
      {/* <TicketsSupa programData={programData} cohort={cohorts[0]} paymentPlans={paymentPlans}/> */}
    </main>
  )
}