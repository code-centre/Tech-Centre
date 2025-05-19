import Image from 'next/image'
import React from 'react'
import { ArrowRightIcon, ZapIcon } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 bg-black">
        <div className="max-w-7xl w-full mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-[60%] mb-10 md:mb-0">
              <span className="inline-block px-4 py-1 rounded-full bg-zinc-800 text-zinc-300 font-medium mb-4">
                Transforma tu futuro profesional
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Aprende las habilidades digitales más demandadas del <span className="text-zinc-300">mercado</span>
              </h1>
              <p className="text-xl text-zinc-300 mb-8">
                Cursos online en vivo impartidos por expertos de la industria. Metodología práctica y orientada a
                resultados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white hover:bg-gray-200 text-black text-lg py-2 rounded-md px-8 cursor-pointer">
                  Explorar cursos
                </button>
                <button
                  className="text-white hover:bg-white/10 text-lg py-2 rounded-md px-8 flex items-center gap-2 border-2 border-zinc-800 cursor-pointer"
                >
                  Ver demo de clase <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gray-300 border-2 border-[#1a103d] overflow-hidden"
                    >
                      <Image
                        src={`/placeholder.svg?height=100&width=100&text=${i}` || ''} 
                        alt={`Student ${i}`}
                        width={100}
                        height={100}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-gray-300">
                  <span className="font-bold text-white">+20,000</span> estudiantes ya confían en nosotros
                </p>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-end w-full">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-4 -left-4 w-full h-full bg-zinc-700 rounded-xl"></div>
                <div className="relative bg-zinc-800 rounded-xl overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=600&width=800"
                    alt="Estudiantes aprendiendo"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-black rounded-lg p-3 shadow-xl border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
                      <ZapIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Próxima clase</p>
                      <p className="text-xs text-gray-300">Hoy • 19:00 hs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}
