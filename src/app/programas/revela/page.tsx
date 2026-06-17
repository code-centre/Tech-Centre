import type { Metadata } from "next";
import ProgramaPage from "@/components/landing/sections/ProgramaPage";
import { ROUTES } from "@/components/landing/data";

export const metadata: Metadata = {
  title: "Revela · Ruta de Datos | AI Application Engineer",
  description:
    "Aprende a construir sistemas que razonan sobre datos: pipelines, RAG y agentes confiables. Ruta de Datos de Tech Centre, presencial en Barranquilla.",
};

export default function RevelaPage() {
  return <ProgramaPage route={ROUTES.revela} />;
}
