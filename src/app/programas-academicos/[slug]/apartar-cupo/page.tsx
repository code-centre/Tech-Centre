import type { Metadata } from "next"
import { createClient } from '@/lib/supabase/server'
import type { Program } from "@/types/programs"
import ApartarCupoClient from './ApartarCupoClient'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  try {
    const { data: program, error } = await supabase
      .from('programs')
      .select('name, subtitle')
      .eq('code', slug)
      .eq('is_active', true)
      .single()

    if (program && !error) {
      return {
        title: `Aparta tu cupo en ${program.name} | Tech Centre`,
        description: program.subtitle || `Aparta tu cupo en ${program.name} sin pago inmediato. Te ayudamos a decidir con claridad.`,
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: "Apartar cupo | Tech Centre",
    description: "Aparta tu cupo en nuestros programas académicos sin pago inmediato.",
  }
}

export default async function ApartarCupoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  
  let programData: Program | null = null
  let cohortData: any = null
  let instructorData: any = null

  try {
    // Obtener el programa por slug (code)
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('*')
      .eq('code', slug)
      .eq('is_active', true)
      .single()

    if (programError || !program) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Programa no encontrado
            </h1>
            <p className="text-text-muted mb-6">
              El programa que buscas no está disponible o no existe.
            </p>
            <Link
              href="/programas-academicos"
              className="btn-primary inline-block"
            >
              Ver todos los programas
            </Link>
          </div>
        </div>
      )
    }

    programData = program as unknown as Program

    // Obtener la primera cohorte disponible
    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .select('id, start_date, modality, schedule')
      .eq('program_id', (program as any).id)
      .eq('offering', true)
      .order('start_date', { ascending: true })
      .limit(1)
      .single()

    if (!cohortError && cohort) {
      cohortData = cohort

      // Obtener el profesor de la cohorte si existe
      const { data: instructorRelation, error: instructorError } = await supabase
        .from('cohort_instructors')
        .select(`
          instructor_id,
          profiles:instructor_id (
            first_name,
            last_name
          )
        `)
        .eq('cohort_id', cohort.id)
        .single()

      if (!instructorError && instructorRelation) {
        const profileData = Array.isArray((instructorRelation as any).profiles)
          ? (instructorRelation as any).profiles[0]
          : (instructorRelation as any).profiles

        if (profileData) {
          instructorData = {
            first_name: profileData.first_name,
            last_name: profileData.last_name
          }
        }
      }
    }
  } catch (error) {
    console.error("Error al cargar datos:", error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Error al cargar la página
          </h1>
          <p className="text-text-muted mb-6">
            Ocurrió un error al cargar la información. Por favor, intenta de nuevo.
          </p>
          <Link
            href="/programas-academicos"
            className="btn-primary inline-block"
          >
            Volver a programas
          </Link>
        </div>
      </div>
    )
  }

  if (!programData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Programa no encontrado
          </h1>
          <p className="text-text-muted mb-6">
            El programa que buscas no está disponible o no existe.
          </p>
          <Link
            href="/programas-academicos"
            className="btn-primary inline-block"
          >
            Ver todos los programas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ApartarCupoClient
      program={programData}
      cohort={cohortData}
      instructor={instructorData}
      slug={slug}
    />
  )
}
