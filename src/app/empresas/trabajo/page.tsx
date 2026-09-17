// src/app/empresas/trabajo/page.tsx
import type { Metadata } from "next";
import SolicitarTrabajo from '@/components/empresas/SolicitarTrabajo';
import SolicitarPasantia from '@/components/empresas/SolicitarPasantia';
import { defaultOpenGraph, defaultTwitter } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Ofertas de Trabajo y Pasantías",
  description: "Oportunidades de trabajo y pasantías en tecnología desde Tech Centre, la academia de tecnología del Caribe. Conecta con empresas que buscan talento formado en industria.",
  keywords: ["trabajo tech", "pasantías", "empleo tecnología", "oportunidades laborales", "Barranquilla"],
  openGraph: defaultOpenGraph({
    title: "Ofertas de Trabajo y Pasantías · Tech Centre",
    description: "Oportunidades de trabajo y pasantías en tecnología desde el Caribe.",
    url: "/empresas/trabajo",
  }),
  twitter: defaultTwitter({
    title: "Ofertas de Trabajo y Pasantías · Tech Centre",
    description: "Oportunidades de trabajo y pasantías en tecnología desde el Caribe.",
  }),
};

export default function TrabajoPage() {
  return (
    <main className="flex-1">
      <div id="trabajo">
        <SolicitarTrabajo 
        hayOfertas={false}
     /> 
      </div>
      <div id="pasantia">
        <SolicitarPasantia 
        hayOfertas={false}
     /> 
      </div>
    </main>
  );
}