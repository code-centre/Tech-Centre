const DEFAULT_COHORT_CAPACITY = 12

/** Texto de urgencia bajo el CTA de apartar cupo en la página del programa. */
export function programSeatsUrgencyCopy(seatsLeft: number | null | undefined): string {
  if (typeof seatsLeft === 'number') {
    if (seatsLeft <= 0) {
      return 'Esta cohorte ya no tiene cupos. Escríbenos y te avisamos cuando abra la siguiente.'
    }
    if (seatsLeft === 1) {
      return 'Solo queda 1 lugar. Aparta tu cupo para que no te quedes fuera.'
    }
    return `Solo quedan ${seatsLeft} lugares. Aparta tu cupo para que no te quedes fuera.`
  }
  return `Solo hay ${DEFAULT_COHORT_CAPACITY} lugares por cohorte. Aparta tu cupo para que no te quedes fuera.`
}
