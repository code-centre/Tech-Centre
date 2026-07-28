import type { Metadata } from "next";
import { LocalBusinessSchema } from "@/components/seo/StructuredData";
import StickyDiagnosticCta from "@/components/landing/agentes/StickyDiagnosticCta";
import Hero from "@/components/landing/sections/Hero";
import Rutas from "@/components/landing/sections/Rutas";
import ParaQuien from "@/components/landing/sections/ParaQuien";
import HomeDemoBand from "@/components/landing/sections/HomeDemoBand";
import Testimonios from "@/components/landing/sections/Testimonios";
import ComoAprendes from "@/components/landing/sections/ComoAprendes";
import Experiencia from "@/components/landing/sections/Experiencia";
import Visitanos from "@/components/landing/sections/Visitanos";
import CtaFinal from "@/components/landing/sections/CtaFinal";
import { AGENTES_COHORT, AGENTES_DEMO_EVENT } from "@/components/landing/agentes/data";

export const metadata: Metadata = {
  title: {
    absolute:
      "Ingeniería de agentes de IA · Inicia 5 de septiembre · Tech Centre Barranquilla",
  },
  description: `Programa avanzado presencial para developers. Inicia el ${AGENTES_COHORT.startLabel}. Clase demo el ${AGENTES_DEMO_EVENT.dateShort}. Primero diagnóstico de 20 minutos, después inscripción. Doce cupos en El Prado.`,
  keywords: [
    "ingeniería de agentes de IA",
    "curso de agentes de IA Barranquilla",
    "MCP",
    "RAG",
    "LangGraph",
    "AI engineer Colombia",
    "formación presencial IA Caribe",
    "Tech Centre",
  ],
  openGraph: {
    title: "Ingeniería de agentes de IA · Tech Centre Barranquilla",
    description: `Inicia el ${AGENTES_COHORT.startLabel}. Ocho semanas presenciales para developers que ya programan. Primero diagnóstico, después inscripción.`,
    type: "website",
    images: [
      {
        url: "/community/manos-teclado.webp",
        width: 1200,
        height: 630,
        alt: "Programa avanzado de ingeniería de agentes · Tech Centre",
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
      <ParaQuien />
      <HomeDemoBand />
      <Testimonios />
      <ComoAprendes />
      <Experiencia />
      <Visitanos />
      <CtaFinal />
    </div>
  );
}
