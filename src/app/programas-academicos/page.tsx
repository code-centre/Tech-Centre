import type { Metadata } from "next";
import { ProgramsList } from "@/components/ProgramsList";
import Testimonials from "@/sections/Testimonials";

export const metadata: Metadata = {
  title: "Programas Académicos",
  description: "Explora nuestros programas académicos en tecnología: diplomados y cursos especializados diseñados para el mercado laboral actual. Formación práctica y experiencial en Barranquilla, Colombia.",
  keywords: ["programas académicos", "diplomados", "cursos tech", "educación tecnológica", "Barranquilla", "Colombia"],
  openGraph: {
    title: "Programas Académicos - Tech Centre",
    description: "Explora nuestros programas académicos en tecnología diseñados para el mercado laboral actual.",
    type: "website",
  },
};

export default function ProgramasAcademicos() {
  return (
    <main className="min-h-screen">
      <ProgramsList 
        fetchPrograms={true}
        showHeader={true}
        backgroundColor="bg-background"
      />
      <Testimonials />
    </main>
  );
}