/**
 * One-shot backfill: copy `programs.syllabus` into `program_modules` for programs
 * that have syllabus modules but zero module rows.
 *
 * Logic mirrors src/lib/programs/sync-syllabus-modules.ts (syncModulesFromSyllabus).
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/backfill-program-modules-from-syllabus.mjs
 *
 * Optional env:
 *   PROGRAM_IDS=13,14,15,16,17,18,19  — limit to specific program ids
 *   DRY_RUN=1                         — log actions without writing
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dryRun = process.env.DRY_RUN === '1';
const programIdsEnv = process.env.PROGRAM_IDS?.trim();

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function buildSyllabusFromModules(modules) {
  return {
    modules: [...modules]
      .sort((a, b) => a.order_index - b.order_index)
      .map((module) => ({
        id: module.id,
        title: module.name,
        topics: module.content?.topics ?? [],
      })),
  };
}

function buildModuleRowsFromSyllabus(programId, syllabus) {
  return (syllabus.modules ?? []).map((module, index) => ({
    program_id: programId,
    name: module.title,
    order_index: index,
    hours: null,
    content: module.topics?.length ? { topics: module.topics } : null,
  }));
}

async function syncModulesFromSyllabus(programId, syllabus) {
  if (dryRun) {
    console.log(`[dry-run] would sync program ${programId} (${syllabus.modules?.length ?? 0} modules)`);
    return;
  }

  const { error: deleteError } = await supabase
    .from('program_modules')
    .delete()
    .eq('program_id', programId);

  if (deleteError) throw new Error(deleteError.message);

  const rows = buildModuleRowsFromSyllabus(programId, syllabus);
  let insertedModules = [];

  if (rows.length > 0) {
    const { data, error: insertError } = await supabase
      .from('program_modules')
      .insert(rows)
      .select('*');

    if (insertError) throw new Error(insertError.message);
    insertedModules = data ?? [];
  }

  const syncedSyllabus = buildSyllabusFromModules(insertedModules);
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('programs')
    .update({ syllabus: syncedSyllabus, updated_at: now })
    .eq('id', programId);

  if (updateError) throw new Error(updateError.message);

  console.log(`✓ program ${programId}: ${insertedModules.length} modules synced`);
}

async function main() {
  let query = supabase.from('programs').select('id, name, syllabus').order('id');

  if (programIdsEnv) {
    const ids = programIdsEnv.split(',').map((id) => parseInt(id.trim(), 10)).filter(Boolean);
    query = query.in('id', ids);
  }

  const { data: programs, error } = await query;
  if (error) throw new Error(error.message);

  let candidates = 0;
  let synced = 0;

  for (const program of programs ?? []) {
    const syllabus = program.syllabus ?? { modules: [] };
    const moduleCount = syllabus.modules?.length ?? 0;
    if (moduleCount === 0) continue;

    const { count, error: countError } = await supabase
      .from('program_modules')
      .select('*', { count: 'exact', head: true })
      .eq('program_id', program.id);

    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) {
      console.log(`· program ${program.id} (${program.name}): already has ${count} modules — skip`);
      continue;
    }

    candidates += 1;
    await syncModulesFromSyllabus(program.id, syllabus);
    synced += 1;
  }

  console.log(`\nDone. ${synced}/${candidates} programs backfilled${dryRun ? ' (dry run)' : ''}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
