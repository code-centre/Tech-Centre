import { revalidatePath, revalidateTag } from 'next/cache'

/** Refresca /programas y el menú de Programas tras abrir o cerrar una cohorte. */
export function revalidateProgramsOffer(): void {
  revalidateTag('programs-nav')
  revalidatePath('/programas')
}
