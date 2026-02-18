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

    const provider = getPaymentProvider();
    const status = await provider.getTransactionStatus(paymentId.trim());

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
