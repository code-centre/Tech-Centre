import { NextRequest, NextResponse } from 'next/server';
import { verifyWompiEventChecksum, type WompiEvent } from '@/lib/payments/wompi-webhook';
import { processApprovedWompiPayment } from '@/lib/payments/process-approved-payment';
import { getPaymentProvider } from '@/lib/payments/payment-factory';
import {
  parseInvoiceIdFromRedirect,
  parseInvoiceIdFromSku,
} from '@/lib/payments/wompi-ids';

export const runtime = 'nodejs';

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
}

function extractPaymentLinkId(transaction: Record<string, unknown>): string | undefined {
  const direct = transaction.payment_link_id;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  const nested = asRecord(transaction.payment_link)?.id;
  if (typeof nested === 'string' && nested.trim()) return nested.trim();

  const extra = asRecord(asRecord(transaction.payment_method)?.extra)?.payment_link_id;
  if (typeof extra === 'string' && extra.trim()) return extra.trim();

  return undefined;
}

export async function POST(request: NextRequest) {
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;

  if (!eventsSecret) {
    console.error('WOMPI_EVENTS_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: WompiEvent;
  try {
    event = (await request.json()) as WompiEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const headerChecksum = request.headers.get('X-Event-Checksum');
  const checksumValid = verifyWompiEventChecksum(event, headerChecksum, eventsSecret);

  if (event.event !== 'transaction.updated') {
    return NextResponse.json({ received: true });
  }

  const payloadTransaction = asRecord(event.data?.transaction);
  const transactionId =
    (typeof payloadTransaction?.id === 'string' && payloadTransaction.id.trim()) || undefined;

  if (!checksumValid && !transactionId) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (!checksumValid) {
    console.warn('Wompi webhook checksum failed; verifying transaction with Wompi API', {
      transactionId,
    });
  }

  let transaction = payloadTransaction ?? {};
  const provider = getPaymentProvider();

  if (transactionId && provider.fetchTransaction) {
    try {
      transaction = await provider.fetchTransaction(transactionId);
    } catch (error) {
      console.error('Wompi webhook could not fetch transaction:', error);
      if (!checksumValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
  }

  const status = transaction.status as string | undefined;
  if (status !== 'APPROVED') {
    return NextResponse.json({ received: true, status: status ?? null });
  }

  const paymentLinkId = extractPaymentLinkId(transaction);
  const invoiceId =
    parseInvoiceIdFromRedirect(
      typeof transaction.redirect_url === 'string' ? transaction.redirect_url : null,
    ) ??
    parseInvoiceIdFromSku(typeof transaction.sku === 'string' ? transaction.sku : null);

  const result = await processApprovedWompiPayment({
    paymentLinkId,
    transactionId: transactionId ?? (typeof transaction.id === 'string' ? transaction.id : undefined),
    invoiceId,
  });

  if (!result.ok) {
    console.warn('Webhook payment processing:', result.message, {
      transactionId,
      paymentLinkId,
      invoiceId,
    });
    return NextResponse.json(
      { received: true, processed: false, error: result.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true, processed: true });
}
