'use client'
import React from 'react'
import { useEffect, useRef } from 'react'
import { CircleCheckBig } from 'lucide-react'
import Image from 'next/image'

const differents = [
  {
    highlight: "Metodología de aprendizaje experiencial:",
    description: "Aprende haciendo. Desde el primer día participarás en proyectos reales, retos prácticos y dinámicas que reflejan el mundo laboral."
  },
  {
    highlight: "Profesores activos en la industria:",
    description: "Nuestros mentores son profesionales que trabajan en empresas tecnológicas reales y te enseñarán lo que hoy se está buscando en el mercado."
  },
  {
    highlight: "Clases presenciales y grupos semipersonalizados:",
    description: "Recibe acompañamiento cercano, resuelve tus dudas en tiempo real y aprende en un entorno colaborativo."
  },
  {
    highlight: "Comunidad Tech en expansión:",
    description: "Conéctate con una red de profesionales, emprendedores y expertos que están construyendo el futuro tecnológico del Caribe."
  }
];

export function WhoWeAre() {

  return (
    <div className="relative text-white overflow-hidden py-16">
      <div className="relative z-10 mx-auto px-4 sm:px-6 max-w-7xl">
        {/* <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white">Centro de tecnología del Caribe</h2>
          <p className="mt-4 text-left text-md text-gray-200 mx-auto">
          En Tech Centre creemos que lo único que se necesita para cambiar el mundo es una oportunidad, y la tecnología es la industria de las oportunidades.
          </p>
          <p className="text-left text-md text-gray-200 mx-auto">
          Nuestra misión es despertar al genio tech que llevas dentro y acompañarte en este viaje para que formes parte de la revolución tecnológica que está transformando al Caribe, a Colombia y al mundo. 
          </p>
          <p className="mt-4 text-left text-xl text-gray-200 mx-auto">Formamos talento preparado para los retos reales de la industria a través de una experiencia educativa práctica, humana y conectada con el ecosistema empresarial.
          </p>
        </div> */}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-xl text-center font-bold mb-6 text-white">¿Por qué elegirnos?</h3>
            <ul className="list-disc list-inside text-gray-200">
              {differents.map((item, index) => (
                <div key={index} className="mb-2 py-3">
                  <p className="text-gray-200">
                    <CircleCheckBig className="inline-block mr-2 text-green-500" />
                    <span className="font-bold text-sky-200">{item.highlight} </span>
                 {item.description}</p>
                </div>
              ))}
            </ul>
          </div>
          <div>
            <Image
              src="/techcentre-hero.jpg"
              width={700}
              height={700}
              alt="Equipo de Tech Centre"
              className="rounded-lg shadow-xl w-full h-[400px] object-cover"
            />
          </div>
        </div>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-800 bg-opacity-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="h-8 w-8 text-blue-300" />
            </div>
            <h4 className="text-xl font-bold mb-2 text-white">Innovación Educativa</h4>
            <p className="text-gray-200">
              Metodologías actualizadas y contenido práctico adaptado al
              mercado.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-800 bg-opacity-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="h-8 w-8 text-blue-300" />
            </div>
            <h4 className="text-xl font-bold mb-2 text-white">Comunidad Activa</h4>
            <p className="text-gray-200">
              Red de profesionales y estudiantes comprometidos con la
              tecnología.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-800 bg-opacity-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUpIcon className="h-8 w-8 text-blue-300" />
            </div>
            <h4 className="text-xl font-bold mb-2 text-white">Crecimiento Continuo</h4>
            <p className="text-gray-200">
              Programas diseñados para impulsar tu desarrollo profesional.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-800 bg-opacity-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AwardIcon className="h-8 w-8 text-blue-300" />
            </div>
            <h4 className="text-xl font-bold mb-2 text-white">Excelencia</h4>
            <p className="text-gray-200">
              Compromiso con la calidad y el éxito de nuestros estudiantes.
            </p>
          </div>
        </div> */}      
        </div>
    </div>
  )
}
