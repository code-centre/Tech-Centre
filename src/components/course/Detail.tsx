'use client'
import React, { useState } from "react";
import courses from "@/utils/courses.json";
import { ArrowDown, DownloadIcon } from "@/components/Icons";
import Image from "next/image";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase";
import BannerPromotion from "@/components/slug/BannerPromotion";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection } from "firebase/firestore";
import FormInfo from "@/components/course/FormInfo";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css';
import Wrapper from "../Wrapper";
import BenefitCard from "./BenefitCard";

interface Props {
  course: any
  openModal: boolean,
  setOpenModal: any,
  loading: boolean
}

export default function Detail({ course, openModal, setOpenModal, loading }: Props) {


  return (
    <main className={`min-h-screen relative overflow-hidden pb-20 px-5 lg:px-0 ${openModal && 'h-[150vh] lg:h-screen'}`}>
      <img className="absolute -z-10 opacity-25" src="/background.webp" />
      {/* <section className="w-full h-screen bg-opacity-35 bg-cover bg-no-repeat"> */}
      {
        loading
          ?
          <div className="flex justify-center items-center h-screen">
            <div className="loader"></div>
          </div>

          : <div className="  flex flex-col gap-10 mx-auto pt-20 z-10 backdrop-blur-sm">
            <section className="max-w-6xl mx-auto  w-full bg-[#e1f3fe] overflow-hidden  rounded-xl grid grid-cols-1 lg:grid-cols-[1.5fr_2fr] items-center relative p-4 md:p-10 gap-5 lg:h-[500px]">
              <div className="flex flex-col gap-5 z-10">
                <div className="flex items-center gap-4 w-fit -top-7 left-0 right-0 bg-gray-300/40 px-4 py-2 rounded-lg">
                  <Image src="/calendar.png" width={25} height={25} alt="" />
                  <div className="flex flex-col gap-1">
                    <p className="leading-tight font-bold text-base">
                      {course.startDate}
                    </p>
                    <p className="text-sm -mt-1">Inicio de clases: 20 de Enero</p>
                  </div>
                </div>
                <div>
                  <p className="lg:text-4xl text-3xl font-semibold drop-shadow-md text-shadow">
                    {
                      course.type
                    } en
                  </p>
                  <p className="lg:text-5xl text-3xl font-semibold max-w-lg leading- text-blue-600">
                    {course.name}
                  </p>
                  <p className="lg:text-2xl text-xl font-medium inline-block max-w-lg ">
                    {course.subtitle}
                  </p>
                  {/* <BannerPromotion /> */}
                </div>
              </div>
              <div className="bg-gray-400 lg:h-full w-full h-[300px] rounded-xl">

              </div>
            </section>
            <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[3fr_1.5fr] gap-10 ">
              <div className="flex flex-col gap-2  order-2 lg:order-1">
                <h2 className="text-3xl font-bold">Detalles del {course.type === 'Curso corto' ? 'curso' : 'diplomado'}</h2>
                <p className="text-base text-[#5D5A6F]">
                  {course.description}
                </p>
                {
                  course.name === "Inteligencia Artificial para Negocios" && <p className="text-base text-[#5D5A6F] mt-5">⭐ Incluye certificado y guia de promts</p>
                }
              </div>

              <div className=" order-1 lg:order-2">

                <div className="flex flex-col gap-3 md:col-span-2 w-full font-medium text-[#0A033C]">
                  <div className="flex justify-between">
                    <p className="text-[#5D5A6F]">Modalidad</p>
                    <p className="font-semibold">Presencial</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[#5D5A6F]">Duración</p>
                    <p className="font-semibold">{course.duration}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[#5D5A6F]">Horas totales</p>
                    <p className="font-semibold">{course.hours}</p>
                  </div>
                  {/* <div className="flex justify-between">
                  <p className="text-[#5D5A6F]">Fecha de Inicio</p>
                  <p className="font-semibold">{course.startDate}</p>
                </div> */}
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[#5D5A6F]">Profesores</p>
                    </div>
                    <div>
                      {
                        course.teacher.map((teacher: any, i: number) => (
                          <p key={i} className="font-semibold underline text-right">
                            {teacher}
                          </p>
                        ))
                      }
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[#5D5A6F] text-pretty w-[80%]">{course.type === "Curso corto" ? "Inversión" : "Precio oferta de lanzamiento"}</p>
                    </div>
                    <div>
                      <p className={`font-semibold  ${course.discount ? "line-through text-gray-400" : "text-[#00A1F9]"} text-center `}>
                        ${Number(course.price)?.toLocaleString()}
                      </p>
                      {
                        course.discount &&
                        <p className="font-semibold text-[#00A1F9]">
                          ${Number(course.discount)?.toLocaleString()}
                        </p>
                      }
                    </div>
                  </div>

                  <Link
                    href={`/cursos/planes?slug=${course.slug}`}
                    className="bg-black mt-2 text-center cursor-pointer text-white py-2 rounded-md block hover:bg-black/80"
                  >
                    Ver Horarios
                  </Link>
                  <a
                    className="bg-sky-600 mt-2 text-center cursor-pointer text-white py-2 rounded-md block hover:bg-sky-700"
                    href="https://api.whatsapp.com/send?phone=573005523872"
                    target="_blank"
                  >
                    Conoce a tu asesor académico
                  </a>
                  <button
                    className="bg-green-600 mt-2 text-center cursor-pointer text-white py-2 rounded-md block hover:bg-green-800"
                    onClick={() => {
                      setOpenModal(true)
                      window.scrollTo(0, 0)
                    }}
                  >
                    Más información
                  </button>
                </div>
              </div>


            </section>
            <div className="max-w-6xl h-1 border-b mx-auto border-dashed w-full"></div>

            <Swiper
              direction={'horizontal'}
              pagination={{
                clickable: true
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              modules={[Pagination, Autoplay]}
              className="mySwiper"
            >
              <SwiperSlide>
                <BenefitCard
                  background="#e1f3fe"
                  title="Estudiantes"
                  textBlack
                  description="Para que complementes tus estudios y alinear tus habilidades a las necesidades reales de la industria. "
                />
              </SwiperSlide>
              <SwiperSlide>
                <BenefitCard
                  background="#00a1f9"
                  title="Profesionales"
                  description="Para actualizr tu conocimiento y alcanzar tu siguiente nivel profesional. "
                />
              </SwiperSlide>
              <SwiperSlide>
                <BenefitCard
                  background="#000000"
                  title="Emprenderores"
                  description="Para entender como la tecnología puede cambiar al mundo y poner a tu disposición su potencial."
                />
              </SwiperSlide>
              <SwiperSlide>
                <BenefitCard
                  background="#004367"
                  title="Personas en cambio de carrera"
                  description="Para abrir tu mundo a nuevas oportunidades en una de las industrias más demandadas del momento."
                />
              </SwiperSlide>
            </Swiper>

            <Wrapper styles="flex flex-col gap-2 w-full max-w-6xl mx-auto">
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold">Temario</h2>
                {
                  course.pdf &&
                  <a
                    href={course.pdf}
                    download
                    className="border flex py-1 gap-1 items-center px-4 border-[#00A1F9] uppercase text-sm hover:bg-[#00A1F9] font-semibold hover:text-white rounded-full"
                  >
                    Descargar <DownloadIcon />{" "}
                  </a>
                }
              </div>
              {course?.syllabus?.map((item: any, i: number) => (
                <div key={i} className="mt-5">
                  <details className="group border-b pb-4">
                    <summary className="flex justify-between items-center font-medium text-lg cursor-pointer list-none">
                      <h3>{item.module}</h3>
                      <span className="group-open:rotate-180 transition">
                        <ArrowDown />
                      </span>
                    </summary>
                    <ul className="list-disc marker:text-[#00A1F9]  pl-5 flex flex-col gap-2 mt-2">
                      {item.topics.map((topic: any, i: number) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))}
            </Wrapper>
            <section className="bg-[#e1f3fe] min-h-[50vh]">
              <div className="max-w-6xl mx-auto  grid grid-cols-1 lg:grid-cols-[2.5fr_1.5fr] gap-10 py-5 items-center px-4">
                <div className="flex flex-col gap-6 lg:gap-10">

                  <h2 className="text-3xl lg:text-5xl font-bold text-blue-500 text-balance">¿Cuales son los beneficios de tomar <span className="text-black">este diplomado?</span></h2>
                  <p className="text-lg font-semibold">Somos pioneros en inteligencia artificial y
                    tecnologías de vanguardia en la Costa. </p>
                  {/* <ul className="flex flex-col gap-3 list-disc pl-8">
                    <li>Presencialidad y Mentores Expertos: Recibe atención personalizada en cada módulo </li>
                    <li>Presencialidad y Mentores Expertos: Recibe atención personalizada en cada módulo </li>
                    <li>Presencialidad y Mentores Expertos: Recibe atención personalizada en cada módulo </li>
                    <li>Presencialidad y Mentores Expertos: Recibe atención personalizada en cada módulo </li>
                  </ul> */}
                  <ul className="list-disc marker:text-[#00A1F9]  pl-8 flex flex-col gap-5  ">
                    {course.benefits.map((benefit: any, i: number) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                <img className="hidden lg:block mask" src="/image-benefits.png" alt="" />
              </div>
            </section>
            <Wrapper styles="flex flex-col gap-2 w-full max-w-6xl mx-auto">
              {
                course.faqs.length > 0 &&
                <>
                  <h2 className="text-2xl font-bold">FAQs</h2>
                  {course.faqs.map((item: any, i: number) => (
                    <div key={i} className="mt-5">
                      <details className="group border-b pb-4">
                        <summary className="flex justify-between items-center font-medium text-lg cursor-pointer list-none">
                          <h3>{item.question}</h3>
                          <span className="group-open:rotate-180 transition">
                            <ArrowDown />
                          </span>
                        </summary>
                        <p>{item.answer}</p>
                      </details>
                    </div>
                  ))}
                </>
              }
            </Wrapper>
          </div>
      }
      {
        openModal &&
        <FormInfo setOpenModal={setOpenModal} />
      }
      {/* </section> */}
    </main>
  );
}


function Syllabus() {

}