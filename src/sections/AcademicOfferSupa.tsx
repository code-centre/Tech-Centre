'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' // Asegúrate de que esta ruta sea correcta
import { useUser } from '@/lib/supabase'; // Ajusta esta ruta según tu configuración
import CardLoader from '../components/loaders-skeletons/CardLoader'
import useUserStore from '../../store/useUserStore'
import EventCreationModal from '@/components/EventCreationModal'
import { CourseListSupa } from '@/components/CourseListSupa'

// Definir la interfaz para los programas
interface Program {
  id: number;
  code: string;
  name: string;
  syllabus: any[];
  difficulty: string;
  kind: string;
  total_hours: number;
  default_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image:string;
  description:string;
  video:string;
  subtitle:string;
  faqs:any[];
}

export default function AcademicOfferSupa() {
  const [areaFiltrada, setAreaFiltrada] = useState("todos");
  const [nivelFiltrado, setNivelFiltrado] = useState("todos");
  const [showAll, setShowAll] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [programas, setProgramas] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';
	
  // Cargar programas desde Supabase
  useEffect(() => {
    const fetchPrograms = async () => {
		
      try {
        setLoading(true);
        let query = supabase
          .from('programs')
          .select('*');
        
        // Si no es admin, solo mostrar programas activos
        if (!isAdmin) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        setProgramas(data || []);
		console.log(isAdmin)
		console.log("cursos",data)
		console.log("programas: ",programas)
      } catch (err) {
        console.error('Error cargando programas:', err);
        setError('Error al cargar los programas');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [isAdmin]);

  // Manejar la creación de nuevos programas
  const handleProgramCreate = (newProgram: any) => {
    setProgramas(prev => [newProgram, ...prev]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <CardLoader />
          <CardLoader />
          <CardLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-100 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <section id="oferta-academica" className="py-15 px-4 text-white bg-background">
      <div className="mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 drop-shadow-lg">
            Programas academicos supa
          </h2>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 drop-shadow-lg">
            diseñados para el mercado laboral actual
          </h2>
          <p className="max-w-2xl mx-auto text-xl">
            Enfoque práctico y orientados al aprendizaje experiencial, diseñados por expertos de la industria.
          </p>

          {isAdmin && (
            <div className="mt-6 flex justify-center gap-4 text-white">
              <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg 
                       hover:from-blue-500 hover:to-blue-400 transform hover:-translate-y-0.5 
                       transition-all duration-200 shadow-lg shadow-blue-700/30"
              >
                Crear nuevo programa
              </button>
            </div>
          )}
        </div>

        {/* Lista de programas */}
		<div className='border-2 border-red-500'>
        <CourseListSupa 
			programs={programas}
			showHeader={true}
			backgroundColor="bg-background"
		/>
		</div>

        {programas.length === 0 && !isAdmin && (
          <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700 shadow">
            <p className="text-gray-300">No hay programas disponibles actualmente.</p>
          </div>
        )}
      </div>

      {/* Modal para crear nuevo programa (deberás implementar este componente) */}
      <EventCreationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onEventCreate={handleProgramCreate}
      />
    </section>
  );
}
