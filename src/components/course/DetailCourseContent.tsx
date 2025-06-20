import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import Loader from '../Loader'
import { db } from '../../../firebase'
import DetailCourseComponent from './DetailCourse'
import TechFoundamentsContainer from '../tech-foundaments/TechFoundamentsContainer'

export default function DetailCourseContent({ slug }: { slug: string }) {
  const [contentType, setContentType] = useState<"program" | "event" | "not-found" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkContentType() {
      try {
        const programsQuery = query(
          collection(db, "programs"),
          where("slug", "==", slug)
        )
        const programsSnapshot = await getDocs(programsQuery)

        if (!programsSnapshot.empty) {
          setContentType("program")
          setIsLoading(false)
          return
        }

        const eventsQuery = query(
          collection(db, "events"),
          where("slug", "==", slug),
          where("type", "==", "curso especializado"),
          where("status", "in", ["published", "draft"]),
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
      {contentType === "program" && (
          <DetailCourseComponent slug={slug} />
      )}
      {contentType === "event" && (
          <TechFoundamentsContainer slug={slug} />
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
