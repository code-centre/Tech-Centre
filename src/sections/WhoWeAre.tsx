import React from 'react'
import {
  BookOpenIcon,
  UsersIcon,
  TrendingUpIcon,
  AwardIcon,
} from 'lucide-react'
export function WhoWeAre() {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Quiénes Somos</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Somos más que un centro de formación tecnológica. Somos un
            ecosistema de aprendizaje donde la innovación y el talento se
            encuentran.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img
              src="https://uploadthingy.s3.us-west-1.amazonaws.com/gmoziLLVVhrjeVc4NEM2ch/image.png"
              alt="Equipo de Tech Centre"
              className="rounded-lg shadow-xl w-full h-[400px] object-cover"
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-6">Nuestra Historia</h3>
            <p className="text-gray-600 mb-6">
              Fundado en 2020, Tech Centre nació con la misión de transformar la
              educación tecnológica en la región. Comenzamos con un pequeño
              grupo de estudiantes apasionados y hoy somos el referente en
              formación tech de la Costa Caribe.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="font-bold text-3xl text-blue-600">3+</div>
                <div className="text-gray-600">Años de experiencia</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="font-bold text-3xl text-blue-600">98%</div>
                <div className="text-gray-600">Satisfacción estudiantes</div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold mb-2">Innovación Educativa</h4>
            <p className="text-gray-600">
              Metodologías actualizadas y contenido práctico adaptado al
              mercado.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold mb-2">Comunidad Activa</h4>
            <p className="text-gray-600">
              Red de profesionales y estudiantes comprometidos con la
              tecnología.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUpIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold mb-2">Crecimiento Continuo</h4>
            <p className="text-gray-600">
              Programas diseñados para impulsar tu desarrollo profesional.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AwardIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold mb-2">Excelencia</h4>
            <p className="text-gray-600">
              Compromiso con la calidad y el éxito de nuestros estudiantes.
            </p>
          </div>
        </div>
        <div className="bg-blue-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
          <p className="text-xl max-w-3xl mx-auto">
            Formar profesionales tecnológicos de alto nivel, impulsando la
            innovación y el desarrollo digital en la región Caribe colombiana.
          </p>
        </div>
      </div>
    </div>
  )
}
