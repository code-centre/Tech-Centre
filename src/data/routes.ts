import { createClient } from '@/lib/supabase/server'
import type { Route } from '@/types/routes'

export async function getVisibleRoutes(): Promise<Route[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching routes:', error)
    return []
  }

  return (data ?? []) as Route[]
}

export async function getAllRoutes(): Promise<Route[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all routes:', error)
    return []
  }

  return (data ?? []) as Route[]
}

export async function getRouteBySlug(slug: string): Promise<Route | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()

  if (error || !data) {
    return null
  }

  return data as Route
}

export async function getRouteSlugs(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('routes')
    .select('slug')
    .eq('is_visible', true)

  if (error) {
    return []
  }

  return (data ?? []).map((r: { slug: string }) => r.slug)
}
