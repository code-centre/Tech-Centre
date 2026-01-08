import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://techcentre.co'
  
  const supabase = await createClient()
  
  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/programas-academicos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/empresas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Obtener programas activos desde Supabase
  let programPages: MetadataRoute.Sitemap = []
  
  try {
    const { data: programs, error } = await supabase
      .from('programs')
      .select('code, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    if (!error && programs) {
      programPages = programs.map((program) => ({
        url: `${baseUrl}/programas-academicos/${program.code}`,
        lastModified: program.updated_at ? new Date(program.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return [...staticPages, ...programPages]
}
