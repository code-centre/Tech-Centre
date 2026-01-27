'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
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

export function Carrusel({
  items,
  type = 'default',
  autoplayDelay = 5000,
  showPagination = true,
  showNavigation = true,
  effect = 'slide',
  className = '',
  itemClassName = '',
  imageClassName = '',
  contentClassName = ''
}: CarruselProps) {
  // Configuración común
  const swiperConfig = {
    modules: [
      ...(showNavigation ? [Navigation] : []),
      ...(showPagination ? [Pagination] : []),
      Autoplay,
      ...(effect === 'fade' ? [EffectFade] : [])
    ],
    navigation: showNavigation,
    pagination: showPagination ? { clickable: true } : false,
    autoplay: { delay: autoplayDelay, disableOnInteraction: false },
    loop: true,
    effect: effect,
    className: `swiper-container ${className}`,
    ...(type === 'cards' && {
      spaceBetween: 20,
      breakpoints: {
        320: { slidesPerView: 1 },
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }
    })
  }

  // Renderizado de items según el tipo
  const renderItem = (item: CarruselProps['items'][0]) => {
    switch (type) {
      case 'hero':
        return (
          <Link 
            href={item.link || '#'} 
            className={`relative block w-full h-full ${itemClassName}`}
          >
            <img
              src={item.image}
              alt={item.alt}
              className={`w-full h-full object-cover ${imageClassName}`}
            />
            {(item.title || item.description) && (
              <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent ${contentClassName}`}>
                {item.title && <h3 className="text-2xl font-bold text-white">{item.title}</h3>}
                {item.description && <p className="text-white/90 mt-2">{item.description}</p>}
              </div>
            )}
          </Link>
        )
      
      case 'cards':
        return (
          <div className={`rounded-lg bg-bgCard overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition h-full flex flex-col ${itemClassName}`}>
            <div className={`w-full h-64 overflow-hidden ${imageClassName}`}>
              <img
                src={item.image}
                alt={item.alt}
                className="w-full h-full object-cover"
              />
            </div>
            {(item.title || item.description) && (
              <div className={`p-4 flex flex-col gap-2 flex-grow ${contentClassName}`}>
                {item.title && <h3 className="text-lg font-semibold text-zuccini">{item.title}</h3>}
                {item.description && <p className="text-sm text-white">{item.description}</p>}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zuccini underline text-sm mt-auto inline-block"
                  >
                    Ver más →
                  </a>
                )}
              </div>
            )}
          </div>
        )
      
      default:
        return (
          <div className={`relative w-full h-full ${itemClassName}`}>
            <img
              src={item.image}
              alt={item.alt}
              className={`w-full h-full object-cover z-10 rounded-lg ${imageClassName}`}
            />
            {(item.title || item.description) && (
              <div className={`absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white ${contentClassName}`}>
                {item.title && <h3 className="text-xl font-bold">{item.title}</h3>}
                {item.description && <p className="text-sm">{item.description}</p>}
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <Swiper 
      {...swiperConfig}
      className={`swiper-container ${className}`}
      onClick={(swiper, event) => {
        // Prevenir el comportamiento por defecto del click en el slide
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {items.map((item) => (
        <SwiperSlide 
          key={item.id} 
          tag="div" // Usamos tag="div" para evitar que SwiperSlide renderice un <a>
        >
          {renderItem(item)}
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default Carrusel