import type { Metadata } from "next";
import { LocalBusinessSchema } from "@/components/seo/StructuredData";
import StickyDiagnosticCta from "@/components/landing/agentes/StickyDiagnosticCta";
import Hero from "@/components/landing/sections/Hero";
import PruebaBar from "@/components/landing/sections/PruebaBar";
import EsParaTi from "@/components/landing/sections/EsParaTi";
import Rutas from "@/components/landing/sections/Rutas";
import ComoEntras from "@/components/landing/sections/ComoEntras";
import PruebaSocial from "@/components/landing/sections/PruebaSocial";
import ComoAprendes from "@/components/landing/sections/ComoAprendes";
import Inversion from "@/components/landing/sections/Inversion";
import DespuesDeLaCumbre from "@/components/landing/sections/DespuesDeLaCumbre";
import FaqHome from "@/components/landing/sections/FaqHome";
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
      <PruebaBar />
      <EsParaTi />
      <Rutas />
      <ComoEntras />
      <PruebaSocial />
      <ComoAprendes />
      <Inversion />
      <DespuesDeLaCumbre />
      <FaqHome />
      <Visitanos />
      <CtaFinal />
    </div>
  );
}
