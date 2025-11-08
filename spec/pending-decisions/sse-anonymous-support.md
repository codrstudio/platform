# SSE Anonymous Support - Implementação Final e Melhorias Futuras

**Data de Criação Original:** 2025-11-07
**Data de Revisão:** 2025-11-08
**Status:** ✅ IMPLEMENTADO (com melhorias pendentes)
**Prioridade Original:** CRÍTICA
**Relacionado:** `lessons-learned/PLAN.example.md`, `spec/SPEC-events.md`, `spec/SPEC-authentication.md`, `spec/SPEC-channels.md`

---

## 📋 RESUMO EXECUTIVO

### Problema Original (RESOLVIDO ✅)
**SSE não funcionava para usuários anônimos**, quebrando websites públicos (landing pages, blogs, e-commerce sem login).

### Solução Implementada
A implementação seguiu uma abordagem diferente da proposta original, mas igualmente válida:

**Proposta Original (spec/pending-decisions/sse-anonymous-support.md):**
- ❌ sessionId em query params (`?sessionId=anon-xxx`)
- ❌ Múltiplos canais Redis por conexão (`platform:config`, `portal:x:public`, `user:x`)
- ❌ Target filtering client-side

**Implementação Real (lessons-learned/PLAN.example.md):**
- ✅ **Guest JWT** gerado em `/api/1/auth/guest`
- ✅ **JWT em query param** (`?token=eyJ...`)
- ✅ **Channel Hierarchy com PSUBSCRIBE** (`platform:events`, `platform:events:*`)
- ✅ **Recovery via lastEventId** (Redis Streams + localStorage)
- ✅ **BullMQ para jobs assíncronos** (complementar ao SSE)

---

## 🎯 O QUE FOI IMPLEMENTADO

### ✅ FASE 1: Guest JWT (Completo)

**Rota criada:** `POST /api/1/auth/guest`

**Funcionamento:**
```typescript
// Backend gera JWT guest automaticamente
{
  sub: "guest_efa6be29-6cc2-46a7-bdb0-ed43bcc23032",
  guest: true,
  iat: 1699384920,
  exp: 1699388520, // 1 hora
  iss: "platform-backend"
}
```

**Frontend:**
```typescript
// src/frontend/src/services/sseClient.ts
private async ensureToken(): Promise<string> {
  let token = sessionStorage.getItem('access_token')
  if (!token) {
    const res = await fetch('/api/1/auth/guest', { method: 'POST' })
    const data = await res.json()
    token = data.access_token
    sessionStorage.setItem('access_token', token)
  }
  return token
}
```

**Vantagens sobre sessionId:**
- ✅ Reutiliza infraestrutura JWT existente
- ✅ Permite conversão guest → user após login (mesmo padrão)
- ✅ Expiração automática (1 hora)
- ✅ Validação via `jwt.verify()` (segurança)

---

### ✅ FASE 2: Channel Hierarchy (Completo)

**Canais implementados:**
- `platform:events` - Broadcast global
- `platform:events:portal:<portalId>` - Portal-scoped
- `platform:events:user:<userId>` - User-specific

**PSUBSCRIBE Pattern Matching:**
```typescript
await redisService.psubscribe(
  ['platform:events', 'platform:events:*'],
  (message: string, channel: string) => {
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
)
```

**Vantagens sobre múltiplas assinaturas:**
- ✅ Usa pattern matching nativo do Redis (performance)
- ✅ Subscriber único por SSE Service (menos overhead)
- ✅ Routing centralizado (mais fácil debugar)

---

### ✅ FASE 3: Recovery (Completo)

**Redis Streams para eventos user-specific:**
```typescript
// Backend armazena eventos em stream
await redisService.addToStream(`events:${userId}`, event)

// Recovery via lastEventId
if (lastEventId !== '0') {
  const missedEvents = await redisService.getStreamEvents(`events:${userId}`, lastEventId)
  for (const event of missedEvents) {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  }
}
```

**Frontend persiste streamId:**
```typescript
// localStorage tracking
this.lastEventId = event.metadata?.streamId || event.id
localStorage.setItem('sse_lastEventId', this.lastEventId)
```

**Vantagens:**
- ✅ Eventos não perdidos durante reload
- ✅ Padrão nativo EventSource (lastEventId)
- ✅ Redis Streams persiste eventos (até limite configurado)

---

### ✅ FASE 4: BullMQ (Completo - Opcional)

**4 filas implementadas:**
- `file-processing` (concurrency: 5, retry: 3)
- `notifications` (concurrency: 10, retry: 5)
- `external-api` (concurrency: 3, retry: 10)
- `scheduled` (concurrency: 5, retry: 3)

**BullBoard UI:** http://localhost:3003/admin/queues

**Integração SSE + BullMQ:**
- Jobs longos → BullMQ (processamento assíncrono)
- Progresso → SSE (`job.updateProgress()` → evento SSE)
- Completude → SSE (notificação ao usuário)

**Vantagens:**
- ✅ Jobs persistentes (sobrevivem a restart)
- ✅ Retry com backoff exponencial
- ✅ Priorização de jobs
- ✅ UI administrativa (debug)

---

## 🔄 COMPARAÇÃO: PROPOSTA vs IMPLEMENTADO

| Aspecto | Proposta Original | Implementação Real | Melhor? |
|---------|-------------------|-------------------|---------|
| **Autenticação Anônima** | sessionId em query param | Guest JWT em query param | ✅ JWT (reutiliza infra) |
| **Canais Redis** | Múltiplos subscribe por conexão | PSUBSCRIBE pattern matching | ✅ Pattern (performance) |
| **Target Filtering** | Backend filtra por target field | Canais separados (routing) | ✅ Canais (menos overhead) |
| **Recovery** | Não especificado | Redis Streams + lastEventId | ✅ Implementado (robusto) |
| **Rate Limiting** | Por IP (10 conexões) | Não implementado | ❌ Pendente |
| **JWT Validation** | Opcional | Obrigatório (jwt.verify) | ✅ Implementado (seguro) |
| **Jobs Assíncronos** | Não especificado | BullMQ completo | ✅ Bonus (útil) |

**Conclusão:** Implementação real é **superior** em todos os aspectos críticos, com JWT sendo mais robusto que sessionId.

---

## ⚠️ MELHORIAS PENDENTES (da Proposta Original)

### 1. Rate Limiting (IMPORTANTE)

**Proposta Original (seção 6.2):**
```typescript
const connections = new Map<string, number>();
const MAX_CONNECTIONS_PER_IP = 10;

router.get('/stream', (req, res) => {
  const ip = req.ip;
  const count = connections.get(ip) || 0;

  if (count >= MAX_CONNECTIONS_PER_IP) {
    return res.status(429).json({ error: 'Too many connections' });
  }

  connections.set(ip, count + 1);

  req.on('close', () => {
    connections.set(ip, (connections.get(ip) || 1) - 1);
  });

  // ...
});
```

**Por que implementar:**
- ✅ **Proteção DoS:** Previne ataques de exaustão de conexões
- ✅ **Fair use:** Evita usuários monopolizarem recursos
- ✅ **Simples:** 10 linhas de código, Map nativo

**Quando implementar:** FASE 1 do próximo plano (alta prioridade)

**Alternativas:**
- Redis rate limiting (mais robusto, multi-instância)
- Express-rate-limit middleware (padronizado)
- Cloudflare/Nginx rate limiting (infraestrutura)

---

### 2. Idle Timeout (MÉDIA PRIORIDADE)

**Proposta Original:**
> Desconectar após 5 minutos sem heartbeat do cliente

**Implementação atual:**
- ✅ Heartbeat enviado a cada 30s (`:keepalive\n\n`)
- ❌ Sem timeout de idle (conexões órfãs permanecem)

**Melhoria proposta:**
```typescript
const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutos
const connections = new Map<string, { res: Response, lastActivity: number }>();

// No heartbeat
setInterval(() => {
  const now = Date.now();
  for (const [userId, conn] of connections.entries()) {
    if (now - conn.lastActivity > IDLE_TIMEOUT) {
      console.log(`[SSE] Idle timeout for ${userId}`);
      conn.res.end();
      connections.delete(userId);
    }
  }
}, 60000); // Check a cada minuto
```

**Por que implementar:**
- ✅ Libera recursos de conexões abandonadas
- ✅ Detecta navegador fechado sem evento `close`
- ✅ Previne memory leak em produção

**Quando implementar:** FASE 2 do próximo plano

---

### 3. Portal-Scoped Events (BAIXA PRIORIDADE)

**Implementação atual (placeholder):**
```typescript
private async broadcastToPortal(portalId: string, event: PlatformEvent): Promise<void> {
  // TODO: Implementar lookup de usuários do portal
  // Por enquanto, broadcast para todos
  console.log(`[SSE] Broadcasting to portal ${portalId} (all users for now)`)
  this.broadcastToAll(event)
}
```

**Melhoria proposta:**
```typescript
private async broadcastToPortal(portalId: string, event: PlatformEvent): Promise<void> {
  // Buscar usuários conectados ao portal (via JQEL ou cache)
  const portalUsers = await this.getPortalUsers(portalId);

  for (const userId of portalUsers) {
    const connection = this.connections.get(userId);
    if (connection) {
      this.sendEvent(connection.response, event);
    }
  }
}

private async getPortalUsers(portalId: string): Promise<string[]> {
  // Opção 1: Query JQEL (mais lento, mas preciso)
  const result = await jqel({
    schema: 'backend',
    select: 'portal_access',
    where: { portalId: { $eq: portalId } },
    output: ['userId']
  });
  return result.data.map(u => u.userId);

  // Opção 2: Cache Redis (mais rápido, requer sincronização)
  const cached = await redis.smembers(`portal:${portalId}:users`);
  return cached;
}
```

**Por que implementar:**
- ✅ Eficiência: Não envia eventos desnecessários
- ✅ Segurança: Usuários não veem eventos de portais que não acessam
- ✅ Escalabilidade: Importante com 100+ portais

**Quando implementar:** Quando tiver módulo de permissões (EPIC 3)

**Alternativas:**
- Cache Redis (Set de userId por portal, atualizado via SSE)
- Frontend filtra eventos (menos eficiente, mas funciona)

---

### 4. Cookie HttpOnly para JWT (SEGURANÇA)

**Proposta Original (seção 6.1):**
> **Guest JWT em query param:** Potencial exposição em logs
> **Alternativa futura:** Usar cookie HttpOnly

**Implementação atual:**
```typescript
// URL expõe token
const url = `/api/events/stream?token=${encodeURIComponent(token)}`
```

**Problema:**
- ❌ Token aparece em logs de servidor (Nginx, Express)
- ❌ Token aparece em histórico do navegador
- ❌ Token pode vazar via Referer header

**Melhoria proposta:**
```typescript
// Backend: Definir cookie ao emitir guest JWT
router.post('/guest', async (_req: Request, res: Response) => {
  const guestId = `guest_${randomUUID()}`
  const token = jwt.sign({ sub: guestId, guest: true, ... }, env.JWT_SECRET)

  res.cookie('sse_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600 * 1000 // 1 hora
  })

  res.json({ code: 'success', ... })
})

// Frontend: EventSource envia cookies automaticamente
const url = '/api/events/stream' // Sem ?token=
this.eventSource = new EventSource(url, { withCredentials: true })
```

**Por que implementar:**
- ✅ **Segurança:** Token não aparece em logs
- ✅ **CSRF protection:** sameSite=strict
- ✅ **XSS protection:** httpOnly (JS não acessa)

**Quando implementar:** FASE 3 do próximo plano (antes de produção)

**Limitações:**
- CORS complexo (requires credentials)
- Subdomínios precisam domain cookie
- Safari/Firefox podem bloquear third-party cookies

---

### 5. Reconnection Backoff Exponencial (BAIXA PRIORIDADE)

**Implementação atual:**
```typescript
// sseClient.ts
private reconnectDelay = 3000 // Fixo 3s
```

**Melhoria proposta:**
```typescript
private getReconnectDelay(): number {
  const baseDelay = 1000 // 1s
  const maxDelay = 60000 // 60s
  const delay = Math.min(baseDelay * Math.pow(2, this.reconnectAttempts), maxDelay)

  // Jitter: ±25% aleatoriedade
  const jitter = delay * 0.25 * (Math.random() - 0.5)

  return delay + jitter
}

private handleError(): void {
  this.closeConnection()

  if (this.reconnectAttempts < this.maxReconnectAttempts) {
    const delay = this.getReconnectDelay()
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`)

    setTimeout(() => this.createConnection(), delay)
    this.reconnectAttempts++
  }
}
```

**Por que implementar:**
- ✅ Reduz carga no servidor durante instabilidade
- ✅ Previne thundering herd (muitos clients reconectando simultâneamente)
- ✅ Padrão da indústria (AWS, Google Cloud)

**Quando implementar:** FASE 2 do próximo plano

---

### 6. Compressão SSE (PERFORMANCE)

**Proposta Original (seção 9):**
> Compressão SSE (reduzir tráfego)

**Implementação:**
```typescript
// Backend: Habilitar gzip para SSE
app.use(compression({
  filter: (req, res) => {
    // Comprimir SSE se cliente suporta
    if (req.path === '/api/events/stream') {
      return req.headers['accept-encoding']?.includes('gzip') || false
    }
    return compression.filter(req, res)
  }
}))
```

**Economia esperada:**
- JSON payload: ~60-70% redução
- Eventos repetitivos: até 90% redução

**Por que implementar:**
- ✅ Reduz banda (importante em mobile)
- ✅ Aumenta throughput (mais eventos/s)
- ✅ Trivial de implementar (1 linha)

**Quando implementar:** FASE 2 do próximo plano

**Limitações:**
- Aumenta CPU (compressão/descompressão)
- EventSource descomprime automaticamente (transparente)

---

### 7. Métricas e Observabilidade (PRODUÇÃO)

**Proposta Original (seção 9):**
> Métricas (conexões ativas, eventos/s)

**Implementação sugerida:**
```typescript
// src/backend/src/services/sse.service.ts
private metrics = {
  connectionsTotal: 0,
  connectionsActive: 0,
  eventsPublished: 0,
  eventsDelivered: 0,
  errors: 0,
  reconnections: 0,
}

getMetrics() {
  return {
    ...this.metrics,
    connectionsByChannel: this.getConnectionsByChannel(),
    uptime: Date.now() - this.startTime,
  }
}

// Endpoint de métricas
router.get('/stats', (req, res) => {
  res.json(sseService.getMetrics())
})
```

**Dashboard (BullBoard style):**
- Conexões ativas (por canal)
- Eventos/segundo (throughput)
- Taxa de erro (%)
- Latência média (ms)

**Por que implementar:**
- ✅ Debug de problemas em produção
- ✅ Capacity planning (quando escalar)
- ✅ Alertas (Grafana, Datadog)

**Quando implementar:** Antes de deploy produção

---

## 📊 PRIORIZAÇÃO DAS MELHORIAS

### ALTA PRIORIDADE (Implementar AGORA)

1. ✅ **Rate Limiting por IP** (proteção DoS)
   - Impacto: Segurança
   - Esforço: 1h
   - Risco: Baixo

### MÉDIA PRIORIDADE (Antes de Produção)

2. ⏳ **Cookie HttpOnly** (segurança de tokens)
   - Impacto: Segurança
   - Esforço: 2-3h (CORS complexo)
   - Risco: Médio (compatibilidade navegadores)

3. ⏳ **Idle Timeout** (recursos)
   - Impacto: Performance
   - Esforço: 1h
   - Risco: Baixo

4. ⏳ **Métricas** (observabilidade)
   - Impacto: Produção
   - Esforço: 2-3h
   - Risco: Baixo

### BAIXA PRIORIDADE (Melhorias Incrementais)

5. ⏳ **Backoff Exponencial** (UX)
   - Impacto: Resiliência
   - Esforço: 1h
   - Risco: Baixo

6. ⏳ **Compressão SSE** (performance)
   - Impacto: Banda
   - Esforço: 30min
   - Risco: Baixo

7. ⏳ **Portal-Scoped Events** (eficiência)
   - Impacto: Escalabilidade
   - Esforço: 4-6h (requer módulo permissões)
   - Risco: Alto (mudança arquitetural)

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Plano de Implementação: PLAN_4-SSE-Improvements.md

**FASE 1: Segurança (2-3h)**
- [ ] Rate limiting por IP (10 conexões)
- [ ] Logs estruturados (Winston, sem tokens)
- [ ] Testes de carga (Apache Bench)

**FASE 2: Performance (2-3h)**
- [ ] Idle timeout (5 min)
- [ ] Backoff exponencial (1s → 60s)
- [ ] Compressão gzip

**FASE 3: Produção (3-4h)**
- [ ] Cookie HttpOnly (substituir query param)
- [ ] Métricas endpoint (`/api/events/stats`)
- [ ] Alertas (conexões > threshold)

**FASE 4: Escalabilidade (Futuro - EPIC 3)**
- [ ] Portal-scoped events (lookup de usuários)
- [ ] Redis Cluster (multi-instância)
- [ ] Load balancing (sticky sessions)

---

## 📝 DECISÕES ARQUITETURAIS (Implementação Real)

### Por que Guest JWT em vez de sessionId?

**Decisão:** Usar JWT com claim `guest: true`

**Justificativa:**
1. **Reutilização:** Mesma infraestrutura de auth (jwt.verify)
2. **Conversão:** Guest pode virar user sem reconexão
3. **Expiração:** TTL automático (1 hora)
4. **Padrão:** Mercure, Socket.IO usam JWT para sessões

**Trade-offs:**
- ❌ JWT em query param expõe token em logs (mitigar: cookie HttpOnly)
- ✅ Mais robusto que sessionId aleatório
- ✅ Permite claims adicionais (permissions, metadata)

### Por que PSUBSCRIBE em vez de múltiplos subscribe?

**Decisão:** Pattern matching `platform:events:*`

**Justificativa:**
1. **Performance:** Um subscriber Redis por SSE Service
2. **Escalabilidade:** Suporta novos canais sem código
3. **Routing:** Centralizado (mais fácil debugar)

**Trade-offs:**
- ❌ Precisa parsing de channel name (overhead mínimo)
- ✅ Menos conexões Redis (importante em cluster)
- ✅ Padrão Redis nativo

### Por que Redis Streams para recovery?

**Decisão:** Armazenar eventos user-specific em streams

**Justificativa:**
1. **Persistência:** Eventos sobrevivem a restart
2. **Padrão EventSource:** lastEventId nativo
3. **Eficiência:** Apenas eventos user-targeted (não broadcast)

**Trade-offs:**
- ❌ Overhead de escrita (cada evento user)
- ✅ Recovery automático (melhor UX)
- ✅ TTL configurável (evita crescimento infinito)

---

## 🔗 REFERÊNCIAS

**Implementação Executada:**
- `lessons-learned/PLAN.example.md` - Plano completo implementado (5 fases)
- `spec/SPEC-queues-implementation.md` - BullMQ implementado

**Especificações Atualizadas:**
- `spec/SPEC-authentication.md` - SPEC-AU-GUEST-001 até 040 (Guest JWT)
- `spec/SPEC-events.md` - SPEC-EV-SSE-029 até 038 (Recovery)
- `spec/SPEC-channels.md` - SPEC-CH-EV-020a até 020i (Channel Hierarchy)

**Proposta Original:**
- `spec/pending-decisions/sse-anonymous-support.md` - Solução alternativa (sessionId)

**Padrões da Indústria:**
- Mercure: https://mercure.rocks/docs/hub/authentication (JWT guest sessions)
- Redis PSUBSCRIBE: https://redis.io/docs/interact/pubsub/ (pattern matching)
- EventSource Recovery: https://html.spec.whatwg.org/multipage/server-sent-events.html#the-last-event-id-header

---

## ✅ CONCLUSÃO

### O que foi alcançado

A implementação **superou a proposta original** ao usar:
- ✅ **Guest JWT** (mais robusto que sessionId)
- ✅ **Channel Hierarchy** (PSUBSCRIBE pattern matching)
- ✅ **Recovery completo** (Redis Streams + lastEventId)
- ✅ **BullMQ** (bonus: jobs assíncronos)

### O que ainda vale implementar

Da proposta original, **7 melhorias** ainda são valiosas:
1. **Rate limiting** (ALTA - proteção DoS)
2. **Cookie HttpOnly** (MÉDIA - segurança)
3. **Idle timeout** (MÉDIA - recursos)
4. **Métricas** (MÉDIA - produção)
5. **Backoff exponencial** (BAIXA - UX)
6. **Compressão** (BAIXA - performance)
7. **Portal-scoped** (BAIXA - escalabilidade)

### Roadmap

**Curto prazo (1-2 semanas):**
- PLAN_4-SSE-Improvements.md (Fases 1-3)

**Médio prazo (1-2 meses):**
- Portal-scoped events (quando tiver módulo permissões)
- Redis Cluster (quando tiver multi-instância)

**Longo prazo (6+ meses):**
- WebSocket fallback (para ambientes que bloqueiam SSE)
- GraphQL Subscriptions (alternativa moderna)

---

**Status Final:** ✅ SSE Anônimo **IMPLEMENTADO E FUNCIONANDO**
**Melhorias:** 7 itens identificados, 4 alta/média prioridade
**Próximo passo:** Criar PLAN_4-SSE-Improvements.md
