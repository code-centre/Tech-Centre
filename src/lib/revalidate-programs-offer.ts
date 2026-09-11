import { revalidatePath, revalidateTag, updateTag } from 'next/cache'

type RevalidateMode = 'action' | 'route'

/** Refresca menú, landing y /programas tras abrir o cerrar una cohorte. */
export function revalidateProgramsOffer(mode: RevalidateMode = 'action'): void {
  if (mode === 'action') {
    updateTag('programs-nav')
  } else {
    revalidateTag('programs-nav', 'max')
  }

  revalidatePath('/programas')
  revalidatePath('/', 'layout')
  revalidatePath('/')
}
