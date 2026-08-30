import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'th3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'jyrtclndzwhslfydadna.supabase.co',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        // Las páginas propias de módulo se eliminaron. El slug del módulo es
        // el code del programa, así que la URL vieja lleva a su página.
        source: '/programas/modulos/:slug',
        destination: '/programas-academicos/:slug',
        permanent: true,
      },
      {
        source: '/programas-academicos',
        destination: '/programas',
        permanent: true,
      },
      {
        source: '/carreras/ai-engineer',
        destination: '/programas',
        permanent: true,
      },
      {
        source: '/carreras/:path*',
        destination: '/rutas/:path*',
        permanent: true,
      },
      {
        source: '/programas-academicos/carreras/:slug',
        destination: '/programas-academicos/rutas/:slug',
        permanent: true,
      },
      {
        source: '/admin/carreras',
        destination: '/admin/rutas',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
