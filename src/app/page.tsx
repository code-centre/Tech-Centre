import type { Metadata } from "next";
import { LocalBusinessSchema, StructuredData } from "@/components/seo/StructuredData";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_KEYWORDS,
  defaultOpenGraph,
  defaultTwitter,
} from "@/lib/seo/site";
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
import { RUTAS } from "@/components/landing/rutas/data";
import { getOfferingCohortsByCode } from "@/lib/cohorts/offering";
import { getProgramCatalogByCodes, getProgramsHub } from "@/data/programsHub";
import CursosSueltos from "@/components/landing/sections/CursosSueltos";

const ROUTE_MODULE_CODES = RUTAS.flatMap((ruta) => ruta.modules.map((mod) => mod.slug));

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: HOME_TITLE,
  },
  description: HOME_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  openGraph: defaultOpenGraph({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
  }),
  twitter: defaultTwitter({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  }),
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
  const [offeringCohorts, hub, moduleCatalog] = await Promise.all([
    getOfferingCohortsByCode(),
    getProgramsHub(),
    getProgramCatalogByCodes(ROUTE_MODULE_CODES),
  ]);

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
      <Rutas offering={offeringCohorts} moduleCatalog={moduleCatalog} />
      {hub.loose.length > 0 ? <CursosSueltos programs={hub.loose} /> : null}
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
