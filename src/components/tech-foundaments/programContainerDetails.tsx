'use client'
import React, { use } from 'react'
import { HeroSupa } from './HeroSupa'
import { useState, useEffect } from 'react'
import { Description } from './Description'
import { Tickets } from './Tickets'
import { useCollection } from 'react-firebase-hooks/firestore'
import { db } from '../../../firebase'
import { where, collection, query, getDocs, doc, updateDoc, serverTimestamp, onSnapshot, getDoc, deleteDoc } from 'firebase/firestore'
import LocationContainerSupa from './LocationContainerSupa'
import Details from './Details'
import Benefits from './Benefits'
import FAQs from './FAQs'
import Syllabus from './Syllabus'
import { ProfessorContainerSupa } from './ProfessorContainerSupa'
import { useRouter } from 'next/navigation'
import { GraduationCap, CalendarClock, Network, Clock, ChevronDown, MapPin } from 'lucide-react';
import ScheduleSupa from "./SchedulesSupa"
import { generateSlug } from '../../../utils/generateSlug'
import PublishButton from '../PublishButton'
import userUseStore from '../../../store/useUserStore'
import { useUser } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'; 
import { DescriptionSupa } from './DescriptionSupa'
import DetailsSupa from './DetailsSupa'
import SyllabusSupa from './SyllabusSupa'
import FaqsSupa from './FAQsSupa'

interface Props {
  slug: string
  shortCourse?: EventFCA | any
}

export interface Module {
  id: number;
  titulo: string;
  temas: string[];
  duracion_horas: number;
}

export interface SyllabusData {
  modulos: Module[];
}

export interface ProgramProps {
  programData: {
    id: number;
    code: string;
    name: string;
    syllabus: SyllabusData; // O tipa esto según tu estructura real
    difficulty: string;
    kind: string;
    total_hours: number;
    default_price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    image: string;
    description: string;
    video: string;
    subtitle: string;
    faqs: any[];
  } | null;
  slug?: string; // Mantenemos slug opcional para compatibilidad
}

export default function ProgramContainerDetails({ programData, slug }: ProgramProps) {
  
  const [cohorts, setCohorts] = useState<any[]>([]);

  // Función para obtener las cohortes de un programa específico
async function getProgramCohorts(programId: number) {
  try {
    
    // 2. Intenta la consulta con el contexto de autenticación
    const { data, error } = await supabase
      .from('cohorts')
      .select('*')
      .eq('program_id', programId);

    

    if (error) {
      console.error('Error en la consulta:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error en getProgramCohorts:', error);
    return [];
  }
}

// Add this function inside your component, after the getProgramCohorts function
async function getCohortInstructor(cohortId: number) {
  try {
    // First, get the instructor ID from cohort_instructors
    const { data: instructorData, error: instructorError } = await supabase
      .from('cohort_instructors')
      .select('instructor_id, role')
      .eq('cohort_id', cohortId)
      .single(); // We only expect one main instructor

    if (instructorError || !instructorData) {
      console.error('Error fetching instructor data:', instructorError);
      return null;
    }

    // Then, get the profile information for this instructor
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', instructorData.instructor_id)
      .single();

    if (profileError || !profileData) {
      console.error('Error fetching profile data:', profileError);
      return null;
    }

    return {
      ...profileData,
      role: instructorData.role
    };
  } catch (error) {
    console.error('Error in getCohortInstructor:', error);
    return null;
  }
}

useEffect(() => {
  
  const loadCohorts = async () => {
    
    if (programData?.id) {
      try {
        
        const programCohorts = await getProgramCohorts(programData.id);
        
        
        if (programCohorts && programCohorts.length > 0) {
          // Ordenar las cohortes por end_date (más cercana primero)
          const sortedCohorts = [...programCohorts].sort((a, b) => {
            const dateA = new Date(a.end_date).getTime();
            const dateB = new Date(b.end_date).getTime();
            const now = new Date().getTime();
            
            // Calcular la diferencia de tiempo desde ahora
            const diffA = Math.abs(dateA - now);
            const diffB = Math.abs(dateB - now);
            
            return diffA - diffB; // Ordenar por la más cercana a la fecha actual
          });
          
          // Tomar la cohorte más cercana
          const nearestCohort = sortedCohorts[0];
          console.log('Cohorte más cercana:', nearestCohort);
          // setCohorts([nearestCohort]); // Envuelve en un array para mantener la consistencia
          
          // Get instructor data for this cohort
        const instructor = await getCohortInstructor(nearestCohort.id);
        
          // Add instructor data to the cohort
          const cohortWithInstructor = {
            ...nearestCohort,
            instructor: instructor
          };
          
          console.log('Cohorte con instructor:', cohortWithInstructor);
          setCohorts([cohortWithInstructor]);
        } else {
          setCohorts([]);
        }
      } catch (error) {
        console.error('Error en loadCohorts:', error);
        setCohorts([]);
        
      }
    }
  };
  loadCohorts();
}, [programData?.id]);

  // Agrega este useEffect después de la declaración de cohorts
useEffect(() => {
  console.log('Cohortes actualizadas:', {
    todas: cohorts,
    primera: cohorts[0],
    tieneDatos: cohorts.length > 0
  });
}, [cohorts]);

  
  const [teacher, setTeacher] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [profesorData, setProfesorData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [deleted, setDeleted] = useState(false);
  const { user } = useUser()
  const router = useRouter()



  return (
    <div className="text-white w-full mt-30 overflow-x-hidden">
      <main className="max-w-7xl flex flex-col mx-auto sm:px-4 lg:px-8  gap-8 ">
        <HeroSupa
          date={cohorts[0]?.start_date || ''} 
          title={programData?.name || ''} 
          subtitle={programData?.subtitle || ''} 
          heroImage={programData?.image || ''} 
          video={programData?.video || ''}
          cohorte={cohorts[0]?.name || ''}
          user={user}
        />
        <div className="bg-bgCard backdrop-blur-sm p-8 rounded-2xl border border-blue-100/20 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                <GraduationCap className="w-6 h-6 text-blueApp" />
              </div>
              <span className="text-sm font-medium text-white mb-1">Tipo de curso</span>
              <span className='text-sm'>{programData?.kind}</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                <CalendarClock className="w-6 h-6 text-blueApp" />
              </div>
              <span className="text-sm font-medium text-white mb-1">Duración</span>
              <span className="text-xs text-white font-semibold">{programData?.total_hours || 'Por definir'}</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                <Network className="w-6 h-6 text-blueApp" />
              </div>
              <span className="text-sm font-medium text-white mb-1">Dificultad</span>
              <span className="text-xs text-white font-semibold">
                {programData?.difficulty || 'Básico'}
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-blueApp" />
              </div>
              <span className="text-sm font-medium text-white mb-1">Modalidad</span>
              <span className="text-xs text-white font-semibold">{cohorts[0]?.modality || 'Por definir'}</span>
            </div>
          </div>
          {user?.rol === 'admin' && (
            <div className="mt-4">
              <button
                // onClick={() => saveChanges('name', programData?.name)}
                className="px-4 py-2 bg-blueApp text-white rounded-lg hover:bg-blueApp/80 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          )}
        </div>
        <DescriptionSupa
          programData={programData?.description || ''}
        />
        <div className="gap-10 mt-12">
          {/* Grid para "aprenderás" y ProfessorContainer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div id="aprenderas" className="bg-transparent">
              <DetailsSupa />
            </div>
            <div className="flex justify-center items-center w-full">
              <div className="w-full h-full"> {/* Nueva capa para controlar el ancho y evitar que se corte */}
                <ProfessorContainerSupa
                  instructor={cohorts[0]?.instructor}
                  
                />
              </div>
            </div>
          </div>

          {/* Secciones adicionales con mejor separación */}
          <div className="flex flex-col gap-y-2">
            <div id="programa" className="bg-transparent pt-6">
              <SyllabusSupa 
                silabo={{
                  modulos: programData?.syllabus?.modulos || []
                }} 
              />
            </div>
            <div id="horarios" className="bg-transparent pt-2">
              <ScheduleSupa 
                data={cohorts[0]?.schedule} 
              />
            </div>

            <div id="precios" className="flex items-center justify-center p-2">
              {/* <Tickets
                tickets={tickets || []}
                eventId={eventId}
                eventSlug={slug}
                isShort={short}
                saveTicketData={saveTicketData}
                deleteTicketData={deleteTicketData}
                saveChanges={saveChanges}
              /> */}
            </div>

            

            
              <LocationContainerSupa/>

            <div id="preguntas" className="bg-transparent">
              <FaqsSupa
                shortCourse={programData?.faqs || []}
              />
            </div>
          </div>
          <>
            {/* {user?.rol === 'admin' && (
              <div className='flex justify-center mt-8'>
                <PublishButton eventId={shortCourse?.id} onPublish={handlePublish} onRemove={handleRemove} onDelete={handleDeleteEvent} onClose={() => { }} />

              </div>
            )} */}
          </>
        </div>
      </main>
    </div>
  )
}