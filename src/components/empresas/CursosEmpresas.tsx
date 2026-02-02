// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const cursos = [
  {
    id: 1,
    title: "Transformación Digital",
    description: "Estrategias y herramientas para la transformación digital de su negocio.",
    duration: "8 semanas",
    level: "INTERMEDIO"
  },
  {
    id: 2,
    title: "Inteligencia Artificial Aplicada",
    description: "Aprenda a implementar soluciones de IA en sus procesos empresariales.",
    duration: "10 semanas",
    level: "BÁSICO"
  },
  {
    id: 3,
    title: "Ciberseguridad Empresarial",
    description: "Proteja los activos digitales con las mejores prácticas en ciberseguridad.",
    duration: "6 semanas",
    level: "INTERMEDIO"
  },
  {
    id: 4,
    title: "Análisis de Datos",
    description: "Tome decisiones basadas en datos con herramientas de análisis avanzado.",
    duration: "8 semanas",
    level: "BÁSICO"
  }
];

export default function CursosEmpresas() {
  return (
    <section id="pasantias" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl text-secondary font-bold mb-4">Nuestros Cursos para Empresas</h2>
          <p className="text-white max-w-2xl mx-auto">
            Programas de formación diseñados para potenciar las habilidades de su equipo y llevar su negocio al siguiente nivel.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cursos.map((curso) => (
            <div 
              key={curso.id} 
              className="flex flex-col h-full bg-bgCard rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-zinc-800/30 group gap-4 p-6"
            >
              <div className="h-1/4">
                <h2 className="text-xl font-bold text-secondary">{curso.title}</h2>
              </div>
              <div className="flex-grow h-1/2">
                <span className="text-secondary font-bold">¿Qué es?</span>
                <p className="text-white border-b-2 border-zinc-800/30">{curso.description}</p>
              </div>
              <div className="flex-grow h-1/2">
                <span className="text-secondary font-bold">¿Cómo funciona?</span>
                <p className="text-white border-b-2 border-zinc-800/30">{curso.description}</p>
              </div>
              <div className="space-y-4 h-1/3">
                <div className="flex-grow">
                  <span className="text-secondary font-bold">Ideal para:</span>
                  <p className="text-white border-b-2 border-zinc-800/30">{curso.description}</p>
                </div>
                <div className="text-sm flex items-center gap-2 justify-center flex-col text-white">
                  <p>Duración: {curso.duration}</p>
                  <span
                  className={`inline-block  ${
                    curso.level === 'BÁSICO'
                      ? 'bg-gradient-to-r from-secondary to-blue-600'
                      : curso.level === 'INTERMEDIO'
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600'
                      : 'bg-gradient-to-r from-secondary to-blue-600'
                  } text-white text-xs font-bold px-4 py-1.5 rounded-full z-10 shadow-lg backdrop-blur-sm border border-white/10 `}
                >
                  {curso.level}
                  </span>
                </div>
              </div>
              <div className="mt-auto pt-4">
                <Link 
                  href={`/cursos/${curso.id}`}
                  className="block w-full text-center px-5 py-2.5 border border-blue-500/30 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-secondary to-blue-600 hover:from-blue-600 hover:to-secondary shadow-lg shadow-secondary/20 hover:shadow-secondary/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  Más información
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            className="mt-6 inline-flex items-center px-5 py-2.5 border border-blue-500/30 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-secondary to-blue-600 hover:from-blue-600 hover:to-secondary shadow-lg shadow-secondary/20 hover:shadow-secondary/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300" 
          >
            <Link href="/cursos">
              Ver todos los cursos
            </Link>
          </button>
        </div>
      </div>
    </section>
  );
}
