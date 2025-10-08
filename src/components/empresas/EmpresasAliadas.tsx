import Image from "next/image";

const empresas = [
  { name: 'Empresa 1', logo: '/logos/Logo-synergy-2.webp' },
  { name: 'Empresa 2', logo: '/logos/Logo-FiveOneLabs.webp' },
  { name: 'Empresa 3', logo: '/logos/LegalIA.webp' },
  // Add more companies as needed
];

export default function EmpresasAliadas() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Empresas que confían en nosotros</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hemos trabajado con empresas líderes en la industria para potenciar sus equipos con habilidades tecnológicas de vanguardia.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          {empresas.map((empresa, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-20 w-40 mx-auto">
                <Image
                  src={empresa.logo}
                  alt={empresa.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
