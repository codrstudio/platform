import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initSWUpdateHandler } from './services/swUpdateHandler'

// Inicializa Service Worker Update Handler
// autoReload=false: usuário será notificado para atualizar manualmente
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => {
    initSWUpdateHandler(false) // false = prompt user, true = auto reload
    console.log('[App] Service Worker Update Handler initialized')
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
