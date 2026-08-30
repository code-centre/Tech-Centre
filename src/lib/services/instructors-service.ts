import type { ServiceClient } from '@/lib/services/cohorts-service';

export interface InstructorSummary {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
}

export interface CohortInstructorAssignment {
  cohort_id: number;
  instructor_id: string;
  role: string;
  created_at?: string;
}

const INSTRUCTOR_COLUMNS =
  'user_id, first_name, last_name, email, phone, role, created_at';

export async function listInstructors(client: ServiceClient): Promise<InstructorSummary[]> {
  const { data, error } = await client
    .from('profiles')
    .select(INSTRUCTOR_COLUMNS)
    .in('role', ['instructor'])
    .order('first_name', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as InstructorSummary[];
}

export async function getInstructor(client: ServiceClient, instructorId: string) {
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('*')
    .eq('user_id', instructorId)
    .single();

  if (profileError) throw new Error(profileError.message);

  const { data: assignments, error: assignError } = await (client as any)
    .from('cohort_instructors')
    .select('cohort_id, instructor_id, role, created_at')
    .eq('instructor_id', instructorId);

  if (assignError) throw new Error(assignError.message);

  return {
    ...(profile as Record<string, unknown>),
    cohort_assignments: (assignments ?? []) as CohortInstructorAssignment[],
  };
}

export async function listCohortInstructors(
  client: ServiceClient,
  options?: { cohortId?: number; instructorId?: string }
) {
  let query = (client as any)
    .from('cohort_instructors')
    .select(
      'cohort_id, instructor_id, role, created_at, profile:profiles!instructor_id(user_id, first_name, last_name, email), cohort:cohorts!cohort_id(id, name, program_id)'
    );

  if (options?.cohortId !== undefined) {
    query = query.eq('cohort_id', options.cohortId);
  }
  if (options?.instructorId) {
    query = query.eq('instructor_id', options.instructorId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function assignCohortInstructor(
  client: ServiceClient,
  input: {
    cohort_id: number;
    instructor_id: string;
    role?: string;
  }
) {
  const { error } = await (client as any).from('cohort_instructors').upsert(
    {
      cohort_id: input.cohort_id,
      instructor_id: input.instructor_id,
      role: input.role ?? 'instructor',
    },
    { onConflict: 'cohort_id,instructor_id' }
  );

  if (error) throw new Error(error.message);

  const { data, error: fetchError } = await (client as any)
    .from('cohort_instructors')
    .select('*')
    .eq('cohort_id', input.cohort_id)
    .eq('instructor_id', input.instructor_id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  return data;
}

export async function removeCohortInstructor(
  client: ServiceClient,
  cohortId: number,
  instructorId: string
) {
  const { error } = await (client as any)
    .from('cohort_instructors')
    .delete()
    .eq('cohort_id', cohortId)
    .eq('instructor_id', instructorId);

  if (error) throw new Error(error.message);
  return { removed: true };
}
