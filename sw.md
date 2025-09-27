# Service Worker Documentation

## Overview

The `public/sw.js` file is an auto-generated Service Worker that enables Progressive Web App (PWA) functionality for the kite school management application.

## What is a Service Worker?

A Service Worker is a JavaScript file that runs in the background, separate from the main browser thread. It acts as a proxy between your web app and the network, enabling offline functionality and performance improvements.

## Configuration

The Service Worker is configured in `next.config.ts` using the `next-pwa` plugin:

```typescript
import withPWA from 'next-pwa'

const pwaConfig = {
  dest: 'public',                                    // Generates sw.js in public/
  register: true,                                    // Auto-register the service worker
  skipWaiting: true,                                // Update immediately when new version available
  disable: process.env.NODE_ENV === 'development',  // Disabled in development
  runtimeCaching,                                    // Custom caching strategies
  buildExcludes: [/manifest\.json$/],               // Files to exclude from precaching
  publicExcludes: ['!manifest.json'],               // Public files to exclude
}
```

## Key Features

### 1. Offline Functionality
- **Precaching**: All static assets (JS, CSS, images) are cached during first visit
- **Offline Access**: Users can access the app without internet connection
- **Perfect for Beach Locations**: Kite instructors often work in areas with poor connectivity

### 2. Caching Strategies

The Service Worker implements different caching strategies for different content types:

- **Static Assets**: `StaleWhileRevalidate` - Serve from cache, update in background
- **Images**: `StaleWhileRevalidate` with 64 entry limit, 24h expiration
- **Google Fonts**: `CacheFirst` for webfonts, `StaleWhileRevalidate` for stylesheets
- **API Calls**: `NetworkFirst` with 10s timeout, fallback to cache
- **Next.js Data**: `StaleWhileRevalidate` for `/_next/data/` routes

### 3. Performance Benefits
- **Faster Loading**: Cached assets load instantly after first visit
- **Background Updates**: New versions download in background
- **Reduced Bandwidth**: Less data usage for repeat visits

### 4. PWA Features Enabled
- **App Installation**: Users can install the app on their devices
- **App-like Experience**: Runs in standalone mode when installed
- **Automatic Updates**: Service Worker updates app content automatically

## File Structure

```
public/
├── sw.js              # Auto-generated Service Worker (DO NOT EDIT)
├── workbox-*.js       # Workbox library files (auto-generated)
└── manifest.json      # PWA manifest file
```

## Important Notes

### ⚠️ DO NOT EDIT `sw.js` MANUALLY
- This file is auto-generated during the build process
- Manual changes will be overwritten on next build
- Customize behavior through `next.config.ts` instead

### Development vs Production
- **Development**: Service Worker is disabled for easier debugging
- **Production**: Fully enabled with all caching strategies

### Updating Service Worker Behavior

To modify Service Worker functionality:

1. **Update `next.config.ts`**: Modify the `pwaConfig` object
2. **Custom Runtime Caching**: Import and modify `runtimeCaching` from `next-pwa/cache`
3. **Rebuild**: Run `npm run build` to regenerate the Service Worker

## Browser Support

Service Workers are supported in all modern browsers:
- ✅ Chrome/Edge 40+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Mobile browsers

## Debugging

### Development
Service Worker is disabled in development to avoid caching issues during development.

### Production Debugging
1. Open browser DevTools
2. Go to **Application** tab
3. Check **Service Workers** section
4. View **Cache Storage** for cached content
5. Use **Network** tab to see cache hits/misses

## Cache Management

The Service Worker automatically:
- **Cleans up outdated caches** when app updates
- **Manages storage limits** with expiration policies
- **Updates cached content** based on defined strategies

## Why This Matters for Kite Schools

1. **Reliable Access**: Works even with poor beach internet
2. **Fast Performance**: Instant loading for returning users
3. **Mobile-First**: Perfect for instructors using phones/tablets
4. **Professional Feel**: App-like experience increases user confidence
5. **Offline Scheduling**: Core functionality available without connectivity

## Monitoring

To monitor Service Worker performance:
- Check browser DevTools Application tab
- Monitor cache hit rates in Network tab
- Use Lighthouse PWA audit for performance metrics

## Troubleshooting

### Clear Cache
If Service Worker issues occur:
1. Open DevTools → Application → Storage
2. Click "Clear storage"
3. Refresh the page

### Force Update
To force Service Worker update:
1. DevTools → Application → Service Workers
2. Check "Update on reload"
3. Refresh the page