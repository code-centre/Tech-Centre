import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { getPaymentProvider } from '@/lib/payments/payment-factory';
import { processApprovedWompiPayment } from '@/lib/payments/process-approved-payment';
import {
  isWompiTransactionId,
  parseInvoiceIdFromRedirect,
} from '@/lib/payments/wompi-ids';

export const runtime = 'nodejs';

interface InvoiceRow {
  id: number;
  enrollment_id: number;
  status: string;
  meta: Record<string, unknown> | null;
}

/**
 * Confirms a Wompi payment against the live API and marks the invoice paid.
 * Used when the student returns from checkout if the webhook did not land.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      invoiceId?: number;
      enrollmentId?: number;
      transactionId?: string;
      all?: boolean;
    };

    let invoiceId =
      typeof body.invoiceId === 'number' && body.invoiceId > 0 ? body.invoiceId : undefined;
    const enrollmentId =
      typeof body.enrollmentId === 'number' && body.enrollmentId > 0
        ? body.enrollmentId
        : undefined;
    let transactionId = isWompiTransactionId(body.transactionId)
      ? body.transactionId!.trim()
      : undefined;
    const reconcileAll = body.all === true;

    if (!invoiceId && !enrollmentId && !transactionId && !reconcileAll) {
      return NextResponse.json({ error: 'Falta la referencia de pago' }, { status: 400 });
    }

    if (reconcileAll && !invoiceId && !enrollmentId && !transactionId) {
      return await reconcileAllUnpaidInvoices(supabase, user.id);
    }

    const provider = getPaymentProvider();
    let status = 'PENDING';
    let paymentLinkFromTx: string | undefined;
    let invoiceIdFromTx: number | undefined;

    if (transactionId) {
      const tx = await provider.getTransactionStatus(transactionId);
      status = tx.status;
      paymentLinkFromTx = tx.paymentLinkId ?? undefined;
      invoiceIdFromTx = parseInvoiceIdFromRedirect(tx.redirectUrl);
      if (!invoiceId && invoiceIdFromTx) {
        invoiceId = invoiceIdFromTx;
      }
    }

    const invoices = await findInvoices(supabase, {
      invoiceId,
      enrollmentId,
      paymentLinkId: paymentLinkFromTx,
      transactionId,
    });

    if (!invoices.length) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    const enrollmentIds = [...new Set(invoices.map((row) => row.enrollment_id))];
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('id, student_id')
      .in('id', enrollmentIds);

    const ownsPayment = ((enrollments ?? []) as { student_id: string }[]).some(
      (enrollment) => enrollment.student_id === user.id,
    );
    if (!ownsPayment) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    if (invoices.some((invoice) => invoice.status === 'paid')) {
      return NextResponse.json({ status: 'APPROVED', reconciled: false });
    }

    const target = invoices[0];
    const paymentLinkId =
      paymentLinkFromTx ??
      (typeof target.meta?.payment_id === 'string' ? target.meta.payment_id : undefined);

    if (!transactionId && provider.findApprovedTransactionForPaymentLink) {
      const tx = await provider.findApprovedTransactionForPaymentLink(
        paymentLinkId,
        target.id,
      );
      if (tx) {
        transactionId = tx.id;
        status = tx.status;
        paymentLinkFromTx = tx.paymentLinkId ?? paymentLinkId;
        invoiceIdFromTx = parseInvoiceIdFromRedirect(tx.redirectUrl);
      }
    }

    if (status !== 'APPROVED' || !transactionId) {
      return NextResponse.json({ status, reconciled: false });
    }

    const result = await processApprovedWompiPayment({
      transactionId,
      paymentLinkId: paymentLinkFromTx ?? paymentLinkId,
      invoiceId: invoiceIdFromTx ?? target.id,
    });

    return NextResponse.json({
      status: result.ok ? 'APPROVED' : status,
      reconciled: result.ok,
    });
  } catch (error) {
    console.error('Error reconciling payment:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error al confirmar el pago',
      },
      { status: 500 },
    );
  }
}

async function findInvoices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  refs: {
    invoiceId?: number;
    enrollmentId?: number;
    paymentLinkId?: string;
    transactionId?: string;
  },
): Promise<InvoiceRow[]> {
  const found = new Map<number, InvoiceRow>();

  const addRows = (rows: InvoiceRow[] | null | undefined) => {
    for (const row of rows ?? []) {
      found.set(row.id, row);
    }
  };

  if (refs.invoiceId) {
    const { data } = await supabase
      .from('invoices')
      .select('id, enrollment_id, status, meta')
      .eq('id', refs.invoiceId);
    addRows((data ?? []) as InvoiceRow[]);
  }

  if (refs.enrollmentId && found.size === 0) {
    const { data } = await supabase
      .from('invoices')
      .select('id, enrollment_id, status, meta')
      .eq('enrollment_id', refs.enrollmentId)
      .order('id', { ascending: true });
    addRows((data ?? []) as InvoiceRow[]);
  }

  if (refs.paymentLinkId && found.size === 0) {
    const { data } = await supabase
      .from('invoices')
      .select('id, enrollment_id, status, meta')
      .contains('meta', { payment_id: refs.paymentLinkId });
    addRows((data ?? []) as InvoiceRow[]);
  }

  if (refs.transactionId && found.size === 0) {
    const { data } = await supabase
      .from('invoices')
      .select('id, enrollment_id, status, meta')
      .contains('meta', { transaction_id: refs.transactionId });
    addRows((data ?? []) as InvoiceRow[]);
  }

  return [...found.values()];
}

async function reconcileAllUnpaidInvoices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', userId);

  const enrollmentIds = ((enrollments ?? []) as { id: number }[]).map((row) => row.id);
  if (!enrollmentIds.length) {
    return NextResponse.json({ status: 'PENDING', reconciled: false });
  }

  const { data: invoiceRows } = await supabase
    .from('invoices')
    .select('id, enrollment_id, status, meta')
    .in('enrollment_id', enrollmentIds)
    .neq('status', 'paid');

  const invoices = (invoiceRows ?? []) as InvoiceRow[];
  if (!invoices.length) {
    return NextResponse.json({ status: 'APPROVED', reconciled: false });
  }

  const provider = getPaymentProvider();
  const approved = provider.listRecentApprovedTransactions
    ? await provider.listRecentApprovedTransactions()
    : [];

  let reconciledCount = 0;

  for (const invoice of invoices) {
    const paymentLinkId =
      typeof invoice.meta?.payment_id === 'string' ? invoice.meta.payment_id : undefined;
    const match = approved.find((tx) => {
      if (paymentLinkId && tx.paymentLinkId === paymentLinkId) return true;
      return parseInvoiceIdFromRedirect(tx.redirectUrl) === invoice.id;
    });

    if (!match) continue;

    const result = await processApprovedWompiPayment({
      transactionId: match.id,
      paymentLinkId: match.paymentLinkId ?? paymentLinkId,
      invoiceId: invoice.id,
    });
    if (result.ok) reconciledCount += 1;
  }

  return NextResponse.json({
    status: reconciledCount > 0 ? 'APPROVED' : 'PENDING',
    reconciled: reconciledCount > 0,
    reconciledCount,
  });
}
