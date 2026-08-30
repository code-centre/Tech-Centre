import type { Metadata } from "next"
import { createClient } from '@/lib/supabase/server'
import { generateProgramMetadata } from '@/lib/seo/generateProgramMetadata'
import type { Program } from "@/types/programs"
import type { Cohort } from "@/types/cohorts"
import ProgramDetailClient from './ProgramDetailClient'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ cohortId?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  try {
    const { data: program, error } = await supabase
      .from('programs')
      .select('*')
      .eq('code', slug)
      .single()

    if (program && !error) {
      return generateProgramMetadata({ 
        program: program as unknown as Program,
        baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://techcentre.co'
      })
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  // Fallback metadata si no se encuentra el programa
  return {
    title: "Programa no encontrado | Tech Centre",
    description: "El programa que buscas no está disponible. Explora nuestros otros programas de tecnología en Tech Centre - Centro de tecnología del Caribe.",
  }
}

export default async function DetailCourse({ params, searchParams }: Props) {
  const { slug } = await params
  const { cohortId: cohortIdParam } = await searchParams
  const supabase = await createClient()

  let programData: Program | null = null
  let cohorts: Cohort[] = []
  let firstCohortId: number | null = null

  try {
    const { data: supabaseProgram, error } = await supabase
      .from('programs')
      .select('*')
      .eq('code', slug)
      .single()

    if (supabaseProgram && !error) {
      programData = supabaseProgram as unknown as Program

      // Una sola consulta de cohortes para toda la página: la tarjeta de
      // oferta, el selector de modalidad y los datos del programa usan la misma.
      const { data: cohortRows } = await supabase
        .from('cohorts')
        .select('*')
        .eq('program_id', (supabaseProgram as { id: number }).id)
        .eq('offering', true)
        .order('start_date', { ascending: true })

      cohorts = (cohortRows as unknown as Cohort[]) || []

      // La cohorte de la URL manda, siempre que sea de este programa.
      const requestedId = cohortIdParam ? parseInt(cohortIdParam, 10) : NaN
      const requested = !isNaN(requestedId)
        ? cohorts.find((cohort) => cohort.id === requestedId)
        : undefined

      firstCohortId = requested?.id ?? cohorts[0]?.id ?? null
    }
  } catch (error) {
    console.error("Error al cargar el programa:", error)
  }

  return (
    <ProgramDetailClient
      initialProgramData={programData}
      initialCohortId={firstCohortId}
      initialCohorts={cohorts}
      slug={slug}
    />
  )
}
