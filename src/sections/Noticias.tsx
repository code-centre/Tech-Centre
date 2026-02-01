'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import noticias from '../../data/noticias.json'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function NoticiasSection() {
    return (
        <section 
            id="noticias"
            className="relative overflow-hidden py-16 md:py-20 who-we-are-gradient"
            aria-labelledby="noticias-heading"
        >
            {/* Elementos decorativos flotantes */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 mx-auto px-4 sm:px-6 max-w-7xl">
                {/* Header */}
                <header className="text-center mb-12">
                    <h2 
                        id="noticias-heading"
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
                    >
                        Reconocidos por impulsar el ecosistema tech del Caribe
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
                        Medios, instituciones y aliados que han documentado el impacto de Tech Centre y su comunidad.
                    </p>
                </header>

                {/* Swiper de noticias */}
                <div className="relative">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        spaceBetween={20}
                        breakpoints={{
                            320: { slidesPerView: 1 },
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="pb-16"
                    >
                        {noticias.map((noticia) => (
                            <SwiperSlide key={noticia.id}>
                                <div className="group rounded-xl card-background overflow-hidden border [border-color:var(--card-curso-border)] shadow-lg hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
                                    <div className="relative overflow-hidden">
                                        <Image
                                            src={noticia.image}
                                            alt={`Noticia: ${noticia.titulo}`}
                                            width={400}
                                            height={300}
                                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-secondary via-secondary/50 to-transparent"></div>
                                    </div>
                                    <div className="p-5 flex flex-col gap-3 grow">
                                        <h3 className="text-lg font-semibold card-text-primary group-hover:text-secondary transition-colors">
                                            {noticia.titulo}
                                        </h3>
                                        <p className="text-sm card-text-muted leading-relaxed grow">
                                            {noticia.descripcion}
                                        </p>
                                        <Link
                                            href={noticia.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 text-sm font-medium mt-auto transition-colors group/link"
                                        >
                                            Leer más
                                            <ExternalLink className="h-4 w-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" aria-hidden="true" />
                                        </Link>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            {/* Estilos del Swiper adaptados para fondo oscuro */}
            <style jsx global>{`
                .swiper-pagination {
                    margin-top: 2rem !important;
                    position: static !important;
                }
                .swiper-pagination-bullet {
                    background: rgba(255, 255, 255, 0.5) !important;
                    opacity: 1 !important;
                }
                .swiper-pagination-bullet-active {
                    background: var(--secondary) !important;
                }
                .swiper-button-next,
                .swiper-button-prev {
                    top: 50% !important;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.95) !important;
                    color: var(--secondary) !important;
                    border-radius: 9999px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 20;
                    transition: all 0.3s;
                }
                .swiper-button-next:hover,
                .swiper-button-prev:hover {
                    background: white !important;
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
                    transform: translateY(-50%) scale(1.1);
                }
                .swiper-button-next {
                    right: 0 !important;
                }
                .swiper-button-prev {
                    left: 0 !important;
                }
                .swiper-button-next:after,
                .swiper-button-prev:after {
                    font-size: 1.5rem !important;
                    font-weight: bold;
                }
                .swiper-button-disabled {
                    opacity: 0.35 !important;
                }
            `}</style>
        </section>
    )
}
