'use client'
import React from 'react'
import {
  BookOpenIcon,
  UsersIcon,
  TrendingUpIcon,
  AwardIcon,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { CircleCheckBig, MapPin } from 'lucide-react'
import Image from 'next/image'

const differents = [
  "Profesores activos en la industria que comparten experiencias reales",
  "Enfoque 100% práctico con proyectos basados en casos reales",
  "Grupos pequeños para atención personalizada",
  "Networking con profesionales y empresas del sector",
  "Bolsa de empleo exclusiva para estudiantes y egresados"
];

export function Ubication() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
      });
    }
  }, []); 
  
  return (
    <div className="relative text-white overflow-hidden py-16">
      {/* Sección con efecto de máscara para transición */}      {/* Overlay de fondo con el gradiente de transición directamente aplicado */}
      <div className="absolute inset-0 w-full h-full" >
      </div>
      {/* Video background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          loop
          className="w-full h-full object-cover"
        >
          <source src="https://firebasestorage.googleapis.com/v0/b/codigo-abierto-effc8.firebasestorage.app/o/video-seccion-techcentre.mp4?alt=media&token=e331c5a6-6f62-4075-b915-9453237007db" type="video/mp4" />
        </video>
        {/* Dark overlay para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4 justify-between">
                <div className="flex items-center">
                    <div className="bg-secondary rounded-full p-3 mr-4">
                        <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-secondary">Encuentranos en el corazón de Barranquilla:</h4>
                        <p className="text-gray-600 text-sm">Cra. 50 #72-126, el Prado, Casa de la tecnologia, Barranquilla, Atlántico</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <a href="https://www.google.com/maps/search/?api=1&query=Tech+Centre&query_place_id=ChIJv01Wyvot9I4RUtzmOXikbpM" className="text-secondary font-bold bg-secondary text-white rounded-lg px-4 py-2 text-sm hover:underline" target="_blank" rel="noopener noreferrer">Cómo llegar</a>
                </div>
            </div>
            <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3916.538907882707!2d-74.8045491!3d10.9981343!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef42d0ad033385b%3A0x326de6a0f5244065!2sCra.%2050%20%2372-126%2C%20Nte.%20Centro%20Historico%2C%20Barranquilla%2C%20Atl%C3%A1ntico!5e0!3m2!1ses-419!2sco!4v1736454294702!5m2!1ses-419!2sco"
            height="300"
            width="500"
            className="border-none rounded-lg w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
      </div>
    </div>
  )
}
