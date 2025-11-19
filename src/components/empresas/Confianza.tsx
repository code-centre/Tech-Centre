// import { Card, CardContent } from "@/components/ui/card";   

const stats = [
  { number: "100+", label: "Empresas capacitadas" },
  { number: "5,000+", label: "Estudiantes formados" },
  { number: "95%", label: "Tasa de satisfacción" },
  { number: "10+", label: "Años de experiencia" }
];

const testimonios = [
  {
    id: 1,
    nombre: "Ana Martínez",
    cargo: "Directora de RRHH",
    empresa: "TecnoSoluciones",
    contenido: "La capacitación recibida transformó nuestro equipo. Los conocimientos adquiridos se tradujeron en mejoras inmediatas en nuestros procesos.",
    imagen: "/public/events/hero.jpeg"
  },
  {
    id: 2,
    nombre: "Carlos Rodríguez",
    cargo: "Gerente de TI",
    empresa: "InnovaCorp",
    contenido: "Excelente nivel académico de los instructores y flexibilidad para adaptar los contenidos a nuestras necesidades específicas.",
    imagen: "/public/events/hero.jpeg"
  }
];

export default function Confianza() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Por qué confiar en nosotros</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Miles de empresas han mejorado sus equipos con nuestros programas de formación especializada.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonios.map((testimonio) => (
            <div key={testimonio.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xl font-semibold text-gray-600">
                        {testimonio.nombre.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 italic mb-4">"{testimonio.contenido}"</p>
                    <div>
                      <p className="font-semibold">{testimonio.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {testimonio.cargo}, {testimonio.empresa}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
