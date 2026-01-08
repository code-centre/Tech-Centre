'use client'
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Program } from "@/types/programs"
import { ProgramsList } from "@/components/ProgramsList"
import Loader from "@/components/Loader"
import NavigationCard from "@/components/NavigationCard"
import ProgramContainer from "@/components/tech-foundaments/ProgramContainer"
import { CourseSchema } from "@/components/seo/StructuredData"

interface ProgramDetailClientProps {
  initialProgramData: Program | null
  initialCohortId: number | null
  slug: string
}

export default function ProgramDetailClient({ 
  initialProgramData, 
  initialCohortId,
  slug 
}: ProgramDetailClientProps) {
  const [contentType, setContentType] = useState<"programa" | "not-found" | null>(
    initialProgramData ? "programa" : null
  )
  const [isLoading, setIsLoading] = useState(!initialProgramData)
  const [programData, setProgramData] = useState<Program | null>(initialProgramData)
  const [allPrograms, setAllPrograms] = useState<Program[]>([])
  const [firstCohortId, setFirstCohortId] = useState<number | null>(initialCohortId)

  useEffect(() => {
    if (initialProgramData) {
      return // Ya tenemos los datos iniciales
    }

    async function checkContentType() {
      try {
        setIsLoading(true)
        
        // Buscar en Supabase
        const { data: supabaseProgram, error } = await supabase
          .from('programs')
          .select('*')
          .eq('code', slug) 
          .single()

        if (supabaseProgram && !error) {
          setProgramData(supabaseProgram)
          setContentType("programa")
          
          // Obtener la primera cohorte disponible para el checkout
          const { data: cohortData } = await (supabase as any)
            .from('cohorts')
            .select('id')
            .eq('program_id', (supabaseProgram as any).id)
            .eq('offering', true)
            .order('start_date', { ascending: true })
            .limit(1)
            .single()
          
          if (cohortData?.id) {
            setFirstCohortId(cohortData.id)
          }
          
          setIsLoading(false)
          return
        }

        // Si no se encuentra, cargar todos los programas activos
        const { data: programs, error: programsError } = await supabase
          .from('programs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (!programsError && programs) {
          setAllPrograms(programs)
        }

        setContentType("not-found")
      } catch (error) {
        console.error("Error al verificar el tipo de contenido:", error)
        
        // Intentar cargar programas incluso si hay error
        try {
          const { data: programs } = await supabase
            .from('programs')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
          
          if (programs) {
            setAllPrograms(programs)
          }
        } catch (e) {
          console.error("Error al cargar programas:", e)
        }
        
        setContentType("not-found")
      } finally {
        setIsLoading(false)
      }
    }

    checkContentType()
  }, [slug, initialProgramData])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://techcentre.co'

  return (
    <>
      {contentType === "programa" && programData && (
        <>
          <CourseSchema
            name={programData.name || ''}
            description={
              typeof programData.description === 'string'
                ? programData.description.replace(/<[^>]*>/g, '').substring(0, 500)
                : String(programData.description || '').substring(0, 500)
            }
            provider={{
              name: "Tech Centre",
              url: baseUrl,
            }}
            image={
              programData.image
                ? (programData.image.startsWith('http') ? programData.image : `${baseUrl}${programData.image}`)
                : `${baseUrl}/tech-center-logos/TechCentreLogoColor.png`
            }
            courseCode={programData.code || programData.slug}
            educationalCredentialAwarded="Diplomado"
            teaches={[
              programData.name || '',
              ...(programData.kind ? [programData.kind] : []),
            ]}
            timeRequired={programData.duration || undefined}
            url={`${baseUrl}/programas-academicos/${programData.code || programData.slug}`}
          />
          <main className="flex gap-8">
            <ProgramContainer programData={programData} />
              
            <aside className="w-80 shrink-0 hidden lg:block">
              <div className="sticky top-24">
                <NavigationCard programData={programData} cohortId={firstCohortId} />
              </div>
            </aside>
          </main>
        </>
       )}

      {contentType === "not-found" && (
        <div className="min-h-screen py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                El programa que buscas no existe
              </h2>
              <p className="text-xl text-gray-300 mb-2">
                Pero revisa alguno de estos otros:
              </p>
            </div>
            {allPrograms.length > 0 ? (
              <ProgramsList 
                programs={allPrograms}
                showHeader={false}
                backgroundColor="bg-background"
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No hay programas disponibles en este momento.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
