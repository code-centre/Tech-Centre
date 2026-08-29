import type { Metadata } from "next";
import { LocalBusinessSchema, StructuredData } from "@/components/seo/StructuredData";
import { CONTACT } from "@/components/landing/data";
import { RUTAS_FAQS_HOME } from "@/components/landing/rutas/data";
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
import { getOfferingCohortsByCode } from "@/lib/cohorts/offering";

// Las cohortes abiertas se leen en vivo; revalidamos cada hora para reflejar
// cambios sin necesidad de redeploy.
export const revalidate = 3600;

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
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "Rutas de aprendizaje · Tech Centre, Centro de Tecnología del Caribe",
      },
    ],
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: RUTAS_FAQS_HOME.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default async function Home() {
  const offeringCohorts = await getOfferingCohortsByCode();

  return (
    <div className="landing-v2 home-conversion">
      <LocalBusinessSchema
        address={{
          streetAddress: "Cra. 50 #72-126, El Prado",
          addressLocality: "Barranquilla",
          addressRegion: "Atlántico",
          addressCountry: "CO",
        }}
        telephone={CONTACT.phone}
        email={CONTACT.email}
        geo={{ latitude: 10.9981343, longitude: -74.8045491 }}
        sameAs={[
          CONTACT.social.instagram,
          CONTACT.social.linkedin,
          CONTACT.social.facebook,
        ]}
        hasMap={CONTACT.mapsUrl}
      />
      <StructuredData data={FAQ_SCHEMA} />
      <StickyDiagnosticCta />
      <Hero />
      <PruebaBar />
      <EsParaTi />
      <Rutas offering={offeringCohorts} />
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
