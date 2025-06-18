'use client'

import { useState, useEffect, useRef } from "react";
import { GraduationCap, UserPlus, ChevronLeft, ChevronRight, Pencil, Code as CodeIcon } from "lucide-react";
import useUserStore from "../../../store/useUserStore";
import SpeakersCreationModal from "./ProfessorCreationModal";
import Image from "next/image";

interface Speaker {
  id: string
  firstName?: string
  lastName?: string
  photoUrl?: string
  occupation?: string
  speciality?: string
  bio?: string
  linkedin?: string
  [key: string]: any
}

interface Talk {
  title: string
  description: string
  hour: string
  place: string
  startHour: string
  endHour: string
  speakerId: string
}

interface Props {
  speakers?: Speaker[]
  eventId?: string
  saveSpeakers?: (speakers: Speaker[]) => Promise<{ success: boolean, error?: string }>
  onDeleteSpeaker?: (speakerId: string) => Promise<void>
}

export function ProfessorContainer({ speakers = [], eventId, saveSpeakers, onDeleteSpeaker }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [current, setCurrent] = useState(0)
  const { user } = useUserStore()
  const isAdmin = user?.rol === 'admin'
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [isManual, setIsManual] = useState(false);

 
  useEffect(() => {
    if (speakers.length <= 1) return;
    if (isManual) return;

    autoplayRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % speakers.length);
    }, 5000);

    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    };
  }, [current, speakers.length, isManual]);

  
  const handleIndicatorClick = (idx: number) => {
    setCurrent(idx);
    setIsManual(true);
    if (autoplayRef.current) clearTimeout(autoplayRef.current);
    autoplayRef.current = setTimeout(() => setIsManual(false), 10000);
  };

  const next = () => {
    setCurrent((prev) => (prev + 1) % speakers.length)
    setIsManual(true);
    if (autoplayRef.current) clearTimeout(autoplayRef.current);
    autoplayRef.current = setTimeout(() => setIsManual(false), 10000);
  }
  const prev = () => {
    setCurrent((prev) => (prev - 1 + speakers.length) % speakers.length)
    setIsManual(true);
    if (autoplayRef.current) clearTimeout(autoplayRef.current);
    autoplayRef.current = setTimeout(() => setIsManual(false), 10000);
  }

  const handleAddSpeaker = async (newSpeaker: Speaker, talks: Talk[]) => {
    if (!saveSpeakers || !speakers) {
      console.error("No hay función de guardado disponible")
      return
    }
    const updatedSpeakers = [...speakers, newSpeaker]
    try {
      await saveSpeakers(updatedSpeakers)
    } catch (error) {
      console.error("Error al guardar el profesor:", error)
    }
  }

  const handleDeleteSpeaker = async (speakerId: string) => {
    if (!onDeleteSpeaker) {
      console.error("No hay función para eliminar disponible")
      return
    }
    try {
      await onDeleteSpeaker(speakerId)
    } catch (error) {
      console.error("Error al eliminar el profesor:", error)
    }
  }

  return (
    <div
      className="w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30"
    >
      {/* Header */}
      <div className="p-4 md:p-6 text-white flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center text-center gap-2">
          <GraduationCap className="text-blueApp" size={24} />
          Profesor{speakers.length > 1 ? 'es' : ''}
        </h2>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blueApp hover:bg-blue-600 transition-colors p-2 rounded-full"
          >
            <UserPlus className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      <div className="p-4 md:p-6">
        {speakers.length > 0 ? (
          <div className="relative min-h-[220px]">
       
            {speakers.length > 1 && (
              <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center z-10 pointer-events-none">
                <button
                  onClick={prev}
                  className="pointer-events-auto bg-zinc-800/70 hover:bg-blueApp text-white rounded-full p-2 shadow transition-colors"
                  aria-label="Anterior"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={next}
                  className="pointer-events-auto bg-zinc-800/70 hover:bg-blueApp text-white rounded-full p-2 shadow transition-colors"
                  aria-label="Siguiente"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
            {/* Profesor actual */}
            <div className="w-full transition-all duration-500">
              {(() => {
                const speaker = speakers[current];
                return (
                  <div
                    key={speaker.id}
                    className="flex flex-col rounded-xl overflow-hidden border border-zinc-800/60 bg-zinc-900/50 mb-6 last:mb-0 transform transition-all duration-300 hover:border-blueApp/80 hover:shadow-xl"
                  >
                    {/* Header con imagen del profesor */}
                    <div className="relative group">
                      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-10"></div>
                      <div className="h-40 sm:h-50 md:h-60 bg-gradient-to-r from-zinc-800 to-zinc-900"></div>
                      <div className="absolute -bottom-8 md:-bottom-12 left-1/2 transform -translate-x-1/2">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-60 lg:h-60 rounded-full overflow-hidden border-2 border-blueApp shadow-lg shadow-black/30 group-hover:border-blue-400 transition-all">
                          <Image
                            width={200}
                            height={200}
                            src={speaker.photoUrl || '/man-avatar.png'}
                            alt={`${speaker.firstName || 'Profesor'} ${speaker.lastName || ''}`}
                            className="w-full h-full object-cover"
                            priority
                          />
                        </div>
                      </div>
                      <div className="absolute top-3 left-0 right-0 text-center z-10">
                        <h3 className="font-bold text-base md:text-lg text-white shadow-sm">{speaker.firstName || 'Nombre no disponible'} {speaker.lastName || ''}</h3>
                      </div>
                      {isAdmin && (
                        <div className="absolute top-2 md:top-3 right-2 md:right-3 z-20 flex gap-1 md:gap-2">
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blueApp hover:bg-blue-600 p-1 md:p-1.5 rounded-full opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <Pencil className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                          </button>
                          {onDeleteSpeaker && (
                            <button
                              onClick={() => handleDeleteSpeaker(speaker.id)}
                              className="bg-red-600 hover:bg-red-700 p-1 md:p-1.5 rounded-full opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Contenido - información del profesor */}
                    <div className="px-3 pt-12 sm:pt-14 md:pt-16 pb-4 md:pb-6 flex flex-col items-center text-center">
                      {speaker.occupation && (
                        <div className="flex mb-4 md:mb-6 flex justify-center items-center text-center gap-2 md:gap-3 bg-zinc-800 rounded-lg px-3 md:px-4 py-2 w-full border border-zinc-700/30">
                          <div className="text-xl md:text-2xl font-bold tracking-tight flex items-center text-center gap-2">
                            <GraduationCap className="w-6 h-6 md:w-10 md:h-10 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm md:text-base">{speaker.occupation}</p>
                          </div>
                        </div>
                      )}
                      {speaker.speciality && (
                        <div className="text-xl md:text-2xl font-bold tracking-tight flex items-center text-center gap-2">
                          <CodeIcon className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                          <p className="text-gray-300 text-xs md:text-sm">{speaker.speciality}</p>
                        </div>
                      )}
                      {speaker.bio && (
                        <div className="bg-zinc-800/70 w-full rounded-lg p-3 md:p-4 mb-3 md:mb-4 border border-zinc-700/20">
                          <p className="text-gray-300 text-xs md:text-sm leading-relaxed">{speaker.bio}</p>
                        </div>
                      )}
                      {speaker.linkedin && (
                        <a
                          href={speaker.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 mt-2 text-xs md:text-sm text-blueApp hover:text-blue-400 transition-colors"
                        >
                          <span>Ver perfil profesional</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            {/* Indicadores de posición */}
            {speakers.length > 1 && (
              <div className="flex justify-center gap-2 mt-2">
                {speakers.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full ${current === idx ? 'bg-blueApp' : 'bg-zinc-500/40'}`}
                    onClick={() => handleIndicatorClick(idx)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 md:py-8 text-center">
            <div className="flex flex-col items-center gap-2 md:gap-4">
              <GraduationCap className="h-8 w-8 md:h-12 md:w-12 text-zinc-500" />
              <p className="text-zinc-400 text-base md:text-lg">
                Aún no hay profesores asignados a este curso.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 px-3 py-1.5 md:px-4 md:py-2 bg-blueApp hover:bg-blue-600 text-white text-sm md:text-base rounded-lg transition-colors"
                >
                  Añadir profesor
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Modal */}
      {isModalOpen && eventId && (
        <SpeakersCreationModal
          eventId={eventId}
          onClose={() => setIsModalOpen(false)}
          onAddSpeaker={handleAddSpeaker}
        />
      )}
    </div>
  )
}
