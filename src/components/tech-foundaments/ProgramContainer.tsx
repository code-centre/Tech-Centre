'use client'
import { useState, useEffect, useMemo } from 'react'
import { ProgramHero } from './ProgramHero'
import ProgramVideo from './ProgramVideo'
import { ProgramDescription } from './ProgramDescription'
import ProgramAudienceFit from './ProgramAudienceFit'
import ProgramFinalProject from './ProgramFinalProject'
import ProgramBenefits from './ProgramBenefits'
import ProgramSyllabus from './ProgramSyllabus'
import { ProgramTeacher } from './ProgramTeacher'
import ProgramDetails from './ProgramDetails'
import ProgramPricing from './ProgramPricing'
import ProgramFAQs from './ProgramFAQs'
import ProgramFinalCTA from './ProgramFinalCTA'
import Location from './Location'
import NavigationCard from '../NavigationCard'
import { useUser } from '@/lib/supabase'
import {
  getAudienceFit,
  getFinalProject,
  getIncludes,
  getPrerequisites,
  getStack,
} from '@/lib/programLanding'
import type { Program } from '@/types/programs'
import type { Cohort } from '@/types/cohorts'

export interface ProgramProps {
  programData: Program
  /** Cohortes con `offering = true`, ya cargadas por el contenedor de la página. */
  cohorts?: Cohort[]
  selectedCohortId?: number | null
  onCohortSelect?: (cohortId: number) => void
  seatsLeft?: number | null
}

export default function ProgramContainer({
  programData,
  cohorts = [],
  selectedCohortId,
  onCohortSelect,
  seatsLeft,
}: ProgramProps) {
  const [currentProgramData, setCurrentProgramData] = useState<Program>(programData)
  const { user } = useUser()

  useEffect(() => {
    setCurrentProgramData(programData)
  }, [programData])

  const selectedCohort = cohorts.find((c) => c.id === selectedCohortId) ?? cohorts[0]

  // Los campos jsonb pueden venir a medio llenar; cada sección se oculta sola.
  const stack = useMemo(() => getStack(currentProgramData), [currentProgramData])
  const audienceFit = useMemo(() => getAudienceFit(currentProgramData), [currentProgramData])
  const prerequisites = useMemo(() => getPrerequisites(currentProgramData), [currentProgramData])
  const finalProject = useMemo(() => getFinalProject(currentProgramData), [currentProgramData])
  const includes = useMemo(() => getIncludes(currentProgramData), [currentProgramData])

  const handleSyllabusUpdate = (updatedSyllabus: { modules: any[] }) => {
    setCurrentProgramData({ ...currentProgramData, syllabus: updatedSyllabus })
  }

  const handleDescriptionUpdate = (updatedDescription: string) => {
    setCurrentProgramData({ ...currentProgramData, description: updatedDescription })
  }

  const handleFAQsUpdate = (updatedFAQs: any[]) => {
    setCurrentProgramData({ ...currentProgramData, faqs: updatedFAQs })
  }

  const handleDetailsUpdate = (updatedDetails: Partial<Program>) => {
    setCurrentProgramData({ ...currentProgramData, ...updatedDetails })
  }

  return (
    <main className="w-full flex flex-col gap-20 md:gap-28">
      {/* La tarjeta de oferta vive dentro del encabezado: si ocupa una columna
          propia en toda la página, el resto del contenido queda en una franja
          angosta con la mitad derecha vacía. */}
      <ProgramHero
        programData={currentProgramData}
        cohortId={selectedCohort?.id ?? selectedCohortId}
        stack={stack}
        modality={selectedCohort?.modality}
        aside={
          <NavigationCard
            programData={currentProgramData}
            cohorts={cohorts}
            cohortId={selectedCohortId}
            onCohortSelect={onCohortSelect}
            seatsLeft={seatsLeft}
          />
        }
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-20 md:gap-28">
      {currentProgramData.video && (
        <ProgramVideo
          video={currentProgramData.video}
          poster={currentProgramData.image}
          programName={currentProgramData.name}
        />
      )}

      <ProgramDetails
        programData={currentProgramData}
        cohorts={cohorts}
        user={user}
        selectedCohortId={selectedCohortId}
        onCohortSelect={onCohortSelect}
        onDetailsUpdate={handleDetailsUpdate}
      />

      <ProgramDescription
        programData={currentProgramData?.description || ''}
        programId={currentProgramData.id}
        onDescriptionUpdate={handleDescriptionUpdate}
      />

      <ProgramAudienceFit
        audienceFit={audienceFit}
        prerequisites={prerequisites}
        programCode={currentProgramData.code || currentProgramData.slug}
      />

      <ProgramFinalProject finalProject={finalProject} />

      <ProgramSyllabus
        syllabusData={currentProgramData?.syllabus || { modules: [] }}
        programId={currentProgramData.id}
        onSyllabusUpdate={handleSyllabusUpdate}
      />

      <ProgramBenefits />

      {(selectedCohort?.id ?? cohorts[0]?.id) && (
        <ProgramTeacher cohortId={selectedCohort?.id ?? cohorts[0].id} />
      )}

      <ProgramPricing
        programData={currentProgramData}
        cohortId={selectedCohort?.id ?? selectedCohortId}
        maximumPayments={selectedCohort?.maximum_payments}
        includes={includes}
      />

      <ProgramFAQs
        shortCourse={currentProgramData?.faqs || []}
        programId={currentProgramData.id}
        onFAQsUpdate={handleFAQsUpdate}
      />

      <Location />

      <ProgramFinalCTA
        programData={currentProgramData}
        cohortId={selectedCohort?.id ?? selectedCohortId}
        seatsLeft={seatsLeft}
      />
      </div>
    </main>
  )
}
