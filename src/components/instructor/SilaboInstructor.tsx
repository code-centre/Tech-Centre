// src/app/instructor/[cohort]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useUser } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Syllabus {
  modulos: Array<{
    id: number;
    titulo: string;
    duracion_horas: number;
    temas: string[];
  }>;
}

interface ProgramData {
  id: number;
  syllabus: Syllabus;
}

interface CohortData {
  id: number;
  program_id: number;
  program: {
    id: number;
    syllabus: Syllabus;
  };
}

export default function CohortPage() {
  const params = useParams();
  const { user, loading } = useUser();
  const [cohortName, setCohortName] = useState('');
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loadingSyllabus, setLoadingSyllabus] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decodificar el nombre del cohorte de la URL
  useEffect(() => {
    if (params.cohort) {
      const decodedName = decodeURIComponent(params.cohort as string);
      setCohortName(decodedName);
      fetchSyllabus(decodedName);
      console.log("nombre decodificado",decodedName)
    }
  }, [params.cohort]);

  const fetchSyllabus = async (cohortName: string) => {
    try {
      setLoadingSyllabus(true);
      setError(null);

      // 1. Primero obtenemos el cohorte por nombre
      const { data: cohortData, error: cohortError } = await supabase
        .from('cohorts')
        .select(`
            id,
            program_id,
            program:programs (
            id,
            syllabus
            )
        `)
        .eq('name', cohortName)
        .single();

      if (cohortError) throw cohortError;
      if (!cohortData) throw new Error('Cohort no encontrado');
      console.log("Estructura completa de cohortData:", JSON.stringify(cohortData, null, 2));
      
      // 2. Accedemos al syllabus del programa
      const cohortDataTyped = cohortData as unknown as {
        program: {
          syllabus: Syllabus;
        };
      };
      const syllabusData = cohortDataTyped.program.syllabus;
      console.log("el silabo es ", syllabusData);
      setSyllabus(syllabusData);

    } catch (err) {
      console.error('Error al cargar el syllabus:', err);
      setError('No se pudo cargar el syllabus. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoadingSyllabus(false);
    }
  };

  if (loading || loadingSyllabus) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !['admin', 'instructor'].includes(user.role)) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>No tienes permiso para ver esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-20">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">{cohortName}</h2>
        
        <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Syllabus del Programa</h3>
            {error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <p>{error}</p>
                </div>
            ) : syllabus ? (
                <div className="space-y-6">
                {syllabus.modulos.map((modulo) => (
                    <div key={modulo.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-2">{modulo.titulo}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                        Duración: {modulo.duracion_horas} horas
                    </p>
                    <div className="space-y-2">
                        <h5 className="font-medium text-gray-700">Temas:</h5>
                        <ul className="list-disc pl-5 space-y-1">
                        {modulo.temas.map((tema, index) => (
                            <li key={index} className="text-gray-600">
                            {tema}
                            </li>
                        ))}
                        </ul>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-gray-500">No hay un syllabus disponible para este programa.</p>
            )}
            </div>
      </div>
    </div>
  );
}