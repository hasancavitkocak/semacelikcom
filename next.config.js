/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables'ları client-side'da kullanılabilir hale getir
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Güvenlik headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // XSS koruması
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Content type sniffing koruması
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Clickjacking koruması
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // HTTPS zorla
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      // API routes için CORS
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ]
  },
  
  // Production'da console log'ları kaldır
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  // Görsel optimizasyonu
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
    formats: ['image/webp', 'image/avif']
  },
  
  // Experimental features
  experimental: {
    // Turbopack Next.js 16'da varsayılan
  }
}

module.exports = nextConfig