"use client"

import { useEffect, useState } from "react"
import DetailCourseComponent from "@/components/course/DetailCourse"
import TechFoundamentsContainer from "@/components/tech-foundaments/TechFoundamentsContainer"
import { db } from "../../../../firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

interface Props {
  params: {
    slug: string
  }
}

export default function DetailCourse({ params }: Props) {
  const [contentType, setContentType] = useState<"program" | "event" | "not-found" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkContentType() {
      try {
        const programsQuery = query(collection(db, "programs"), where("slug", "==", params.slug))
        const programsSnapshot = await getDocs(programsQuery)

        if (!programsSnapshot.empty) {
          setContentType("program")
          setIsLoading(false)
          return
        }

        const eventsQuery = query(
          collection(db, "events"),
          where("slug", "==", params.slug),
          where("type", "==", "curso especializado"),
          where("status", "==", "published"),
        )
        const eventsSnapshot = await getDocs(eventsQuery)

        if (!eventsSnapshot.empty) {
          setContentType("event")
        } else {
          setContentType("not-found")
        }
      } catch (error) {
        console.error("Error al verificar el tipo de contenido:", error)
        setContentType("not-found")
      } finally {
        setIsLoading(false)
      }
    }

    checkContentType()
  }, [params.slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      {contentType === "program" && (
          <DetailCourseComponent slug={params.slug} />
      )}
      {contentType === "event" && (
          <TechFoundamentsContainer slug={params.slug} />
      )}
      {contentType === "not-found" && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Contenido no encontrado</h2>
            <p className="text-xl text-gray-600">No se encontró información para este programa o taller.</p>
          </div>
        </div>
      )}
    </>
  )
}
