
import withPWA from 'next-pwa'
import runtimeCaching from 'next-pwa/cache'
import type { NextConfig } from 'next'

// Next.js configuration
const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

// PWA plugin options
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching,
  buildExcludes: [/manifest\.json$/],
  publicExcludes: ['!manifest.json'],
}

// Export Next.js config wrapped with PWA support
export default withPWA(pwaConfig)(nextConfig)
