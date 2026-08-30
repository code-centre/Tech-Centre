import type { ServiceClient } from '@/lib/services/cohorts-service';
import type { PayMode } from '@/lib/instructorPay';

export interface InstructorRateRecord {
  instructor_id: string;
  cohort_id: number;
  mode: PayMode;
  amount: number;
  requires_attendance: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InstructorPaymentRecord {
  id: number;
  instructor_id: string;
  cohort_id: number;
  concept: string;
  amount: number;
  period_start: string;
  period_end: string;
  session_count: number;
  status: 'pending' | 'paid';
  paid_at: string | null;
  method: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SetInstructorRateInput {
  instructor_id: string;
  cohort_id: number;
  mode: PayMode;
  amount: number;
  requires_attendance?: boolean;
}

export interface RecordInstructorPaymentInput {
  instructor_id: string;
  cohort_id: number;
  concept: string;
  amount: number;
  period_start: string;
  period_end: string;
  session_count?: number;
  status?: 'pending' | 'paid';
  paid_at?: string | null;
  method?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface UpdateInstructorPaymentInput {
  concept?: string;
  amount?: number;
  period_start?: string;
  period_end?: string;
  session_count?: number;
  status?: 'pending' | 'paid';
  paid_at?: string | null;
  method?: string | null;
  notes?: string | null;
}

export async function listInstructorRates(
  client: ServiceClient,
  options?: { instructorId?: string; cohortId?: number }
) {
  let query = (client as any).from('instructor_rates').select('*');

  if (options?.instructorId) query = query.eq('instructor_id', options.instructorId);
  if (options?.cohortId !== undefined) query = query.eq('cohort_id', options.cohortId);

  const { data, error } = await query.order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as InstructorRateRecord[];
}

export async function setInstructorRate(client: ServiceClient, input: SetInstructorRateInput) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('amount must be greater than zero');
  }

  const { data, error } = await (client as any)
    .from('instructor_rates')
    .upsert(
      {
        instructor_id: input.instructor_id,
        cohort_id: input.cohort_id,
        mode: input.mode,
        amount: input.amount,
        requires_attendance: input.requires_attendance ?? true,
      },
      { onConflict: 'instructor_id,cohort_id' }
    )
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as InstructorRateRecord;
}

export async function listInstructorPayments(
  client: ServiceClient,
  options?: {
    instructorId?: string;
    cohortId?: number;
    status?: 'pending' | 'paid';
    limit?: number;
  }
) {
  let query = (client as any).from('instructor_payments').select('*');

  if (options?.instructorId) query = query.eq('instructor_id', options.instructorId);
  if (options?.cohortId !== undefined) query = query.eq('cohort_id', options.cohortId);
  if (options?.status) query = query.eq('status', options.status);

  query = query.order('period_start', { ascending: false });
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as InstructorPaymentRecord[];
}

export async function getInstructorPayment(client: ServiceClient, paymentId: number) {
  const { data, error } = await (client as any)
    .from('instructor_payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (error) throw new Error(error.message);
  return data as InstructorPaymentRecord;
}

export async function recordInstructorPayment(
  client: ServiceClient,
  input: RecordInstructorPaymentInput
) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('amount must be greater than zero');
  }
  if (!input.period_start || !input.period_end) {
    throw new Error('period_start and period_end are required');
  }

  const status = input.status ?? 'paid';
  const paidAt =
    status === 'paid' ? input.paid_at ?? new Date().toISOString() : input.paid_at ?? null;

  const { data, error } = await (client as any)
    .from('instructor_payments')
    .upsert(
      {
        instructor_id: input.instructor_id,
        cohort_id: input.cohort_id,
        concept: input.concept.trim(),
        amount: input.amount,
        period_start: input.period_start,
        period_end: input.period_end,
        session_count: input.session_count ?? 0,
        status,
        paid_at: paidAt,
        method: input.method ?? null,
        notes: input.notes ?? null,
        created_by: input.created_by ?? null,
      },
      { onConflict: 'instructor_id,cohort_id,period_start,period_end' }
    )
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as InstructorPaymentRecord;
}

export async function updateInstructorPayment(
  client: ServiceClient,
  paymentId: number,
  input: UpdateInstructorPaymentInput
) {
  const record: Record<string, unknown> = {};

  if (input.concept !== undefined) record.concept = input.concept.trim();
  if (input.amount !== undefined) {
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error('amount must be greater than zero');
    }
    record.amount = input.amount;
  }
  if (input.period_start !== undefined) record.period_start = input.period_start;
  if (input.period_end !== undefined) record.period_end = input.period_end;
  if (input.session_count !== undefined) record.session_count = input.session_count;
  if (input.status !== undefined) record.status = input.status;
  if (input.paid_at !== undefined) record.paid_at = input.paid_at;
  if (input.method !== undefined) record.method = input.method;
  if (input.notes !== undefined) record.notes = input.notes;

  if (input.status === 'paid' && input.paid_at === undefined && !record.paid_at) {
    record.paid_at = new Date().toISOString();
  }

  if (Object.keys(record).length === 0) {
    throw new Error('No fields to update');
  }

  const { data, error } = await (client as any)
    .from('instructor_payments')
    .update(record)
    .eq('id', paymentId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as InstructorPaymentRecord;
}
