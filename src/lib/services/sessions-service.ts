import type { ServiceClient } from '@/lib/services/cohorts-service';
import type { SessionMaterial } from '@/types/supabase';

export interface SessionFieldsInput {
  module_id?: number | null;
  title?: string | null;
  starts_at?: string;
  ends_at?: string;
  room?: string | null;
  materials?: SessionMaterial[] | null;
}

export interface CreateSessionInput extends SessionFieldsInput {
  cohort_id: number;
  starts_at: string;
  ends_at: string;
}

export interface UpdateSessionInput extends SessionFieldsInput {}

const SESSION_LIST_COLUMNS =
  'id, cohort_id, module_id, title, starts_at, ends_at, room, materials, created_at';

export async function listSessions(
  client: ServiceClient,
  options?: { cohortId?: number; from?: string; to?: string }
) {
  let query = (client as any)
    .from('sessions')
    .select(SESSION_LIST_COLUMNS)
    .order('starts_at', { ascending: true });

  if (options?.cohortId !== undefined) {
    query = query.eq('cohort_id', options.cohortId);
  }
  if (options?.from) {
    query = query.gte('starts_at', options.from);
  }
  if (options?.to) {
    query = query.lte('starts_at', options.to);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSession(client: ServiceClient, sessionId: number) {
  const { data, error } = await (client as any)
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

function buildSessionRecord(input: SessionFieldsInput): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  if (input.module_id !== undefined) record.module_id = input.module_id;
  if (input.title !== undefined) {
    record.title = typeof input.title === 'string' ? input.title.trim() || null : input.title;
  }
  if (input.starts_at !== undefined) record.starts_at = input.starts_at;
  if (input.ends_at !== undefined) record.ends_at = input.ends_at;
  if (input.room !== undefined) {
    record.room = typeof input.room === 'string' ? input.room.trim() || null : input.room;
  }
  if (input.materials !== undefined) record.materials = input.materials;

  return record;
}

export async function createSession(client: ServiceClient, input: CreateSessionInput) {
  if (new Date(input.ends_at) <= new Date(input.starts_at)) {
    throw new Error('ends_at must be after starts_at');
  }

  const { data, error } = await (client as any)
    .from('sessions')
    .insert({
      materials: [],
      ...buildSessionRecord(input),
      cohort_id: input.cohort_id,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSession(
  client: ServiceClient,
  sessionId: number,
  input: UpdateSessionInput
) {
  const record = buildSessionRecord(input);

  if (record.starts_at && record.ends_at) {
    if (new Date(String(record.ends_at)) <= new Date(String(record.starts_at))) {
      throw new Error('ends_at must be after starts_at');
    }
  }

  if (Object.keys(record).length === 0) {
    throw new Error('No fields to update');
  }

  const { data, error } = await (client as any)
    .from('sessions')
    .update(record)
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}
