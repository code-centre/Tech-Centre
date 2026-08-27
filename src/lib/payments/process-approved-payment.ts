import { incrementCouponUses } from '@/lib/discounts/coupon-service';
import { markMatriculaAsPaid } from '@/lib/matricula/matricula-service';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

interface InvoiceRow {
  id: number;
  enrollment_id: number;
  status: string;
  meta: Record<string, unknown> | null;
}

interface EnrollmentRow {
  id: number;
  student_id: string;
  status: string;
  agreed_price: number | null;
}

/**
 * Marks invoice/enrollment as paid after verified Wompi webhook.
 * Uses service role because webhooks have no user session.
 */
export async function processApprovedWompiPayment(params: {
  paymentLinkId?: string;
  transactionId?: string;
}): Promise<{ ok: boolean; message: string }> {
  const supabase = createServiceRoleClient();
  const { paymentLinkId, transactionId } = params;

  if (!paymentLinkId && !transactionId) {
    return { ok: false, message: 'Missing payment reference' };
  }

  let invoices: InvoiceRow[] | null = null;

  if (paymentLinkId) {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, enrollment_id, status, meta')
      .contains('meta', { payment_id: paymentLinkId });

    if (error) {
      console.error('Webhook invoice lookup error:', error);
      return { ok: false, message: error.message };
    }

    invoices = (data ?? []) as InvoiceRow[];
  }

  if ((!invoices || invoices.length === 0) && transactionId) {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, enrollment_id, status, meta')
      .contains('meta', { transaction_id: transactionId });

    if (error) {
      console.error('Webhook invoice lookup by transaction error:', error);
      return { ok: false, message: error.message };
    }

    invoices = (data ?? []) as InvoiceRow[];
  }

  if (!invoices || invoices.length === 0) {
    return { ok: false, message: 'Invoice not found for payment reference' };
  }

  const paidAt = new Date().toISOString();

  for (const invoice of invoices) {
    if (invoice.status === 'paid') continue;

    const isFirstInstallment =
      Number(invoice.meta?.payment_number ?? 1) === 1;

    if (!isFirstInstallment) continue;

    const { error: invoiceUpdateError } = await (supabase as any)
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: paidAt,
        meta: {
          ...(invoice.meta ?? {}),
          ...(transactionId ? { transaction_id: transactionId } : {}),
        },
      })
      .eq('id', invoice.id);

    if (invoiceUpdateError) {
      console.error('Webhook invoice update error:', invoiceUpdateError);
      return { ok: false, message: invoiceUpdateError.message };
    }

    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, student_id, status, agreed_price')
      .eq('id', invoice.enrollment_id)
      .single();

    if (enrollmentError || !enrollmentData) {
      return { ok: false, message: 'Enrollment not found' };
    }

    const enrollment = enrollmentData as EnrollmentRow;

    if (enrollment.status !== 'enrolled') {
      const { error: enrollmentUpdateError } = await (supabase as any)
        .from('enrollments')
        .update({ status: 'enrolled', updated_at: paidAt })
        .eq('id', enrollment.id);

      if (enrollmentUpdateError) {
        console.error('Webhook enrollment update error:', enrollmentUpdateError);
        return { ok: false, message: enrollmentUpdateError.message };
      }

      await (supabase as any)
        .from('profiles')
        .update({ role: 'student', updated_at: paidAt })
        .eq('user_id', enrollment.student_id)
        .eq('role', 'lead');
    }

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

  return { ok: true, message: 'Payment processed' };
}
