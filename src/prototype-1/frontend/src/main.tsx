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
// Note: PWA Service Worker registration is handled by UpdateAvailableDialog component
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
