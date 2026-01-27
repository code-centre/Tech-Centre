"use client"
import Link from "next/link";

export default function HeroEmpresas() {
  return (
    <section className="relative mt-4 bg-background text-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-zuccini">
            Capacitación y desarrollo para tu equipo
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Potencia el crecimiento de tu empresa con nuestros programas de formación especializados en tecnología y transformación digital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              className="mt-2 inline-flex items-center px-5 py-2.5 border border-blue-500/30 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-zuccini to-blue-600 hover:from-blue-600 hover:to-zuccini shadow-lg shadow-zuccini/20 hover:shadow-zuccini/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300" 
            >
              <Link href="#contacto">
                  Contáctanos
              </Link>
            </button>
            <button
              type="button"
              className="mt-2 inline-flex items-center px-5 py-2.5 border border-blue-500/30 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-zuccini to-blue-600 hover:from-blue-600 hover:to-zuccini shadow-lg shadow-zuccini/20 hover:shadow-zuccini/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300" 
            >
              <Link href="/#cursos">
                Ver cursos
              </Link>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
