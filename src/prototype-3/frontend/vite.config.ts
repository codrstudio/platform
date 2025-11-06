import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['robots.txt'],
      manifest: {
        name: 'Codr Platform',
        short_name: 'Codr',
        description: 'Modular Platform for Building Reusable Applications',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        // Icons will be added in production
        // For now, use icon.svg as fallback
        icons: []
      },
      workbox: {
        // Cache-first for static assets (SPEC-A-PWA-008)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          // Network-first for navigation (HTML) - SPEC-A-PWA-023 to SPEC-A-PWA-028
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              }
            }
          },
          // Network-first for API calls (SPEC-A-PWA-009)
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5 // 5 minutes
              }
            }
          }
        ],
        // Clean old caches automatically
        cleanupOutdatedCaches: true,
        // Don't precache HTML files (SPEC-A-PWA-024)
        navigateFallback: null
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3400,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3443',
        changeOrigin: true
      }
    }
  },
  build: {
    // SPEC-A-LL-010: Tree-shaking to eliminate unused code
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // SPEC-A-LL-008: Vendor chunks for better caching
          // SPEC-R-PE-001: Each module as separate chunk
          if (id.includes('node_modules')) {
            // React core (most stable, cache longest)
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // React Router (routing, relatively stable)
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // TanStack Query (data fetching)
            if (id.includes('@tanstack')) {
              return 'vendor-tanstack';
            }
            // UI components (shadcn/ui dependencies)
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-ui';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            // Everything else
            return 'vendor';
          }

          // SPEC-A-LL-004: Separate module chunks
          // Future modules will be split automatically
          if (id.includes('/modules/')) {
            const moduleName = id.split('/modules/')[1]?.split('/')[0];
            if (moduleName) {
              return `module-${moduleName}`;
            }
          }

          // SPEC-R-PE-004: Lazy-loaded pages as separate chunks
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1]?.split('.')[0];
            if (pageName) {
              return `page-${pageName}`;
            }
          }

          // Core routing components
          if (id.includes('/core/routing/')) {
            return 'core-routing';
          }

          // Services layer
          if (id.includes('/services/')) {
            return 'core-services';
          }

          // Auth components and providers
          if (id.includes('/providers/') || id.includes('/components/auth/')) {
            return 'core-auth';
          }
        }
      }
    },
    // SPEC-A-LL-007: Target bundle size < 200KB initial
    // SPEC-A-LL-009: Module chunks < 500KB
    chunkSizeWarningLimit: 500,
    // Enable code splitting for better loading
    cssCodeSplit: true,
  }
});
