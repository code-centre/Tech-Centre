'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import { useState,useRef, useEffect } from 'react'
import Link from 'next/link'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

interface CarruselProps {
  items: {
    id: string | number
    image: string
    alt: string
    title?: string
    description?: string
    link?: string
  }[]
  type?: 'default' | 'hero' | 'cards'
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
  effect?: 'slide' | 'fade'
  className?: string
  itemClassName?: string
  imageClassName?: string
  contentClassName?: string
}

// ... (imports y tipos permanecen iguales)

export function HeroCarrusel({
  items,
  type = 'default',
  autoplayDelay = 5000,
  showPagination = true,
  showNavigation = true,
  effect = 'fade',
  className = '',
  itemClassName = '',
  imageClassName = '',
  contentClassName = ''
}: CarruselProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
      });
    }
  }, []);

  // Configuración común
  const swiperConfig = {
    modules: [
      ...(showNavigation ? [Navigation] : []),
      ...(showPagination ? [Pagination] : []),
      Autoplay,
      EffectFade
    ],
    navigation: showNavigation,
    pagination: showPagination ? { clickable: true } : false,
    autoplay: { 
      delay: autoplayDelay, 
      disableOnInteraction: false,
      waitForTransition: true
    },
    speed: 1000, // Aumentamos la velocidad para que sea más suave
    loop: true,
    effect: effect,
    fadeEffect: { 
      crossFade: true // Reactivamos crossFade para mejor transición
    },
    className: `swiper-container ${className}`,
    watchSlidesProgress: true,
    preventInteractionOnTransition: true,
    on: {
      slideChange: () => {
        // Forzamos un reflow para limpiar el estado
        document.body.offsetHeight;
      }
    }
  };

  return (
    <div className="relative text-white overflow-hidden mt-2">
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
      </div>
      
      {/* Contenido del carrusel */}
      <Swiper {...swiperConfig}>
        {items.map((item) => (
          <SwiperSlide 
            key={item.id} 
            className="swiper-slide " // Clase estándar de Swiper
            style={{ 
              backgroundColor: 'transparent',
              position: 'relative',
              zIndex: 10
            }}
          >
            <div className="max-w-7xl mx-10 px-4 sm:px-6 lg:px-8 ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative z-20  ">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    {item.title}
                  </h1>
                  <p className="text-xl mb-8 text-blue-100">
                    {item.description}
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <a
                      href="#cursos"
                      className="px-8 py-3 text-center bg-white text-blueApp font-medium rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Ver programas académicos
                    </a>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
                    <a
                      href="#testimonio"
                      className="px-8 py-3 text-center bg-transparent border border-white text-white font-medium rounded-md hover:bg-white hover:text-blueApp transition-colors"
                    >
                      Impacto
                    </a>
                    <a
                      href="#contacto"
                      className="px-8 py-3 text-center bg-transparent border border-white text-white font-medium rounded-md hover:bg-white hover:text-blueApp transition-colors"
                    >
                      Contáctanos
                    </a>
                  </div>
                </div>
                
                <div className="relative group ">
                  <div className="absolute -left-4 -top-4 w-24 h-24 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
                  
                  <div className="p-1 z-2 bg-gradient-to-r from-blueApp via-blue-100 to-blueApp rounded-lg rotate-1 shadow-2xl">
                    <div className="p-1 z-4 bg-gradient-to-r from-lightBlue via-blue-300 to-blueApp rounded-lg -rotate-2">
                      <Link href={item.link || '#'} className="block">
                        <img
                          src={item.image}
                          alt={item.alt}
                          className="w-full h-64 md:h-80 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default HeroCarrusel;