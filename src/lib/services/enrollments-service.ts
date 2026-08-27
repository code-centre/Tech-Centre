import type { ServiceClient } from '@/lib/services/cohorts-service';

export interface EnrollmentSummary {
  id: number;
  student_id: string;
  cohort_id: number;
  status: string;
  agreed_price: number | null;
  created_at: string;
}

export async function listEnrollments(
  client: ServiceClient,
  options?: { cohortId?: number; studentId?: string }
): Promise<EnrollmentSummary[]> {
  let query = client
    .from('enrollments')
    .select('id, student_id, cohort_id, status, agreed_price, created_at')
    .order('created_at', { ascending: false });

  if (options?.cohortId) {
    query = query.eq('cohort_id', options.cohortId);
  }

  if (options?.studentId) {
    query = query.eq('student_id', options.studentId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as EnrollmentSummary[];
}

export interface EnrollStudentInput {
  student_id: string;
  cohort_id: number;
  agreed_price?: number | null;
  status?: string;
}

export async function enrollStudent(client: ServiceClient, input: EnrollStudentInput) {
  const { data, error } = await (client as any)
    .from('enrollments')
    .insert({
      student_id: input.student_id,
      cohort_id: input.cohort_id,
      agreed_price: input.agreed_price ?? null,
      status: input.status ?? 'pending_payment',
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}
