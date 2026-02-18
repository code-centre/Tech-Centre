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
      .eq('is_active', true)
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
  let firstCohortId: number | null = null

  try {
    // Buscar el programa en Supabase
    const { data: supabaseProgram, error } = await supabase
      .from('programs')
      .select('*')
      .eq('code', slug)
      .eq('is_active', true)
      .single()

    if (supabaseProgram && !error) {
      programData = supabaseProgram as unknown as Program
      const programId = (supabaseProgram as any).id

      // Si viene cohortId en la URL, verificar que pertenezca al programa
      if (cohortIdParam) {
        const cohortIdNum = parseInt(cohortIdParam, 10)
        if (!isNaN(cohortIdNum)) {
          const { data: cohortById } = await supabase
            .from('cohorts')
            .select('id')
            .eq('id', cohortIdNum)
            .eq('program_id', programId)
            .single()
          const cohortId = (cohortById as { id?: number } | null)?.id
          if (cohortId != null) {
            firstCohortId = cohortId
          }
        }
      }

      // Fallback: primera cohorte con offering=true
      if (firstCohortId === null) {
        const { data: fallbackCohort } = await supabase
          .from('cohorts')
          .select('id')
          .eq('program_id', programId)
          .eq('offering', true)
          .order('start_date', { ascending: true })
          .limit(1)
          .single()
        const fallbackId = (fallbackCohort as { id?: number } | null)?.id
        if (fallbackId != null) {
          firstCohortId = fallbackId
        }
      }
    }
  } catch (error) {
    console.error("Error al cargar el programa:", error)
  }

  return (
    <ProgramDetailClient 
      initialProgramData={programData}
      initialCohortId={firstCohortId}
      slug={slug}
    />
  )
}
