import type { Metadata } from "next"
import { createClient } from '@/lib/supabase/server'
import { generateProgramMetadata } from '@/lib/seo/generateProgramMetadata'
import type { Program } from "@/types/programs"
import ProgramDetailClient from './ProgramDetailClient'

interface Props {
  params: Promise<{ slug: string }>
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

export default async function DetailCourse({ params }: Props) {
  const { slug } = await params
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
      
      // Obtener la primera cohorte disponible para el checkout
      const { data: cohortData } = await supabase
        .from('cohorts')
        .select('id')
        .eq('program_id', (supabaseProgram as any).id)
        .eq('offering', true)
        .order('start_date', { ascending: true })
        .limit(1)
        .single()
      
      if (cohortData?.id) {
        firstCohortId = cohortData.id
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
