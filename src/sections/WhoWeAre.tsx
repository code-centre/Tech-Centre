'use client'
import React from 'react'
import { CircleCheckBig, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const differents = [
  {
    highlight: "Metodología de aprendizaje experiencial:",
    description: "Construyes desde el primer día, enfrentando retos reales similares a los del mundo laboral."
  },
  {
    highlight: "Profesores activos en la industria:",
    description: "Te enseñan personas que hoy están construyendo tecnología, no solo explicándola."
  },
  {
    highlight: "Clases presenciales y grupos semipersonalizados:",
    description: "No eres un número más. Los grupos pequeños permiten acompañamiento real y aprendizaje colaborativo."
  },
  {
    highlight: "Comunidad Tech en expansión:",
    description: "Formas parte de una comunidad que sigue creciendo, dentro y fuera del aula, en eventos, proyectos y conexiones reales."
  }
];

export function WhoWeAre() {

  return (
    <section className="relative overflow-hidden py-16 who-we-are-gradient">
      {/* Elementos decorativos flotantes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      <div className="relative z-10 mx-auto px-4 sm:px-6 max-w-7xl">
        <header className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Aquí se forma el talento tech del Caribe</h2>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">Personas reales, aprendiendo y construyendo tecnología para el mundo real.</p>
        </header>
        
        <article className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 items-center">
          <figure>
            <Image
              src="/techcentre-hero.jpg"
              width={700}
              height={700}
              alt="Equipo de Tech Centre"
              className="rounded-lg shadow-xl w-full h-[400px] object-cover"
            />
          </figure>
          <div>
            <h3 className="text-xl text-center font-bold mb-6 text-white">¿Qué nos diferencia?</h3>
            <ul className="space-y-4 mb-8">
              {differents.map((item, index) => (
                <li key={index} className="py-3">
                  <p className="text-white/90">
                    <CircleCheckBig className="inline-block mr-2 text-green-400 dark:text-green-300" size={20} />
                    <span className="font-bold text-white">{item.highlight} </span>
                    <span className="text-white/80">{item.description}</span>
                  </p>
                </li>
              ))}
            </ul>
            <div className="text-center mt-8">
              <Link
                href="#testimonio"
                className="who-we-are-cta inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Ver testimonios
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </article>   
      </div>
    </section>
  )
}
