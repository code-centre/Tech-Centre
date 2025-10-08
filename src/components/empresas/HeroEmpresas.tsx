import Link from "next/link";

export default function HeroEmpresas() {
  return (
    <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Capacitación y desarrollo para tu equipo
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Potencia el crecimiento de tu empresa con nuestros programas de formación especializados en tecnología y transformación digital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button>
                <Link href="#contacto">
                    Contáctanos
                </Link>
            </button>
            <button>
              <Link href="#cursos">
                Ver cursos
              </Link>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
