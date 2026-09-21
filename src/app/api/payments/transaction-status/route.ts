import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { getPaymentProvider } from '@/lib/payments/payment-factory';
import {
  isWompiTransactionId,
  parseInvoiceIdFromRedirect,
} from '@/lib/payments/wompi-ids';

/**
 * GET /api/payments/transaction-status?paymentId=xxx
 * paymentId can be a Wompi transaction id or a payment-link id stored on the invoice.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
      return NextResponse.json(
        { error: 'paymentId es requerido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const trimmedPaymentId = paymentId.trim();
    const provider = getPaymentProvider();

    if (isWompiTransactionId(trimmedPaymentId)) {
      const status = await provider.getTransactionStatus(trimmedPaymentId);
      const invoiceId = parseInvoiceIdFromRedirect(status.redirectUrl);
      const paymentLinkId = status.paymentLinkId ?? undefined;

      const ownsPayment = await userOwnsRelatedInvoice(supabase, user.id, {
        invoiceId,
        paymentLinkId,
        transactionId: trimmedPaymentId,
      });

      if (!ownsPayment) {
        return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
      }

      return NextResponse.json({
        status: status.status,
        id: status.id,
        amount: status.amount,
        currency: status.currency,
      });
    }

    const { data: invoiceRows, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, enrollment_id, meta')
      .contains('meta', { payment_id: trimmedPaymentId });

    if (invoiceError) {
      return NextResponse.json({ error: 'Error al verificar factura' }, { status: 500 });
    }

    if (!invoiceRows || invoiceRows.length === 0) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    }

    const rows = invoiceRows as { id: number; enrollment_id: number; meta: unknown }[];
    const enrollmentIds = [...new Set(rows.map((row) => row.enrollment_id))];
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, student_id')
      .in('id', enrollmentIds);

    if (enrollmentError || !enrollments?.length) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 });
    }

    const ownsPayment = (enrollments as { id: number; student_id: string }[]).some(
      (enrollment) => enrollment.student_id === user.id
    );
    if (!ownsPayment) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    if (provider.findApprovedTransactionForPaymentLink) {
      const approved = await provider.findApprovedTransactionForPaymentLink(trimmedPaymentId);
      if (approved) {
        return NextResponse.json({
          status: approved.status,
          id: approved.id,
          amount: approved.amount,
          currency: approved.currency,
        });
      }
    }

    return NextResponse.json({
      status: 'PENDING',
      id: trimmedPaymentId,
      amount: 0,
      currency: 'COP',
    });
  } catch (error) {
    console.error('Error al verificar estado de transacción:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al verificar el estado del pago',
      },
      { status: 500 }
    );
  }
}

async function userOwnsRelatedInvoice(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  refs: {
    invoiceId?: number;
    paymentLinkId?: string;
    transactionId?: string;
  },
): Promise<boolean> {
  const enrollmentIds = new Set<number>();

  if (refs.invoiceId) {
    const { data } = await supabase
      .from('invoices')
      .select('enrollment_id')
      .eq('id', refs.invoiceId);
    for (const row of (data ?? []) as { enrollment_id: number }[]) {
      enrollmentIds.add(row.enrollment_id);
    }
  }

  if (refs.paymentLinkId) {
    const { data } = await supabase
      .from('invoices')
      .select('enrollment_id')
      .contains('meta', { payment_id: refs.paymentLinkId });
    for (const row of (data ?? []) as { enrollment_id: number }[]) {
      enrollmentIds.add(row.enrollment_id);
    }
  }

  if (refs.transactionId) {
    const { data } = await supabase
      .from('invoices')
      .select('enrollment_id')
      .contains('meta', { transaction_id: refs.transactionId });
    for (const row of (data ?? []) as { enrollment_id: number }[]) {
      enrollmentIds.add(row.enrollment_id);
    }
  }

  if (enrollmentIds.size === 0) return false;

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, student_id')
    .in('id', [...enrollmentIds]);

  return ((enrollments ?? []) as { student_id: string }[]).some(
    (enrollment) => enrollment.student_id === userId,
  );
}
