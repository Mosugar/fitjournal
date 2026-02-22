import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase storage (replace YOUR_PROJECT_ID with yours)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Dicebear avatars (fallback)
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      // Google profile pictures (OAuth)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // Serve modern WebP/AVIF automatically
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 7 days
    minimumCacheTTL: 604800,
  },
}

export default nextConfig