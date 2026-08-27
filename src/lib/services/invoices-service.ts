import type { ServiceClient } from '@/lib/services/cohorts-service';

export interface PaymentSummary {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export async function getPaymentSummary(
  client: ServiceClient,
  options?: { cohortId?: number; enrollmentId?: number }
): Promise<PaymentSummary> {
  let enrollmentIds: number[] | null = null;

  if (options?.enrollmentId) {
    enrollmentIds = [options.enrollmentId];
  } else if (options?.cohortId) {
    const { data: enrollments, error: enrollmentsError } = await client
      .from('enrollments')
      .select('id')
      .eq('cohort_id', options.cohortId);

    if (enrollmentsError) throw new Error(enrollmentsError.message);
    enrollmentIds = ((enrollments ?? []) as { id: number }[]).map((row) => row.id);
  }

  let query = client.from('invoices').select('amount, status');

  if (enrollmentIds) {
    if (enrollmentIds.length === 0) {
      return {
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      };
    }
    query = query.in('enrollment_id', enrollmentIds);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const invoices = (data ?? []) as { amount: number | null; status: string | null }[];
  const paid = invoices.filter((inv) => inv.status === 'paid');
  const pending = invoices.filter((inv) => inv.status !== 'paid');

  return {
    totalInvoices: invoices.length,
    paidInvoices: paid.length,
    pendingInvoices: pending.length,
    totalAmount: invoices.reduce((sum, inv) => sum + Number(inv.amount ?? 0), 0),
    paidAmount: paid.reduce((sum, inv) => sum + Number(inv.amount ?? 0), 0),
    pendingAmount: pending.reduce((sum, inv) => sum + Number(inv.amount ?? 0), 0),
  };
}

export async function markInvoicePaid(
  client: ServiceClient,
  invoiceId: number,
  paidAt?: string
) {
  const { data, error } = await (client as any)
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: paidAt ?? new Date().toISOString(),
    })
    .eq('id', invoiceId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}
