import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(__dirname),
}

export default nextConfig
