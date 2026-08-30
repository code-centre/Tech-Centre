'use client'
import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSupabaseClient } from "@/lib/supabase"
import { Program } from "@/types/programs"
import { Cohort } from "@/types/cohorts"
import { ProgramsList } from "@/components/ProgramsList"
import Loader from "@/components/Loader"
import NavigationCard from "@/components/NavigationCard"
import ProgramContainer from "@/components/tech-foundaments/ProgramContainer"
import { CourseSchema } from "@/components/seo/StructuredData"

interface ProgramDetailClientProps {
  initialProgramData: Program | null
  initialCohortId: number | null
  initialCohorts?: Cohort[]
  slug: string
}

export default function ProgramDetailClient({
  initialProgramData,
  initialCohortId,
  initialCohorts = [],
  slug
}: ProgramDetailClientProps) {
  const [contentType, setContentType] = useState<"programa" | "not-found" | null>(
    initialProgramData ? "programa" : null
  )
  const [isLoading, setIsLoading] = useState(!initialProgramData)
  const [programData, setProgramData] = useState<Program | null>(initialProgramData)
  const [allPrograms, setAllPrograms] = useState<Program[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>(initialCohorts)
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(initialCohortId)
  const [seatsLeft, setSeatsLeft] = useState<number | null>(null)
  const supabase = useSupabaseClient()
  const searchParams = useSearchParams()
  const cohortIdParam = searchParams.get('cohortId')

  const loadCohorts = useCallback(async (programId: number) => {
    const { data, error } = await supabase
      .from('cohorts')
      .select('*')
      .eq('program_id', programId)
      .eq('offering', true)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error al cargar cohortes:', error)
      return [] as Cohort[]
    }
    return (data as unknown as Cohort[]) || []
  }, [supabase])

  // El programa ya viene del servidor en el caso normal; esto cubre el
  // fallback y la pantalla de "no existe".
  useEffect(() => {
    if (initialProgramData) return

    async function checkContentType() {
      try {
        setIsLoading(true)

        const { data: supabaseProgram, error } = await supabase
          .from('programs')
          .select('*')
          .eq('code', slug)
          .single()

        if (supabaseProgram && !error) {
          const program = supabaseProgram as unknown as Program
          setProgramData(program)
          setContentType("programa")
          setCohorts(await loadCohorts(program.id))
          setIsLoading(false)
          return
        }

        const { data: programs, error: programsError } = await supabase
          .from('programs')
          .select('*')
          .order('created_at', { ascending: false })

        if (!programsError && programs) {
          setAllPrograms(programs)
        }

        setContentType("not-found")
      } catch (error) {
        console.error("Error al verificar el tipo de contenido:", error)
        setContentType("not-found")
      } finally {
        setIsLoading(false)
      }
    }

    checkContentType()
  }, [slug, initialProgramData, supabase, loadCohorts])

  // Si el servidor no alcanzó a mandar las cohortes, se piden aquí.
  useEffect(() => {
    if (!programData || cohorts.length > 0) return
    let cancelled = false
    loadCohorts(programData.id).then((list) => {
      if (!cancelled) setCohorts(list)
    })
    return () => { cancelled = true }
  }, [programData, cohorts.length, loadCohorts])

  // La cohorte de la URL manda, siempre que pertenezca a este programa.
  useEffect(() => {
    if (cohorts.length === 0) return
    const fromUrl = cohortIdParam ? parseInt(cohortIdParam, 10) : NaN
    if (!isNaN(fromUrl) && cohorts.some((c) => c.id === fromUrl)) {
      setSelectedCohortId(fromUrl)
      return
    }
    setSelectedCohortId((current) =>
      current != null && cohorts.some((c) => c.id === current) ? current : cohorts[0].id
    )
  }, [cohorts, cohortIdParam])

  // Cupos restantes. La función agrega el conteo en el servidor: enrollments
  // no es legible en público.
  useEffect(() => {
    if (!selectedCohortId) {
      setSeatsLeft(null)
      return
    }
    let cancelled = false
    supabase
      .rpc('cohort_seats_left', { p_cohort_id: selectedCohortId })
      .then(({ data, error }) => {
        if (cancelled) return
        setSeatsLeft(error || typeof data !== 'number' ? null : data)
      })
    return () => { cancelled = true }
  }, [selectedCohortId, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://techcentre.co')

  return (
    <>
      {programData && (
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
          <main className="flex flex-col lg:flex-row gap-8 lg:gap-10 pb-28 lg:pb-16 px-4 sm:px-6 lg:px-8">
            <div className="flex-1 min-w-0">
              <ProgramContainer
                programData={programData}
                cohorts={cohorts}
                selectedCohortId={selectedCohortId}
                onCohortSelect={setSelectedCohortId}
                seatsLeft={seatsLeft}
              />
            </div>

            {/* Escritorio: tarjeta de oferta pegada */}
            <aside className="w-full lg:w-[360px] shrink-0 hidden lg:block">
              <div className="sticky top-24">
                <NavigationCard
                  programData={programData}
                  cohorts={cohorts}
                  cohortId={selectedCohortId}
                  onCohortSelect={setSelectedCohortId}
                  seatsLeft={seatsLeft}
                />
              </div>
            </aside>

            {/* Móvil: barra fija con precio y las dos acciones */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-5 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-t border-gray-300 dark:border-border-color shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.6)]">
              <NavigationCard
                programData={programData}
                cohorts={cohorts}
                cohortId={selectedCohortId}
                seatsLeft={seatsLeft}
                compact
              />
            </div>
          </main>
        </>
       )}

      {contentType === "not-found" && (
        <div className="min-h-screen py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 mb-8">
              <h2 className="font-highlight text-3xl md:text-4xl font-extrabold mb-4 card-text-primary">
                El programa que buscas no existe
              </h2>
              <p className="text-xl card-text-muted mb-2">
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
                <p className="card-text-muted">No hay programas disponibles en este momento.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
