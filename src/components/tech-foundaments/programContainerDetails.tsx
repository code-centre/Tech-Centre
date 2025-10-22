'use client'
import React, { use } from 'react'
import { Hero } from './Hero'
import { useState, useEffect } from 'react'
import { Description } from './Description'
import { Tickets } from './Tickets'
import { useCollection } from 'react-firebase-hooks/firestore'
import { db } from '../../../firebase'
import { where, collection, query, getDocs, doc, updateDoc, serverTimestamp, onSnapshot, getDoc, deleteDoc } from 'firebase/firestore'
import LocationContainer from './LocationContainer'
import Details from './Details'
import Benefits from './Benefits'
import FAQs from './FAQs'
import Syllabus from './Syllabus'
import { ProfessorContainer } from './ProfessorContainer'
import { useRouter } from 'next/navigation'
import { GraduationCap, CalendarClock, Network, Clock, ChevronDown } from 'lucide-react';
import Schedule from "./SchedulesShorts"
import { generateSlug } from '../../../utils/generateSlug'
import PublishButton from '../PublishButton'
import userUseStore from '../../../store/useUserStore'
import { useUser } from '@/lib/supabase'

interface Props {
  slug: string
  shortCourse?: EventFCA | any
}
interface ProgramProps {
  programData: {
    id: number;
    code: string;
    name: string;
    syllabus: any[]; // O tipa esto según tu estructura real
    difficulty: string;
    kind: string;
    total_hours: number;
    default_price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  } | null;
  slug?: string; // Mantenemos slug opcional para compatibilidad
}

export default function ProgramContainerDetails({ programData, slug }: ProgramProps) {
  // Mostrar los datos en consola
  useEffect(() => {
    if (programData) {
      console.log('Datos del programa desde Supabase:', programData);
    } else if (slug) {
      console.log('Buscando datos con slug (modo legacy):', slug);
      // Aquí iría la lógica de Firestore si es necesario
    }
  }, [programData, slug]);

  
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
        {/* <Hero
          date={shortCourse?.date || ''}
          title={shortCourse?.title || ''}
          subtitle={shortCourse?.subtitle || ''}
          heroImage={shortCourse?.heroImage || ''}
          saveChanges={saveChanges}
          shortCourse={shortCourse || {}}
        /> */}
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
                <Clock className="w-6 h-6 text-blueApp" />
              </div>
              <span className="text-sm font-medium text-white mb-1">Dedicación</span>
              <span className="text-xs text-white font-semibold">{programData?.total_hours || 'Por definir'}</span>
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
        {/* <Description
          saveChanges={saveChanges}
          shortCourse={shortCourse || {}}
        /> */}
        <div className="gap-10 mt-12">
          {/* Grid para "aprenderás" y ProfessorContainer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div id="aprenderas" className="bg-transparent">
              {/* <Details
                shortCourse={shortCourse || {}}
                saveChanges={saveChanges}
              /> */}
            </div>
            <div className="flex justify-center items-center w-full">
              <div className="w-full h-full"> {/* Nueva capa para controlar el ancho y evitar que se corte */}
                {/* <ProfessorContainer
                  speakers={profesorData}
                  eventId={eventId}
                  saveSpeakers={saveSpeakersData}
                  onDeleteSpeaker={handleDeleteSpeaker}
                /> */}
              </div>
            </div>
          </div>

          {/* Secciones adicionales con mejor separación */}
          <div className="flex flex-col gap-y-2">
            <div id="programa" className="bg-transparent pt-6"> {/* Separación extra antes del temario */}
              {/* <Syllabus
                shortCourse={programData?.syllabus || []}
                saveChanges={saveChanges}
              /> */}
            </div>
            <div id="horarios" className="bg-transparent pt-2">
              {/* <Schedule
                data={shortCourse || {}}
                saveChanges={saveChanges}
              /> */}
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

            <div id="beneficios" className="bg-transparent">
              {/* <Benefits
                shortCourse={shortCourse || {}}
                saveChanges={saveChanges}
              /> */}
            </div>

            
              {/* <LocationContainer
                location={shortCourse?.location || ''}
                eventId={eventId}
                saveChanges={handleLocationUpdate}
              /> */}

            <div id="preguntas" className="bg-transparent">
              {/* <FAQs
                shortCourse={shortCourse || {}}
                saveChanges={saveChanges}
              /> */}
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