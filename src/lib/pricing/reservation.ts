/** Monto del apartado de cupo en COP. */
export const RESERVATION_DEPOSIT_COP = 100_000

/** Mínimo de Wompi para tarjeta/PSE (documentado en payment-link API). */
export const WOMPI_MIN_AMOUNT_COP = 150_000

export function reservationBalanceAmount(programPrice: number): number {
  return Math.max(0, programPrice - RESERVATION_DEPOSIT_COP)
}

export function isReservationCheckoutMode(mode: string | null | undefined): boolean {
  return mode === 'reservation'
}
