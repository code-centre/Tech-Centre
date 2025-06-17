import React, {useState, useEffect} from 'react'
import { CalendarIcon, EditIcon } from 'lucide-react'
import Image from 'next/image'

interface Props {
  title: string
  subtitle: string
  date: string
  heroImage: string
  saveChanges?: (propertyName: string, content: any) => void
}

export function Hero({ title, subtitle, date, heroImage, saveChanges }: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false)
  const [isEditingDate, setIsEditingDate] = useState(false)  
  const [heroTitle, setHeroTitle] =  useState(title || '')
  const [heroSubtitle, setHeroSubtitle] = useState(subtitle || '')
  const [heroDate, setHeroDate] = useState(date || '')
  
  useEffect(() => {
    setHeroTitle(title || '');
    setHeroSubtitle(subtitle || '');
    setHeroDate(date || '');
  }, [title, subtitle, date]);

  return (
    <section className="relative w-full min-h-[350px] lg:min-h-[420px] flex items-stretch overflow-hidden rounded-xl mb-8">
      {/* BG image */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
        }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full w-full lg:w-1/2 px-6 py-10">        
      <div className="inline-flex items-center rounded-lg px-4 py-2 mb-8 bg-zinc-800/90">
          <CalendarIcon className="w-5 h-5 mr-2 text-blueApp" />
          {isEditingDate ? (
            <div className="flex items-center">
              <input 
                type="date" 
                value={heroDate}
                onChange={(e) => setHeroDate(e.target.value)}
                className="bg-zinc-700 text-white px-2 py-1 rounded mr-2 text-sm w-40"
              />
              <div className="flex gap-1">
                <button 
                  className="bg-green-600 p-1 rounded hover:bg-green-700"
                  onClick={() => {
                    if (saveChanges) {
                      saveChanges('date', heroDate);
                    }
                    setIsEditingDate(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <button 
                  className="bg-red-600 p-1 rounded hover:bg-red-700"
                  onClick={() => {
                    setHeroDate(date);
                    setIsEditingDate(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="text-sm text-white font-medium">
                {date ? new Date(date).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : 'Fecha no establecida'}
              </span>
              {saveChanges && (
                <button 
                  className="ml-2 bg-blue-600 p-1 rounded hover:bg-blue-700"
                  onClick={() => setIsEditingDate(true)}
                >
                  <EditIcon className="w-4 h-4 text-white" />
                </button>
              )}
            </>
          )}
        </div>        
        {isEditingTitle ? (
          <div className="flex flex-col mb-4">
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="text-3xl md:text-4xl font-bold bg-zinc-800/80 text-white px-3 py-2 rounded mb-2"
              placeholder="Título del curso"
            />
            <div className="flex gap-2">
              <button
                className="bg-green-600 p-2 rounded hover:bg-green-700 text-white flex items-center"
                onClick={() => {
                  if (saveChanges) {
                    saveChanges('title', heroTitle);
                  }
                  setIsEditingTitle(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Guardar
              </button>
              <button
                className="bg-red-600 p-2 rounded hover:bg-red-700 text-white flex items-center"
                onClick={() => {
                  setHeroTitle(title);
                  setIsEditingTitle(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg flex-grow">
              {title || 'Sin título'}
            </h1>
            {saveChanges && (
              <button
                className="ml-3 bg-blue-600 p-2 rounded hover:bg-blue-700 self-start"
                onClick={() => setIsEditingTitle(true)}
              >
                <EditIcon className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        )}        {isEditingSubtitle ? (
          <div className="flex flex-col mb-4">
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="text-xl md:text-2xl font-medium bg-zinc-800/80 text-white px-3 py-2 rounded mb-2"
              placeholder="Subtítulo del curso"
            />
            <div className="flex gap-2">
              <button
                className="bg-green-600 p-2 rounded hover:bg-green-700 text-white flex items-center"
                onClick={() => {
                  if (saveChanges) {
                    saveChanges('subtitle', heroSubtitle);
                  }
                  setIsEditingSubtitle(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Guardar
              </button>
              <button
                className="bg-red-600 p-2 rounded hover:bg-red-700 text-white flex items-center"
                onClick={() => {
                  setHeroSubtitle(subtitle);
                  setIsEditingSubtitle(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start mb-4">
            <h2 className="text-2xl md:text-3xl font-medium text-white drop-shadow flex-grow">
              {subtitle || 'Sin subtítulo'}
            </h2>
            {saveChanges && (
              <button
                className="ml-3 bg-blue-600 p-2 rounded hover:bg-blue-700 self-start"
                onClick={() => setIsEditingSubtitle(true)}
              >
                <EditIcon className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}