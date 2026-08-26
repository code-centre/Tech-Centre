import type { Metadata } from "next";
import { LocalBusinessSchema } from "@/components/seo/StructuredData";
import StickyDiagnosticCta from "@/components/landing/agentes/StickyDiagnosticCta";
import Hero from "@/components/landing/sections/Hero";
import Rutas from "@/components/landing/sections/Rutas";
import ComoFunciona from "@/components/landing/sections/ComoFunciona";
import Testimonios from "@/components/landing/sections/Testimonios";
import ComoAprendes from "@/components/landing/sections/ComoAprendes";
import Experiencia from "@/components/landing/sections/Experiencia";
import DespuesDeLaCumbre from "@/components/landing/sections/DespuesDeLaCumbre";
import Visitanos from "@/components/landing/sections/Visitanos";
import CtaFinal from "@/components/landing/sections/CtaFinal";

export const metadata: Metadata = {
  title: {
    absolute:
      "Rutas de aprendizaje en tecnología e IA · Tech Centre · Barranquilla",
  },
  description:
    "Dos rutas para entrar a la industria tech: Producto (JavaScript, TypeScript y agentes de IA) y Datos (Python, SQL y machine learning). Tres módulos de 8 semanas que puedes tomar de forma independiente, presencial en Casa Tech, Barranquilla. Diagnóstico gratuito.",
  keywords: [
    "aprender a programar Barranquilla",
    "curso de programación desde cero",
    "curso de agentes de IA",
    "curso de datos y machine learning",
    "JavaScript TypeScript React",
    "Python SQL machine learning",
    "formación presencial tecnología Caribe",
    "Tech Centre",
  ],
  openGraph: {
    title: "Dos rutas para entrar a la industria tech · Tech Centre Barranquilla",
    description:
      "Ruta Producto: productos y agentes de IA. Ruta Datos: datos y machine learning. Tres módulos de 8 semanas, máximo 12 personas, presencial en Casa Tech. Empieza con un diagnóstico gratuito.",
    type: "website",
    images: [
      {
        url: "/community/manos-teclado.webp",
        width: 1200,
        height: 630,
        alt: "Rutas de aprendizaje · Tech Centre, Centro de Tecnología del Caribe",
      },
    ],
  },
};

export default function Home() {
  return (
    <div className="landing-v2 home-conversion">
      <LocalBusinessSchema />
      <StickyDiagnosticCta />
      <Hero />
      <Rutas />
      <ComoFunciona />
      <Testimonios />
      <ComoAprendes />
      <Experiencia />
      <DespuesDeLaCumbre />
      <Visitanos />
      <CtaFinal />
    </div>
  );
}
