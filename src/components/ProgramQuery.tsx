"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Program {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  code: string;
  // Agrega más campos según necesites
}

function ProgramQuery({ onProgramsLoaded }: { onProgramsLoaded: (programs: any[]) => void }) {
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        console.log('Iniciando consulta a la tabla programs...');
        
        const { data: programs, error } = await supabase
          .from('programs')
          .select('*')
          .eq('is_active', true)  // Solo programas activos
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error al obtener los programas:', error);
          return;
        }

        console.log('Programas encontrados:', programs);
        onProgramsLoaded(programs || []);
      } catch (error) {
        console.error('Error en la consulta:', error);
      }
    };

    fetchPrograms();
  }, [onProgramsLoaded]);

  return null;
}

export default ProgramQuery;