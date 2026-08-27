import { NextRequest, NextResponse } from 'next/server';
import { verifyWompiEventChecksum, type WompiEvent } from '@/lib/payments/wompi-webhook';
import { processApprovedWompiPayment } from '@/lib/payments/process-approved-payment';

export const runtime = 'nodejs';

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
  const isValid = verifyWompiEventChecksum(event, headerChecksum, eventsSecret);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (event.event !== 'transaction.updated') {
    return NextResponse.json({ received: true });
  }

  const transaction = event.data?.transaction as Record<string, unknown> | undefined;
  const status = transaction?.status as string | undefined;

  if (status !== 'APPROVED') {
    return NextResponse.json({ received: true });
  }

  const paymentLinkId =
    (transaction?.payment_link_id as string | undefined) ||
    (transaction?.payment_link as Record<string, unknown> | undefined)?.id?.toString();

  const transactionId = transaction?.id as string | undefined;

  const result = await processApprovedWompiPayment({
    paymentLinkId,
    transactionId,
  });

  if (!result.ok) {
    console.warn('Webhook payment processing:', result.message);
  }

  return NextResponse.json({ received: true, processed: result.ok });
}
