import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Program } from '@/types/programs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://techcentre.co'
  
  const supabase = await createClient()
  
  // Páginas estáticas principales
  const now = new Date()
  const routeList: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '', priority: 1, changeFrequency: 'daily' },
    { path: '/programas', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/programas/construye', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/programas/revela', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/metodologia', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/comunidad', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/nosotros', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/empleabilidad', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/inversion', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contacto', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/inscripcion', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/empresas', priority: 0.6, changeFrequency: 'weekly' },
  ]
  const staticPages: MetadataRoute.Sitemap = routeList.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  // Obtener programas activos desde Supabase
  let programPages: MetadataRoute.Sitemap = []
  
  try {
    const { data: programs, error }: { data: Program[] | null, error: any } = await supabase
      .from('programs')
      .select('code, updated_at')
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

  // Obtener posts del blog publicados
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })

    const blogPosts = (data ?? []) as Array<{ slug: string; updated_at: string | null }>
    blogPages = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Error generating blog sitemap:', error)
  }

  return [...staticPages, ...programPages, ...blogPages]
}
