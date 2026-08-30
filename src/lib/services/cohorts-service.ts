import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export type ServiceClient = SupabaseClient<Database>;

export interface CohortSchedule {
  days: string[];
  hours: string[];
}

/** Campos editables de `cohorts`, alineados con el admin. */
export interface CohortFieldsInput {
  slug?: string | null;
  offering?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  modality?: string | null;
  campus?: string | null;
  capacity?: number | null;
  maximum_payments?: number | null;
  schedule?: CohortSchedule | null;
}

export interface CreateCohortInput extends CohortFieldsInput {
  name: string;
  program_id: string;
  /** UUID del instructor principal; null explícito = sin instructor. */
  instructor_id?: string | null;
}

export interface UpdateCohortInput extends CohortFieldsInput {
  name?: string;
  program_id?: string;
  instructor_id?: string | null;
}

export interface CohortSummary extends CohortFieldsInput {
  id: number;
  name: string | null;
  program_id: string | null;
}

// The live `cohorts` table has no `created_at`/`updated_at` columns, so they
// are intentionally excluded from the selected columns (they would otherwise
// fail with a schema-cache error).
const COHORT_LIST_COLUMNS =
  'id, name, slug, offering, start_date, end_date, program_id, modality, campus, capacity, maximum_payments, schedule';

const TEXT_FIELDS = ['slug', 'modality', 'campus'] as const;
const DATE_FIELDS = ['start_date', 'end_date'] as const;
const NUMBER_FIELDS = ['capacity', 'maximum_payments'] as const;

function buildCohortRecord(input: CohortFieldsInput): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  for (const field of TEXT_FIELDS) {
    const value = input[field];
    if (value === undefined) continue;
    record[field] = typeof value === 'string' ? value.trim() || null : value;
  }

  for (const field of DATE_FIELDS) {
    if (input[field] !== undefined) record[field] = input[field] || null;
  }

  for (const field of NUMBER_FIELDS) {
    if (input[field] !== undefined) record[field] = input[field];
  }

  if (input.offering !== undefined) record.offering = input.offering;
  if (input.schedule !== undefined) record.schedule = input.schedule;

  return record;
}

async function syncCohortInstructor(
  client: ServiceClient,
  cohortId: number,
  instructorId: string | null | undefined
) {
  if (instructorId === undefined) return;

  await (client as any).from('cohort_instructors').delete().eq('cohort_id', cohortId);

  if (instructorId) {
    const { error } = await (client as any).from('cohort_instructors').insert({
      cohort_id: cohortId,
      instructor_id: instructorId,
      role: 'instructor',
    });
    if (error) throw new Error(error.message);
  }
}

async function getCohortInstructorId(
  client: ServiceClient,
  cohortId: number
): Promise<string | null> {
  const { data, error } = await (client as any)
    .from('cohort_instructors')
    .select('instructor_id')
    .eq('cohort_id', cohortId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.instructor_id as string | undefined) ?? null;
}

export async function listCohorts(
  client: ServiceClient,
  options?: { activeOnly?: boolean }
): Promise<CohortSummary[]> {
  let query = (client as any)
    .from('cohorts')
    .select(COHORT_LIST_COLUMNS)
    .order('start_date', { ascending: true });

  if (options?.activeOnly) {
    const today = new Date().toISOString().slice(0, 10);
    query = query.or(
      `offering.eq.true,and(start_date.lte.${today},end_date.gte.${today})`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as CohortSummary[];
}

export async function getCohort(client: ServiceClient, cohortId: number) {
  const { data, error } = await client
    .from('cohorts')
    .select('*')
    .eq('id', cohortId)
    .single();

  if (error) throw new Error(error.message);

  const instructor_id = await getCohortInstructorId(client, cohortId);
  return { ...(data as Record<string, unknown>), instructor_id };
}

export async function createCohort(client: ServiceClient, input: CreateCohortInput) {
  const { instructor_id, ...fields } = input;

  // The live `cohorts` table has no `created_at`/`updated_at` columns, so they
  // are intentionally omitted from the insert payload.
  const { data, error } = await (client as any)
    .from('cohorts')
    .insert({
      offering: false,
      maximum_payments: 1,
      schedule: { days: [], hours: [] },
      ...buildCohortRecord(fields),
      name: input.name.trim(),
      program_id: input.program_id,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  await syncCohortInstructor(client, data.id as number, instructor_id ?? null);

  const resolvedInstructorId = await getCohortInstructorId(client, data.id as number);
  return { ...data, instructor_id: resolvedInstructorId };
}

export async function updateCohort(
  client: ServiceClient,
  cohortId: number,
  input: UpdateCohortInput
) {
  const { instructor_id, name, program_id, ...fields } = input;

  const record = buildCohortRecord(fields);

  if (name !== undefined) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('name cannot be empty');
    record.name = trimmed;
  }
  if (program_id !== undefined) {
    if (!program_id.trim()) throw new Error('program_id cannot be empty');
    record.program_id = program_id;
  }

  if (Object.keys(record).length === 0 && instructor_id === undefined) {
    throw new Error('No fields to update');
  }

  let data = null;

  if (Object.keys(record).length > 0) {
    // The live `cohorts` table has no `updated_at` column, so we do not set it
    // here; writing it fails with a schema-cache error.
    const { data: updated, error } = await (client as any)
      .from('cohorts')
      .update(record)
      .eq('id', cohortId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    data = updated;
  } else {
    const { data: existing, error } = await client
      .from('cohorts')
      .select('*')
      .eq('id', cohortId)
      .single();
    if (error) throw new Error(error.message);
    data = existing;
  }

  await syncCohortInstructor(client, cohortId, instructor_id);

  const resolvedInstructorId = await getCohortInstructorId(client, cohortId);
  return { ...data, instructor_id: resolvedInstructorId };
}
