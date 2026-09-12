/** Monto del apartado de cupo en COP. */
export const RESERVATION_DEPOSIT_COP = 100_000

/** Ej: `$100.000` */
export function formatReservationDepositCop(): string {
  return `$${RESERVATION_DEPOSIT_COP.toLocaleString('es-CO')}`
}

/** Texto del CTA principal en checkout (modo apartado). */
export function reservationCheckoutButtonLabel(): string {
  return `Pagar ${formatReservationDepositCop()} y apartar mi cupo`
}

/** Precio acordado del programa tras cupón; nunca menor al apartado. */
export function reservationAgreedPrice(programPrice: number, couponDiscount = 0): number {
  const discounted = Math.max(0, programPrice - couponDiscount)
  return Math.max(RESERVATION_DEPOSIT_COP, discounted)
}

/** Saldo pendiente después del apartado fijo de $100.000. */
export function reservationBalanceAmount(programPrice: number, couponDiscount = 0): number {
  const agreed = reservationAgreedPrice(programPrice, couponDiscount)
  return Math.max(0, agreed - RESERVATION_DEPOSIT_COP)
}

export function isReservationCheckoutMode(mode: string | null | undefined): boolean {
  return mode === 'reservation'
}
