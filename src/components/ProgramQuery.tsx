"use client";
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import type { Program } from '@/types/programs';

// Re-exportar Program para compatibilidad con código existente
export type { Program }

function ProgramQuery({ onProgramsLoaded }: { onProgramsLoaded: (programs: any[]) => void }) {
  const supabase = useSupabaseClient()
  
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

        onProgramsLoaded(programs || []);
      } catch (error) {
        console.error('Error en la consulta:', error);
      }
    };

    fetchPrograms();
  }, [onProgramsLoaded, supabase]);

  return null;
}

export default ProgramQuery;