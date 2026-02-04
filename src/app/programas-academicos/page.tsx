import type { Metadata } from "next";
import { ProgramsList } from "@/components/ProgramsList";
import { MessageCircle } from "lucide-react";

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

const WHATSAPP_URL = 'https://wa.me/573005523872?text=Hola%2C%20quiero%20información%20sobre%20los%20programas%20de%20Tech%20Centre'

export default function ProgramasAcademicos() {
  return (
    <main className="min-h-screen">
      <ProgramsList 
        fetchPrograms={true}
        showHeader={true}
        backgroundColor="bg-background"
      />
      {/* Sección de asesoría */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            ¿No sabes qué programa elegir?
          </h2>
          <p className="text-lg md:text-xl text-text-muted mb-8">
            Te ayudamos a encontrar el programa ideal según tu perfil y objetivos.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            Hablar con un asesor
          </a>
        </div>
      </section>
    </main>
  );
}