import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import BenefitCard from './BenefitCard'
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css';

export default function SwiperComponent() {
  return (
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
  )
}
