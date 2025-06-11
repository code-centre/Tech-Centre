import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
    ],
     domains: [
      'th3.googleusercontent.com',
      'lh3.googleusercontent.com', 
    ],
  }
};

export default nextConfig;
