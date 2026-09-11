import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/auth/require-role';
import { syncModulesFromSyllabus } from '@/lib/programs/sync-syllabus-modules';
import { createClient } from '@/lib/supabase/server';
import type { SyllabusData } from '@/types/programs';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  const authResult = await requireApiRole(['admin']);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { programId: programIdParam } = await params;
  const programId = parseInt(programIdParam, 10);
  if (Number.isNaN(programId)) {
    return NextResponse.json({ error: 'programId inválido' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: program, error: programError } = await (supabase as any)
    .from('programs')
    .select('syllabus')
    .eq('id', programId)
    .single();

  if (programError || !program) {
    return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 });
  }

  const syllabus = ((program as { syllabus?: SyllabusData }).syllabus ?? {
    modules: [],
  }) as SyllabusData;
  if (!syllabus.modules?.length) {
    return NextResponse.json({ error: 'El programa no tiene temario en syllabus' }, { status: 400 });
  }

  try {
    const result = await syncModulesFromSyllabus(supabase, programId, syllabus);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al sincronizar módulos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
