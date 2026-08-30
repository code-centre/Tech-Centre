import type { ServiceClient } from '@/lib/services/cohorts-service';

/** Valores de `stage` usados en formularios y admin. */
export type LeadStage = 'diagnostico' | 'apartar' | 'dudas' | 'pagos' | 'confirmar';

export interface LeadNotes {
  program?: string;
  message?: string;
  source?: string;
  moduleName?: string;
  routeName?: string;
  metadata?: Record<string, unknown>;
}

export interface Lead {
  id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  stage: string | null;
  notes: string | null;
  interested_program_id: number | null;
  created_at: string;
}

export interface LeadSummary {
  id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  stage: string | null;
  interested_program_id: number | null;
  created_at: string;
}

const LEAD_LIST_COLUMNS =
  'id, full_name, email, phone, source, stage, interested_program_id, created_at';

export interface ListLeadsOptions {
  source?: string;
  sourcePrefix?: string;
  stage?: string;
  email?: string;
  interestedProgramId?: number;
  limit?: number;
}

export interface LeadFieldsInput {
  full_name?: string;
  email?: string;
  phone?: string | null;
  source?: string;
  stage?: LeadStage | string;
  interested_program_id?: number | null;
  notes?: LeadNotes | null;
}

export interface CreateLeadInput extends LeadFieldsInput {
  full_name: string;
  email: string;
}

export interface UpdateLeadInput extends LeadFieldsInput {}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone?: string | null): string | null {
  if (phone == null || phone === '') return null;
  const digits = phone.replace(/\D/g, '');
  return digits || null;
}

function serializeNotes(notes?: LeadNotes | null): string | null | undefined {
  if (notes === undefined) return undefined;
  if (notes === null) return null;
  return JSON.stringify(notes);
}

function buildLeadRecord(input: LeadFieldsInput): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  if (input.full_name !== undefined) {
    const name = input.full_name.trim();
    if (!name) throw new Error('full_name cannot be empty');
    record.full_name = name;
  }

  if (input.email !== undefined) {
    const email = normalizeEmail(input.email);
    if (!email.includes('@')) throw new Error('email is invalid');
    record.email = email;
  }

  if (input.phone !== undefined) {
    record.phone = normalizePhone(input.phone);
  }

  if (input.source !== undefined) {
    const source = input.source.trim();
    if (!source) throw new Error('source cannot be empty');
    record.source = source;
  }

  if (input.stage !== undefined) {
    record.stage = input.stage || null;
  }

  if (input.interested_program_id !== undefined) {
    record.interested_program_id = input.interested_program_id;
  }

  const notesJson = serializeNotes(input.notes);
  if (notesJson !== undefined) {
    record.notes = notesJson;
  }

  return record;
}

export async function listLeads(
  client: ServiceClient,
  options?: ListLeadsOptions
): Promise<LeadSummary[]> {
  let query = (client as any)
    .from('leads')
    .select(LEAD_LIST_COLUMNS)
    .order('created_at', { ascending: false });

  if (options?.source) {
    query = query.eq('source', options.source);
  } else if (options?.sourcePrefix) {
    query = query.like('source', `${options.sourcePrefix}%`);
  }

  if (options?.stage) {
    query = query.eq('stage', options.stage);
  }

  if (options?.email) {
    query = query.eq('email', normalizeEmail(options.email));
  }

  if (options?.interestedProgramId !== undefined) {
    query = query.eq('interested_program_id', options.interestedProgramId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as LeadSummary[];
}

export async function getLead(client: ServiceClient, leadId: number): Promise<Lead> {
  const { data, error } = await (client as any)
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (error) throw new Error(error.message);
  return data as Lead;
}

export async function createLead(client: ServiceClient, input: CreateLeadInput) {
  const record = buildLeadRecord({
    ...input,
    full_name: input.full_name,
    email: input.email,
    source: input.source ?? 'mcp_manual',
    stage: input.stage ?? 'dudas',
  });

  const { data, error } = await (client as any)
    .from('leads')
    .insert(record)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Lead;
}

export async function updateLead(
  client: ServiceClient,
  leadId: number,
  input: UpdateLeadInput
) {
  const record = buildLeadRecord(input);

  if (Object.keys(record).length === 0) {
    throw new Error('No fields to update');
  }

  const { data, error } = await (client as any)
    .from('leads')
    .update(record)
    .eq('id', leadId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Lead;
}

/** Resuelve `programs.id` por nombre (para vincular interés al crear/actualizar). */
export async function resolveProgramIdForLead(
  client: ServiceClient,
  programName?: string | null
): Promise<number | null> {
  const name = programName?.trim();
  if (!name) return null;

  const { data, error } = await client
    .from('programs')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as { id: number } | null)?.id ?? null;
}
