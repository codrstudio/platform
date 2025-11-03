import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './contexts/AuthContext'
import { SSEProvider } from './providers/SSEProvider'

// Register all modules
import './core/modules/registry'

// Render React app
// Provider order: Query → Auth → SSE → App
// SSE requires Auth to be available (auto-connects when authenticated)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <SSEProvider>
          <App />
        </SSEProvider>
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>,
)

/**
 * Register Service Worker for PWA functionality
 * SPEC-A-PWA-018: Service Worker registration on initialization
 * SPEC-A-PWA-021: Auto-update when new version available
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ [PWA] Service Worker registered:', registration.scope)

        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available, show update notification
              console.log('🔄 [PWA] New version available! Refresh to update.')

              // Optional: Show user notification
              if (confirm('A new version is available! Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' })
                window.location.reload()
              }
            }
          })
        })

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('♻️ [PWA] Service Worker updated, reloading page...')
          window.location.reload()
        })
      })
      .catch((error) => {
        console.error('❌ [PWA] Service Worker registration failed:', error)
      })
  })

  // Handle offline/online status
  window.addEventListener('online', () => {
    console.log('🌐 [PWA] Back online')
  })

  window.addEventListener('offline', () => {
    console.log('📡 [PWA] You are offline')
  })
} else {
  console.warn('⚠️ [PWA] Service Workers not supported in this browser')
}
