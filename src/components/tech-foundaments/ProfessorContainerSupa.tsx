'use client'

import { useState, useEffect, useRef } from "react";
import { GraduationCap, UserPlus, ChevronLeft, ChevronRight, Pencil, Code as CodeIcon } from "lucide-react";
import useUserStore from "../../../store/useUserStore";
import SpeakersCreationModal from "./ProfessorCreationModal";
import Image from "next/image";

interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  professional_title?: string;
  bio?: string;
  email?: string;
  role?: string;
  [key: string]: any; // For any additional properties
}



interface Props {
  instructor?: Instructor
}

export function ProfessorContainerSupa({ instructor }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [current, setCurrent] = useState(0)
  const { user } = useUserStore()
  const isAdmin = user?.rol === 'admin'
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    console.log('Instructor data received:', instructor);
  }, [instructor]);
 
  

  
  const handleIndicatorClick = (idx: number) => {
    setCurrent(idx);
    setIsManual(true);
    if (autoplayRef.current) clearTimeout(autoplayRef.current);
    autoplayRef.current = setTimeout(() => setIsManual(false), 10000);
  };


  return (
    <div
      className="w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30"
    >
      {/* Header */}
      <div className="p-4 md:p-6 text-white flex justify-between items-center">
        <h2 className="text-xl md:text-xl font-bold tracking-tight flex items-center text-center gap-2">
          <GraduationCap className="text-blueApp" size={24} />
          Profesor
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
      <div className="p-4 md:p-6 animate-slide-in animate-delay-300 animate-duration-slow">
        {instructor ? (
          <div className="relative min-h-[220px]">
       
            
            {/* Profesor actual */}
            <div className="w-full animate-slide-in-bottom animate-delay-300 animate-duration-slow">
              {(() => {
                const speaker = instructor;
                console.log('Speaker data:', speaker);
                return (
                  <div
                    key={speaker.id}
                    className="flex flex-col rounded-xl overflow-hidden border border-zinc-800/60 bg-zinc-900/50 mb-6 last:mb-0 transform transition-all duration-500 hover:border-blue-500/80 hover:shadow-xl animate-slide-in-bottom animate-delay-300 animate-duration-slow"
                  >
                    {/* Header con imagen del profesor */}
                    <div className="relative group">
                      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent"></div>
                      <div className="h-40 sm:h-50 md:h-60 bg-gradient-to-r from-zinc-800 to-zinc-900"></div>
                      <div className="absolute -bottom-8 md:-bottom-12 left-1/2 transform -translate-x-1/2">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-60 lg:h-60 rounded-full overflow-hidden border-2 border-blueApp shadow-lg shadow-black/30 group-hover:border-blue-400 transition-all">
                          <Image
                            width={200}
                            height={200}
                            src={speaker.profile_image || '/man-avatar.png'}
                            alt={`${speaker.firstName || 'Profesor'} ${speaker.lastName || ''}`}
                            className="w-full h-full object-cover"
                            priority
                          />
                        </div>
                      </div>
                      <div className="absolute top-3 left-0 right-0 text-center">
                        <h3 className="font-bold text-base md:text-lg text-white shadow-sm">{speaker?.first_name || 'Nombre no disponible'} {speaker?.last_name || ''}</h3>
                      </div>
                      {isAdmin && (
                        <div className="absolute top-2 md:top-3 right-2 md:right-3 z-20 flex gap-1 md:gap-2">
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blueApp hover:bg-blue-600 p-1 md:p-1.5 rounded-full opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <Pencil className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                          </button>
                          
                        </div>
                      )}
                    </div>
                    {/* Contenido - información del profesor */}
                    <div className="px-3 pt-12 sm:pt-14 md:pt-16 pb-4 md:pb-6 flex flex-col items-center ">
                      {speaker.professional_title && (
                        <div className="flex mb-4 md:mb-6 flex justify-start items-center text-center gap-2 md:gap-3 bg-zinc-800 rounded-lg px-3 md:px-4 py-2 w-full border border-zinc-700/30">
                          <div className="text-xl md:text-2xl font-bold tracking-tight flex items-center text-center gap-2">
                            <GraduationCap className="w-6 h-6 md:w-10 md:h-10 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-left text-white text-sm md:text-base">{speaker.professional_title}</p>
                          </div>
                        </div>
                      )}
                      
                      {speaker.bio && (
                        <div className="flex mb-4 md:mb-6 flex justify-start items-center text-center gap-2 md:gap-3 bg-zinc-800 rounded-lg px-3 md:px-4 py-2 w-full border border-zinc-700/30">
                          <CodeIcon className=" w-6 h-6 md:w-8 md:h-8 text-blue-400" />
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
    </div>
  )
}
