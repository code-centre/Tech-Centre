'use client'

import { useState } from "react"
import { GraduationCap, UserPlus, Pencil } from "lucide-react"
import Image from "next/image"
import useUserStore from "../../../store/useUserStore"
import SpeakersCreationModal from "./ProfessorCreationModal"

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
  saveSpeakers?: (speakers: Speaker[]) => Promise<{success: boolean, error?: string}>
  onDeleteSpeaker?: (speakerId: string) => Promise<void>
}

export function ProfessorContainer({ speakers = [], eventId, saveSpeakers, onDeleteSpeaker }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user } = useUserStore()
  
  const isAdmin = user?.rol === 'admin'
    const handleAddSpeaker = async (newSpeaker: Speaker, talks: Talk[]) => {
    if (!saveSpeakers || !speakers) {
      console.error("No hay función de guardado disponible")
      return
    }
    
    // Agregar el nuevo profesor a la lista
    const updatedSpeakers = [...speakers, newSpeaker]
    
    // Guardar usando la función proporcionada por el componente padre
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
    <div className="max-w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30">
      {/* Header with gradient */}
      <div className="p-6 text-white flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
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

      <div className="p-6">
        {speakers.length > 0 ? (
          speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="flex flex-col rounded-xl overflow-hidden border border-zinc-800/60 bg-zinc-900/50 mb-6 last:mb-0 transform transition-all duration-300 hover:border-zinc-700/80 hover:shadow-xl"
            >
              {/* Header con imagen del profesor */}
              <div className="relative group">
                {/* Gradiente superior para mejorar legibilidad del nombre */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-10"></div>

                {/* Fondo de cabecera */}
                <div className="h-60 bg-gradient-to-r from-zinc-800 to-zinc-900"></div>

                {/* Foto del profesor */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="w-60 h-60 rounded-full overflow-hidden border-2 border-blueApp shadow-lg shadow-black/30 group-hover:border-blue-400 transition-all">
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

                {/* Nombre del profesor posicionado en la parte superior */}
                <div className="absolute top-3 left-0 right-0 text-center z-10">
                  <h3 className="font-bold text-lg text-white shadow-sm">{speaker.firstName || 'Nombre no disponible'} {speaker.lastName || ''}</h3>
                </div>
                  {/* Botones de acción (solo para admin) */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-20 flex gap-2">
                    {/* Botón de edición */}
                    <button 
                      onClick={() => {
                        setIsModalOpen(true)
                      }}
                      className="bg-blueApp hover:bg-blue-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Pencil className="h-3 w-3 text-white" />
                    </button>
                      {/* Botón de eliminar */}
                    {onDeleteSpeaker && (
                      <button 
                        onClick={() => handleDeleteSpeaker(speaker.id)}
                        className="bg-red-600 hover:bg-red-700 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <div className="px-6 pt-16 pb-6 flex flex-col items-center">
                {/* Especialidad/Ocupación con ícono */}
                {speaker.occupation && (
                  <div className="flex mb-6">
                    <div className="mr-4 mt-1">
                      <GraduationCap className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white">{speaker.occupation}</p>
                    </div>
                  </div>
                )}

                {/* Especialidad */}
                {speaker.speciality && (
                  <div className="bg-zinc-800 rounded-lg px-4 py-2 w-full mb-4 flex items-center gap-3 border border-zinc-700/30">
                    <p className="text-gray-300 text-sm">{speaker.speciality}</p>
                  </div>
                )}

                {/* Bio o descripción si existe */}
                {speaker.bio && (
                  <div className="bg-zinc-800/70 w-full rounded-lg p-4 mb-4 border border-zinc-700/20">
                    <p className="text-gray-300 text-sm leading-relaxed">{speaker.bio}</p>
                  </div>
                )}

                {/* LinkedIn si existe */}
                {speaker.linkedin && (
                  <a
                    href={speaker.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 mt-2 text-sm text-blueApp hover:text-blue-400 transition-colors"
                  >
                    <span>Ver perfil profesional</span>
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <GraduationCap className="h-12 w-12 text-zinc-500" />
              <p className="text-zinc-400 text-lg">
                Aún no hay profesores asignados a este curso.
              </p>
              {isAdmin && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-blueApp hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Añadir profesor
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
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
