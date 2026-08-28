import type { SupabaseClient } from '@supabase/supabase-js';
import { sendEnrollmentConfirmedEmail } from '@/lib/email/enrollment-emails';

interface EnrollmentRow {
  id: number;
  student_id: string;
  status: string;
}

/**
 * Marks enrollment as enrolled (if needed), promotes lead→student, sends welcome email once.
 * Returns whether enrollment was newly confirmed.
 */
export async function confirmEnrollmentPaid(
  supabase: SupabaseClient,
  enrollmentId: number,
  paidAt?: string,
): Promise<{ newlyEnrolled: boolean; error?: string }> {
  const timestamp = paidAt ?? new Date().toISOString();

  const { data: enrollmentData, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id, student_id, status')
    .eq('id', enrollmentId)
    .single();

  if (enrollmentError || !enrollmentData) {
    return { newlyEnrolled: false, error: 'Enrollment not found' };
  }

  const enrollment = enrollmentData as EnrollmentRow;
  const wasAlreadyEnrolled = enrollment.status === 'enrolled';

  if (!wasAlreadyEnrolled) {
    const { error: enrollmentUpdateError } = await supabase
      .from('enrollments')
      .update({ status: 'enrolled', updated_at: timestamp })
      .eq('id', enrollment.id);

    if (enrollmentUpdateError) {
      console.error('[enrollment] update error:', enrollmentUpdateError);
      return { newlyEnrolled: false, error: enrollmentUpdateError.message };
    }

    await supabase
      .from('profiles')
      .update({ role: 'student', updated_at: timestamp })
      .eq('user_id', enrollment.student_id)
      .eq('role', 'lead');
  }

  if (!wasAlreadyEnrolled) {
    try {
      await sendEnrollmentConfirmedEmail(enrollment.id);
    } catch (emailErr) {
      console.warn('[enrollment] welcome email failed:', emailErr);
    }
    return { newlyEnrolled: true };
  }

  return { newlyEnrolled: false };
}

/**
 * After an invoice is marked paid: if it is the first installment, confirm enrollment.
 */
export async function handleInvoicePaidForEnrollment(
  supabase: SupabaseClient,
  invoice: {
    id: number;
    enrollment_id: number;
    meta?: Record<string, unknown> | null;
  },
): Promise<void> {
  const paymentNumber = Number(invoice.meta?.payment_number ?? 1);
  if (paymentNumber !== 1) return;

  await confirmEnrollmentPaid(supabase, invoice.enrollment_id);
}
