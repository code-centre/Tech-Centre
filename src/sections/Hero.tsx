'use client'
import React, { useEffect, useRef } from 'react'
import { CalendarIcon } from 'lucide-react'
import Image from 'next/image';

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
      });
    }
  }, []);

  return (
    <div className="relative text-white overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          loop
          className="w-full h-full object-cover"
        >
          <source src="https://firebasestorage.googleapis.com/v0/b/codigo-abierto-effc8.firebasestorage.app/o/video-portada-techcenter2.mp4?alt=media&token=be98970b-1806-4aa8-a77a-240200892f29" type="video/mp4" />
        </video>
        {/* Overlay to ensure text remains readable */}
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            {/* <div className="inline-flex items-center px-4 py-1 rounded-full bg-blue-800/50 backdrop-blur-sm text-white mb-6">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>Inscripciones abiertas</span>
            </div> */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Transforma tu futuro con habilidades tech
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Aprende de expertos de la industria con programas prácticos
              diseñados para el mercado laboral actual.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="#cursos"
                className="px-8 py-3 text-center bg-white text-blueApp font-medium rounded-md hover:bg-blue-50 transition-colors"
              >
                Ver programas académicos
              </a>
              <a
                href="#contacto"
                className="px-8 py-3 text-center bg-transparent border border-white text-white font-medium rounded-md hover:bg-white hover:text-blueApp transition-colors"
              >
                Contáctanos
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative group">
              {/* Efectos decorativos */}
              <div className="absolute -left-4 -top-4 w-24 h-24 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
              
              {/* Marco con borde brillante */}
              <div className="p-1 bg-gradient-to-r from-blue-400 via-blue-100 to-indigo-400 rounded-lg rotate-1 shadow-2xl">
                <div className="p-1 bg-gradient-to-r from-indigo-500 via-blue-300 to-blue-600 rounded-lg -rotate-2">
                  <Image
                    src="/techcentre-hero.jpg"
                    width={800}
                    height={400}
                    alt="Estudiantes aprendiendo tecnología"
                    className="rounded-lg shadow-xl relative z-10 object-cover w-full h-[400px] group-hover:scale-[1.02] transition-transform duration-300"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 bg-blueApp backdrop-blur-sm py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="font-bold text-3xl">10+</div>
              <div className="text-blue-200">Cursos y Diplomados</div>
            </div>
            <div className="p-4">
              <div className="font-bold text-3xl">100+</div>
              <div className="text-blue-200">Estudiantes</div>
            </div>
            <div className="p-4">
              <div className="font-bold text-3xl">20+</div>
              <div className="text-blue-200">Expertos</div>
            </div>
            <div className="p-4">
              <div className="font-bold text-3xl">95%</div>
              <div className="text-blue-200">Tasa de empleo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
