import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kite Hostel - Tarifa Management App',
    short_name: 'Kite Hostel',
    description: 'Professional kite school management application for wind-dependent scheduling operations',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0ea5e9', // Sky blue theme matching kite/wind theme
    orientation: 'portrait-primary',
    scope: '/',
    id: '/',
    lang: 'en',
    dir: 'ltr',
    categories: ['business', 'productivity', 'sports'],
    prefer_related_applications: false,
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/maskable-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    shortcuts: [
      {
        name: 'Whiteboard',
        short_name: 'Whiteboard',
        description: 'Mobile admin interface for daily operations',
        url: '/whiteboard',
        icons: [{ src: '/icons/shortcut-whiteboard.png', sizes: '192x192' }]
      },
      {
        name: 'Billboard',
        short_name: 'Billboard',
        description: 'Desktop scheduling interface',
        url: '/billboard',
        icons: [{ src: '/icons/shortcut-billboard.png', sizes: '192x192' }]
      },
      {
        name: 'Teachers',
        short_name: 'Teachers',
        description: 'Teacher management',
        url: '/teachers',
        icons: [{ src: '/icons/shortcut-teachers.png', sizes: '192x192' }]
      }
    ],
    screenshots: [
      {
        src: '/screenshots/desktop-1.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Desktop billboard view'
      },
      {
        src: '/screenshots/mobile-1.png',
        sizes: '375x812',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Mobile whiteboard view'
      }
    ]
  }
}