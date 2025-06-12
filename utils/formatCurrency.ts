export function formatPrice(price: number, currency: string = "COP"): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(price);
}
