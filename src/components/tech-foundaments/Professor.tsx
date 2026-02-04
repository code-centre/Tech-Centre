'use client'

import React from 'react'
import Image from 'next/image'
import { GraduationCap, Award, Briefcase, Book, LinkedinIcon, CodeIcon } from 'lucide-react'

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

export function Professor({ speakers = [] }: { speakers?: Speaker[] }) {
  if (!speakers.length) return null

  return (
    <div className="max-w-xl w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30">
      {/* Header with gradient */}
      <div className="bg-linear-to-br from-bgCard via-zinc-700 to-zinc-900 p-6 text-white">
        <h2 className="text-2xl font-bold mb-1 tracking-tight flex items-center gap-2">
          <GraduationCap className="text-secondary" size={24} />
          Profesor{speakers.length > 1 ? 'es' : ''}
        </h2>
      </div>

      <div className="p-6">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            className="flex flex-col rounded-xl overflow-hidden border border-zinc-800/60 bg-zinc-900/50 mb-6 last:mb-0 transform transition-all duration-300 hover:border-zinc-700/80 hover:shadow-xl"
          >
            {/* Header con imagen del profesor */}
            <div className="relative group">
              {/* Gradiente superior para mejorar legibilidad del nombre */}
              <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/60 to-transparent z-10"></div>

              {/* Fondo de cabecera */}
              <div className="h-60 bg-linear-to-r from-zinc-800 to-zinc-900"></div>

              {/* Foto del profesor */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-60 h-60 rounded-full overflow-hidden border-2 border-secondary shadow-lg shadow-black/30 group-hover:border-blue-400 transition-all">
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
            </div>

            {/* Contenido - información del profesor */}
            <div className="px-6 pb-6 flex flex-col items-center">
              {/* Especialidad/Ocupación con ícono */}
              {speaker.occupation && (
                <div className="flex mb-6">
                  <div className="mr-4 mt-1">
                    <Briefcase className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white">
                      {speaker.occupation}
                    </p>
                  </div>
                </div>
              )}

              {/* Especialidad */}
              {speaker.speciality && (
                <div className="bg-zinc-800 rounded-lg px-4 py-2 w-full mb-4 flex items-center gap-3 border border-zinc-700/30">
                  <CodeIcon className="text-blue-400 h-4 w-4 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">{speaker.speciality}</p>
                </div>
              )}

              {/* Bio o descripción si existe */}
              {speaker.bio && (
                <div className="bg-zinc-800/70 w-full rounded-lg p-4 mb-4 border border-zinc-700/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Book className="text-secondary h-4 w-4" />
                    <h4 className="text-white text-sm font-medium">Biografía</h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{speaker.bio}</p>
                </div>
              )}

              {/* LinkedIn si existe */}
              {speaker.linkedin && (
                <a
                  href={speaker.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 mt-2 text-sm text-secondary hover:text-blue-400 transition-colors"
                >
                  <LinkedinIcon size={16} />
                  <span>Ver perfil profesional</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
