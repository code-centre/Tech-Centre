import type { Metadata } from "next";
import HeroEmpresas from "@/components/empresas/HeroEmpresas";
import EmpresasAliadas from "@/components/empresas/EmpresasAliadas";
import CursosEmpresas from "@/components/empresas/CursosEmpresas";
import Confianza from "@/components/empresas/Confianza";
import FAQ from "@/components/empresas/FAQ";
import { defaultOpenGraph, defaultTwitter } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Para Empresas",
  description: "Formación corporativa en tecnología con el método experiencial de Tech Centre, la academia de tecnología del Caribe. Programas para equipos, alineados a la industria.",
  keywords: ["capacitación corporativa", "formación empresarial", "cursos para empresas", "tecnología empresarial", "Barranquilla"],
  openGraph: defaultOpenGraph({
    title: "Para Empresas · Tech Centre",
    description: "Formación corporativa experiencial en tecnología para equipos, en Barranquilla.",
    url: "/empresas",
  }),
  twitter: defaultTwitter({
    title: "Para Empresas · Tech Centre",
    description: "Formación corporativa experiencial en tecnología para equipos, en Barranquilla.",
  }),
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
