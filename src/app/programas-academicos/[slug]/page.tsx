'use client'
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Program } from "@/types/programs"
import { useParams } from "next/navigation"
import { ProgramsList } from "@/components/ProgramsList"
import Loader from "@/components/Loader"
import NavigationCard from "@/components/NavigationCard"
import ProgramContainer from "@/components/tech-foundaments/ProgramContainer"

export default function DetailCourse() {
  const { slug }: { slug: string } = useParams()
  const [contentType, setContentType] = useState<"programa" | "not-found" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [programData, setProgramData] = useState<Program | null>(null)
  const [allPrograms, setAllPrograms] = useState<Program[]>([])

  useEffect(() => {
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
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <>
      {contentType === "programa" && programData && (
        <main className="flex gap-8">
          <ProgramContainer programData={programData} />
            
          <aside className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24">
              <NavigationCard programData={programData} />
            </div>
          </aside>
        </main>
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
