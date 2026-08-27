import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { getPaymentProvider } from '@/lib/payments/payment-factory';

/**
 * GET /api/payments/transaction-status?paymentId=xxx
 * Verifica el estado de una transacción en el proveedor de pagos (Wompi).
 * Solo en servidor para usar WOMPI_SECRET_KEY de forma segura.
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

    const rows = (invoiceRows ?? []) as { id: number; enrollment_id: number; meta: unknown }[];
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

    const provider = getPaymentProvider();
    const status = await provider.getTransactionStatus(trimmedPaymentId);

    return NextResponse.json({
      status: status.status,
      id: status.id,
      amount: status.amount,
      currency: status.currency,
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
