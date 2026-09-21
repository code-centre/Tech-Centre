import { incrementCouponUses } from '@/lib/discounts/coupon-service';
import { markMatriculaAsPaid } from '@/lib/matricula/matricula-service';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { handleInvoicePaidForEnrollment } from '@/lib/payments/confirm-enrollment-paid';
import { recordConfirmedPurchase } from '@/lib/analytics/meta/purchase';
import { isEnrollmentConfirmingPayment } from '@/lib/payments/invoice-meta';

interface InvoiceRow {
  id: number;
  enrollment_id: number;
  status: string;
  amount: number;
  meta: Record<string, unknown> | null;
}

interface EnrollmentRow {
  id: number;
  student_id: string;
  status: string;
  agreed_price: number | null;
}

/**
 * Marks invoice/enrollment as paid after a verified Wompi approval.
 * Uses service role because webhooks have no user session.
 */
export async function processApprovedWompiPayment(params: {
  paymentLinkId?: string | null;
  transactionId?: string | null;
  invoiceId?: number | null;
}): Promise<{ ok: boolean; message: string }> {
  const supabase = createServiceRoleClient();
  const paymentLinkId = params.paymentLinkId?.trim() || undefined;
  const transactionId = params.transactionId?.trim() || undefined;
  const invoiceId =
    typeof params.invoiceId === 'number' && params.invoiceId > 0
      ? params.invoiceId
      : undefined;

  if (!paymentLinkId && !transactionId && !invoiceId) {
    return { ok: false, message: 'Missing payment reference' };
  }

  const invoices = await findInvoicesForPayment(supabase, {
    paymentLinkId,
    transactionId,
    invoiceId,
  });

  if (!invoices.length) {
    return { ok: false, message: 'Invoice not found for payment reference' };
  }

  const paidAt = new Date().toISOString();

  for (const invoice of invoices) {
    if (invoice.status === 'paid') continue;

    const isFirstInstallment = isEnrollmentConfirmingPayment(invoice.meta);

    const { data: updated, error: invoiceUpdateError } = await (supabase as any)
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: paidAt,
        meta: {
          ...(invoice.meta ?? {}),
          ...(transactionId ? { transaction_id: transactionId } : {}),
          ...(paymentLinkId ? { payment_id: paymentLinkId } : {}),
        },
      })
      .eq('id', invoice.id)
      .neq('status', 'paid')
      .select('id')
      .maybeSingle();

    if (invoiceUpdateError) {
      console.error('Webhook invoice update error:', invoiceUpdateError);
      return { ok: false, message: invoiceUpdateError.message };
    }

    if (!updated) continue;

    await recordConfirmedPurchase({
      invoiceId: invoice.id,
      transactionId,
    });

    if (isFirstInstallment) {
      await handleInvoicePaidForEnrollment(supabase, invoice);

      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id, student_id, status, agreed_price')
        .eq('id', invoice.enrollment_id)
        .single();

      if (enrollmentError || !enrollmentData) {
        return { ok: false, message: 'Enrollment not found' };
      }

      const enrollment = enrollmentData as EnrollmentRow;

      const matriculaAdded = Boolean(invoice.meta?.matricula_added);
      const matriculaAmount = Number(invoice.meta?.matricula_amount ?? 0);

      if (matriculaAdded && matriculaAmount > 0) {
        try {
          await markMatriculaAsPaid(supabase, enrollment.student_id);
        } catch (matriculaError) {
          console.warn('Webhook matricula update failed:', matriculaError);
        }
      }

      const couponCode = invoice.meta?.coupon_code;
      if (typeof couponCode === 'string' && couponCode.length > 0) {
        const { data: couponData } = await supabase
          .from('discount_coupons')
          .select('id')
          .eq('code', couponCode.toUpperCase())
          .single();

        const couponId = (couponData as { id?: string } | null)?.id;
        if (couponId) {
          try {
            await incrementCouponUses(couponId);
          } catch (couponError) {
            console.warn('Webhook coupon increment failed:', couponError);
          }
        }
      }
    }
  }

  return { ok: true, message: 'Payment processed' };
}

async function findInvoicesForPayment(
  supabase: ReturnType<typeof createServiceRoleClient>,
  refs: {
    paymentLinkId?: string;
    transactionId?: string;
    invoiceId?: number;
  },
): Promise<InvoiceRow[]> {
  const found = new Map<number, InvoiceRow>();

  const addRows = (rows: InvoiceRow[] | null | undefined) => {
    for (const row of rows ?? []) {
      found.set(row.id, row);
    }
  };

  if (refs.invoiceId) {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, enrollment_id, status, amount, meta')
      .eq('id', refs.invoiceId);
    if (error) {
      console.error('Invoice lookup by id error:', error);
    } else {
      addRows((data ?? []) as InvoiceRow[]);
    }
  }

  if (refs.paymentLinkId) {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, enrollment_id, status, amount, meta')
      .contains('meta', { payment_id: refs.paymentLinkId });
    if (error) {
      console.error('Webhook invoice lookup error:', error);
    } else {
      addRows((data ?? []) as InvoiceRow[]);
    }

    if (found.size === 0) {
      const { data: textRows, error: textError } = await supabase
        .from('invoices')
        .select('id, enrollment_id, status, amount, meta')
        .filter('meta->>payment_id', 'eq', refs.paymentLinkId);
      if (textError) {
        console.error('Invoice lookup by payment_id text error:', textError);
      } else {
        addRows((textRows ?? []) as InvoiceRow[]);
      }
    }
  }

  if (refs.transactionId && found.size === 0) {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, enrollment_id, status, amount, meta')
      .contains('meta', { transaction_id: refs.transactionId });
    if (error) {
      console.error('Webhook invoice lookup by transaction error:', error);
    } else {
      addRows((data ?? []) as InvoiceRow[]);
    }
  }

  return [...found.values()];
}
