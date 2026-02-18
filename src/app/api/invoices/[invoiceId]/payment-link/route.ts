import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { getPaymentProvider } from '@/lib/payments/payment-factory';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;
    const invoiceIdNum = parseInt(invoiceId, 10);

    if (isNaN(invoiceIdNum)) {
      return NextResponse.json(
        { error: 'ID de factura inválido' },
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

    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        id,
        enrollment_id,
        label,
        amount,
        status,
        meta
      `)
      .eq('id', invoiceIdNum)
      .single();

    const invoice = invoiceData as {
      id: number;
      enrollment_id: number;
      label: string;
      amount: number;
      status: string;
      meta: Record<string, unknown> | null;
    } | null;

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Esta factura ya está pagada' },
        { status: 400 }
      );
    }

    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('id', invoice.enrollment_id)
      .single();

    const enrollment = enrollmentData as { student_id: string } | null;

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: 'Inscripción no encontrada' },
        { status: 404 }
      );
    }

    if (enrollment.student_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para pagar esta factura' },
        { status: 403 }
      );
    }

    const WOMPI_MIN_AMOUNT_COP = 150_000;
    if (invoice.amount < WOMPI_MIN_AMOUNT_COP) {
      return NextResponse.json(
        {
          error: `El monto mínimo para pagar con tarjeta es ${WOMPI_MIN_AMOUNT_COP.toLocaleString('es-CO')} COP. Tu factura es de ${invoice.amount.toLocaleString('es-CO')} COP. Puedes subir un comprobante de pago en su lugar.`,
        },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/checkout/confirmacion?invoiceId=${invoice.id}`;

    const paymentProvider = getPaymentProvider();
    const paymentLink = await paymentProvider.createPaymentLink({
      amount: Math.round(invoice.amount),
      name: invoice.label,
      description: 'Pago de factura',
      redirectUrl,
      metadata: {
        invoice_id: invoice.id,
        enrollment_id: invoice.enrollment_id,
      },
    });

    const updatedMeta: Record<string, unknown> = {
      ...(typeof invoice.meta === 'object' && invoice.meta !== null
        ? (invoice.meta as Record<string, unknown>)
        : {}),
      payment_id: paymentLink.id,
    };

    // Supabase infers 'never' for invoices.update() - table exists, types may be out of sync
    const { error: updateError } = await (supabase.from('invoices') as unknown as { update: (data: { meta: unknown }) => { eq: (col: string, val: number) => Promise<{ error: { message?: string } | null }> } })
      .update({ meta: updatedMeta })
      .eq('id', invoice.id);

    if (updateError) {
      console.error('Error al guardar payment_id en factura:', updateError);
    }

    return NextResponse.json({ url: paymentLink.url });
  } catch (error) {
    console.error('Error al crear link de pago:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al generar el link de pago',
      },
      { status: 500 }
    );
  }
}
