import { canonicalSiteUrl } from '@/lib/blog/siteUrl';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { logMetaError } from './log';
import { getAttributionForIdentity, linkAttributionIdentity } from './persist';
import { getInvoicePaymentNumber } from '@/lib/payments/invoice-meta';
import { recordAndSendMetaEvent } from './server';

interface InvoiceRow {
  id: number;
  enrollment_id: number;
  amount: number;
  status: string;
  meta: Record<string, unknown> | null;
}

/**
 * Purchase is only recorded after an invoice is confirmed paid
 * (Wompi webhook or admin mark-paid). Never from /checkout/confirmacion.
 */
export async function recordConfirmedPurchase(params: {
  invoiceId: number;
  transactionId?: string | null;
  eventSourceUrl?: string | null;
}): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, enrollment_id, amount, status, meta')
      .eq('id', params.invoiceId)
      .single();

    if (invoiceError || !invoiceData) return;
    const invoice = invoiceData as InvoiceRow;
    if (invoice.status !== 'paid') return;

    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select('id, student_id, status, cohort:cohorts(id, program:programs(id, name, code))')
      .eq('id', invoice.enrollment_id)
      .single();

    if (!enrollmentData) return;

    const enrollment = enrollmentData as {
      id: number;
      student_id: string;
      status: string;
      cohort:
        | {
            program: { id: number; name: string; code: string } | { id: number; name: string; code: string }[] | null;
          }
        | {
            program: { id: number; name: string; code: string } | { id: number; name: string; code: string }[] | null;
          }[]
        | null;
    };

    const cohort = Array.isArray(enrollment.cohort) ? enrollment.cohort[0] : enrollment.cohort;
    const program = Array.isArray(cohort?.program) ? cohort?.program[0] : cohort?.program;

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, email, phone')
      .eq('user_id', enrollment.student_id)
      .maybeSingle();

    const profileRow = profile as { user_id: string; email: string | null; phone: string | null } | null;
    await linkAttributionIdentity({
      userId: enrollment.student_id,
      email: profileRow?.email,
    });
    const attribution = await getAttributionForIdentity({
      userId: enrollment.student_id,
      email: profileRow?.email,
    });

    const transactionId =
      params.transactionId ||
      (typeof invoice.meta?.transaction_id === 'string' ? invoice.meta.transaction_id : null) ||
      `invoice:${invoice.id}`;

    const eventId = `invoice:${invoice.id}`;
    const amount = Number(invoice.amount) || 0;
    const contentName = program?.name || 'Programa Tech Centre';
    const contentIds = program?.code ? [program.code] : [];

    await recordAndSendMetaEvent({
      eventName: 'Purchase',
      eventId,
      eventSourceUrl: params.eventSourceUrl || `${canonicalSiteUrl()}/checkout/confirmacion`,
      userData: {
        email: profileRow?.email,
        phone: profileRow?.phone,
        externalId: enrollment.student_id,
        fbp: (attribution?.last_fbp as string | null) || (attribution?.first_fbp as string | null),
        fbc: (attribution?.last_fbc as string | null) || (attribution?.first_fbc as string | null),
      },
      customData: {
        currency: 'COP',
        value: amount,
        content_name: contentName,
        content_ids: contentIds,
        content_type: 'product',
        content_category: contentName,
        order_id: transactionId,
        transaction_id: transactionId,
      },
      persist: {
        userId: enrollment.student_id,
        enrollmentId: enrollment.id,
        invoiceId: invoice.id,
        programId: program?.id ?? null,
        value: amount,
        currency: 'COP',
        metadata: {
          payment_number: getInvoicePaymentNumber(invoice.meta),
          payment_type: invoice.meta?.payment_type ?? null,
        },
      },
    });
  } catch (error) {
    logMetaError('recordConfirmedPurchase failed', {
      eventName: 'Purchase',
      eventId: `invoice:${params.invoiceId}`,
    });
    if (process.env.NODE_ENV !== 'production') {
      console.error('[meta] purchase recorder', error);
    }
  }
}
