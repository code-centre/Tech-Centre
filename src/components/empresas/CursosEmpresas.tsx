// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const cursos = [
  {
    id: 1,
    title: "Transformación Digital",
    description: "Estrategias y herramientas para la transformación digital de su negocio.",
    duration: "8 semanas",
    level: "Intermedio"
  },
  {
    id: 2,
    title: "Inteligencia Artificial Aplicada",
    description: "Aprenda a implementar soluciones de IA en sus procesos empresariales.",
    duration: "10 semanas",
    level: "Avanzado"
  },
  {
    id: 3,
    title: "Ciberseguridad Empresarial",
    description: "Proteja los activos digitales de su empresa con las mejores prácticas en ciberseguridad.",
    duration: "6 semanas",
    level: "Intermedio"
  },
  {
    id: 4,
    title: "Análisis de Datos",
    description: "Tome decisiones basadas en datos con herramientas de análisis avanzado.",
    duration: "8 semanas",
    level: "Intermedio"
  }
];

export default function CursosEmpresas() {
  return (
    <section id="cursos" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nuestros Cursos para Empresas</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Programas de formación diseñados para potenciar las habilidades de su equipo y llevar su negocio al siguiente nivel.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cursos.map((curso) => (
            <div key={curso.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <div>
                <h2 className="text-xl">{curso.title}</h2>
                <p>{curso.description}</p>
              </div>
              <div className="flex-grow">
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Duración: {curso.duration}</p>
                  <p>Nivel: {curso.level}</p>
                </div>
              </div>
              <div>
                <button className="w-full">
                  <Link href={`/cursos/${curso.id}`}>
                    Más información
                  </Link>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button>
            <Link href="/cursos">
              Ver todos los cursos
            </Link>
          </button>
        </div>
      </div>
    </section>
  );
}
