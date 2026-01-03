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
import { useUser } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'; 
import type { Program } from '@/types/programs'

export interface ProgramProps {
  programData: Program;
}

export default function ProgramContainer({ programData }: ProgramProps) {
  const [cohorts, setCohorts] = useState<any[]>([]);
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
  }, [programData?.id]);

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
    <main className="max-w-7xl flex flex-col gap-16 text-white">
      <ProgramHero
        heroImage={currentProgramData?.image || ''} 
        video={currentProgramData?.video || ''}
      />
      <ProgramDetails 
        programData={currentProgramData} 
        cohorts={cohorts} 
        user={user}
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
      {cohorts[0]?.id && (
        <ProgramTeacher cohortId={cohorts[0].id} />
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