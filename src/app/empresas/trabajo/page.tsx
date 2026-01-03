// src/app/empresas/trabajo/page.tsx
import type { Metadata } from "next";
import SolicitarTrabajo from '@/components/empresas/SolicitarTrabajo';
import SolicitarPasantia from '@/components/empresas/SolicitarPasantia';

export const metadata: Metadata = {
  title: "Ofertas de Trabajo y Pasantías",
  description: "Explora oportunidades de trabajo y pasantías en tecnología. Conecta con empresas que buscan talento tech en Barranquilla y Colombia.",
  keywords: ["trabajo tech", "pasantías", "empleo tecnología", "oportunidades laborales", "Barranquilla"],
  openGraph: {
    title: "Ofertas de Trabajo y Pasantías - Tech Centre",
    description: "Explora oportunidades de trabajo y pasantías en tecnología.",
    type: "website",
  },
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