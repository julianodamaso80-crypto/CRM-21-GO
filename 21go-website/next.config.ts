import type { NextConfig } from 'next'

const RAILWAY_URL = process.env.RAILWAY_BACKEND_URL || 'https://crm-21-go-production.up.railway.app'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      { source: '/crm', destination: `${RAILWAY_URL}/crm` },
      { source: '/crm/:path*', destination: `${RAILWAY_URL}/crm/:path*` },
      { source: '/api/:path*', destination: `${RAILWAY_URL}/api/:path*` },
      { source: '/socket.io/:path*', destination: `${RAILWAY_URL}/socket.io/:path*` },
    ]
  },
}

export default nextConfig
