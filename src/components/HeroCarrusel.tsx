'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

interface HeroCarruselProps {
  title?: string
  description?: string
  link?: string
  cta?: string
  className?: string
}

export function HeroCarrusel({
  title = "Aprende la tecnología que mueve la industria hoy.",
  description = "Programas presenciales y prácticos en software, datos, diseño e inteligencia artificial, guiados por profesionales activos en el mercado.",
  link = "/programas-academicos",
  cta = "Ver programas",
  className = '',
}: HeroCarruselProps) {

  return (
    <section className={`relative overflow-hidden rounded-2xl ${className}`} aria-label="Hero principal">
      <article 
        className="relative h-full min-h-[500px] md:min-h-[600px]"
      >
        {/* Background image */}
        <div 
          className="absolute inset-0 background-image"
          aria-hidden="true"
        />
        
        <div 
          className="absolute inset-0 z-10"
          aria-hidden="true"
        />
      
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 h-full flex items-center min-h-[500px] md:min-h-[600px]">
          {/* Text Content - Centered */}
          <header className="relative w-full text-center text-white space-y-8 z-10">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-medium animate-fade-in-up" 
              role="status" 
              aria-label="Estado"
              style={{ animationDelay: '0.1s' }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" aria-hidden="true" />
              <span>Construye en la era agéntica</span>
            </div>

            {/* Title */}
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white animate-fade-in-up my-2"
              style={{ animationDelay: '0.2s' }}
            >
              {title}
            </h2>

            {/* Description */}
            <p 
              className="text-lg md:text-xl lg:text-2xl text-blue-100/90 leading-relaxed max-w-2xl mx-auto animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              {description}
            </p>

            {/* CTA Buttons */}
            <nav 
              className="pt-4 animate-fade-in-up flex flex-col sm:flex-row items-center justify-center gap-4" 
              aria-label="Acciones principales"
              style={{ animationDelay: '0.4s' }}
            >
              {/* <Link
                href="/pre-inscripcion"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 hover:scale-105"
              >
                <span>Pre-inscribirme</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link> */}
              <Link
                href={link || '#'}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm transform hover:-translate-y-1 hover:scale-105"
              >
                <span>{cta}</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </nav>

            {/* Stats or additional info */}
            <dl 
              className="flex flex-wrap justify-center gap-6 pt-6 animate-fade-in-up"
              style={{ animationDelay: '0.5s' }}
            >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <dt className="sr-only">Modalidad de clases</dt>
                <dd className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" aria-hidden="true"></div>
                  <span className="text-sm text-white/80">Clases presenciales en Barranquilla</span>
                </dd>
              </div>
                <dt className="sr-only">Estado de inscripciones</dt>
                <dd className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></div>
                  <span className="text-sm text-white/80">Inscripciones abiertas - Febrero 2026</span>
                </dd>
              </div>
            </dl>
          </header>
        </div>
      </article>

      {/* Custom styles */}
      <style jsx>{`
        /* Background image with animation and strong blur */
        .background-image {
          background-image: url('/background-texture.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          animation: background-pan 30s ease-in-out infinite;
          filter: blur(12px) brightness(0.5) saturate(1);
          transform: scale(1.1);
        }

        @keyframes background-pan {
          0%, 100% {
            background-position: center center;
            transform: scale(1.1);
          }
          50% {
            background-position: 60% 40%;
            transform: scale(1.15);
          }
        }

        /* Glassmorphism overlay - efecto cristal polarizado */

        /* Fade in up animation */
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        /* Slow spin animation */
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </section>
  );
}

export default HeroCarrusel;