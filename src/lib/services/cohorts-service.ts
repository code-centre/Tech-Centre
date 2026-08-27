import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export type ServiceClient = SupabaseClient<Database>;

export interface CohortSummary {
  id: number;
  name: string | null;
  slug: string | null;
  offering: boolean | null;
  start_date: string | null;
  end_date: string | null;
  program_id: string | null;
}

export async function listCohorts(
  client: ServiceClient,
  options?: { activeOnly?: boolean }
): Promise<CohortSummary[]> {
  let query = (client as any)
    .from('cohorts')
    .select('id, name, slug, offering, start_date, end_date, program_id')
    .order('start_date', { ascending: true });

  // The live `cohorts` table has no `status` column, so "active" is derived
  // from real columns: it is currently being offered, or today falls within
  // the cohort's start/end date range.
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
  return data;
}

export interface CreateCohortInput {
  name: string;
  program_id: string;
  slug?: string | null;
  offering?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  modality?: string | null;
  campus?: string | null;
  capacity?: number | null;
}

export async function createCohort(client: ServiceClient, input: CreateCohortInput) {
  // The live `cohorts` table has no `status` column, so it is intentionally
  // omitted from the insert payload.
  const { data, error } = await (client as any)
    .from('cohorts')
    .insert({
      name: input.name,
      program_id: input.program_id,
      slug: input.slug ?? null,
      offering: input.offering ?? false,
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
      modality: input.modality ?? null,
      campus: input.campus ?? null,
      capacity: input.capacity ?? null,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCohort(
  client: ServiceClient,
  cohortId: number,
  input: Partial<CreateCohortInput>
) {
  // Strip any fields that do not exist on the live `cohorts` table (e.g.
  // `status`) so updates align with the real schema.
  const { status: _status, ...allowed } = input as Partial<CreateCohortInput> & {
    status?: unknown;
  };

  const { data, error } = await (client as any)
    .from('cohorts')
    .update(allowed)
    .eq('id', cohortId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}
