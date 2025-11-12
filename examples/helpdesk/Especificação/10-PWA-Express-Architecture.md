# Paper 10: PWA com Express - Arquitetura Zero CORS

## 📋 Visão Geral

Este documento descreve a arquitetura full-stack do **Coletivos HelpDesk** usando **Node.js/Express + React + PWA**, eliminando completamente problemas de CORS tanto em desenvolvimento quanto em produção.

**Princípios fundamentais:**
- ✅ **Uma porta em produção** (zero CORS)
- ✅ **Vite proxy em dev** (zero CORS)
- ✅ **PWA offline-first** (experiência app nativo)
- ✅ **Express como proxy** (único ponto de entrada)

---

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER / PWA                        │
│  ┌───────────────────────────────────────────────────┐ │
│  │         React App (Vite build)                    │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │    Service Worker (PWA)                     │ │ │
│  │  │  - Cache assets (HTML/CSS/JS)               │ │ │
│  │  │  - Cache API responses (IndexedDB)          │ │ │
│  │  │  - Offline fallback                         │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
                    HTTP Requests
                          ↓
┌─────────────────────────────────────────────────────────┐
│              EXPRESS SERVER (Porta 4000)                │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Rota /api/jsql (Proxy)                          │ │
│  │    ↓                                              │ │
│  │  POST para N8N                                    │ │
│  │    ↓                                              │ │
│  │  Retorna resposta                                 │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Serve React Static Files (produção)             │ │
│  │    - /dist/index.html                             │ │
│  │    - /dist/assets/*                               │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
                    Proxy Request
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 N8N (Camada de Negócios)                │
│  - Workflow: coletivos-requisicao                       │
│  - Valida JWT                                           │
│  - Executa JSQL procedures                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    SQL SERVER                           │
│  - Procedures: sac.jsql__select__*                      │
│  - Procedures: sac.jsql__mutate__*                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

```
src/helpdesk/
├── server/                         # Backend Express
│   ├── index.ts                    # Entry point
│   ├── routes/
│   │   └── jsql.ts                 # POST /api/jsql (proxy N8N)
│   ├── middleware/
│   │   └── error.ts                # Error handling
│   └── config/
│       └── n8n.ts                  # N8N URLs
│
├── src/                            # Frontend React
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component
│   ├── components/                 # UI components
│   ├── pages/                      # Route pages
│   ├── core/
│   │   ├── api/
│   │   │   └── jsqlClient.ts       # API client
│   │   └── hooks/
│   └── sw/
│       └── service-worker.ts       # PWA Service Worker
│
├── public/
│   ├── manifest.json               # PWA Manifest
│   └── icons/                      # PWA Icons (192x192, 512x512)
│
├── dist/                           # Build output (git ignored)
│   ├── index.html
│   ├── assets/
│   └── sw.js
│
├── vite.config.ts                  # Vite config (com proxy)
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 🚀 Configuração: Dev vs Prod

### Development Mode

**2 processos, 1 origin (zero CORS)**

```bash
# Terminal 1: Backend Express
npm run dev:back
# Roda em http://localhost:4000

# Terminal 2: Frontend Vite
npm run dev:front
# Roda em http://localhost:5173
# Proxy /api → localhost:4000
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Coletivos HelpDesk',
        short_name: 'HelpDesk',
        theme_color: '#0EA5E9',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutos
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

**Fluxo Dev:**
```
Browser → http://localhost:5173/api/jsql
              ↓ (Vite proxy interno)
          http://localhost:4000/api/jsql
              ↓ (Express)
          https://n8n.codrstudio.dev/webhook/...
              ↓ (N8N)
          SQL Server
```

**Perspectiva do Browser:**
- Request: `http://localhost:5173/api/jsql`
- Response: `http://localhost:5173/api/jsql`
- **Same origin → ZERO CORS! ✅**

---

### Production Mode

**1 processo, 1 porta (zero CORS)**

```bash
# Build frontend
npm run build
# Output: dist/

# Start server
npm start
# Express serve em http://localhost:4000
```

**server/index.ts:**
```typescript
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import jsqlRouter from './routes/jsql.js'
import errorHandler from './middleware/error.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000
const isDev = process.env.NODE_ENV !== 'production'

// Middleware
app.use(express.json())

// API Routes (sempre primeiro!)
app.use('/api', jsqlRouter)

// Serve React static files (produção)
if (!isDev) {
  const distPath = path.join(__dirname, '../dist')

  // Serve arquivos estáticos
  app.use(express.static(distPath))

  // SPA fallback: todas as rotas não-API retornam index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📦 Mode: ${isDev ? 'development' : 'production'}`)
})
```

**Fluxo Prod:**
```
Browser → http://app.com:4000/
              ↓ (Express static)
          dist/index.html

Browser → http://app.com:4000/api/jsql
              ↓ (Express proxy)
          https://n8n.codrstudio.dev/webhook/...
              ↓ (N8N)
          SQL Server
```

**Perspectiva do Browser:**
- Request: `http://app.com:4000/api/jsql`
- Response: `http://app.com:4000/api/jsql`
- **Same origin → ZERO CORS! ✅**

---

## 🔌 Implementação da Rota Proxy

### server/routes/jsql.ts

```typescript
import { Router } from 'express'
import fetch from 'node-fetch'
import { N8N_CONFIG } from '../config/n8n.js'

const router = Router()

/**
 * POST /api/jsql
 *
 * Proxy para N8N workflow coletivos-requisicao
 * Repassa JSQL query do frontend para N8N e retorna resposta
 */
router.post('/jsql', async (req, res) => {
  try {
    const jsqlQuery = req.body

    // Validação básica
    if (!jsqlQuery.select && !jsqlQuery.mutate) {
      return res.status(400).json({
        code: 400,
        message: 'Query JSQL inválida: deve conter "select" ou "mutate"'
      })
    }

    // Monta URL do N8N
    const n8nUrl = `${N8N_CONFIG.baseUrl}${N8N_CONFIG.endpoints.requisicao}`

    // Repassa headers de autenticação
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Prioridade: Cookie > Authorization header > Body
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie
    }
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization
    }

    // Faz request para N8N
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(jsqlQuery)
    })

    // Parse resposta
    const data = await response.json()

    // Retorna com mesmo status code
    res.status(response.status).json(data)

  } catch (error) {
    console.error('Erro ao processar JSQL:', error)

    res.status(500).json({
      code: 500,
      message: 'Erro interno ao processar requisição JSQL',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router
```

### server/config/n8n.ts

```typescript
export const N8N_CONFIG = {
  baseUrl: process.env.N8N_URL || 'https://n8n.codrstudio.dev',
  endpoints: {
    requisicao: '/webhook/coletivos/api/1/requisicao',
    autenticar: '/webhook/coletivos/api/1/autenticar',
    autorizar: '/webhook/coletivos/api/1/autorizar'
  },
  timeout: 30000 // 30 segundos
}
```

---

## 📱 PWA: Experiência Offline

### Objetivo

**Quando o app está offline:**
- ❌ **NÃO** mostrar página de erro do browser (ERR_INTERNET_DISCONNECTED)
- ✅ **SIM** mostrar interface do app com mensagem "Você está offline"
- ✅ Cache de assets (HTML/CSS/JS) para funcionar offline
- ✅ Cache de dados (opcional: últimas consultas em IndexedDB)

### Service Worker Strategy

```typescript
// src/sw/service-worker.ts

const CACHE_NAME = 'helpdesk-v1'
const ASSETS_CACHE = 'helpdesk-assets-v1'
const API_CACHE = 'helpdesk-api-v1'

// Assets para cache (shell do app)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
  // Vite adiciona automaticamente: /assets/*.js, /assets/*.css
]

// Install: Pre-cache assets críticos
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(ASSETS_CACHE).then(cache => {
      return cache.addAll(PRECACHE_ASSETS)
    })
  )
})

// Activate: Limpar caches antigos
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== ASSETS_CACHE && key !== API_CACHE)
          .map(key => caches.delete(key))
      )
    })
  )
})

// Fetch: Estratégias de cache
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // API requests: Network First (com fallback offline)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache resposta bem-sucedida
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Offline: tenta cache
          return caches.match(request).then(cached => {
            if (cached) {
              return cached
            }
            // Sem cache: retorna resposta offline
            return new Response(
              JSON.stringify({
                code: 503,
                message: 'Você está offline. Conecte-se à internet para continuar.',
                offline: true
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          })
        })
    )
    return
  }

  // Assets estáticos: Cache First
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        return cached
      }

      return fetch(request).then(response => {
        // Cache assets para uso futuro
        if (response.ok && request.method === 'GET') {
          const responseClone = response.clone()
          caches.open(ASSETS_CACHE).then(cache => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
    })
  )
})
```

### Componente Offline (React)

```typescript
// src/components/OfflineBanner.tsx
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-3 text-center z-50">
      <p className="font-semibold">⚠️ Você está offline</p>
      <p className="text-sm">Conecte-se à internet para continuar usando o sistema.</p>
    </div>
  )
}
```

### Integração no App

```typescript
// src/App.tsx
import { OfflineBanner } from './components/OfflineBanner'

export function App() {
  return (
    <>
      <OfflineBanner />
      {/* Resto do app */}
    </>
  )
}
```

---

## 🔐 Autenticação e Cookies

### Como funciona:

1. **Login via N8N** → retorna JWT
2. **JWT salvo em cookie httpOnly** (seguro)
3. **Requests automáticos** → cookie enviado pelo browser
4. **Express repassa cookie** → N8N valida

### Fluxo de Login

```typescript
// src/core/auth/AuthContext.tsx
async function login(email: string, password: string) {
  // POST para nosso backend (que proxy para N8N)
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include' // IMPORTANTE: envia cookies
  })

  const data = await response.json()

  if (data.code === 200) {
    // JWT já está no cookie (httpOnly)
    // Salvar dados do usuário no state
    setUser(data.data.user)
    return true
  }

  return false
}
```

**Express proxy login:**
```typescript
// server/routes/auth.ts
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  const response = await fetch(`${N8N_CONFIG.baseUrl}${N8N_CONFIG.endpoints.autenticar}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await response.json()

  if (data.code === 200 && data.data.access_token) {
    // Define cookie httpOnly
    res.cookie('access_token', data.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only em prod
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    })
  }

  res.json(data)
})
```

---

## 📦 Scripts package.json

```json
{
  "name": "coletivos-helpdesk",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev:front": "vite",
    "dev:back": "tsx watch server/index.ts",
    "dev": "concurrently \"npm run dev:back\" \"npm run dev:front\"",
    "build": "vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "start": "NODE_ENV=production node dist-server/index.js",
    "preview": "vite preview"
  },
  "dependencies": {
    "express": "^4.18.2",
    "node-fetch": "^3.3.2",
    "cookie-parser": "^1.4.6"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@vitejs/plugin-react": "^4.2.1",
    "concurrently": "^8.2.2",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "vite-plugin-pwa": "^0.17.4"
  }
}
```

---

## 🌐 Deploy em Produção

### Traefik (Reverse Proxy)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  helpdesk:
    build: .
    environment:
      - NODE_ENV=production
      - PORT=4000
      - N8N_URL=https://n8n.codrstudio.dev
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.helpdesk.rule=Host(`helpdesk.codrstudio.dev`)"
      - "traefik.http.routers.helpdesk.entrypoints=websecure"
      - "traefik.http.routers.helpdesk.tls.certresolver=letsencrypt"
      - "traefik.http.services.helpdesk.loadbalancer.server.port=4000"
    networks:
      - traefik
    restart: unless-stopped

networks:
  traefik:
    external: true
```

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build frontend
COPY . .
RUN npm run build

# Build server
RUN npm run build:server

# Expose port
EXPOSE 4000

# Start
CMD ["npm", "start"]
```

---

## ✅ Checklist de Implementação

### Backend Express
- [ ] Criar estrutura `server/`
- [ ] Implementar `server/index.ts` (Express + static serving)
- [ ] Implementar `server/routes/jsql.ts` (proxy N8N)
- [ ] Implementar `server/routes/auth.ts` (proxy login)
- [ ] Implementar `server/config/n8n.ts` (config N8N)
- [ ] Implementar `server/middleware/error.ts` (error handler)

### Frontend React
- [ ] Configurar `vite.config.ts` (proxy + PWA)
- [ ] Criar `public/manifest.json` (PWA manifest)
- [ ] Adicionar icons PWA (192x192, 512x512)
- [ ] Implementar `src/sw/service-worker.ts` (cache strategies)
- [ ] Implementar `src/components/OfflineBanner.tsx` (UI offline)
- [ ] Configurar `src/core/api/jsqlClient.ts` (usar `/api/jsql`)

### PWA
- [ ] Registrar Service Worker no `main.tsx`
- [ ] Testar cache offline (DevTools → Application → Cache Storage)
- [ ] Testar offline mode (DevTools → Network → Offline)
- [ ] Validar manifest (Lighthouse PWA audit)
- [ ] Testar instalação no mobile (iOS/Android)

### Deploy
- [ ] Configurar `.env` em produção
- [ ] Build Docker image
- [ ] Configurar Traefik labels
- [ ] Deploy em servidor
- [ ] Validar HTTPS (obrigatório para PWA)
- [ ] Testar Service Worker em produção

---

## 🎯 Benefícios desta Arquitetura

✅ **Zero CORS** - Mesmo origin em dev e prod
✅ **PWA Completo** - Funciona offline, instalável
✅ **Deploy Simples** - Um container, uma porta
✅ **Dev Experience** - Hot reload Vite + backend watch
✅ **Segurança** - Cookies httpOnly, HTTPS obrigatório
✅ **Performance** - Cache inteligente, assets otimizados
✅ **Manutenção** - Codebase única Node.js full-stack

---

**Última atualização:** 2025-10-02
**Autor:** Claude Code
**Status:** ✅ Especificação Completa
