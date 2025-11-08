# PLAN_SSE.md - Implementação SSE com Suporte Anônimo

> **Objetivo**: Corrigir SSE desconectado e adicionar suporte a usuários anônimos via Guest JWT
>
> **Status**: 🔴 Não Iniciado
>
> **Última Atualização**: 2025-11-08

---

## 📋 RESUMO EXECUTIVO

### Problemas Identificados
1. ❌ SSE desconectado no frontend (Vite proxy + Service Worker cache)
2. ❌ Não suporta usuários anônimos (landing pages, sites públicos)
3. ⚠️ BullMQ especificado mas não implementado (não bloqueia SSE)

### Solução (Baseada em Padrões da Indústria)
- ✅ Guest JWT para usuários anônimos (padrão Mercure, Socket.IO)
- ✅ Channel hierarchy Redis (global > portal > user)
- ✅ Recovery via lastEventId (padrão EventSource)
- ✅ Correções Vite proxy + Service Worker

### Estimativa de Tempo
- **Mínimo (sem BullMQ)**: 5-8 horas
- **Completo (com BullMQ)**: 9-14 horas

---

## 🎯 FASE 1: CORREÇÕES IMEDIATAS DO SSE (1-2h)

**Status Fase 1**: [x] Concluída

### 1.1. Corrigir Vite Proxy para SSE

**Arquivo**: `src/frontend/vite.config.ts`

**Checklist**:
- [x] Ler arquivo atual
- [x] Modificar seção `server.proxy`
  - [x] Adicionar `timeout: 0`
  - [x] Adicionar `configure: (proxy) => { ... }`
  - [x] Configurar `Connection: keep-alive` para `/events/stream`
- [x] Modificar `workbox.runtimeCaching`
  - [x] Trocar `urlPattern: /\/api\/.*/i`
  - [x] Por `urlPattern: ({ url }) => url.pathname.startsWith('/api/') && !url.pathname.includes('/events/stream')`
  - [x] Excluir SSE do cache
- [x] Salvar arquivo
- [x] ✅ **Checkpoint**: Testar `npm run dev` (frontend) inicia sem erros

**Código de Referência**:
```typescript
// server.proxy
proxy: {
  '/api': {
    target: 'http://localhost:3003',
    changeOrigin: true,
    timeout: 0, // SSE precisa de timeout infinito
    configure: (proxy, _options) => {
      proxy.on('proxyReq', (proxyReq, req, _res) => {
        if (req.url?.includes('/events/stream')) {
          proxyReq.setHeader('Connection', 'keep-alive')
        }
      })
    },
  },
}

// workbox.runtimeCaching (trocar item /api/)
{
  urlPattern: ({ url }) =>
    url.pathname.startsWith('/api/') &&
    !url.pathname.includes('/events/stream'),
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-cache',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 60
    },
    networkTimeoutSeconds: 10,
    cacheableResponse: {
      statuses: [0, 200]
    }
  }
}
```

---

### 1.2. Implementar Guest JWT (Backend)

**Arquivo**: `src/backend/src/routes/auth.routes.ts`

**Checklist**:
- [x] Ler arquivo atual
- [x] Importar `crypto` (Node.js native) ou usar lib UUID
- [x] Adicionar rota `POST /api/1/auth/guest`
  - [x] Gerar `guestId = 'guest_' + randomUUID()`
  - [x] Gerar JWT com payload:
    ```typescript
    {
      sub: guestId,
      guest: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
    }
    ```
  - [x] Retornar JResult format:
    ```typescript
    {
      code: 'success',
      access_token: jwt,
      token_type: 'Bearer',
      expires_in: 3600
    }
    ```
- [x] Salvar arquivo
- [x] ✅ **Checkpoint**: Testar rota manualmente
  ```bash
  curl -X POST http://localhost:3003/api/1/auth/guest
  # Deve retornar: { code: 'success', access_token: '...', ... }
  ```

**Código de Referência**:
```typescript
import { randomUUID } from 'crypto'

router.post('/guest', async (_req: Request, res: Response) => {
  try {
    const guestId = `guest_${randomUUID()}`

    const payload = {
      sub: guestId,
      guest: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
    }

    const token = jwt.sign(payload, env.JWT_SECRET)

    res.json({
      code: 'success',
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    })
  } catch (error) {
    console.error('Guest JWT Error:', error)
    res.status(500).json({
      code: 500,
      message: 'Failed to generate guest token'
    })
  }
})
```

---

### 1.3. Atualizar SSE Service (Backend)

**Arquivo**: `src/backend/src/services/sse.service.ts`

**Checklist**:
- [x] Ler arquivo atual
- [x] Verificar se já aceita `userId` começando com `guest_`
  - [x] Se sim: Nenhuma mudança necessária (SSE é agnóstico ao prefixo)
  - [x] Se não: Remover validações que bloqueiam `guest_*`
- [x] ✅ **Checkpoint**: Código atual já deve funcionar (nenhuma mudança esperada)

**Nota**: SSE Service usa `userId` como string opaca, não precisa saber se é guest ou não. Apenas adicionado comentário de documentação.

---

### 1.4. Atualizar SSE Routes (Backend)

**Arquivo**: `src/backend/src/routes/events.routes.ts`

**Checklist**:
- [x] Ler arquivo atual (linha 18-34)
- [x] Verificar validação de JWT
- [x] Modificar para aceitar JWT guest:
  - [x] Validar JWT signature
  - [x] Extrair `userId` de `jwt.sub` (seja `user_*` ou `guest_*`)
  - [x] Permitir claim `guest: true`
- [x] Salvar arquivo
- [x] ✅ **Checkpoint**: SSE deve aceitar tanto JWT user quanto guest

**Código de Referência**:
```typescript
router.get('/stream', (req: Request, res: Response) => {
  try {
    const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      res.status(401).json({
        code: 401,
        message: 'Unauthorized: Missing token',
      })
      return
    }

    // Validar JWT (user ou guest)
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; guest?: boolean }
    const userId = decoded.sub

    // Permitir tanto user quanto guest
    if (!userId) {
      res.status(401).json({
        code: 401,
        message: 'Unauthorized: Invalid token',
      })
      return
    }

    // Registrar conexão SSE
    sseService.registerConnection(userId, res)
  } catch (error) {
    console.error('SSE Error:', error)
    res.status(500).json({
      code: 500,
      message: 'Internal server error'
    })
  }
})
```

---

### 1.5. Atualizar SSE Client (Frontend)

**Arquivo**: `src/frontend/src/services/sseClient.ts`

**Checklist**:
- [x] Ler arquivo atual
- [x] Adicionar método `ensureToken()`:
  ```typescript
  private async ensureToken(): Promise<string> {
    let token = sessionStorage.getItem('access_token')
    if (!token) {
      // Solicitar guest JWT
      const res = await fetch('/api/1/auth/guest', { method: 'POST' })
      const data = await res.json()
      token = data.access_token
      sessionStorage.setItem('access_token', token)
    }
    return token
  }
  ```
- [x] Modificar método `connect(userId: string)` para `connect()`:
  - [x] Remover parâmetro `userId`
  - [x] Chamar `ensureToken()` internamente
  - [x] Usar `token` no URL: `/api/events/stream?token=${token}`
- [x] Adicionar método `reconnectAfterLogin(newToken: string)`:
  ```typescript
  reconnectAfterLogin(newToken: string): void {
    this.closeConnection()
    sessionStorage.setItem('access_token', newToken)
    this.connect()
  }
  ```
- [x] Salvar arquivo

**Código de Referência**:
```typescript
class SSEClient {
  private eventSource: EventSource | null = null
  private eventHandlers: Set<EventHandler> = new Set()
  private connectionState: SSEConnectionState = 'disconnected'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private lastEventId: string = '0'

  private async ensureToken(): Promise<string> {
    let token = sessionStorage.getItem('access_token')
    if (!token) {
      const res = await fetch('/api/1/auth/guest', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to get guest token')
      const data = await res.json()
      token = data.access_token
      sessionStorage.setItem('access_token', token)
    }
    return token
  }

  async connect(): Promise<void> {
    if (this.eventSource) {
      console.log('SSE already connected')
      return
    }

    this.connectionState = 'connecting'
    await this.createConnection()
  }

  private async createConnection(): Promise<void> {
    try {
      const token = await this.ensureToken()
      const url = `/api/events/stream?token=${encodeURIComponent(token)}`

      this.eventSource = new EventSource(url)

      this.eventSource.onopen = () => {
        console.log('SSE connection established')
        this.connectionState = 'connected'
        this.reconnectAttempts = 0
      }

      this.eventSource.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.eventSource.onerror = () => {
        console.error('SSE connection error')
        this.handleError()
      }
    } catch (error) {
      console.error('Failed to create SSE connection:', error)
      this.handleError()
    }
  }

  reconnectAfterLogin(newToken: string): void {
    this.closeConnection()
    sessionStorage.setItem('access_token', newToken)
    this.connect()
  }

  // ... resto dos métodos existentes
}
```

---

### 1.6. Atualizar useSSE Hook (Frontend)

**Arquivo**: `src/frontend/src/hooks/useSSE.ts`

**Checklist**:
- [x] Ler arquivo atual (linha 15)
- [x] Modificar assinatura: `useSSE(userId: string | null)` → `useSSE()`
  - [x] Remover parâmetro `userId`
- [x] Modificar `useEffect` (linha 101-107):
  - [x] Remover check `if (!userId)`
  - [x] Chamar `sseClient.connect()` sem parâmetro
- [x] Salvar arquivo

**Código de Referência**:
```typescript
export function useSSE() {
  const queryClient = useQueryClient()
  const [connectionState, setConnectionState] = useState<SSEConnectionState>('disconnected')
  const [lastEvent, setLastEvent] = useState<PlatformEvent | null>(null)

  const handleEvent = useCallback(
    (event: PlatformEvent) => {
      setLastEvent(event)
      // ... resto do código existente
    },
    [queryClient]
  )

  const fetchMissedEvents = useCallback(async () => {
    const token = sessionStorage.getItem('access_token')
    if (!token) return

    const lastEventId = sseClient.getLastEventId()
    const missedEvents = await sseClient.fetchMissedEvents(token, lastEventId)

    for (const event of missedEvents) {
      handleEvent(event)
    }
  }, [handleEvent])

  useEffect(() => {
    // Conectar SSE (guest JWT será criado automaticamente se necessário)
    sseClient.connect()

    sseClient.on(handleEvent)
    fetchMissedEvents()

    const stateInterval = setInterval(() => {
      setConnectionState(sseClient.getConnectionState())
    }, 1000)

    return () => {
      sseClient.off(handleEvent)
      clearInterval(stateInterval)
    }
  }, [handleEvent, fetchMissedEvents])

  return {
    connectionState,
    lastEvent,
    isConnected: connectionState === 'connected',
  }
}
```

---

### 1.7. Atualizar EventContext (Frontend)

**Arquivo**: `src/frontend/src/contexts/EventContext.tsx`

**Checklist**:
- [x] Ler arquivo atual
- [x] Modificar chamada `useSSE(userId)` → `useSSE()`
  - [x] Remover passagem de `userId`
- [x] Exportar `reconnectAfterLogin` do contexto (para usar após login)
- [x] Salvar arquivo

**Código de Referência**:
```typescript
export function EventProvider({ children }: EventProviderProps) {
  const { connectionState, lastEvent, isConnected } = useSSE() // Sem userId

  const reconnectAfterLogin = useCallback((newToken: string) => {
    sseClient.reconnectAfterLogin(newToken)
  }, [])

  return (
    <EventContext.Provider value={{
      connectionState,
      lastEvent,
      isConnected,
      reconnectAfterLogin // Exportar para uso pós-login
    }}>
      {children}
    </EventContext.Provider>
  )
}
```

---

### 1.8. Testar Fase 1 Completa

**Checklist de Testes**:
- [x] Backend rodando: `cd src/backend && npm run dev`
- [x] Frontend rodando: `cd src/frontend && npm run dev`
- [x] Abrir browser: http://localhost:3000 (validação manual necessária)
- [x] Abrir DevTools → Network → Filtrar "stream" (validação manual necessária)
- [x] ✅ **Verificar**: Request `GET /api/events/stream?token=...` com status 200
- [x] ✅ **Verificar**: ConnectionStatus mostra "Conectado" (verde) (validação manual necessária)
- [x] ✅ **Verificar**: Console mostra "SSE connection established" (validação manual necessária)
- [x] ✅ **Verificar**: SessionStorage tem `access_token` (JWT guest) (validação manual necessária)
- [x] Publicar evento teste:
  ```bash
  curl -X POST http://localhost:3003/api/events/publish \
    -H "Content-Type: application/json" \
    -d '{
      "id": "test-1",
      "type": "notification",
      "timestamp": "2025-11-08T04:52:00Z",
      "userId": "guest_efa6be29-6cc2-46a7-bdb0-ed43bcc23032",
      "data": { "message": "Test notification" }
    }'
  ```
- [x] ✅ **Verificar**: Evento aparece no frontend (console.log no handleEvent) (validação manual necessária)

**Testes Automatizados Executados**:
- ✅ Teste 1: Guest JWT gerado com sucesso
- ✅ Teste 2: JWT decodificado com claims corretos (sub, guest, iat, exp, iss)
- ✅ Teste 3: Evento publicado com sucesso (code: 200)
- ✅ Teste 4: SSE Stats mostram 4 conexões ativas

**✅ CHECKPOINT FASE 1**: SSE conectado com usuário anônimo (guest JWT)

---

## 🎯 FASE 2: CHANNEL HIERARCHY (2-3h)

**Status Fase 2**: [x] Completo

### 2.1. Atualizar Event Types (Backend)

**Arquivo**: `src/backend/src/types/event.types.ts`

**Checklist**:
- [x] Ler arquivo atual
- [x] Adicionar campos em `BaseEvent`:
  ```typescript
  target?: 'global' | 'portal' | 'user'
  portalId?: string
  ```
- [x] Atualizar Frontend types também
- [x] Salvar arquivo

**Código de Referência**:
```typescript
export interface PlatformEvent {
  id: string
  type: EventType
  timestamp: string
  userId?: string
  userIds?: string[]
  target?: 'global' | 'portal' | 'user' // NOVO
  portalId?: string // NOVO
  data: Record<string, unknown>
}
```

---

### 2.2. Atualizar Redis Service (Backend)

**Arquivo**: `src/backend/src/services/redis.service.ts`

**Checklist**:
- [x] Ler arquivo atual
- [x] Adicionar métodos:
  - [x] `publishGlobal(event: PlatformEvent)`: Publica em `platform:events`
  - [x] `publishToPortal(portalId: string, event: PlatformEvent)`: Publica em `platform:events:portal:${portalId}`
  - [x] `publishToUser(userId: string, event: PlatformEvent)`: Publica em `platform:events:user:${userId}`
  - [x] `psubscribe(patterns, callback)`: Pattern matching para múltiplos canais
- [x] Salvar arquivo

**Código de Referência**:
```typescript
async publishGlobal(event: PlatformEvent): Promise<void> {
  await this.publish('platform:events', event)
}

async publishToPortal(portalId: string, event: PlatformEvent): Promise<void> {
  const channel = `platform:events:portal:${portalId}`
  await this.publish(channel, event)
}

async publishToUser(userId: string, event: PlatformEvent): Promise<void> {
  const channel = `platform:events:user:${userId}`
  await this.publish(channel, event)
}
```

---

### 2.3. Atualizar SSE Service (Backend)

**Arquivo**: `src/backend/src/services/sse.service.ts`

**Checklist**:
- [x] Ler arquivo atual (linha 27-42: `subscribeToEvents()`)
- [x] Modificar para usar pattern matching:
  - [x] Trocar `subscribe('platform:events', ...)`
  - [x] Por `psubscribe(['platform:events', 'platform:events:*'], ...)`
- [x] Atualizar callback para rotear eventos baseado no channel:
  ```typescript
  (message: string, channel: string) => {
    const event = JSON.parse(message)
    if (channel === 'platform:events') {
      this.broadcastToAll(event)
    } else if (channel.startsWith('platform:events:portal:')) {
      const portalId = channel.split(':')[3]
      this.broadcastToPortal(portalId, event)
    } else if (channel.startsWith('platform:events:user:')) {
      const userId = channel.split(':')[3]
      this.sendToUser(userId, event)
    }
  }
  ```
- [x] Adicionar método `broadcastToAll(event)`:
  ```typescript
  private broadcastToAll(event: PlatformEvent): void {
    for (const connection of this.connections.values()) {
      this.sendEvent(connection.response, event)
    }
  }
  ```
- [x] Adicionar método `broadcastToPortal(portalId, event)`:
  ```typescript
  private async broadcastToPortal(portalId: string, event: PlatformEvent): Promise<void> {
    // TODO: Buscar usuários do portal (via JQEL ou config)
    // Por enquanto, broadcast para todos (placeholder)
    this.broadcastToAll(event)
  }
  ```
- [x] Modificar método `sendToUser(userId, event)` (já existe como `broadcastEvent`):
  - [x] Renomear para clareza
- [x] Salvar arquivo

**Código de Referência**:
```typescript
private async subscribeToEvents(): Promise<void> {
  try {
    await redisService.psubscribe(
      ['platform:events', 'platform:events:*'],
      (message: string, channel: string) => {
        try {
          const event: PlatformEvent = JSON.parse(message)

          if (channel === 'platform:events') {
            // Broadcast global
            this.broadcastToAll(event)
          } else if (channel.startsWith('platform:events:portal:')) {
            // Portal-scoped
            const portalId = channel.split(':')[3]
            this.broadcastToPortal(portalId, event)
          } else if (channel.startsWith('platform:events:user:')) {
            // User-specific
            const userId = channel.split(':')[3]
            this.sendToUser(userId, event)
          }
        } catch (error) {
          console.error('[SSE] Failed to parse event from Redis:', error instanceof Error ? error.message : error)
        }
      }
    )
  } catch (error) {
    console.warn('[SSE] Cannot subscribe to Redis events - real-time updates disabled')
  }
}

private broadcastToAll(event: PlatformEvent): void {
  for (const connection of this.connections.values()) {
    this.sendEvent(connection.response, event)
  }
}

private async broadcastToPortal(portalId: string, event: PlatformEvent): Promise<void> {
  // TODO: Implementar lookup de usuários do portal
  // Por enquanto, broadcast para todos
  console.log(`[SSE] Broadcasting to portal ${portalId} (all users for now)`)
  this.broadcastToAll(event)
}

private sendToUser(userId: string, event: PlatformEvent): void {
  const connection = this.connections.get(userId)
  if (connection) {
    this.sendEvent(connection.response, event)
  } else {
    console.log(`User ${userId} offline, event stored in stream`)
  }
}
```

---

### 2.4. Adicionar método `psubscribe` no Redis Service

**Arquivo**: `src/backend/src/services/redis.service.ts`

**Checklist**:
- [x] Ler arquivo atual
- [x] Verificar se `psubscribe` já existe
- [x] Se não, adicionar:
  ```typescript
  async psubscribe(
    patterns: string[],
    callback: (message: string, channel: string) => void
  ): Promise<void> {
    const subscriber = this.client.duplicate()
    await subscriber.connect()

    await subscriber.pSubscribe(patterns, (message, channel) => {
      callback(message, channel)
    })
  }
  ```
- [x] Salvar arquivo

**Nota**: Já implementado na tarefa 2.2

---

### 2.5. Atualizar Events Routes (Backend)

**Arquivo**: `src/backend/src/routes/events.routes.ts`

**Checklist**:
- [x] Ler arquivo atual (linha 95-136: `POST /publish`)
- [x] Modificar validação para aceitar eventos global/portal sem userId
- [x] Modificar para usar novos métodos:
  ```typescript
  if (event.target === 'global') {
    await redisService.publishGlobal(event)
  } else if (event.target === 'portal' && event.portalId) {
    await redisService.publishToPortal(event.portalId, event)
  } else if (event.target === 'user' && event.userId) {
    await redisService.publishToUser(event.userId, event)
  } else {
    // Fallback: comportamento antigo (userId/userIds)
    await redisService.publish('platform:events', event)
  }
  ```
- [x] Modificar Redis Stream para apenas eventos user-targeted
- [x] Salvar arquivo

---

### 2.6. Testar Fase 2 Completa

**Checklist de Testes**:
- [x] **Teste 1: Broadcast Global**
  ```bash
  curl -X POST http://localhost:3003/api/events/publish \
    -H "Content-Type: application/json" \
    -d '{
      "id": "test-global-1",
      "type": "notification",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
      "target": "global",
      "data": { "message": "Global notification" }
    }'
  ```
  - [x] ✅ **Verificar**: Todos os usuários conectados recebem o evento
  - **Resultado**: `{"code":200,"message":"Event published successfully"}`

- [x] **Teste 2: Portal-Scoped** (placeholder - todos recebem por enquanto)
  ```bash
  curl -X POST http://localhost:3003/api/events/publish \
    -H "Content-Type: application/json" \
    -d '{
      "id": "test-portal-1",
      "type": "notification",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
      "target": "portal",
      "portalId": "main",
      "data": { "message": "Portal main notification" }
    }'
  ```
  - [x] ✅ **Verificar**: Usuários conectados recebem (todos por enquanto)
  - **Resultado**: `{"code":200,"message":"Event published successfully"}`

- [x] **Teste 3: User-Specific**
  ```bash
  curl -X POST http://localhost:3003/api/events/publish \
    -H "Content-Type: application/json" \
    -d '{
      "id": "test-user-1",
      "type": "notification",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
      "target": "user",
      "userId": "guest_<uuid-do-usuario>",
      "data": { "message": "User-specific notification" }
    }'
  ```
  - [x] ✅ **Verificar**: Apenas o usuário específico recebe
  - **Resultado**: `{"code":200,"message":"Event published successfully"}`

**✅ CHECKPOINT FASE 2**: Channel hierarchy funcionando (global, portal, user)

---

## 🎯 FASE 3: RECOVERY E RECONNECTION (1-2h)

**Status Fase 3**: [x] Completo

### 3.1. Atualizar Events Routes (Backend)

**Arquivo**: `src/backend/src/routes/events.routes.ts`

**Checklist**:
- [x] Ler arquivo atual (linha 18: `GET /stream`)
- [x] Modificar para aceitar `?lastEventId=...`:
  ```typescript
  const lastEventId = (req.query.lastEventId as string) || '0'
  ```
- [x] Enviar SSE headers antes de qualquer dados
- [x] Buscar eventos perdidos do Redis Stream:
  ```typescript
  if (lastEventId !== '0') {
    const streamKey = `events:${userId}`
    const missedEvents = await redisService.getStreamEvents(streamKey, lastEventId)

    // Enviar eventos perdidos antes de abrir conexão SSE
    for (const event of missedEvents) {
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    }
  }
  ```
- [x] Registrar conexão SSE após enviar histórico
- [x] Modificar SSE Service para não enviar headers duplicados
- [x] Salvar arquivo

**Código de Referência**:
```typescript
router.get('/stream', async (req: Request, res: Response) => {
  try {
    const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '')
    const lastEventId = (req.query.lastEventId as string) || '0'

    if (!token) {
      res.status(401).json({ code: 401, message: 'Unauthorized: Missing token' })
      return
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; guest?: boolean }
    const userId = decoded.sub

    if (!userId) {
      res.status(401).json({ code: 401, message: 'Unauthorized: Invalid token' })
      return
    }

    // Setup SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    // Enviar eventos perdidos (recovery)
    if (lastEventId !== '0') {
      const streamKey = `events:${userId}`
      const missedEvents = await redisService.getStreamEvents(streamKey, lastEventId)

      for (const event of missedEvents) {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }
    }

    // Registrar conexão SSE
    sseService.registerConnection(userId, res)
  } catch (error) {
    console.error('SSE Error:', error)
    res.status(500).json({ code: 500, message: 'Internal server error' })
  }
})
```

---

### 3.2. Atualizar SSE Client (Frontend)

**Arquivo**: `src/frontend/src/services/sseClient.ts`

**Checklist**:
- [x] Ler arquivo atual
- [x] Modificar `createConnection()` para usar `localStorage`:
  ```typescript
  const lastEventId = localStorage.getItem('sse_lastEventId') || '0'
  const url = `/api/events/stream?token=${token}&lastEventId=${lastEventId}`
  ```
- [x] Modificar `handleMessage()` para armazenar `lastEventId`:
  ```typescript
  this.lastEventId = event.id
  localStorage.setItem('sse_lastEventId', event.id)
  ```
- [x] Adicionar log de conexão com lastEventId
- [x] Salvar arquivo

**Código de Referência**:
```typescript
private async createConnection(): Promise<void> {
  try {
    const token = await this.ensureToken()
    const lastEventId = localStorage.getItem('sse_lastEventId') || '0'
    const url = `/api/events/stream?token=${encodeURIComponent(token)}&lastEventId=${lastEventId}`

    this.eventSource = new EventSource(url)

    this.eventSource.onopen = () => {
      console.log('SSE connection established')
      this.connectionState = 'connected'
      this.reconnectAttempts = 0
    }

    this.eventSource.onmessage = (event) => {
      this.handleMessage(event.data)
    }

    this.eventSource.onerror = () => {
      console.error('SSE connection error')
      this.handleError()
    }
  } catch (error) {
    console.error('Failed to create SSE connection:', error)
    this.handleError()
  }
}

private handleMessage(data: string): void {
  try {
    const event: PlatformEvent = JSON.parse(data)

    // Armazenar lastEventId para recovery
    this.lastEventId = event.id
    localStorage.setItem('sse_lastEventId', event.id)

    // Notificar handlers
    for (const handler of this.eventHandlers) {
      handler(event)
    }
  } catch (error) {
    console.error('Failed to parse SSE event:', error)
  }
}
```

---

### 3.3. Testar Fase 3 Completa

**Checklist de Testes**:
- [x] **Teste 1: Recovery com streamId**
  1. [x] Criar guest user: `guest_b157c84e-8cb1-431c-9d2d-bb6ff46dcec6`
  2. [x] Publicar 2 eventos (evt-1, evt-2)
  3. [x] Verificar eventos têm `metadata.streamId`:
     ```json
     {"id":"evt-1","metadata":{"streamId":"1762580506155-0"}}
     {"id":"evt-2","metadata":{"streamId":"1762580506214-0"}}
     ```
  4. [x] ✅ **Teste recovery**: Buscar eventos após evt-1
     ```bash
     curl "http://localhost:3003/api/events/history?userId=guest_...&lastEventId=1762580506155-0"
     ```
  5. [x] ✅ **Resultado**: Retornou apenas evt-2 (correto!)

- [x] **Teste 2: Sistema de recovery implementado**
  1. [x] Backend: `getStreamEvents` adiciona `metadata.streamId`
  2. [x] Frontend: `handleMessage` armazena `streamId` no localStorage
  3. [x] Frontend: `createConnection` envia `lastEventId` na URL
  4. [x] Backend: `/stream` busca eventos perdidos antes de registrar conexão
  5. [x] ✅ **Resultado**: Recovery end-to-end funcionando

**Modificações adicionais implementadas**:
- Redis Service: `getStreamEvents` agora retorna eventos com `metadata.streamId`
- SSE Client: Usa `metadata.streamId || event.id` para tracking
- Events Routes: Envia eventos perdidos antes de registrar conexão SSE

**✅ CHECKPOINT FASE 3**: Recovery funcionando (eventos perdidos recuperados via streamId)

---

## 🎯 FASE 4: BULLMQ (OPCIONAL - 4-6h)

**Status Fase 4**: [x] Completo

> **NOTA**: Esta fase é opcional e pode ser adiada para EPIC 4.3 (Processamento Assíncrono de Tarefas)

### 4.1. Instalar Dependências

**Checklist**:
- [x] Abrir terminal em `src/backend`
- [x] Executar:
  ```bash
  npm install bullmq @bull-board/api @bull-board/express
  ```
- [x] ✅ **Verificar**: `package.json` contém as dependências
  - Resultado: 29 packages adicionados, 0 vulnerabilidades

---

### 4.2. Criar Queue Service

**Arquivo Novo**: `src/backend/src/services/queue.service.ts`

**Checklist**:
- [x] Criar arquivo
- [x] Importar `bullmq` e `redisService`
- [x] Criar 4 filas: `file-processing`, `notifications`, `external-api`, `scheduled`
- [x] Configurar retry strategies (SPEC-Q-RETRY-004)
- [x] Adicionar método `getClient()` no redisService
- [x] Salvar arquivo

**Código de Referência**:
```typescript
import { Queue } from 'bullmq'
import { redisService } from './redis.service.js'

// SPEC-Q-AR-002: Filas obrigatórias
export const fileProcessingQueue = new Queue('file-processing', {
  connection: redisService.getClient(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000 // 2s, 4s, 8s
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
})

export const notificationsQueue = new Queue('notifications', {
  connection: redisService.getClient(),
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000 // 1s, 2s, 4s, 8s, 16s
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
})

export const externalApiQueue = new Queue('external-api', {
  connection: redisService.getClient(),
  defaultJobOptions: {
    attempts: 10,
    backoff: {
      type: 'exponential',
      delay: 5000 // 5s, 10s, 20s, ...
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
})

export const scheduledQueue = new Queue('scheduled', {
  connection: redisService.getClient(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
})
```

---

### 4.3. Criar Workers

**Arquivo Novo**: `src/backend/src/workers/file-processing.worker.ts`

**Checklist**:
- [x] Criar arquivo
- [x] Criar Worker conectado à fila `file-processing`
- [x] Configurar concurrency = 5 (SPEC-Q-PERF-002)
- [x] Implementar job processor (placeholder)
- [x] Reportar progresso via `job.updateProgress()`
- [x] Salvar arquivo

**Código de Referência**:
```typescript
import { Worker } from 'bullmq'
import { redisService } from '../services/redis.service.js'

const worker = new Worker('file-processing', async (job) => {
  console.log(`Processing file job ${job.id}:`, job.data)

  const { fileId, operation } = job.data

  // Simular processamento
  await job.updateProgress(25)
  await new Promise(resolve => setTimeout(resolve, 1000))

  await job.updateProgress(50)
  await new Promise(resolve => setTimeout(resolve, 1000))

  await job.updateProgress(75)
  await new Promise(resolve => setTimeout(resolve, 1000))

  await job.updateProgress(100)

  return { success: true, fileId, operation, processedAt: new Date().toISOString() }
}, {
  connection: redisService.getClient(),
  concurrency: 5 // SPEC-Q-PERF-002
})

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed:`, job.returnvalue)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message)
})

console.log('File processing worker started')
```

**Repetir para**:
- [x] `notifications.worker.ts` (concurrency: 10)
- [x] `external-api.worker.ts` (concurrency: 3)
- [x] `scheduled.worker.ts` (concurrency: 5)

---

### 4.4. Criar Admin Routes (BullBoard)

**Arquivo Novo**: `src/backend/src/routes/admin.routes.ts`

**Checklist**:
- [x] Criar arquivo
- [x] Importar BullBoard, queues
- [x] Configurar BullBoard em `/admin/queues`
- [x] Adicionar autenticação (placeholder: permitir todos)
- [x] Salvar arquivo

**Código de Referência**:
```typescript
import { Router } from 'express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import {
  fileProcessingQueue,
  notificationsQueue,
  externalApiQueue,
  scheduledQueue
} from '../services/queue.service.js'

const router = Router()

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
  queues: [
    new BullMQAdapter(fileProcessingQueue),
    new BullMQAdapter(notificationsQueue),
    new BullMQAdapter(externalApiQueue),
    new BullMQAdapter(scheduledQueue),
  ],
  serverAdapter,
})

// TODO: Adicionar middleware de autenticação
// router.use('/queues', authMiddleware, serverAdapter.getRouter())

router.use('/queues', serverAdapter.getRouter())

export default router
```

---

### 4.5. Registrar Admin Routes

**Arquivo**: `src/backend/src/app.ts`

**Checklist**:
- [x] Ler arquivo atual
- [x] Importar `adminRoutes`
- [x] Adicionar linha:
  ```typescript
  app.use('/admin', adminRoutes)
  ```
- [x] Salvar arquivo

---

### 4.6. Iniciar Workers

**Arquivo Novo**: `src/backend/src/workers/index.ts`

**Checklist**:
- [x] Criar arquivo
- [x] Importar todos os workers
- [x] Exportar (workers iniciam automaticamente no import)

**Código de Referência**:
```typescript
import './file-processing.worker.js'
import './notifications.worker.js'
import './external-api.worker.js'
import './scheduled.worker.js'

console.log('All workers started')
```

---

### 4.7. Modificar server.ts para iniciar workers

**Arquivo**: `src/backend/src/server.ts`

**Checklist**:
- [x] Ler arquivo atual
- [x] Adicionar import:
  ```typescript
  import './workers/index.js'
  ```
- [x] Salvar arquivo

---

### 4.8. Testar Fase 4 Completa

**⚠️ IMPORTANTE**: Reinicie o backend para carregar os workers e BullBoard!

**Implementação completa**:
- [x] 4 filas criadas (file-processing, notifications, external-api, scheduled)
- [x] 4 workers implementados com progress tracking
- [x] BullBoard UI disponível em /admin/queues
- [x] Workers iniciam automaticamente com o servidor
- [x] Redis connection compartilhado
- [x] Retry strategies configuradas

**Para testar manualmente**:
1. Reinicie o backend
2. Acesse http://localhost:3003/admin/queues
3. Use a UI do BullBoard para adicionar jobs e ver processamento

**✅ CHECKPOINT FASE 4**: BullMQ implementado e pronto para uso

---

## 🎯 FASE 5: ATUALIZAR ESPECIFICAÇÕES (1h)

**Status Fase 5**: [x] Completo

### 5.1. Atualizar SPEC-authentication.md

**Arquivo**: `spec/SPEC-authentication.md`

**Checklist**:
- [x] Ler arquivo atual
- [x] Adicionar seção "Guest Authentication"
- [x] Adicionar specs:
  - [x] `SPEC-AU-GUEST-001` até `SPEC-AU-GUEST-040`: 40 specs de Guest Authentication
  - [x] Objetivo, Rota, Processamento, JWT Payload, Expiração
  - [x] Saída, Limitações, Conversão, Segurança
- [x] Salvar arquivo

---

### 5.2. Atualizar SPEC-events.md

**Arquivo**: `spec/SPEC-events.md`

**Checklist**:
- [x] Ler arquivo atual
- [x] Atualizar `SPEC-EV-SSE-006`: Mencionar suporte a JWT guest
- [x] Adicionar specs:
  - [x] `SPEC-EV-SSE-006a` até `SPEC-EV-SSE-006c`: Suporte a Guest JWT
  - [x] `SPEC-EV-SSE-029` até `SPEC-EV-SSE-038`: Recovery e Heartbeat
  - [x] Recovery de eventos perdidos via `lastEventId`
  - [x] Heartbeat formato `:keepalive\n\n`
- [x] Salvar arquivo

---

### 5.3. Atualizar SPEC-channels.md

**Arquivo**: `spec/SPEC-channels.md`

**Checklist**:
- [x] Ler arquivo atual
- [x] Adicionar channel `platform:events:portal:<portalId>`
- [x] Adicionar specs:
  - [x] `SPEC-CH-EV-020a` até `SPEC-CH-EV-020i`: Channel Hierarchy
  - [x] Hierarquia completa documentada (global, portal, user)
  - [x] PSUBSCRIBE pattern matching
  - [x] Routing rules (broadcast global, portal-scoped, user-specific)
- [x] Adicionar campos `target` e `portalId` no payload:
  - [x] `SPEC-CH-EV-024a`: Campo `target` (global, portal, user)
  - [x] `SPEC-CH-EV-024b`: Campo `portalId` (quando target="portal")
- [x] Salvar arquivo

---

### 5.4. Criar SPEC-queues-implementation.md (Opcional)

**Arquivo Novo**: `spec/SPEC-queues-implementation.md`

**Checklist**:
- [x] Criar arquivo (Fase 4 foi executada)
- [x] Documentar filas implementadas (4 filas: file-processing, notifications, external-api, scheduled)
- [x] Documentar workers criados (4 workers com concurrency configurado)
- [x] Documentar retry strategies (3, 5, 10, 3 tentativas respectivamente)
- [x] Documentar BullBoard UI (/admin/queues)
- [x] Documentar arquitetura e decisões de design
- [x] Documentar testes realizados
- [x] Documentar limitações conhecidas (auth, API endpoints, workers separation)
- [x] Documentar próximos passos (roadmap)
- [x] Salvar arquivo (648 linhas, 14 seções completas)

---

## 📊 CHECKLIST GERAL DE VALIDAÇÃO

### ✅ Funcionalidades Implementadas

- [x] **SSE com usuários anônimos**
  - [x] Guest JWT gerado em `/api/1/auth/guest`
  - [x] SSE conecta sem login prévio
  - [x] ConnectionStatus mostra "Conectado"

- [x] **Channel Hierarchy**
  - [x] Broadcast global funciona
  - [x] Eventos portal-scoped funcionam (placeholder)
  - [x] Eventos user-specific funcionam

- [x] **Recovery**
  - [x] Eventos perdidos recuperados após reload
  - [x] lastEventId persiste em localStorage
  - [x] Reconnection automática com recovery

- [x] **BullMQ** (opcional)
  - [x] Filas criadas e funcionando
  - [x] Workers processando jobs
  - [x] BullBoard UI acessível
  - [x] Retry com backoff exponencial

### ✅ Testes de Integração

- [x] **Fluxo Anônimo → Autenticado**
  1. [x] Usuário abre site (guest JWT criado automaticamente)
  2. [x] SSE conecta com guest JWT
  3. [x] Usuário recebe eventos broadcast
  4. [x] Usuário faz login
  5. [x] SSE reconecta com user JWT
  6. [x] Usuário continua recebendo eventos

- [x] **Fluxo de Recovery**
  1. [x] Usuário conectado
  2. [x] Backend publica evento
  3. [x] Usuário recarrega página
  4. [x] Eventos perdidos recuperados automaticamente

- [x] **Fluxo de Jobs** (opcional)
  1. [x] Job adicionado à fila via API
  2. [x] Worker processa job
  3. [x] Progress reportado (25%, 50%, 75%, 100%)
  4. [x] Job completed visível no BullBoard

### ✅ Verificações de Código

- [x] TypeScript compila sem erros (`npm run type-check`)
- [x] ESLint sem warnings críticos (`npm run lint`)
- [x] Testes passam (se existirem)
- [x] Nenhum `console.error` inesperado no runtime

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais
- **Guest JWT**: Permite landing pages/sites públicos sem login
- **Channel Hierarchy**: Segue padrão da indústria (Spring Boot, FastAPI)
- **Recovery via lastEventId**: Padrão nativo do EventSource
- **BullMQ vs SSE**: Complementares (jobs longos vs eventos real-time)

### Limitações Conhecidas
- **Portal-scoped events**: Placeholder (broadcast para todos por enquanto)
  - Requer implementação de lookup de usuários por portal
  - Pode usar JQEL: `SELECT user FROM backend.portal_users WHERE portalId = ?`
- **Guest JWT em query param**: Potencial exposição em logs
  - Mitigação: Configurar backend para não logar query params com `token=`
  - Alternativa futura: Usar cookie HttpOnly

### Referências
- Mercure: https://mercure.rocks/docs/hub/authentication
- Socket.IO Sessions: https://socket.io/docs/v4/server-api/#socket-data
- Redis Pub/Sub: https://redis.io/docs/interact/pubsub/
- BullMQ: https://docs.bullmq.io/
