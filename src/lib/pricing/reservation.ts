/** Monto del apartado de cupo en COP. */
export const RESERVATION_DEPOSIT_COP = 100_000

export function reservationBalanceAmount(programPrice: number): number {
  return Math.max(0, programPrice - RESERVATION_DEPOSIT_COP)
}

export function isReservationCheckoutMode(mode: string | null | undefined): boolean {
  return mode === 'reservation'
}
