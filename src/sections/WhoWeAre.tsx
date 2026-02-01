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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-xl text-center font-bold mb-6 text-white">Formación pensada para la industria real</h3>
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
        </div>
    </div>
  )
}
