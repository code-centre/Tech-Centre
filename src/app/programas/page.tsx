import type { Metadata } from "next";
import PageHero from "@/components/landing/PageHero";
import RouteCard from "@/components/landing/RouteCard";
import ModuleTimeline from "@/components/landing/ModuleTimeline";
import IntensityCards from "@/components/landing/IntensityCards";
import CtaBand from "@/components/landing/CtaBand";
import Reveal from "@/components/landing/Reveal";
import SparkEyebrow from "@/components/landing/SparkEyebrow";
import { ROUTES, SHARED_MODULES } from "@/components/landing/data";

export const metadata: Metadata = {
  title: "Programas · Ingeniero de Aplicaciones de IA",
  description:
    "Un oficio, dos rutas: Construye (web) y Revela (datos). De cero al perfil de Ingeniero de Aplicaciones de IA que la industria busca, presencial en Barranquilla.",
};

export default function ProgramasPage() {
  return (
    <div className="landing-v2">
      <PageHero
        eyebrow="Programas"
        title={
          <>
            Un oficio:{" "}
            <span className="lv2-mint">Ingeniero de Aplicaciones de IA</span>
          </>
        }
        subtitle="Dos rutas para llegar, según por dónde quieras entrar."
      />

      <section className="px-4 py-12 sm:px-6 lg:px-8" aria-label="Las dos rutas">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
          <RouteCard route={ROUTES.construye} fromLeft />
          <RouteCard route={ROUTES.revela} fromLeft={false} />
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="recorrido-title">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SparkEyebrow>El recorrido</SparkEyebrow>
            <h2
              id="recorrido-title"
              className="lv2-display mt-5 max-w-2xl text-3xl text-[var(--paper)] sm:text-4xl"
            >
              Cuatro módulos, un mismo destino
            </h2>
            <p className="mb-10 mt-4 max-w-2xl text-lg lv2-soft">
              El Módulo 3 es el punto de entrada para quienes ya tienen
              experiencia en web o datos.
            </p>
          </Reveal>
          <ModuleTimeline items={SHARED_MODULES} />
          <div className="mt-10">
            <IntensityCards />
          </div>
        </div>
      </section>

      <CtaBand title="Elige tu ruta y" highlight="empieza a explorar." />
    </div>
  );
}
