'use client'

import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import Loader from '../Loader'
import { db } from '../../../firebase'
import DetailCourseComponent from './DetailCourse'
import TechFoundamentsContainer from '../tech-foundaments/TechFoundamentsContainer'
import { Json } from '@/types/supabase'
import { supabase } from '@/lib/supabase'; // Ajusta esta ruta según tu configuración
import ProgramContainerDetails from '../tech-foundaments/programContainerDetails'

// Definición de tipos para el enum difficulty
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Interfaz para el syllabus (si necesitas tipado más específico)
// interface SyllabusItem {
//   title: string;
//   description?: string;
//   duration?: number;
//   // Agrega más campos según la estructura de tu syllabus
// }

interface Module {
  id: number;
  titulo: string;
  temas: string[];
  duracion_horas: number;
}

interface SyllabusData {
  modulos: Module[];
}
// Interfaz principal del programa
interface Program {
  id: number;
  code: string;
  name: string;
  syllabus: SyllabusData; // o any[] si la estructura es muy dinámica
  difficulty: Difficulty;
  kind: string;
  total_hours: number;
  default_price: number;
  is_active: boolean;
  created_at: string; // o Date si lo conviertes
  updated_at: string; 
  image: string;
  description: string;
  video: string;
  subtitle: string;
  faqs: any[];
  // Agrega aquí cualquier otro campo que pueda tener tu tabla
}
export default function DetailCourseContent({ slug }: { slug: string }) {
  const [contentType, setContentType] = useState<"program" | "event" | "not-found"| "programa" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [programData, setProgramData] = useState<Program | null>(null);

  useEffect(() => {
    async function checkContentType() {
      try {
        setIsLoading(true)
        
        // 1. Primero buscamos en Supabase
        const { data: supabaseProgram, error } = await supabase
          .from('programs')
          .select('*')
          .eq('code', slug) 
          .single()

        if (supabaseProgram && !error) {
          setProgramData(supabaseProgram)
          setContentType("programa")
          console.log("programa",supabaseProgram)
          setIsLoading(false)
          return
        }

        // 2. Si no se encuentra en Supabase, buscar en Firestore (mantenemos para retrocompatibilidad)
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

        // 3. Buscar en eventos si no se encuentra en programas
        const eventsQuery = query(
          collection(db, "events"),
          where("slug", "==", slug),
          where("type", "==", "curso especializado"),
          where("status", "in", ["published", "draft"])
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
      {contentType === "programa" && (
        <ProgramContainerDetails programData={programData} slug={slug} />
      )}
      {contentType === "not-found" && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center py-20 ">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Contenido no encontrado</h2>
            <p className="text-xl text-gray-600">No se encontró información para este programa o taller.</p>
          </div>
        </div>
      )}
    </>
  )
}
