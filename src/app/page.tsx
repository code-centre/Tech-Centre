import type { Metadata } from "next";
import { LocalBusinessSchema } from "@/components/seo/StructuredData";
import Hero from "@/components/landing/sections/Hero";
import Manifiesto from "@/components/landing/sections/Manifiesto";
import ComoAprendes from "@/components/landing/sections/ComoAprendes";
import Experiencia from "@/components/landing/sections/Experiencia";
import Rutas from "@/components/landing/sections/Rutas";
import ParaQuien from "@/components/landing/sections/ParaQuien";
import SiPuedes from "@/components/landing/sections/SiPuedes";
import Testimonios from "@/components/landing/sections/Testimonios";
import PrensaAliados from "@/components/landing/sections/PrensaAliados";
import Visitanos from "@/components/landing/sections/Visitanos";
import CtaFinal from "@/components/landing/sections/CtaFinal";

export const metadata: Metadata = {
  title:
    "Tech Centre - Despierta el genio tech que llevas dentro | Centro de Tecnología del Caribe",
  description:
    "Aprende a construir con inteligencia artificial, de cero al perfil que la industria busca. Clases presenciales en Barranquilla, dos rutas (Web y Datos), acompañándote paso a paso.",
  keywords: [
    "centro tecnología Caribe",
    "cursos programación Barranquilla",
    "inteligencia artificial",
    "AI Engineer",
    "ingeniero de aplicaciones de IA",
    "agentes IA",
    "análisis de datos",
    "python",
    "react",
    "next.js",
    "desarrollo web",
    "formación tech Caribe",
    "clases presenciales Barranquilla",
  ],
  openGraph: {
    title: "Tech Centre - Despierta el genio tech que llevas dentro",
    description:
      "Aprende a construir con inteligencia artificial, de cero al perfil que la industria busca. Presencial, en el Caribe, acompañándote paso a paso.",
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
    <div className="landing-v2">
      <LocalBusinessSchema />
      <Hero />
      <Manifiesto />
      <ComoAprendes />
      <Experiencia />
      <Rutas />
      <ParaQuien />
      <SiPuedes />
      <Testimonios />
      <PrensaAliados />
      <Visitanos />
      <CtaFinal />
    </div>
  );
}
