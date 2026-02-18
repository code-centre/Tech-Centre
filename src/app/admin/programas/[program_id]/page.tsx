// app/admin/programas/[program_id]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import CohortList from '@/components/adminspage/CohortList';
import ProgramDetails from '@/components/adminspage/ProgramDetails';
import ProgramHeader from '@/components/adminspage/ProgramHeader';
import ProgramModulesList from '@/components/adminspage/ProgramModulesList';
import type { Program } from '@/types/programs';
import type { ProgramModule } from '@/types/supabase';

export const metadata: Metadata = {
  title: 'Detalles del Programa',
};

interface Props {
  params: Promise<{ program_id: string }>;
}

export default async function ProgramPage({ params }: Props) {
  const { program_id } = await params;
  const supabase = await createClient();

  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('id', program_id)
    .single();

  if (!program) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Programa no encontrado</h1>
        <p className="text-text-muted mb-4">
          El programa que buscas no existe o fue eliminado.
        </p>
        <Link
          href="/admin/programas"
          className="btn-primary inline-flex items-center gap-2"
        >
          Volver a programas
        </Link>
      </div>
    );
  }

  const typedProgram = program as unknown as Program;

  const [{ data: cohorts }, { data: modules }] = await Promise.all([
    supabase.from('cohorts').select('*').eq('program_id', program_id),
    supabase
      .from('program_modules')
      .select('*')
      .eq('program_id', program_id)
      .order('order_index', { ascending: true }),
  ]);

  return (
    <div className="space-y-8">
      <ProgramHeader program={typedProgram} />
      <CohortList cohorts={cohorts || []} programId={program_id} />
      <ProgramModulesList
        programId={program_id}
        modules={(modules as ProgramModule[]) || []}
        syllabus={typedProgram.syllabus}
      />
      <ProgramDetails program={typedProgram} />
    </div>
  );
}