import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Datos de /programas: las rutas visibles con sus programas en orden, y los
 * programas que no pertenecen a ninguna ruta.
 *
 * Regla de la página: solo se lista lo que tiene cohorte abierta. Un programa
 * sin cohorte no aparece atenuado, no aparece.
 */

export interface HubProgram {
  code: string
  name: string
  subtitle: string | null
  hours: number | null
  level: string | null
  price: number | null
  currency: string
  /** Inicio de la cohorte abierta más próxima, en ISO. */
  startDate: string | null
}

export interface HubRoute {
  id: string
  slug: string
  name: string
  description: string | null
  level: string | null
  modality: string | null
  duration: string | null
  image: string | null
  programs: HubProgram[]
}

export interface ProgramsHub {
  routes: HubRoute[]
  loose: HubProgram[]
  /** Total de programas con cohorte abierta, rutas y sueltos juntos. */
  openCount: number
  /** El inicio más próximo de toda la oferta, en ISO. */
  nextStart: string | null
}

interface RouteRow {
  id: string
  slug: string
  name: string
  description: string | null
  level: string | null
  modality: string | null
  duration: string | null
  image: string | null
  /** Respaldo histórico: cada url apunta al `code` de un programa. */
  learning_points: { title?: string; url?: string }[] | null
}

interface ProgramRow {
  id: number
  code: string | null
  name: string | null
  subtitle: string | null
  total_hours: number | null
  difficulty: string | null
  default_price: number | null
  discount: number | null
  currency: string | null
}

const EMPTY: ProgramsHub = { routes: [], loose: [], openCount: 0, nextStart: null }

/**
 * @param client Cliente alterno. El header lo llama con uno anónimo y sin
 * cookies para poder cachear el resultado entre peticiones.
 */
export async function getProgramsHub(client?: SupabaseClient): Promise<ProgramsHub> {
  const supabase = client ?? (await createClient())

  const [routesResult, linksResult, cohortsResult] = await Promise.all([
    supabase
      .from('routes')
      .select('id, slug, name, description, level, modality, duration, image, learning_points')
      .eq('is_visible', true)
      .order('created_at', { ascending: true }),
    supabase.from('route_programs').select('route_id, program_id, position'),
    supabase
      .from('cohorts')
      .select('program_id, start_date')
      .eq('offering', true)
      .order('start_date', { ascending: true }),
  ])

  if (cohortsResult.error) {
    // Sin cohortes no hay nada que listar: la página no debe reventar.
    console.error('Error al cargar cohortes abiertas:', cohortsResult.error)
    return EMPTY
  }

  // program_id -> inicio de su cohorte abierta más próxima
  const openByProgram = new Map<number, string | null>()
  for (const row of (cohortsResult.data ?? []) as { program_id: number; start_date: string | null }[]) {
    if (!openByProgram.has(row.program_id)) {
      openByProgram.set(row.program_id, row.start_date)
    }
  }

  if (openByProgram.size === 0) return EMPTY

  const { data: programRows, error: programsError } = await supabase
    .from('programs')
    .select('id, code, name, subtitle, total_hours, difficulty, default_price, discount, currency')
    .in('id', Array.from(openByProgram.keys()))

  if (programsError) {
    console.error('Error al cargar programas:', programsError)
    return EMPTY
  }

  const programsById = new Map<number, HubProgram>()
  for (const row of (programRows ?? []) as unknown as ProgramRow[]) {
    if (!row.code || !row.name) continue
    programsById.set(row.id, {
      code: row.code,
      name: row.name,
      subtitle: row.subtitle,
      hours: row.total_hours,
      level: row.difficulty,
      price: row.discount || row.default_price,
      currency: row.currency || 'COP',
      startDate: openByProgram.get(row.id) ?? null,
    })
  }

  if (routesResult.error) console.error('Error al cargar rutas:', routesResult.error)
  if (linksResult.error) console.error('Error al cargar route_programs:', linksResult.error)

  const links = (linksResult.data ?? []) as { route_id: string; program_id: number; position: number }[]
  const routeRows = (routesResult.data ?? []) as unknown as RouteRow[]

  // `route_programs` es la fuente buena, pero mientras esté vacía la ruta
  // todavía sabe cuáles son sus programas: `learning_points[].url` apunta al
  // code de cada uno, en orden. Sin este respaldo los programas de una ruta
  // se listarían como sueltos.
  const idByCode = new Map<string, number>()
  for (const [id, program] of programsById) idByCode.set(program.code, id)

  const resolvedLinks = [...links]
  for (const route of routeRows) {
    if (resolvedLinks.some((link) => link.route_id === route.id)) continue
    ;(route.learning_points ?? []).forEach((point, index) => {
      const code = (point?.url ?? '').replace(/^\/+/, '').trim()
      const programId = code ? idByCode.get(code) : undefined
      if (programId != null) {
        resolvedLinks.push({ route_id: route.id, program_id: programId, position: index + 1 })
      }
    })
  }

  const inSomeRoute = new Set(resolvedLinks.map((link) => link.program_id))

  const routes: HubRoute[] = routeRows.map((route) => ({
    id: route.id,
    slug: route.slug,
    name: route.name,
    description: route.description,
    level: route.level,
    modality: route.modality,
    duration: route.duration,
    image: route.image,
    programs: resolvedLinks
      .filter((link) => link.route_id === route.id)
      .sort((a, b) => a.position - b.position)
      .map((link) => programsById.get(link.program_id))
      .filter((program): program is HubProgram => Boolean(program)),
  }))

  const loose = Array.from(programsById.entries())
    .filter(([id]) => !inSomeRoute.has(id))
    .map(([, program]) => program)
    .sort((a, b) => (b.hours ?? 0) - (a.hours ?? 0))

  const starts = Array.from(openByProgram.values()).filter((value): value is string => Boolean(value)).sort()

  return {
    // Una ruta sin programas abiertos no se muestra.
    routes: routes.filter((route) => route.programs.length > 0),
    loose,
    openCount: programsById.size,
    nextStart: starts[0] ?? null,
  }
}
