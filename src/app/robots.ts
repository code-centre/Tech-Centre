import { MetadataRoute } from 'next'
import { canonicalSiteUrl } from '@/lib/blog/siteUrl'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = canonicalSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og-image', '/og-image', '/blog/'],
        disallow: [
          '/admin/',
          '/perfil/',
          '/checkout/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
