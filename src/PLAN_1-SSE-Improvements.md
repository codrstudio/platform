# PLAN_1-SSE-Improvements.md - Melhorias de Segurança e Performance do SSE

**Objetivo**: Implementar melhorias críticas de segurança, performance e observabilidade no sistema SSE já funcional (Guest JWT + Channel Hierarchy + Recovery implementados).

**⚠️ PRÉ-REQUISITO**: SSE Anonymous já implementado (ver `lessons-learned/PLAN.example.md`)

---

## 📋 RESUMO EXECUTIVO

### Sistema Atual (JÁ IMPLEMENTADO ✅)
1. ✅ **Guest JWT** - Usuários anônimos conectam via `/api/1/auth/guest`
2. ✅ **Channel Hierarchy** - `platform:events`, `platform:events:portal:*`, `platform:events:user:*`
3. ✅ **Recovery** - Redis Streams + lastEventId (eventos não perdidos)
4. ✅ **BullMQ** - Filas para jobs assíncronos com retry

### Problemas Identificados (PENDENTES ❌)
1. ❌ **Sem rate limiting** - Vulnerável a DoS (conexões ilimitadas)
2. ❌ **JWT em query param** - Token exposto em logs (risco segurança)
3. ❌ **Conexões órfãs** - Sem timeout de idle (memory leak)
4. ❌ **Sem métricas** - Impossível monitorar produção
5. ⚠️ **Reconnect fixo** - Sempre 3s (thundering herd)
6. ⚠️ **Sem compressão** - Banda desperdiçada
7. ⚠️ **Broadcast ineficiente** - Portal-scoped envia para todos

### Solução (Baseada em Padrões da Indústria)
- ✅ **Rate limiting por IP** (10 conexões/IP)
- ✅ **Cookie HttpOnly** (JWT seguro, sem logs)
- ✅ **Idle timeout** (5 min sem heartbeat)
- ✅ **Métricas endpoint** (`/api/events/stats`)
- ✅ **Backoff exponencial** (1s → 60s + jitter)
- ✅ **Compressão gzip** (60-70% economia)

---

## 🎯 FASE 1: RATE LIMITING E SEGURANÇA

**Status Fase 1**: [ ] Não Iniciado

### 1.1. Implementar Rate Limiting por IP

**Arquivo**: `src/backend/src/routes/events.routes.ts`

**Checklist**:
- [ ] Criar Map para rastrear conexões:
  ```typescript
  const connections = new Map<string, number>();
  const MAX_CONNECTIONS_PER_IP = 10;
  ```
- [ ] No início de `GET /stream`:
  ```typescript
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const count = connections.get(ip) || 0;

  if (count >= MAX_CONNECTIONS_PER_IP) {
    res.status(429).json({
      code: 429,
      message: 'Too many connections from this IP'
    });
    return;
  }

  connections.set(ip, count + 1);
  ```
- [ ] No handler `req.on('close')`:
  ```typescript
  const currentCount = connections.get(ip) || 1;
  if (currentCount <= 1) {
    connections.delete(ip);
  } else {
    connections.set(ip, currentCount - 1);
  }
  ```
- [ ] ✅ **Checkpoint**: Máximo 10 conexões por IP

**Leitura de Referência**:
- `spec/pending-decisions/sse-anonymous-support.md` (seção "Rate Limiting")
- `lessons-learned/PLAN.example.md` (Fase 1.1 - Rate limiting proposto)

**Código de Referência**:
```typescript
// No topo do arquivo
const connections = new Map<string, number>();
const MAX_CONNECTIONS_PER_IP = parseInt(env.MAX_SSE_CONNECTIONS_PER_IP || '10', 10);

router.get('/stream', async (req: Request, res: Response) => {
  try {
    // Rate limiting
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const count = connections.get(ip) || 0;

    if (count >= MAX_CONNECTIONS_PER_IP) {
      res.status(429).json({
        code: 429,
        message: `Too many connections from this IP (max: ${MAX_CONNECTIONS_PER_IP})`
      });
      return;
    }

    connections.set(ip, count + 1);
    console.log(`[SSE] IP ${ip} now has ${count + 1} connection(s)`);

    // ... resto do código SSE existente

    req.on('close', () => {
      const currentCount = connections.get(ip) || 1;
      if (currentCount <= 1) {
        connections.delete(ip);
        console.log(`[SSE] IP ${ip} has no more connections`);
      } else {
        connections.set(ip, currentCount - 1);
        console.log(`[SSE] IP ${ip} now has ${currentCount - 1} connection(s)`);
      }
    });
  } catch (error) {
    console.error('SSE Error:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});
```

---

### 1.2. Configurar Logs Estruturados (Sem Tokens)

**Arquivo**: `src/backend/src/middleware/logger.middleware.ts` (criar se não existir)

**Checklist**:
- [ ] Instalar Winston (se não tiver):
  ```bash
  npm install winston
  ```
- [ ] Criar middleware de sanitização:
  ```typescript
  import morgan from 'morgan';

  // Custom token para sanitizar query params
  morgan.token('sanitized-url', (req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);

    // Remover token de query params
    if (url.searchParams.has('token')) {
      url.searchParams.set('token', '[REDACTED]');
    }

    return url.pathname + url.search;
  });

  // Usar no morgan
  app.use(morgan(':method :sanitized-url :status :response-time ms'));
  ```
- [ ] Adicionar ao `app.ts`
- [ ] ✅ **Checkpoint**: Logs não mostram tokens

**Código de Referência**:
```typescript
// src/backend/src/middleware/logger.middleware.ts
import morgan from 'morgan';
import { Request } from 'express';

// Sanitizar URLs para não logar tokens
morgan.token('sanitized-url', (req: Request) => {
  try {
    const url = new URL(req.url!, `http://${req.headers.host}`);

    // Redact sensitive query params
    const sensitiveParams = ['token', 'password', 'secret'];
    sensitiveParams.forEach(param => {
      if (url.searchParams.has(param)) {
        url.searchParams.set(param, '[REDACTED]');
      }
    });

    return url.pathname + url.search;
  } catch {
    return req.url || '';
  }
});

export const loggerMiddleware = morgan(
  ':method :sanitized-url :status :response-time ms - :res[content-length]'
);
```

---

### 1.3. Adicionar Variável de Ambiente

**Arquivo**: `src/backend/.env.example`

**Checklist**:
- [ ] Adicionar configuração:
  ```
  # SSE Rate Limiting
  MAX_SSE_CONNECTIONS_PER_IP=10
  ```
- [ ] Atualizar `src/backend/.env` (local)
- [ ] Documentar em README
- [ ] ✅ **Checkpoint**: Rate limit configurável

---

### 1.4. Testar Fase 1 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Rate Limiting**
  - [ ] Abrir 11 abas do navegador conectadas ao SSE
  - [ ] Verificar 11ª aba recebe 429 Too Many Requests
  - [ ] Fechar uma aba
  - [ ] Verificar pode conectar novamente
  - [ ] ✅ **Verificar**: Limite funciona

- [ ] **Teste 2: Logs Sanitizados**
  - [ ] Conectar SSE: `GET /api/events/stream?token=eyJ...`
  - [ ] Verificar log do backend mostra: `GET /api/events/stream?token=[REDACTED]`
  - [ ] ✅ **Resultado**: Tokens não aparecem em logs

- [ ] **Teste 3: Env Configurável**
  - [ ] Mudar `.env`: `MAX_SSE_CONNECTIONS_PER_IP=5`
  - [ ] Reiniciar backend
  - [ ] Verificar limite agora é 5
  - [ ] ✅ **Verificar**: Configuração dinâmica

**✅ CHECKPOINT FASE 1**: Rate limiting implementado e testado

---

## 🎯 FASE 2: COOKIE HTTPONLY

**Status Fase 2**: [ ] Não Iniciado

### 2.1. Modificar Rota Guest JWT (Backend)

**Arquivo**: `src/backend/src/routes/auth.routes.ts`

**Checklist**:
- [ ] Localizar `POST /guest`
- [ ] Após gerar JWT, definir cookie:
  ```typescript
  res.cookie('sse_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600 * 1000, // 1 hora
    path: '/api/events' // Apenas SSE
  });
  ```
- [ ] Manter resposta JSON (compatibilidade):
  ```typescript
  res.json({
    code: 'success',
    access_token: token, // Frontend pode usar se quiser
    token_type: 'Bearer',
    expires_in: 3600
  });
  ```
- [ ] ✅ **Checkpoint**: Cookie definido ao criar guest JWT

**Código de Referência**:
```typescript
router.post('/guest', async (_req: Request, res: Response) => {
  try {
    const guestId = `guest_${randomUUID()}`;

    const payload = {
      sub: guestId,
      guest: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: env.JWT_ISSUER || 'platform-backend'
    };

    const token = jwt.sign(payload, env.JWT_SECRET);

    // Definir cookie HttpOnly
    res.cookie('sse_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 * 1000,
      path: '/api/events'
    });

    // Resposta JSON (compatibilidade)
    res.json({
      code: 'success',
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    });
  } catch (error) {
    console.error('Guest JWT Error:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to generate guest token'
    });
  }
});
```

---

### 2.2. Modificar Rota SSE para Aceitar Cookie (Backend)

**Arquivo**: `src/backend/src/routes/events.routes.ts`

**Checklist**:
- [ ] Modificar extração de token em `GET /stream`:
  ```typescript
  const token = req.cookies?.sse_token ||
                (req.query.token as string) ||
                req.headers.authorization?.replace('Bearer ', '');
  ```
- [ ] Manter compatibilidade com query param (fallback)
- [ ] ✅ **Checkpoint**: SSE aceita token de cookie ou query param

**Código de Referência**:
```typescript
router.get('/stream', async (req: Request, res: Response) => {
  try {
    // Rate limiting (já implementado na Fase 1)
    // ...

    // Extrair token: prioridade cookie > query > header
    const token = req.cookies?.sse_token ||
                  (req.query.token as string) ||
                  req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        code: 401,
        message: 'Unauthorized: Missing token'
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; guest?: boolean };
    const userId = decoded.sub;

    // ... resto do código existente
  } catch (error) {
    console.error('SSE Error:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});
```

---

### 2.3. Instalar cookie-parser (Backend)

**Arquivo**: `src/backend/src/app.ts`

**Checklist**:
- [ ] Verificar se CORS já tem `credentials: true`:
  ```typescript
  // ✅ JÁ CONFIGURADO (linhas 19-24)
  app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true, // ✅ Já permite cookies
  }));
  ```
- [ ] Instalar cookie-parser:
  ```bash
  npm install cookie-parser
  npm install -D @types/cookie-parser
  ```
- [ ] Adicionar middleware:
  ```typescript
  import cookieParser from 'cookie-parser';
  app.use(cookieParser()); // Antes das rotas
  ```
- [ ] ✅ **Checkpoint**: Backend pode ler cookies

**Código de Referência**:
```typescript
// src/backend/src/app.ts
import cookieParser from 'cookie-parser';

// Middlewares (adicionar ANTES das rotas)
app.use(cookieParser());

// CORS (já configurado corretamente)
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true, // ✅ Já estava correto
}));
```

**Nota**: CORS já está configurado corretamente com `credentials: true`, não precisa modificar!

---

### 2.4. Modificar SSEClient para Usar Cookies (Frontend)

**Arquivo**: `src/frontend/src/services/sseClient.ts`

**Checklist**:
- [ ] Modificar `createConnection()`:
  ```typescript
  // Não enviar token em query param se cookie existe
  const url = '/api/events/stream'; // Sem ?token=
  this.eventSource = new EventSource(url, { withCredentials: true });
  ```
- [ ] Manter `ensureToken()` para garantir cookie criado:
  ```typescript
  private async ensureToken(): Promise<void> {
    // Verificar se já tem cookie (via fetch test)
    try {
      const test = await fetch('/api/events/stats', { credentials: 'include' });
      if (test.ok) return; // Cookie válido
    } catch {}

    // Solicitar guest JWT (criará cookie)
    const res = await fetch('/api/1/auth/guest', {
      method: 'POST',
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Failed to get guest token');
  }
  ```
- [ ] Remover armazenamento de token em sessionStorage (obsoleto)
- [ ] ✅ **Checkpoint**: Frontend usa cookie automaticamente

**Código de Referência**:
```typescript
class SSEClient {
  private eventSource: EventSource | null = null;
  private eventHandlers: Set<EventHandler> = new Set();
  private connectionState: SSEConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private lastEventId: string = '0';

  private async ensureToken(): Promise<void> {
    // Tentar acessar endpoint protegido para verificar se cookie existe
    try {
      const test = await fetch('/api/events/stats', {
        credentials: 'include'
      });
      if (test.ok) return; // Cookie válido
    } catch {
      // Sem cookie ou expirado
    }

    // Solicitar guest JWT (backend definirá cookie)
    const res = await fetch('/api/1/auth/guest', {
      method: 'POST',
      credentials: 'include' // Importante!
    });

    if (!res.ok) {
      throw new Error('Failed to get guest token');
    }
  }

  async connect(): Promise<void> {
    if (this.eventSource) {
      console.log('SSE already connected');
      return;
    }

    this.connectionState = 'connecting';
    await this.createConnection();
  }

  private async createConnection(): Promise<void> {
    try {
      await this.ensureToken();

      const lastEventId = localStorage.getItem('sse_lastEventId') || '0';
      const url = `/api/events/stream?lastEventId=${lastEventId}`;

      // withCredentials: true para enviar cookies
      this.eventSource = new EventSource(url, { withCredentials: true });

      this.eventSource.onopen = () => {
        console.log('SSE connection established');
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.eventSource.onerror = () => {
        console.error('SSE connection error');
        this.handleError();
      };
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      this.handleError();
    }
  }

  reconnectAfterLogin(newToken: string): void {
    // Com cookies, não precisa passar token
    this.closeConnection();
    this.connect();
  }

  // ... resto dos métodos existentes
}
```

---

### 2.5. Testar Fase 2 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Cookie Criado**
  - [ ] Abrir DevTools → Application → Cookies
  - [ ] Conectar SSE
  - [ ] Verificar cookie `sse_token` existe
  - [ ] Atributos: `HttpOnly`, `SameSite=Strict`, `Path=/api/events`
  - [ ] ✅ **Verificar**: Cookie seguro

- [ ] **Teste 2: URL Sem Token**
  - [ ] DevTools → Network → Filtrar "stream"
  - [ ] Verificar URL: `GET /api/events/stream?lastEventId=0` (sem token)
  - [ ] Verificar Request Headers: `Cookie: sse_token=...`
  - [ ] ✅ **Resultado**: Token não exposto em URL

- [ ] **Teste 3: Logs Limpos**
  - [ ] Backend logs mostram: `GET /api/events/stream`
  - [ ] Sem `?token=...` em logs
  - [ ] ✅ **Verificar**: Logs não expõem tokens

- [ ] **Teste 4: Compatibilidade**
  - [ ] Deletar cookie
  - [ ] Conectar com `?token=...` (fallback)
  - [ ] Verificar funciona
  - [ ] ✅ **Resultado**: Backward compatible

**✅ CHECKPOINT FASE 2**: Cookie HttpOnly implementado e seguro

---

## 🎯 FASE 3: IDLE TIMEOUT E MÉTRICAS

**Status Fase 3**: [ ] Não Iniciado

### 3.1. Implementar Idle Timeout (Backend)

**Arquivo**: `src/backend/src/services/sse.service.ts`

**Checklist**:
- [ ] Modificar interface `SSEConnection`:
  ```typescript
  interface SSEConnection {
    userId: string;
    response: Response;
    lastActivity: number; // Timestamp
  }
  ```
- [ ] No `registerConnection()`:
  ```typescript
  this.connections.set(userId, {
    response: res,
    lastActivity: Date.now()
  });
  ```
- [ ] Criar método `updateActivity()`:
  ```typescript
  private updateActivity(userId: string): void {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.lastActivity = Date.now();
    }
  }
  ```
- [ ] Chamar no `sendEvent()`:
  ```typescript
  private sendEvent(res: Response, event: PlatformEvent): void {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      // Atualizar lastActivity ao enviar evento
      for (const [userId, conn] of this.connections.entries()) {
        if (conn.response === res) {
          this.updateActivity(userId);
          break;
        }
      }
    } catch (error) {
      console.error('[SSE] Failed to send event:', error);
    }
  }
  ```
- [ ] Criar intervalo de cleanup:
  ```typescript
  private startIdleTimeoutChecker(): void {
    const IDLE_TIMEOUT = parseInt(env.SSE_IDLE_TIMEOUT || '300000', 10); // 5 min
    const CHECK_INTERVAL = 60000; // 1 min

    setInterval(() => {
      const now = Date.now();
      const toRemove: string[] = [];

      for (const [userId, conn] of this.connections.entries()) {
        if (now - conn.lastActivity > IDLE_TIMEOUT) {
          console.log(`[SSE] Idle timeout for user ${userId}`);
          try {
            conn.response.end();
          } catch {}
          toRemove.push(userId);
        }
      }

      toRemove.forEach(userId => this.connections.delete(userId));
    }, CHECK_INTERVAL);
  }
  ```
- [ ] Chamar no constructor:
  ```typescript
  constructor() {
    this.startIdleTimeoutChecker();
    // ... resto da inicialização
  }
  ```
- [ ] ✅ **Checkpoint**: Conexões idle desconectadas após 5 min

**Código de Referência**:
```typescript
// src/backend/src/services/sse.service.ts
interface SSEConnection {
  userId: string;
  response: Response;
  lastActivity: number;
}

class SSEService {
  private connections: Map<string, SSEConnection> = new Map();

  constructor() {
    this.subscribeToEvents();
    this.startIdleTimeoutChecker();
  }

  private startIdleTimeoutChecker(): void {
    const IDLE_TIMEOUT = parseInt(env.SSE_IDLE_TIMEOUT || '300000', 10); // 5 min default
    const CHECK_INTERVAL = 60000; // Check a cada 1 min

    setInterval(() => {
      const now = Date.now();
      const toRemove: string[] = [];

      for (const [userId, conn] of this.connections.entries()) {
        const idleTime = now - conn.lastActivity;

        if (idleTime > IDLE_TIMEOUT) {
          console.log(`[SSE] Idle timeout for user ${userId} (${Math.floor(idleTime / 1000)}s idle)`);

          try {
            conn.response.end();
          } catch (error) {
            console.error(`[SSE] Error closing idle connection:`, error);
          }

          toRemove.push(userId);
        }
      }

      if (toRemove.length > 0) {
        console.log(`[SSE] Removed ${toRemove.length} idle connection(s)`);
        toRemove.forEach(userId => this.connections.delete(userId));
      }
    }, CHECK_INTERVAL);
  }

  registerConnection(userId: string, res: Response): void {
    this.connections.set(userId, {
      userId,
      response: res,
      lastActivity: Date.now()
    });
    console.log(`[SSE] User ${userId} connected (total: ${this.connections.size})`);
  }

  private sendEvent(res: Response, event: PlatformEvent): void {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);

      // Atualizar lastActivity
      for (const [userId, conn] of this.connections.entries()) {
        if (conn.response === res) {
          conn.lastActivity = Date.now();
          break;
        }
      }
    } catch (error) {
      console.error('[SSE] Failed to send event:', error);
    }
  }

  // ... resto dos métodos existentes
}
```

---

### 3.2. Criar Endpoint de Métricas (Backend)

**Arquivo**: `src/backend/src/routes/events.routes.ts`

**Checklist**:
- [ ] Adicionar rota `GET /stats`:
  ```typescript
  router.get('/stats', (req: Request, res: Response) => {
    const stats = sseService.getMetrics();
    res.json(stats);
  });
  ```
- [ ] Implementar `getMetrics()` no SSEService:
  ```typescript
  getMetrics() {
    const connections = Array.from(this.connections.values());
    const now = Date.now();

    return {
      connectionsTotal: connections.length,
      connectionsByType: {
        guest: connections.filter(c => c.userId.startsWith('guest_')).length,
        user: connections.filter(c => !c.userId.startsWith('guest_')).length
      },
      avgIdleTime: connections.reduce((sum, c) => sum + (now - c.lastActivity), 0) / connections.length || 0,
      oldestConnection: Math.max(...connections.map(c => now - c.lastActivity)),
      uptime: now - this.startTime
    };
  }
  ```
- [ ] Adicionar `startTime` no constructor:
  ```typescript
  private startTime = Date.now();
  ```
- [ ] ✅ **Checkpoint**: Endpoint `/api/events/stats` funciona

**Código de Referência**:
```typescript
// src/backend/src/routes/events.routes.ts
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = sseService.getMetrics();
    res.json({
      code: 200,
      data: stats
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get stats'
    });
  }
});

// src/backend/src/services/sse.service.ts
class SSEService {
  private startTime = Date.now();

  getMetrics() {
    const connections = Array.from(this.connections.values());
    const now = Date.now();

    const guestConnections = connections.filter(c => c.userId.startsWith('guest_'));
    const userConnections = connections.filter(c => !c.userId.startsWith('guest_'));

    return {
      connectionsTotal: connections.length,
      connectionsByType: {
        guest: guestConnections.length,
        user: userConnections.length
      },
      avgIdleTime: connections.length > 0
        ? Math.floor(connections.reduce((sum, c) => sum + (now - c.lastActivity), 0) / connections.length)
        : 0,
      maxIdleTime: connections.length > 0
        ? Math.max(...connections.map(c => now - c.lastActivity))
        : 0,
      uptime: now - this.startTime,
      uptimeFormatted: this.formatUptime(now - this.startTime)
    };
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}
```

---

### 3.3. Adicionar Variáveis de Ambiente

**Arquivo**: `src/backend/.env.example`

**Checklist**:
- [ ] Adicionar:
  ```
  # SSE Idle Timeout (ms)
  SSE_IDLE_TIMEOUT=300000
  ```
- [ ] Atualizar `.env` local
- [ ] ✅ **Checkpoint**: Timeout configurável

---

### 3.4. Testar Fase 3 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Idle Timeout**
  - [ ] Conectar SSE
  - [ ] Não enviar eventos por 6 minutos
  - [ ] Verificar conexão fechada automaticamente
  - [ ] Verificar log: `[SSE] Idle timeout for user guest_...`
  - [ ] ✅ **Verificar**: Timeout funciona

- [ ] **Teste 2: Métricas**
  - [ ] `curl http://localhost:3003/api/events/stats`
  - [ ] Verificar JSON:
    ```json
    {
      "code": 200,
      "data": {
        "connectionsTotal": 4,
        "connectionsByType": { "guest": 3, "user": 1 },
        "avgIdleTime": 15320,
        "maxIdleTime": 45230,
        "uptime": 1234567,
        "uptimeFormatted": "20m 34s"
      }
    }
    ```
  - [ ] ✅ **Resultado**: Métricas precisas

- [ ] **Teste 3: Activity Update**
  - [ ] Conectar SSE
  - [ ] Publicar evento para usuário
  - [ ] Verificar `lastActivity` atualizado (métricas)
  - [ ] ✅ **Verificar**: Activity tracking funciona

**✅ CHECKPOINT FASE 3**: Idle timeout e métricas funcionando

---

## 🎯 FASE 4: PERFORMANCE E UX

**Status Fase 4**: [ ] Não Iniciado

### 4.1. Backoff Exponencial (Frontend)

**Arquivo**: `src/frontend/src/services/sseClient.ts`

**Checklist**:
- [ ] Modificar `getReconnectDelay()`:
  ```typescript
  private getReconnectDelay(): number {
    const baseDelay = 1000; // 1s
    const maxDelay = 60000; // 60s
    const delay = Math.min(baseDelay * Math.pow(2, this.reconnectAttempts), maxDelay);

    // Jitter: ±25% aleatoriedade
    const jitter = delay * 0.25 * (Math.random() - 0.5);

    return Math.floor(delay + jitter);
  }
  ```
- [ ] Modificar `handleError()`:
  ```typescript
  private handleError(): void {
    this.closeConnection();

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.getReconnectDelay();
      console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.createConnection();
      }, delay);

      this.reconnectAttempts++;
    } else {
      console.error(`[SSE] Max reconnect attempts reached (${this.maxReconnectAttempts})`);
      this.connectionState = 'failed';
    }
  }
  ```
- [ ] ✅ **Checkpoint**: Backoff exponencial com jitter

**Código de Referência**:
```typescript
// src/frontend/src/services/sseClient.ts
class SSEClient {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10; // Aumentado de 5

  private getReconnectDelay(): number {
    const baseDelay = 1000; // 1s
    const maxDelay = 60000; // 60s

    // Exponencial: 1s, 2s, 4s, 8s, 16s, 32s, 60s, 60s, ...
    const exponentialDelay = baseDelay * Math.pow(2, this.reconnectAttempts);
    const delay = Math.min(exponentialDelay, maxDelay);

    // Jitter: ±25% aleatoriedade (previne thundering herd)
    const jitter = delay * 0.25 * (Math.random() - 0.5);

    return Math.floor(delay + jitter);
  }

  private handleError(): void {
    console.error('[SSE] Connection error');
    this.closeConnection();

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.getReconnectDelay();

      console.log(
        `[SSE] Reconnecting in ${Math.floor(delay / 1000)}s ` +
        `(attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.createConnection();
      }, delay);

      this.reconnectAttempts++;
    } else {
      console.error(`[SSE] Max reconnect attempts reached`);
      this.connectionState = 'failed';

      // Notificar usuário
      for (const handler of this.eventHandlers) {
        handler({
          id: 'connection-failed',
          type: 'system',
          timestamp: new Date().toISOString(),
          data: { message: 'Connection failed after multiple retries' }
        } as PlatformEvent);
      }
    }
  }
}
```

---

### 4.2. Compressão SSE (Backend)

**Arquivo**: `src/backend/src/app.ts`

**Checklist**:
- [ ] Instalar compression:
  ```bash
  npm install compression
  npm install -D @types/compression
  ```
- [ ] Adicionar middleware:
  ```typescript
  import compression from 'compression';

  app.use(compression({
    filter: (req, res) => {
      // Comprimir SSE se cliente suporta
      if (req.path.includes('/events/stream')) {
        return req.headers['accept-encoding']?.includes('gzip') || false;
      }
      return compression.filter(req, res);
    },
    threshold: 0 // Comprimir sempre (SSE é stream)
  }));
  ```
- [ ] ✅ **Checkpoint**: SSE comprimido com gzip

**Código de Referência**:
```typescript
// src/backend/src/app.ts
import compression from 'compression';

// Middleware de compressão (antes das rotas)
app.use(compression({
  filter: (req, res) => {
    // Comprimir SSE se cliente suporta
    if (req.path.includes('/events/stream')) {
      const acceptsGzip = req.headers['accept-encoding']?.includes('gzip') || false;
      console.log(`[SSE] Compression ${acceptsGzip ? 'enabled' : 'disabled'} for ${req.ip}`);
      return acceptsGzip;
    }

    // Default filter para outras rotas
    return compression.filter(req, res);
  },
  threshold: 0, // Comprimir sempre (importante para SSE)
  level: 6 // Nível de compressão (1-9, 6 é padrão)
}));
```

---

### 4.3. Testar Fase 4 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Backoff Exponencial**
  - [ ] Desligar backend
  - [ ] Verificar logs frontend:
    - `Reconnecting in 1s (attempt 1/10)`
    - `Reconnecting in 2s (attempt 2/10)`
    - `Reconnecting in 4s (attempt 3/10)`
    - `Reconnecting in 8s (attempt 4/10)`
    - ...
    - `Reconnecting in 60s (attempt 7/10)`
  - [ ] ✅ **Verificar**: Delay aumenta exponencialmente

- [ ] **Teste 2: Jitter**
  - [ ] Desligar backend
  - [ ] Abrir 5 abas
  - [ ] Verificar delays ligeiramente diferentes (±25%)
  - [ ] ✅ **Resultado**: Thundering herd prevenido

- [ ] **Teste 3: Compressão**
  - [ ] DevTools → Network → stream
  - [ ] Response Headers: `Content-Encoding: gzip`
  - [ ] Size: ~60-70% menor
  - [ ] ✅ **Verificar**: Compressão ativa

**✅ CHECKPOINT FASE 4**: Performance otimizada

---

## 📊 CHECKLIST GERAL DE VALIDAÇÃO

### ✅ Funcionalidades Implementadas

- [ ] **FASE 1: Segurança**
  - [ ] Rate limiting por IP (10 conexões)
  - [ ] Logs sanitizados (sem tokens)
  - [ ] Configurável via .env

- [ ] **FASE 2: Cookie HttpOnly**
  - [ ] Cookie definido em /guest
  - [ ] SSE aceita cookie (prioridade sobre query param)
  - [ ] CORS com credentials
  - [ ] Backward compatible (query param fallback)

- [ ] **FASE 3: Timeout e Métricas**
  - [ ] Idle timeout (5 min configurável)
  - [ ] Activity tracking (lastActivity)
  - [ ] Endpoint /api/events/stats
  - [ ] Métricas detalhadas (guest/user, idle times, uptime)

- [ ] **FASE 4: Performance**
  - [ ] Backoff exponencial (1s → 60s)
  - [ ] Jitter (±25%)
  - [ ] Compressão gzip
  - [ ] Max reconnect attempts aumentado (10)

### ✅ Testes de Integração

- [ ] **Fluxo Completo: Anônimo → Autenticado**
  1. [ ] Abrir site (guest JWT criado, cookie definido)
  2. [ ] SSE conecta com cookie
  3. [ ] Recebe eventos broadcast
  4. [ ] Login
  5. [ ] SSE reconecta (novo cookie)
  6. [ ] Continua recebendo eventos

- [ ] **Fluxo Rate Limiting**
  1. [ ] Abrir 11 abas
  2. [ ] 11ª recebe 429
  3. [ ] Fechar uma aba
  4. [ ] Pode conectar novamente

- [ ] **Fluxo Idle Timeout**
  1. [ ] Conectar SSE
  2. [ ] Esperar 6 minutos
  3. [ ] Conexão fechada
  4. [ ] Frontend reconecta automaticamente

- [ ] **Fluxo Métricas**
  1. [ ] Conectar 5 clientes (3 guest, 2 user)
  2. [ ] GET /api/events/stats
  3. [ ] Verificar contadores corretos
  4. [ ] Publicar evento
  5. [ ] Verificar avgIdleTime diminui

### ✅ Verificações de Código

- [ ] TypeScript compila sem erros (`npm run type-check`)
- [ ] ESLint sem warnings (`npm run lint`)
- [ ] Backend roda sem erros (`npm run dev`)
- [ ] Frontend roda sem erros (`npm run dev`)
- [ ] Cookies aparecem no DevTools → Application
- [ ] Logs não mostram tokens
- [ ] Compressão ativa (Response Headers)

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais

- **Rate Limiting em Memória**: Map nativo (simples, suficiente para single-instance)
  - Alternativa futura: Redis (multi-instance)
- **Cookie HttpOnly**: Mais seguro que query param, padrão da indústria
  - Trade-off: CORS complexo (credentials: true)
- **Idle Timeout 5 min**: Equilibra recursos vs UX
  - Muito curto: muitos reconnects
  - Muito longo: conexões órfãs
- **Backoff Exponencial**: Padrão AWS, Google Cloud
  - Jitter previne thundering herd
- **Compressão SSE**: ~60-70% economia, overhead CPU mínimo

### Limitações Conhecidas

- **Rate Limiting por IP**: Usuários em NAT corporativo compartilham IP
  - Mitigação: Aumentar limite ou usar rate limit por userId
  - Alternativa futura: Fingerprinting do navegador
- **Cookie SameSite=Strict**: Não funciona em iframes cross-domain
  - Mitigação: SameSite=Lax se necessário
  - Alternativa: Mensagem postMessage para iframes
- **Idle Timeout**: Pode fechar conexões lentas (eventos raros)
  - Mitigação: Heartbeat conta como activity
  - Alternativa: Timeout configurável por portal
- **Compressão**: Aumenta CPU ~5-10%
  - Mitigação: Monitorar carga CPU em produção
  - Alternativa: Desabilitar se CPU > 80%

### Referências

- `spec/pending-decisions/sse-anonymous-support.md` - Melhorias propostas
- `lessons-learned/PLAN.example.md` - Implementação original (Guest JWT)
- Rate Limiting: https://www.nginx.com/blog/rate-limiting-nginx/
- Cookie Security: https://owasp.org/www-community/controls/SecureFlag
- Exponential Backoff: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
- SSE Compression: https://developer.mozilla.org/en-US/docs/Web/HTTP/Compression
