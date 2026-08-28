'use server';

import { createClient } from '@/lib/supabase/server';
import { confirmEnrollmentPaid } from '@/lib/payments/confirm-enrollment-paid';

export interface MarkInvoicePaidResult {
  success: boolean;
  error?: string;
  enrollmentConfirmed?: boolean;
}

export async function markInvoicePaidAdmin(
  invoiceId: number,
  payload: {
    status: 'paid';
    paid_at: string;
    meta: Record<string, unknown>;
    url_recipe?: string | null;
  },
): Promise<MarkInvoicePaidResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if ((profile as { role?: string } | null)?.role !== 'admin') {
    return { success: false, error: 'Sin permisos' };
  }

  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('id, enrollment_id, status, meta')
    .eq('id', invoiceId)
    .single();

  if (fetchError || !invoice) {
    return { success: false, error: 'Factura no encontrada' };
  }

  const inv = invoice as {
    id: number;
    enrollment_id: number;
    status: string;
    meta?: Record<string, unknown> | null;
  };
  const wasPending = inv.status !== 'paid';

  const { error: updateError } = await supabase
    .from('invoices')
    .update(payload as never)
    .eq('id', invoiceId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  if (wasPending) {
    const mergedMeta = { ...(inv.meta ?? {}), ...payload.meta };
    const paymentNumber = Number(mergedMeta.payment_number ?? 1);
    if (paymentNumber === 1) {
      const result = await confirmEnrollmentPaid(supabase, inv.enrollment_id, payload.paid_at);
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, enrollmentConfirmed: result.newlyEnrolled };
    }
  }

  return { success: true };
}
