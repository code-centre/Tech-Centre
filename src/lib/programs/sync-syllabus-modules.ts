import type { ServiceClient } from '@/lib/services/cohorts-service';
import type { SyllabusData } from '@/types/programs';
import type { ProgramModule } from '@/types/supabase';

function moduleTopics(module: ProgramModule): string[] {
  const content = module.content as { topics?: string[] } | null;
  return content?.topics ?? [];
}

/** Map `program_modules` rows to the `programs.syllabus` jsonb shape. */
export function buildSyllabusFromModules(modules: ProgramModule[]): SyllabusData {
  return {
    modules: [...modules]
      .sort((a, b) => a.order_index - b.order_index)
      .map((module) => ({
        id: module.id,
        title: module.name,
        topics: moduleTopics(module),
      })),
  };
}

type ModuleInsertRow = {
  program_id: number;
  name: string;
  order_index: number;
  hours: number | null;
  content: { topics: string[] } | null;
};

/** Map syllabus modules to rows ready for `program_modules` insert. */
export function buildModuleRowsFromSyllabus(
  programId: number,
  syllabus: SyllabusData
): ModuleInsertRow[] {
  return (syllabus.modules ?? []).map((module, index) => ({
    program_id: programId,
    name: module.title,
    order_index: index,
    hours: null,
    content: module.topics?.length ? { topics: module.topics } : null,
  }));
}

/** Admin / module CRUD path: persist syllabus jsonb from current module rows. */
export async function syncSyllabusFromModules(
  client: ServiceClient,
  programId: number,
  modules: ProgramModule[]
): Promise<SyllabusData> {
  const syllabus = buildSyllabusFromModules(modules);
  const now = new Date().toISOString();

  const { error } = await (client as any)
    .from('programs')
    .update({
      syllabus,
      updated_at: now,
    })
    .eq('id', programId);

  if (error) throw new Error(error.message);
  return syllabus;
}

/**
 * MCP / syllabus write path: replace all `program_modules` for a program, then
 * rewrite `programs.syllabus` from inserted rows so module ids stay aligned.
 */
export async function syncModulesFromSyllabus(
  client: ServiceClient,
  programId: number,
  syllabus: SyllabusData
): Promise<{ modules: ProgramModule[]; syllabus: SyllabusData }> {
  const { error: deleteError } = await (client as any)
    .from('program_modules')
    .delete()
    .eq('program_id', programId);

  if (deleteError) throw new Error(deleteError.message);

  const rows = buildModuleRowsFromSyllabus(programId, syllabus);
  let insertedModules: ProgramModule[] = [];

  if (rows.length > 0) {
    const { data, error: insertError } = await (client as any)
      .from('program_modules')
      .insert(rows)
      .select('*');

    if (insertError) throw new Error(insertError.message);
    insertedModules = (data ?? []) as ProgramModule[];
  }

  const syncedSyllabus = buildSyllabusFromModules(insertedModules);
  const now = new Date().toISOString();

  const { error: updateError } = await (client as any)
    .from('programs')
    .update({
      syllabus: syncedSyllabus,
      updated_at: now,
    })
    .eq('id', programId);

  if (updateError) throw new Error(updateError.message);

  return { modules: insertedModules, syllabus: syncedSyllabus };
}

export type SyncProgramSyllabusSource =
  | { direction: 'modules-to-syllabus'; modules: ProgramModule[] }
  | { direction: 'syllabus-to-modules'; syllabus: SyllabusData };

/** Single entry point for both sync directions. */
export async function syncProgramSyllabusAndModules(
  client: ServiceClient,
  programId: number,
  source: SyncProgramSyllabusSource
): Promise<{ modules?: ProgramModule[]; syllabus: SyllabusData }> {
  if (source.direction === 'modules-to-syllabus') {
    const syllabus = await syncSyllabusFromModules(client, programId, source.modules);
    return { syllabus };
  }

  return syncModulesFromSyllabus(client, programId, source.syllabus);
}
