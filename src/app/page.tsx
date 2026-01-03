import type { Metadata } from "next";
import Testimonials from "@/sections/Testimonials";
import { WhoWeAre } from "@/sections/WhoWeAre";
import Reviews from "@/sections/Reviews";
import NoticiasSection from "@/sections/Noticias";
import { Ubication } from "@/sections/ubication";
import HeroCarrusel from "@/components/HeroCarrusel";
import { AliadosSection } from '@/components/aliadosSection';
import heroData from '../../data/herocarrusel.json'
import AcademicOfferSupa from "@/sections/AcademicOfferSupa";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Tech Centre - Formamos a los profesionales tech del futuro con programas prácticos y actualizados. Descubre nuestros diplomados y cursos especializados en tecnología diseñados para el mercado laboral actual en Barranquilla, Colombia.",
  keywords: ["tecnología", "programación", "diplomados tech", "cursos especializados", "educación tecnológica", "Barranquilla", "Colombia", "formación profesional"],
  openGraph: {
    title: "Tech Centre - Formación Tech para el Futuro",
    description: "Formamos a los profesionales tech del futuro con programas prácticos y actualizados.",
    type: "website",
    images: [
      {
        url: "/tech-center-logos/TechCentreLogoColor.png",
        width: 1200,
        height: 630,
        alt: "Tech Centre - Formación Tech",
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <HeroCarrusel 
        items={heroData}
        type="hero"
        effect="fade"
        className="w-full z-10 rounded-lg mt-24"
        itemClassName="group z-10"
        imageClassName=""
      />
      <div id="programs">
        <AcademicOfferSupa />
      </div>
      <div id="quienes-somos">
        <WhoWeAre />
      </div>
      <div id="ubicacion">
        <Ubication />
      </div>
      <div id="testimonios">
        <Reviews />
      </div>
      <Testimonials />
      <NoticiasSection/>
      <AliadosSection />      
    </>
  );
}
