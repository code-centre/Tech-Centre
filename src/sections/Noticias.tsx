'use client'
import React from 'react'
import Image from 'next/image'
import Wrapper from '@/components/Wrapper'
import Link from 'next/link'
import noticias from '../../data/noticias.json'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function NoticiasSection() {
    return (
        <div className="bg-background text-zuccini py-4">
            <Wrapper styles="max-w-6xl w-full">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 tracking-tight leading-snug">
                    Reconocimientos en prensa
                </h2>


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
                    className="pb-10"
                >
                    {noticias.map((noticia) => (
                        <SwiperSlide key={noticia.id}>
                            <div className="rounded-lg bg-bgCard overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition h-full flex flex-col">
                                <Image
                                    src={noticia.image}
                                    alt={`Noticia: ${noticia.titulo}`}
                                    width={400}
                                    height={300}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="p-4 flex flex-col gap-2 flex-grow">
                                    <h3 className="text-lg font-semibold text-zuccini">
                                        {noticia.titulo}
                                    </h3>
                                    <p className="text-sm text-white">{noticia.descripcion}</p>
                                    <Link
                                        href={noticia.link}
                                        target="_blank"
                                        className="text-zuccini underline text-sm mt-auto"
                                    >
                                        Leer más →
                                    </Link>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                <style jsx global>{`
                .swiper-pagination {
                    margin-top: 2rem !important; /* Ajusta el valor según lo que necesites */
                    position: static !important;
                }
                .swiper-button-next,
                .swiper-button-prev {
                    top: 50% !important;
                    transform: translateY(-50%);
                    background: #fff;
                    color: #1a1cc0;
                    border-radius: 9999px;
                    box-shadow: 0 2px 8px #0002;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 20;
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
            `}</style>
            </Wrapper>
        </div>
    )
}
