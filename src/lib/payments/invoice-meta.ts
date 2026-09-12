/** Invoice.meta helpers. Missing `payment_number` is not payment 1. */

export function getInvoicePaymentNumber(
  meta: Record<string, unknown> | null | undefined
): number | null {
  if (!meta) return null;
  const raw = meta.payment_number;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() !== '') {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function isReservationDeposit(
  meta: Record<string, unknown> | null | undefined
): boolean {
  return meta?.payment_type === 'reservation_deposit';
}

/**
 * Reservation deposit or an explicit first installment.
 * Does not treat a missing payment_number as 1.
 */
export function isEnrollmentConfirmingPayment(
  meta: Record<string, unknown> | null | undefined
): boolean {
  if (isReservationDeposit(meta)) return true;
  return getInvoicePaymentNumber(meta) === 1;
}
