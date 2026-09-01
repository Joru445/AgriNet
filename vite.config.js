import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.svg',
        'favicon.png',
        'favicon.ico',
        'apple-touch-icon.png',
        'icon-192x192.png',
        'icon-512x512.png',
        'icon-maskable-512x512.png',
        'push-sw.js',
      ],
      manifest: {
        name: 'AgriNet - Farm Fresh Marketplace',
        short_name: 'AgriNet',
        description: 'Connect directly with local farmers. Buy fresh produce, manage your farm store, and grow your agricultural business.',
        theme_color: '#1B4332',
        background_color: '#f5fbf7',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        id: '/',
        categories: ['food', 'shopping', 'business'],
        lang: 'en',
        dir: 'ltr',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,webp,woff,woff2,ttf,eot}',
        ],
        globIgnores: [
          '**/remixicon-BTtOSOPh.svg',
          '**/push-sw.js',
        ],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB
        runtimeCaching: [
          // Google Fonts stylesheets
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          // Google Fonts webfont files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Remixicon fonts (loaded from CDN)
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/npm\/remixicon@.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'remixicon-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cloudinary images (product photos, avatars)
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cloudinary-images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Leaflet tile maps
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'leaflet-map-tiles',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // Navigation fallback: serve index.html for SPA routes
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          // Do not serve index.html for API calls
          /^\/api\//,
          // Do not serve index.html for Firebase/auth endpoints
          /^\/__/,
          // Do not serve index.html for 404.html (GitHub Pages SPA redirect)
          /\/404\.html$/,
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  base: '/',
})
