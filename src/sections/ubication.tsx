'use client'

import React from 'react'
import { MapPin, Clock, Car, MessageCircle, ExternalLink } from 'lucide-react'

const locationDetails = [
  {
    icon: MapPin,
    title: 'Dirección',
    description: 'Cra. 50 #72-126, El Prado, Barranquilla',
    subtitle: 'Casa de la Tecnología'
  },
  {
    icon: Clock,
    title: 'Horario de atención',
    description: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
    subtitle: 'Sábados: 9:00 AM - 1:00 PM'
  },
  {
    icon: Car,
    title: 'Cómo llegar',
    description: 'Cerca del estadio Romelio Martínez',
    subtitle: 'Parqueadero disponible'
  }
]

const GOOGLE_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Tech+Centre&query_place_id=ChIJv01Wyvot9I4RUtzmOXikbpM'
const WHATSAPP_URL = 'https://wa.me/573005523872?text=Hola%2C%20quiero%20información%20sobre%20los%20programas%20de%20Tech%20Centre'
const EMBED_MAP_URL = 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3916.538907882707!2d-74.8045491!3d10.9981343!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef42d0ad033385b%3A0x326de6a0f5244065!2sCra.%2050%20%2372-126%2C%20Nte.%20Centro%20Historico%2C%20Barranquilla%2C%20Atl%C3%A1ntico!5e0!3m2!1ses-419!2sco!4v1736454294702!5m2!1ses-419!2sco'

export function Ubication() {
  return (
    <section 
      id="ubicacion" 
      className="relative overflow-hidden py-16 md:py-20 who-we-are-gradient"
      aria-labelledby="ubication-heading"
    >
      {/* Elementos decorativos flotantes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Grid: 2 columnas en desktop, stack en mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Columna izquierda: Contenido y CTAs */}
          <div className="order-2 lg:order-1">
            {/* Header */}
            <header className="mb-8">
              <h2 
                id="ubication-heading"
                className="text-3xl md:text-4xl font-bold text-white mb-3"
              >
                Visítanos en Barranquilla
              </h2>
              <p className="text-lg md:text-xl text-white/90">
                Clases presenciales. Comunidad activa. Cupos limitados.
              </p>
            </header>

            {/* Lista de información */}
            <ul className="space-y-5 mb-8" role="list">
              {locationDetails.map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                    <item.icon className="h-5 w-5 text-secondary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {item.description}
                    </p>
                    {item.subtitle && (
                      <p className="text-white/60 text-sm">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary group"
                aria-label="Abrir ubicación de Tech Centre en Google Maps"
              >
                <ExternalLink className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
                Abrir en Google Maps
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                aria-label="Escribir por WhatsApp a Tech Centre"
              >
                <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                Escribir por WhatsApp
              </a>
            </div>

            {/* Microcopy */}
            <p className="text-sm text-white/60 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
              ¿No sabes qué programa elegir? Escríbenos y te orientamos.
            </p>
          </div>

          {/* Columna derecha: Mapa embebido */}
          <div className="order-1 lg:order-2">
            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl shadow-black/20 p-3 md:p-4 overflow-hidden">
              {/* Decoración superior de la card */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-secondary via-secondary/50 to-transparent"></div>
              
              <div className="relative rounded-xl overflow-hidden">
                <iframe
                  src={EMBED_MAP_URL}
                  className="w-full h-[260px] sm:h-[300px] md:h-[360px] lg:h-[380px] border-0 rounded-xl"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Tech Centre en Barranquilla"
                  aria-label="Mapa interactivo mostrando la ubicación de Tech Centre"
                ></iframe>
              </div>

              {/* Footer de la card del mapa */}
              <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  El Prado, Barranquilla
                </span>
                <span className="text-white/40">Haz clic para navegar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
