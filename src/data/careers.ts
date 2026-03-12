import { createClient } from '@/lib/supabase/server'
import type { Career } from '@/types/careers'

export async function getVisibleCareers(): Promise<Career[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching careers:', error)
    return []
  }

  return (data ?? []) as Career[]
}

export async function getAllCareers(): Promise<Career[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all careers:', error)
    return []
  }

  return (data ?? []) as Career[]
}

export async function getCareerBySlug(slug: string): Promise<Career | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()

  if (error || !data) {
    return null
  }

  return data as Career
}

export async function getCareerSlugs(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('careers')
    .select('slug')
    .eq('is_visible', true)

  if (error) {
    return []
  }

  return (data ?? []).map((c: { slug: string }) => c.slug)
}
