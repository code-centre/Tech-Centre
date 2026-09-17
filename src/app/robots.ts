import { MetadataRoute } from 'next'
import { canonicalSiteUrl } from '@/lib/blog/siteUrl'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = canonicalSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og-image', '/og-image', '/og-image.jpg', '/blog/', '/llms.txt', '/llms-full.txt'],
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
