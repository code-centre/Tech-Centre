'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
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
    cta?: string
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
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (videoRef.current && mounted) {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
      });
    }
  }, [mounted]);

  // Configuración común
  const swiperConfig = {
    modules: [
      ...(showNavigation ? [Navigation] : []),
      ...(showPagination ? [Pagination] : []),
      Autoplay,
      EffectFade
    ],
    navigation: false,
    pagination: showPagination ? { 
      clickable: true,
      bulletClass: 'swiper-pagination-bullet !bg-white/30 !w-3 !h-3 !mx-1.5',
      bulletActiveClass: 'swiper-pagination-bullet-active !bg-white !w-8 !rounded-full'
    } : false,
    autoplay: { 
      delay: autoplayDelay, 
      disableOnInteraction: false,
      waitForTransition: true
    },
    speed: 800,
    loop: true,
    effect: effect,
    fadeEffect: { 
      crossFade: true
    },
    className: `swiper-container ${className}`,
    watchSlidesProgress: true,
    preventInteractionOnTransition: true,
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative overflow-hidden mt-2 rounded-2xl">
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
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full">
        <Swiper {...swiperConfig}>
          {items.map((item, index) => (
            <SwiperSlide 
              key={item.id} 
              className="swiper-slide"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex items-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
                  {/* Image Section */}
                  <div className="relative order-2 lg:order-1">
                    <div className="relative group">
                      {/* Glow effect */}
                      <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                      
                      {/* Image container with glassmorphism */}
                      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-2 border border-white/20 shadow-2xl transform transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-blue-500/25">
                        <div className="relative overflow-hidden rounded-2xl">
                          <img
                            src={item.image}
                            alt={item.alt}
                            className="w-full h-[300px] md:h-[400px] object-cover rounded-2xl transform transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                        </div>
                        
                        {/* Decorative corner elements */}
                        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-lg"></div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-indigo-400 rounded-br-lg"></div>
                      </div>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="relative order-1 lg:order-2 text-white space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-medium">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Formación Tech de Calidad</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">
                      {item.title}
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-blue-100/90 leading-relaxed max-w-xl">
                      {item.description}
                    </p>

                    {/* CTA Button */}
                    <div className="pt-4">
                      <Link
                        href={item.link || '#'}
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1"
                      >
                        <span>{item.cta}</span>
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Stats or additional info */}
                    <div className="flex flex-wrap gap-6 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-white/80">Inscripciones abiertas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-white/80">Clases presenciales</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default HeroCarrusel;