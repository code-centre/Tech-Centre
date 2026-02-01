import type { Metadata } from "next";
import Testimonials from "@/sections/Testimonials";
import { WhoWeAre } from "@/sections/WhoWeAre";
import Reviews from "@/sections/Reviews";
import NoticiasSection from "@/sections/Noticias";
import { Ubication } from "@/sections/ubication";
import HeroCarrusel from "@/components/HeroCarrusel";
import { AliadosSection } from '@/components/aliadosSection';
import AcademicOffer from "@/sections/AcademicOffer";
import { HowYouLearn } from "@/sections/HowYouLearn";
import { LocalBusinessSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Tech Centre - Centro de Tecnología del Caribe | Educación Tech de Vanguardia",
  description: "Tech Centre - Centro de tecnología del Caribe. Formamos a los profesionales tech del futuro con programas prácticos, actualizados y de vanguardia. Educación tecnológica de calidad en Barranquilla, Colombia. Cursos de inteligencia artificial, análisis de datos, Python, JavaScript, React, diseño y más.",
  keywords: [
    "centro tecnología Caribe",
    "cursos programación Barranquilla",
    "diplomados tech Colombia",
    "educación tecnológica vanguardia",
    "formación tech Caribe",
    "aprender tecnología Barranquilla",
    "cursos tecnología calidad",
    "inteligencia artificial",
    "análisis de datos",
    "python",
    "javascript",
    "react",
    "diseño",
    "figma",
    "agentes IA",
    "machine learning",
    "data science",
    "desarrollo web",
    "programación python",
    "desarrollo react",
    "diseño UI/UX",
    "análisis datos python",
    "inteligencia artificial Colombia",
    "cursos python Barranquilla",
    "cursos react Caribe",
    "diseño figma Barranquilla",
  ],
  openGraph: {
    title: "Tech Centre - Centro de Tecnología del Caribe | Educación Tech de Vanguardia",
    description: "Tech Centre - Centro de tecnología del Caribe. Formamos a los profesionales tech del futuro con programas prácticos, actualizados y de vanguardia. Educación tecnológica de calidad en Barranquilla, Colombia.",
    type: "website",
    images: [
      {
        url: "/tech-center-logos/TechCentreLogoColor.png",
        width: 1200,
        height: 630,
        alt: "Tech Centre - Centro de Tecnología del Caribe",
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <LocalBusinessSchema />
      <HeroCarrusel 
        className="w-full z-10 rounded-lg mt-12"
      />
      <HowYouLearn />
      <div id="quienes-somos">
        <WhoWeAre />
      </div>
      <div id="programs">
        <AcademicOffer />
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
