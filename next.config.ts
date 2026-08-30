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
