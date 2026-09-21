/** Wompi transaction ids look like `01-1532941443-49201`. */
const TRANSACTION_ID_RE = /^\d+-\d+-\d+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isWompiTransactionId(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return TRANSACTION_ID_RE.test(trimmed) || UUID_RE.test(trimmed);
}

export function parseInvoiceIdFromRedirect(
  redirectUrl: string | null | undefined,
): number | undefined {
  if (!redirectUrl) return undefined;
  try {
    const url = new URL(redirectUrl);
    const raw = url.searchParams.get('invoiceId');
    if (!raw) return undefined;
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : undefined;
  } catch {
    return undefined;
  }
}

export function parseInvoiceIdFromSku(
  sku: string | null | undefined,
): number | undefined {
  if (!sku) return undefined;
  const match = /^invoice-(\d+)$/.exec(sku.trim());
  if (!match) return undefined;
  const id = Number(match[1]);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}
