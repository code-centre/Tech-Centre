import type { Metadata } from "next";
import { ProgramsList } from "@/components/ProgramsList";
import { MessageCircle } from "lucide-react";
import { defaultOpenGraph, defaultTwitter } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Programas Académicos",
  description: "Programas experienciales de Tech Centre, la academia de tecnología del Caribe: formación alineada a la industria, presencial en Barranquilla.",
  keywords: ["programas académicos", "academia tecnología Caribe", "formación experiencial", "cursos tech Barranquilla"],
  openGraph: defaultOpenGraph({
    title: "Programas Académicos · Tech Centre",
    description: "Programas experienciales alineados a la industria, presencial en Casa Tech, Barranquilla.",
    url: "/programas-academicos",
  }),
  twitter: defaultTwitter({
    title: "Programas Académicos · Tech Centre",
    description: "Programas experienciales alineados a la industria, presencial en Casa Tech, Barranquilla.",
  }),
};

const WHATSAPP_URL = 'https://wa.me/573005523872?text=Hola%2C%20quiero%20información%20sobre%20los%20programas%20de%20Tech%20Centre'

export default function ProgramasAcademicos() {
  return (
    <main className="min-h-screen max-w-7xl mx-auto">
      
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