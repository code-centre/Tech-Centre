import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { getProgramsHub } from '@/data/programsHub'

/**
 * Menú de "Programas" del header: las rutas visibles con sus módulos activos,
 * y los cursos sueltos que también tengan cohorte abierta.
 *
 * Va con un cliente anónimo y sin cookies para poder cachearse: el header se
 * renderiza en todas las páginas y no puede costar cuatro consultas por visita.
 */

export interface NavProgram {
  code: string
  name: string
  subtitle: string | null
  hours: number | null
}

export interface NavRoute {
  slug: string
  name: string
  programs: NavProgram[]
}

export interface ProgramsNav {
  routes: NavRoute[]
  loose: NavProgram[]
}

const EMPTY: ProgramsNav = { routes: [], loose: [] }

async function fetchProgramsNav(): Promise<ProgramsNav> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return EMPTY

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const hub = await getProgramsHub(supabase)

    const toNav = (program: { code: string; name: string; subtitle: string | null; hours: number | null }) => ({
      code: program.code,
      name: program.name,
      subtitle: program.subtitle,
      hours: program.hours,
    })

    return {
      routes: hub.routes.map((route) => ({
        slug: route.slug,
        name: route.name,
        programs: route.programs.map(toNav),
      })),
      loose: hub.loose.map(toNav),
    }
  } catch (error) {
    // El menú nunca debe tumbar el layout: si falla, el header usa su respaldo.
    console.error('Error al cargar el menú de programas:', error)
    return EMPTY
  }
}

export const getProgramsNav = unstable_cache(fetchProgramsNav, ['programs-nav'], {
  revalidate: 3600,
  tags: ['programs-nav'],
})
