import type { ServiceClient } from '@/lib/services/cohorts-service';
import { generateSlug } from '@/../utils/generateSlug';

export interface ProgramSummary {
  id: number;
  name: string | null;
  code: string | null;
  kind: string | null;
  difficulty: string | null;
  default_price: number | null;
  total_hours: number | null;
}

const PROGRAM_SUMMARY_COLUMNS =
  'id, name, code, kind, difficulty, default_price, total_hours';

export async function listPrograms(
  client: ServiceClient,
  options?: { kind?: string; difficulty?: string }
): Promise<ProgramSummary[]> {
  let query = client
    .from('programs')
    .select(PROGRAM_SUMMARY_COLUMNS)
    .order('id', { ascending: true });

  if (options?.kind) {
    query = query.eq('kind', options.kind);
  }

  if (options?.difficulty) {
    query = query.eq('difficulty', options.difficulty);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ProgramSummary[];
}

export interface CreateProgramInput {
  name: string;
  subtitle?: string | null;
  description?: string | null;
  kind?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  total_hours?: number | null;
  default_price?: number | null;
}

/**
 * Derive a unique `code` slug from the program name, mirroring the admin modal
 * (ProgramCreationModal) which slugifies the name. The modal rejects a
 * collision; here we append a numeric suffix so the tool can be used
 * unattended without failing on near-duplicate names.
 */
async function generateUniqueProgramCode(
  client: ServiceClient,
  name: string
): Promise<string> {
  const base = generateSlug(name) || 'programa';

  let candidate = base;
  let attempt = 1;

  // Bounded loop: keep trying suffixes until we find a free code.
  while (attempt < 1000) {
    const { data, error } = await client
      .from('programs')
      .select('code')
      .eq('code', candidate)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return candidate;

    attempt += 1;
    candidate = `${base}-${attempt}`;
  }

  throw new Error('Could not generate a unique program code');
}

export async function createProgram(client: ServiceClient, input: CreateProgramInput) {
  const code = await generateUniqueProgramCode(client, input.name);
  const now = new Date().toISOString();

  const { data, error } = await (client as any)
    .from('programs')
    .insert({
      name: input.name.trim(),
      subtitle: input.subtitle?.trim() || null,
      description: input.description?.trim() || null,
      code,
      kind: (input.kind ?? 'diplomado').toLowerCase(),
      difficulty: input.difficulty ?? 'beginner',
      total_hours: input.total_hours ?? 0,
      default_price: input.default_price ?? 0,
      syllabus: {},
      image: null,
      schedule: null,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}
