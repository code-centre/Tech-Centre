import HeroEmpresas from "@/components/empresas/HeroEmpresas";
import EmpresasAliadas from "@/components/empresas/EmpresasAliadas";
import CursosEmpresas from "@/components/empresas/CursosEmpresas";
import Confianza from "@/components/empresas/Confianza";
import FAQ from "@/components/empresas/FAQ";

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
