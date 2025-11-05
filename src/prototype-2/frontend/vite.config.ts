import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import * as path from 'path'

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      // React Fast Refresh
      react(),

      // PWA with service worker
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'icons/**/*.png'],
        manifest: {
          // Core identity
          name: env.VITE_APP_NAME || 'Platform Application',
          short_name: env.VITE_APP_SHORT_NAME || 'Platform',
          description: env.VITE_APP_DESCRIPTION || 'Modular application platform for building scalable web applications',

          // Display configuration
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'any',

          // Theming (SPEC-A-PWA-016, SPEC-A-PWA-017)
          theme_color: env.VITE_THEME_COLOR || '#000000',
          background_color: env.VITE_BACKGROUND_COLOR || '#ffffff',

          // Icons (SPEC-A-PWA-013)
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],

          // Metadata
          categories: ['productivity', 'business'],
          lang: 'en-US',
          dir: 'ltr'
        },
        workbox: {
          // Cache static assets including module chunks (SPEC-A-PWA-007)
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],

          // Offline fallback page (SPEC-A-PWA-006)
          navigateFallback: '/offline.html',
          navigateFallbackDenylist: [/^\/api\//, /^\/auth\//],

          // Automatic cache cleanup (SPEC-A-PWA-020)
          cleanupOutdatedCaches: true,
          clientsClaim: true,

          // Runtime caching strategies
          runtimeCaching: [
            // Strategy 1: API Data - NetworkFirst (excludes auth & events)
            {
              urlPattern: /^https?:\/\/.*\/api\/(?!1\/auth|events).*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 5 * 60 // 5 minutes
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },

            // Strategy 2: Authentication & Events - NetworkOnly (SPEC-A-PWA-022)
            {
              urlPattern: /^https?:\/\/.*\/api\/(1\/auth|events).*/,
              handler: 'NetworkOnly'
            },

            // Strategy 3: Vendor Chunks - CacheFirst (rarely change)
            {
              urlPattern: /\/assets\/.*-vendor-.*\.js$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'vendor-chunks',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },

            // Strategy 4: Module Chunks - StaleWhileRevalidate (may update)
            {
              urlPattern: /\/assets\/modules-.*\.js$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'module-chunks',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },

            // Strategy 5: Other JavaScript/CSS - CacheFirst (SPEC-A-PWA-008)
            {
              urlPattern: /\/assets\/.*\.(js|css)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'asset-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },

            // Strategy 6: External Resources - StaleWhileRevalidate
            {
              urlPattern: /^https?:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net).*/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'external-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },

            // Strategy 7: Images - CacheFirst with size limit
            {
              urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      }),

      // Optional: Enforce chunk size limits (for CI/CD)
      // Uncomment the following to fail builds with oversized chunks
      /*
      {
        name: 'enforce-chunk-size',
        generateBundle(options, bundle) {
          const MAX_CHUNK_SIZE = 500 * 1024; // 500KB in bytes
          const oversized = [];

          for (const [fileName, chunk] of Object.entries(bundle)) {
            if (chunk.type === 'chunk' && chunk.code) {
              const size = Buffer.byteLength(chunk.code);
              if (size > MAX_CHUNK_SIZE) {
                oversized.push({ fileName, size: Math.round(size / 1024) });
              }
            }
          }

          if (oversized.length > 0) {
            console.warn('⚠️ Oversized chunks detected:');
            oversized.forEach(({ fileName, size }) => {
              console.warn(`  - ${fileName}: ${size}KB (max: 500KB)`);
            });
            // Uncomment to fail build in CI:
            // throw new Error('Build failed: chunks exceed size limit');
          }
        }
      }
      */
    ],

    // Path aliases (must match tsconfig.json)
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/core': path.resolve(__dirname, './src/core'),
        '@/services': path.resolve(__dirname, './src/services'),
        '@/modules': path.resolve(__dirname, './src/modules'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/types': path.resolve(__dirname, './src/types'),
        '@/utils': path.resolve(__dirname, './src/utils'),
        '@/lib': path.resolve(__dirname, './src/lib'),
        '@/providers': path.resolve(__dirname, './src/providers'),
      },
    },

    // Development server
    server: {
      port: Number(env.VITE_PORT) || 5173,
      strictPort: true, // Fail if port occupied
      host: true, // Listen on all addresses

      // Proxy API requests to backend
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true, // WebSocket support for SSE
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              console.error('[Proxy Error]', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('[Proxy]', req.method, req.url);
            });
          }
        }
      }
    },

    // Production build configuration
    build: {
      target: 'es2020', // React 19 compatibility
      cssCodeSplit: true, // Split CSS per async chunk
      sourcemap: false, // Disable source maps in production (enable for debugging)

      // Performance: disable gzip reporting for faster builds
      reportCompressedSize: false,

      // Chunk size warning threshold
      chunkSizeWarningLimit: 500, // 500 KB (per SPEC-A-LL-009)

      // Rollup options for advanced bundling
      rollupOptions: {
        output: {
          // Manual chunk splitting for vendor code
          manualChunks: {
            // React core libraries (~140KB)
            'react-vendor': [
              'react',
              'react-dom',
              'react-router-dom'
            ],

            // TanStack Query (~50KB)
            'query-vendor': [
              '@tanstack/react-query',
              '@tanstack/react-query-devtools'
            ],

            // Radix UI components (shadcn/ui base) (~150KB)
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-label',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-avatar'
            ],

            // Form libraries (~30KB)
            'form-vendor': [
              'react-hook-form',
              '@hookform/resolvers',
              'zod'
            ]
          },

          // Custom chunk naming for better debugging and caching
          chunkFileNames: (chunkInfo) => {
            // Modules get predictable names for easier debugging
            if (chunkInfo.name.includes('modules/')) {
              return 'assets/[name]-[hash].js';
            }
            // Other chunks use default pattern
            return 'assets/[name]-[hash].js';
          },

          // Entry point naming
          entryFileNames: 'assets/[name]-[hash].js',

          // Asset naming (CSS, images)
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      }
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query'
      ]
    }
  }
})
