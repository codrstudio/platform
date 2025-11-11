/**
 * Custom Service Worker for PWA Update Control
 *
 * Este Service Worker customizado adiciona suporte para update manual
 * via postMessage, permitindo que o usuário controle quando a aplicação
 * deve atualizar para uma nova versão.
 *
 * Features:
 * - Message listener para SKIP_WAITING
 * - Workbox precaching para assets estáticos
 * - Cache strategies para diferentes tipos de recursos
 *
 * Refs: PLAN_4-Cache-Invalidation.md - FASE 3
 */

/* eslint-disable no-undef */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'

// ============================================================================
// PRECACHING - Assets estáticos gerados pelo build
// ============================================================================

// O Workbox vai injetar automaticamente a lista de assets para precache
// durante o build process
precacheAndRoute(self.__WB_MANIFEST)

// Limpa caches antigos de versões anteriores
cleanupOutdatedCaches()

// ============================================================================
// MESSAGE LISTENER - Controle manual de update
// ============================================================================

self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Processing SKIP_WAITING message')

    // Força o Service Worker em waiting state a se tornar ativo
    self.skipWaiting()

    // Responde ao client confirmando que o comando foi processado
    event.ports[0]?.postMessage({ type: 'SKIP_WAITING_PROCESSED' })
  }

  if (event.data && event.data.type === 'INVALIDATE_ICONS') {
    console.log('[SW] Processing INVALIDATE_ICONS message')

    // Invalida cache de ícones e manifest
    event.waitUntil(
      caches.open('icons-cache').then((cache) => {
        return cache.keys().then((keys) => {
          // Remove todos os ícones do cache
          const deletePromises = keys.map((key) => {
            console.log('[SW] Deleting from cache:', key.url)
            return cache.delete(key)
          })
          return Promise.all(deletePromises)
        })
      }).then(() => {
        // Também limpa cache de images que pode ter PWA icons
        return caches.open('images-cache').then((cache) => {
          return cache.keys().then((keys) => {
            const iconKeys = keys.filter((key) =>
              key.url.includes('/assets/') &&
              (key.url.includes('favicon') ||
               key.url.includes('pwa-') ||
               key.url.includes('apple-touch'))
            )
            const deletePromises = iconKeys.map((key) => {
              console.log('[SW] Deleting icon from images-cache:', key.url)
              return cache.delete(key)
            })
            return Promise.all(deletePromises)
          })
        })
      }).then(() => {
        // Remove manifest do cache
        return caches.open('api-cache').then((cache) => {
          return cache.keys().then((keys) => {
            const manifestKeys = keys.filter((key) =>
              key.url.includes('manifest.webmanifest')
            )
            const deletePromises = manifestKeys.map((key) => {
              console.log('[SW] Deleting manifest from cache:', key.url)
              return cache.delete(key)
            })
            return Promise.all(deletePromises)
          })
        })
      }).then(() => {
        console.log('[SW] Icon cache invalidation complete')

        // Responde ao client
        if (event.ports[0]) {
          event.ports[0].postMessage({ type: 'ICONS_CACHE_INVALIDATED' })
        }
      }).catch((error) => {
        console.error('[SW] Error invalidating icon cache:', error)
      })
    )
  }
})

// ============================================================================
// CACHE STRATEGIES - Diferentes estratégias por tipo de recurso
// ============================================================================

// API Calls - Network First (prioriza dados frescos)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutos
      }),
    ],
  })
)

// Icons & PWA assets - Cache First with shorter expiration for updates
registerRoute(
  ({ url }) =>
    url.pathname.includes('/assets/') &&
    (url.pathname.includes('favicon') ||
     url.pathname.includes('pwa-') ||
     url.pathname.includes('apple-touch')),
  new CacheFirst({
    cacheName: 'icons-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
      }),
    ],
  })
)

// Manifest - Cache First with shorter expiration
registerRoute(
  ({ url }) => url.pathname.includes('manifest.webmanifest'),
  new CacheFirst({
    cacheName: 'manifest-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 5,
        maxAgeSeconds: 24 * 60 * 60, // 1 dia
      }),
    ],
  })
)

// Images - Cache First (assets estáticos)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
)

// Fonts - Cache First (raramente mudam)
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
      }),
    ],
  })
)

// CSS & JS - Stale While Revalidate (performance + frescor)
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
      }),
    ],
  })
)

// ============================================================================
// ACTIVATION - Claim clients imediatamente após ativação
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated')

  // Faz claim de todos os clients imediatamente
  // Isso garante que o novo SW controle todas as páginas abertas
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('[SW] Clients claimed')
    })
  )
})

// ============================================================================
// INSTALL - Log de instalação
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing')

  // Por padrão, NÃO fazemos skipWaiting aqui
  // Queremos que o usuário tenha controle sobre quando atualizar
  // O skipWaiting só será chamado quando recebermos a mensagem SKIP_WAITING
})

console.log('[SW] Custom Service Worker loaded')
