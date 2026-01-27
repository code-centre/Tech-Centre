// app/admin/programas/[program_id]/page.tsx
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import CohortList from '@/components/adminspage/CohortList'
import ProgramDetails from '@/components/adminspage/ProgramDetails'
import type { Program } from '@/types/programs'

export const metadata: Metadata = {
  title: 'Detalles del Programa',
}

interface Props {
  params: Promise<{ program_id: string }>
}


export default async function ProgramPage({ params }: Props) {
  const { program_id } = await params
  const supabase = await createClient()


  // Obtener datos del programa
  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('id', program_id)
    .single()

  // Obtener sesión
  const { data: { session } } = await supabase.auth.getSession()

  // Si no hay programa, mostrar 404
  if (!program) {
    return <div>Programa no encontrado</div>
  }

  // Tipar el programa correctamente
  const typedProgram = program as unknown as Program

  // Obtener cohortes
  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('*')
    .eq('program_id', program_id)

  // En tu archivo [program_id]/page.tsx
    console.log('Datos del programa:', typedProgram);
    console.log('Cohortes:', cohorts);

  return (
    <div className="space-y-8 mt-32"> 
        <div className="bg-bgCard text-center p-6 rounded-lg shadow mt-10 border-2 border-zuccini">
            <h1 className="text-2xl font-bold text-zuccini mb-2">Programa:  {typedProgram.name}</h1>
        </div>
      <CohortList 
        cohorts={cohorts || []} 
        programId={program_id} 
      />
      <ProgramDetails program={typedProgram} />
    </div>
  );
}