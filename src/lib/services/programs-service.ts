import type { ServiceClient } from '@/lib/services/cohorts-service';
import { generateSlug } from '@/../utils/generateSlug';
import type {
  AudienceFit,
  Faq,
  FinalProject,
  Prerequisite,
  SyllabusData,
} from '@/types/programs';

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

/**
 * Todos los campos editables de `programs`, en el mismo formato en que se
 * guardan. Los campos ausentes (undefined) no se tocan; un string vacío se
 * normaliza a null, igual que hace el admin.
 */
export interface ProgramFieldsInput {
  subtitle?: string | null;
  description?: string | null;
  kind?: string;
  difficulty?: string;
  total_hours?: number | null;
  default_price?: number | null;
  discount?: number | null;
  currency?: string | null;
  duration?: string | null;
  schedule?: string | null;
  start_date?: string | null;
  video?: string | null;
  image?: string | null;
  audience?: string | null;
  slug?: string | null;
  faqs?: Faq[];
  syllabus?: SyllabusData;
  stack?: string[];
  includes?: string[];
  audience_fit?: AudienceFit;
  prerequisites?: Prerequisite[];
  final_project?: FinalProject;
}

export interface CreateProgramInput extends ProgramFieldsInput {
  name: string;
}

export interface UpdateProgramInput extends ProgramFieldsInput {
  name?: string;
  code?: string;
}

/**
 * The live `programs.difficulty` Postgres enum stores Spanish values. The MCP
 * tool schema keeps exposing English values (beginner/intermediate/advanced),
 * so map them to the Spanish enum members the database actually accepts.
 * Values already in Spanish pass through unchanged.
 */
function toSpanishDifficulty(difficulty?: string): string {
  switch (difficulty) {
    case 'beginner':
      return 'Principiante';
    case 'intermediate':
      return 'Intermedio';
    case 'advanced':
      return 'Avanzado';
    case 'Principiante':
    case 'Intermedio':
    case 'Avanzado':
      return difficulty;
    default:
      return 'Principiante';
  }
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

const TEXT_FIELDS = [
  'subtitle',
  'description',
  'currency',
  'duration',
  'schedule',
  'video',
  'image',
  'audience',
  'slug',
] as const;

const NUMBER_FIELDS = ['total_hours', 'default_price', 'discount'] as const;

const JSON_FIELDS = [
  'faqs',
  'syllabus',
  'stack',
  'includes',
  'audience_fit',
  'prerequisites',
  'final_project',
] as const;

/**
 * Traduce el input a un registro de `programs`, incluyendo únicamente los
 * campos que vienen definidos para que un update parcial no pise el resto.
 */
function buildProgramRecord(input: ProgramFieldsInput): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  for (const field of TEXT_FIELDS) {
    const value = input[field];
    if (value === undefined) continue;
    record[field] = typeof value === 'string' ? value.trim() || null : value;
  }

  for (const field of NUMBER_FIELDS) {
    if (input[field] !== undefined) record[field] = input[field];
  }

  for (const field of JSON_FIELDS) {
    if (input[field] !== undefined) record[field] = input[field];
  }

  if (input.start_date !== undefined) {
    record.start_date = input.start_date || null;
  }
  if (input.kind !== undefined) {
    record.kind = input.kind.trim().toLowerCase();
  }
  if (input.difficulty !== undefined) {
    record.difficulty = toSpanishDifficulty(input.difficulty);
  }

  return record;
}

export async function createProgram(client: ServiceClient, input: CreateProgramInput) {
  const code = await generateUniqueProgramCode(client, input.name);
  const now = new Date().toISOString();

  const { data, error } = await (client as any)
    .from('programs')
    .insert({
      // Defaults del programa recién creado; buildProgramRecord los
      // sobrescribe cuando el input trae el campo.
      kind: 'diplomado',
      difficulty: toSpanishDifficulty(undefined),
      total_hours: 0,
      default_price: 0,
      syllabus: {},
      image: null,
      ...buildProgramRecord(input),
      name: input.name.trim(),
      code,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProgram(
  client: ServiceClient,
  programId: number,
  input: UpdateProgramInput
) {
  const record = buildProgramRecord(input);

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error('name cannot be empty');
    record.name = name;
  }
  if (input.code !== undefined) {
    const code = input.code.trim();
    if (!code) throw new Error('code cannot be empty');
    record.code = code;
  }

  if (Object.keys(record).length === 0) {
    throw new Error('No fields to update');
  }

  record.updated_at = new Date().toISOString();

  const { data, error } = await (client as any)
    .from('programs')
    .update(record)
    .eq('id', programId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getProgram(client: ServiceClient, programId: number) {
  const { data, error } = await client
    .from('programs')
    .select('*')
    .eq('id', programId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
