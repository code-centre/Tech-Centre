'use client'

import React from 'react'
import Image from 'next/image'

interface Speaker {
  id: string
  firstName?: string
  lastName?: string
  photoUrl?: string
  occupation?: string
  speciality?: string
  [key: string]: any
}

export function Professor({ speakers = [] }: { speakers?: Speaker[] }) {
  if (!speakers.length) return null
  return (
    <div className="bg-gray-900 rounded-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Profesor{speakers.length > 1 ? 'es' : ''}</h2>
      <div className="flex flex-col gap-8">
        {speakers.map((speaker) => (
          <div key={speaker.id} className="flex flex-col items-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-800">
                <Image
                  width={128}
                  height={128}
                  src={speaker.photoUrl || '/man-avatar.png'}
                  alt={speaker.firstName || 'Profesor'}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
            <div className="text-center w-80">
              <h3 className="font-bold text-lg leading-tight break-words">{speaker.firstName || 'Nombre no disponible'} {speaker.lastName}</h3>
              {speaker.occupation && (
                <div className="mt-4 border-2 border-blue-600 rounded-xl px-4 py-3 text-sm font-medium text-white bg-gray-800 w-full break-words">
                  {speaker.occupation}
                </div>
              )}
              {speaker.speciality && (
                <p className="text-gray-400 text-sm mt-2 leading-snug break-words">{speaker.speciality}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
