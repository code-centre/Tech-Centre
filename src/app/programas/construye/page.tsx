import type { Metadata } from "next";
import ProgramaPage from "@/components/landing/sections/ProgramaPage";
import { ROUTES } from "@/components/landing/data";

export const metadata: Metadata = {
  title: "Construye · Ruta Web | AI Product / Full-Stack Engineer",
  description:
    "Aprende a construir apps y agentes de IA que la gente usa, de cero a desplegar. Ruta Web de Tech Centre, presencial en Barranquilla.",
};

export default function ConstruyePage() {
  return <ProgramaPage route={ROUTES.construye} />;
}
