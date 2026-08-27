'use server';

import { createClient } from '@/lib/supabase/server';

export interface UpdateProfileInput {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  professional_title: string | null;
  linkedin_url: string | null;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Updates a user profile. Only admins can change the role field.
 * Instructors can update other fields but not role.
 */
export async function updateProfileAdmin(input: UpdateProfileInput): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return { success: false, error: 'No autenticado' };
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', authUser.id)
    .single();

  const callerRole = (callerProfile as { role?: string } | null)?.role;
  const isAdmin = callerRole === 'admin';
  const isInstructor = callerRole === 'instructor';

  if (!isAdmin && !isInstructor) {
    return { success: false, error: 'Sin permisos para editar perfiles' };
  }

  if (isInstructor && !isAdmin) {
    const { data: cohortLinks, error: cohortLinksError } = await supabase
      .from('cohort_instructors')
      .select('cohort_id')
      .eq('instructor_id', authUser.id);

    if (cohortLinksError) {
      return { success: false, error: cohortLinksError.message };
    }

    const cohortIds = ((cohortLinks ?? []) as { cohort_id: number }[]).map(
      (row) => row.cohort_id
    );
    if (cohortIds.length === 0) {
      return { success: false, error: 'Sin cohortes asignadas' };
    }

    const { data: studentEnrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', input.user_id)
      .in('cohort_id', cohortIds)
      .limit(1)
      .maybeSingle();

    if (enrollmentError) {
      return { success: false, error: enrollmentError.message };
    }

    if (!studentEnrollment) {
      return { success: false, error: 'Solo puedes editar estudiantes de tus cohortes' };
    }
  }

  // Only admins can change the role field
  const updatePayload = {
    first_name: input.first_name.trim(),
    last_name: input.last_name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    professional_title: input.professional_title?.trim() || null,
    linkedin_url: input.linkedin_url?.trim() || null,
    updated_at: new Date().toISOString(),
    ...(isAdmin && { role: input.role }),
  };

  const { error } = await (supabase as any)
    .from('profiles')
    .update(updatePayload)
    .eq('user_id', input.user_id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
