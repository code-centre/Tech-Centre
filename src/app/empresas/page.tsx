import type { Metadata } from "next";
import HeroEmpresas from "@/components/empresas/HeroEmpresas";
import EmpresasAliadas from "@/components/empresas/EmpresasAliadas";
import CursosEmpresas from "@/components/empresas/CursosEmpresas";
import Confianza from "@/components/empresas/Confianza";
import FAQ from "@/components/empresas/FAQ";

export const metadata: Metadata = {
  title: "Para Empresas",
  description: "Capacitación corporativa en tecnología para empresas. Programas de formación personalizados para equipos de trabajo. Transforma tu organización con Tech Centre.",
  keywords: ["capacitación corporativa", "formación empresarial", "cursos para empresas", "tecnología empresarial", "Barranquilla"],
  openGraph: {
    title: "Para Empresas - Tech Centre",
    description: "Capacitación corporativa en tecnología para empresas. Programas de formación personalizados.",
    type: "website",
  },
};

export default function EmpresasPage() {
  return (
    <main className="flex-1">
      <HeroEmpresas />
      <EmpresasAliadas />
      <CursosEmpresas />
      <Confianza />
      <FAQ />
    </main>
  );
}
