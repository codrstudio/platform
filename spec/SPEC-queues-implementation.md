# SPEC-queues-implementation.md

## Especificação: Implementação do Sistema de Filas (BullMQ)

### Escopo
Este documento complementa `SPEC-queues.md` descrevendo a implementação concreta do sistema de filas usando BullMQ, incluindo decisões de arquitetura e configurações específicas.

---

## 1. Stack Tecnológico

### Bibliotecas Implementadas

**SPEC-QI-TECH-001:** Sistema USA `bullmq` versão 5.x+

**SPEC-QI-TECH-002:** Sistema USA `@bull-board/api` para dashboard

**SPEC-QI-TECH-003:** Sistema USA `@bull-board/express` para integração com Express

**SPEC-QI-TECH-004:** Sistema USA Redis client compartilhado de `redis.service.ts`

### Dependências

**SPEC-QI-TECH-005:** BullMQ DEPENDE de Redis 6.2+

**SPEC-QI-TECH-006:** BullMQ NÃO requer banco de dados adicional

**SPEC-QI-TECH-007:** Bull-Board USA bibliotecas BullMQ Adapter

---

## 2. Filas Implementadas

### Fila: file-processing

**SPEC-QI-FP-001:** Fila CRIADA em `src/backend/src/services/queue.service.ts`

**SPEC-QI-FP-002:** Worker CRIADO em `src/backend/src/workers/file-processing.worker.ts`

**SPEC-QI-FP-003:** Configuração:
```typescript
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }, // 2s, 4s, 8s
  removeOnComplete: 100,
  removeOnFail: 500
}
```

**SPEC-QI-FP-004:** Concurrency: 5 (configurado no worker)

**SPEC-QI-FP-005:** Use cases:
- Upload de arquivos
- Conversão de formatos
- Compressão de imagens
- Geração de thumbnails

### Fila: notifications

**SPEC-QI-NO-001:** Fila CRIADA em `src/backend/src/services/queue.service.ts`

**SPEC-QI-NO-002:** Worker CRIADO em `src/backend/src/workers/notifications.worker.ts`

**SPEC-QI-NO-003:** Configuração:
```typescript
{
  attempts: 5,
  backoff: { type: 'exponential', delay: 1000 }, // 1s, 2s, 4s, 8s, 16s
  removeOnComplete: 100,
  removeOnFail: 500
}
```

**SPEC-QI-NO-004:** Concurrency: 10 (configurado no worker)

**SPEC-QI-NO-005:** Use cases:
- Envio de emails
- Push notifications
- SMS
- Notificações integradas

### Fila: external-api

**SPEC-QI-EA-001:** Fila CRIADA em `src/backend/src/services/queue.service.ts`

**SPEC-QI-EA-002:** Worker CRIADO em `src/backend/src/workers/external-api.worker.ts`

**SPEC-QI-EA-003:** Configuração:
```typescript
{
  attempts: 10,
  backoff: { type: 'exponential', delay: 5000 }, // 5s, 10s, 20s, 40s...
  removeOnComplete: 100,
  removeOnFail: 500
}
```

**SPEC-QI-EA-004:** Concurrency: 3 (configurado no worker)

**SPEC-QI-EA-005:** Use cases:
- Integração com APIs de terceiros
- Webhooks externos
- Sincronização de dados
- Chamadas a serviços externos

### Fila: scheduled

**SPEC-QI-SC-001:** Fila CRIADA em `src/backend/src/services/queue.service.ts`

**SPEC-QI-SC-002:** Worker CRIADO em `src/backend/src/workers/scheduled.worker.ts`

**SPEC-QI-SC-003:** Configuração:
```typescript
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: 100,
  removeOnFail: 500
}
```

**SPEC-QI-SC-004:** Concurrency: 5 (configurado no worker)

**SPEC-QI-SC-005:** Use cases:
- Jobs agendados (cron)
- Tarefas recorrentes
- Limpeza de dados
- Relatórios programados

---

## 3. Arquivos Criados

### Services

**SPEC-QI-AR-001:** Arquivo CRIADO: `src/backend/src/services/queue.service.ts`

**SPEC-QI-AR-002:** Arquivo EXPORTA:
- `fileProcessingQueue` (Queue instance)
- `notificationsQueue` (Queue instance)
- `externalApiQueue` (Queue instance)
- `scheduledQueue` (Queue instance)

**SPEC-QI-AR-003:** Todas as filas USAM conexão Redis compartilhada via `redisService.getClient()`

### Workers

**SPEC-QI-AR-004:** Arquivo CRIADO: `src/backend/src/workers/file-processing.worker.ts`

**SPEC-QI-AR-005:** Arquivo CRIADO: `src/backend/src/workers/notifications.worker.ts`

**SPEC-QI-AR-006:** Arquivo CRIADO: `src/backend/src/workers/external-api.worker.ts`

**SPEC-QI-AR-007:** Arquivo CRIADO: `src/backend/src/workers/scheduled.worker.ts`

**SPEC-QI-AR-008:** Arquivo CRIADO: `src/backend/src/workers/index.ts` (bootstrap)

**SPEC-QI-AR-009:** Workers INICIAM automaticamente ao importar `workers/index.ts`

**SPEC-QI-AR-010:** Workers REGISTRAM listeners:
- `on('completed', ...)` - Logs de sucesso
- `on('failed', ...)` - Logs de erro

### Routes

**SPEC-QI-AR-011:** Arquivo CRIADO: `src/backend/src/routes/admin.routes.ts`

**SPEC-QI-AR-012:** Rota REGISTRADA em `src/backend/src/app.ts` como `/admin`

**SPEC-QI-AR-013:** Bull-Board DISPONÍVEL em `/admin/queues`

### Modificações em Arquivos Existentes

**SPEC-QI-AR-014:** Arquivo MODIFICADO: `src/backend/src/server.ts`
- Import adicionado: `import './workers/index.js'`
- Workers iniciam com o servidor

**SPEC-QI-AR-015:** Arquivo MODIFICADO: `src/backend/src/app.ts`
- Import adicionado: `import adminRoutes from './routes/admin.routes.js'`
- Rota registrada: `app.use('/admin', adminRoutes)`

**SPEC-QI-AR-016:** Arquivo MODIFICADO: `src/backend/src/services/redis.service.ts`
- Método adicionado: `getClient()` - Retorna cliente Redis raw

---

## 4. Retry Strategies

### File Processing

**SPEC-QI-RETRY-001:** Tentativas: 3

**SPEC-QI-RETRY-002:** Backoff: exponencial, início 2s

**SPEC-QI-RETRY-003:** Delays: 2s → 4s → 8s

**SPEC-QI-RETRY-004:** Após 3 falhas, job marcado como `failed`

### Notifications

**SPEC-QI-RETRY-005:** Tentativas: 5

**SPEC-QI-RETRY-006:** Backoff: exponencial, início 1s

**SPEC-QI-RETRY-007:** Delays: 1s → 2s → 4s → 8s → 16s

**SPEC-QI-RETRY-008:** Após 5 falhas, job marcado como `failed`

### External API

**SPEC-QI-RETRY-009:** Tentativas: 10

**SPEC-QI-RETRY-010:** Backoff: exponencial, início 5s

**SPEC-QI-RETRY-011:** Delays: 5s → 10s → 20s → 40s → 80s → 160s → 320s → 640s → 1280s → 2560s

**SPEC-QI-RETRY-012:** Retry agressivo para lidar com instabilidade de APIs externas

### Scheduled

**SPEC-QI-RETRY-013:** Tentativas: 3

**SPEC-QI-RETRY-014:** Backoff: exponencial, início 2s

**SPEC-QI-RETRY-015:** Delays: 2s → 4s → 8s

---

## 5. Bull-Board UI

### Configuração

**SPEC-QI-UI-001:** Bull-Board CONFIGURADO em `src/backend/src/routes/admin.routes.ts`

**SPEC-QI-UI-002:** BasePath: `/admin/queues`

**SPEC-QI-UI-003:** Adapter: `ExpressAdapter` do `@bull-board/express`

**SPEC-QI-UI-004:** Queues registradas: 4 (file-processing, notifications, external-api, scheduled)

### Acesso

**SPEC-QI-UI-005:** URL: `http://localhost:3003/admin/queues` (desenvolvimento)

**SPEC-QI-UI-006:** Autenticação: TODO (placeholder - atualmente aberto)

**SPEC-QI-UI-007:** Em produção, DEVE adicionar middleware de autenticação

**SPEC-QI-UI-008:** Sugestão: Validar JWT admin via `/api/1/auth/authorize`

### Funcionalidades Disponíveis

**SPEC-QI-UI-009:** Visualizar filas e jobs (waiting, active, completed, failed)

**SPEC-QI-UI-010:** Ver detalhes de jobs (data, progress, logs)

**SPEC-QI-UI-011:** Retry manual de jobs falhados

**SPEC-QI-UI-012:** Limpar jobs completed/failed

**SPEC-QI-UI-013:** Pausar/retomar filas

**SPEC-QI-UI-014:** Adicionar jobs manualmente (para testes)

---

## 6. Progress Tracking

### Implementação

**SPEC-QI-PROG-001:** Workers DEVEM chamar `job.updateProgress(percentage)`

**SPEC-QI-PROG-002:** Percentage: 0-100 (integer)

**SPEC-QI-PROG-003:** Progress SALVO em Redis automaticamente

**SPEC-QI-PROG-004:** Progress VISÍVEL no Bull-Board

### Exemplo (file-processing.worker.ts)

**SPEC-QI-PROG-005:** Worker IMPLEMENTA 4 checkpoints:
```typescript
await job.updateProgress(25)  // Início
await job.updateProgress(50)  // Metade
await job.updateProgress(75)  // Quase completo
await job.updateProgress(100) // Concluído
```

**SPEC-QI-PROG-006:** Progress PODE ser usado para UX (loading bars)

**SPEC-QI-PROG-007:** Progress NÃO é obrigatório (opcional)

---

## 7. Job Lifecycle

### Estados de Job

**SPEC-QI-LIFE-001:** Job passa pelos estados:
1. `waiting` - Aguardando na fila
2. `active` - Sendo processado
3. `completed` OU `failed` - Finalizado

**SPEC-QI-LIFE-002:** Job `failed` PODE ser retried automaticamente

**SPEC-QI-LIFE-003:** Job `failed` permanente após esgotar tentativas

### Cleanup

**SPEC-QI-LIFE-004:** Jobs `completed` MANTIDOS: últimos 100

**SPEC-QI-LIFE-005:** Jobs `failed` MANTIDOS: últimos 500

**SPEC-QI-LIFE-006:** Configuração: `removeOnComplete: 100`, `removeOnFail: 500`

**SPEC-QI-LIFE-007:** Cleanup AUTOMÁTICO (BullMQ remove jobs antigos)

### Logs

**SPEC-QI-LIFE-008:** Worker LOGA ao completar: `console.log('Job X completed:', result)`

**SPEC-QI-LIFE-009:** Worker LOGA ao falhar: `console.error('Job X failed:', error.message)`

**SPEC-QI-LIFE-010:** Logs APARECEM no stdout do worker

---

## 8. Performance e Concurrency

### Concurrency por Fila

**SPEC-QI-PERF-001:** `file-processing`: 5 jobs simultâneos

**SPEC-QI-PERF-002:** `notifications`: 10 jobs simultâneos

**SPEC-QI-PERF-003:** `external-api`: 3 jobs simultâneos (rate limiting)

**SPEC-QI-PERF-004:** `scheduled`: 5 jobs simultâneos

### Ajustes

**SPEC-QI-PERF-005:** Concurrency PODE ser ajustada via variável de ambiente

**SPEC-QI-PERF-006:** Sugestão: `QUEUE_<NAME>_CONCURRENCY` (ex: `QUEUE_FILE_PROCESSING_CONCURRENCY=10`)

**SPEC-QI-PERF-007:** Worker PODE rodar em múltiplos processos (horizontal scaling)

---

## 9. Integração com SSE

### Notificação de Progresso

**SPEC-QI-SSE-001:** Workers PODEM publicar eventos SSE via Redis

**SPEC-QI-SSE-002:** Exemplo: Job de processamento publica `{ type: 'job-progress', jobId, progress }`

**SPEC-QI-SSE-003:** Frontend PODE escutar eventos de progresso via SSE

**SPEC-QI-SSE-004:** Usar canal `platform:events:user:<userId>` para job-specific events

### Eventos de Job

**SPEC-QI-SSE-005:** Job `completed` PODE publicar evento:
```typescript
{
  type: 'notification',
  id: `job-completed-${jobId}`,
  userId: job.data.userId,
  data: { message: 'Processing completed', jobId }
}
```

**SPEC-QI-SSE-006:** Job `failed` PODE publicar evento de erro

**SPEC-QI-SSE-007:** Integração SSE é OPCIONAL (workers podem implementar ou não)

---

## 10. Decisões de Arquitetura

### Redis Connection Sharing

**SPEC-QI-ARCH-001:** Decisão: Compartilhar cliente Redis entre BullMQ e SSE

**SPEC-QI-ARCH-002:** Rationale: Reduz overhead de conexões, simplifica config

**SPEC-QI-ARCH-003:** Implementação: `redisService.getClient()` retorna raw client

**SPEC-QI-ARCH-004:** BullMQ USA `connection: redisService.getClient()`

### Workers Startup

**SPEC-QI-ARCH-005:** Decisão: Workers iniciam com servidor backend

**SPEC-QI-ARCH-006:** Rationale: Simplicidade em desenvolvimento, monólito inicial

**SPEC-QI-ARCH-007:** Futuro: Workers PODEM ser separados em processos distintos

**SPEC-QI-ARCH-008:** Separação futura NÃO quebra código (mesma interface)

### Bull-Board Placement

**SPEC-QI-ARCH-009:** Decisão: Bull-Board em `/admin/queues`

**SPEC-QI-ARCH-010:** Rationale: Namespace admin permite proteger facilmente

**SPEC-QI-ARCH-011:** Futuro: Adicionar middleware de autenticação admin

**SPEC-QI-ARCH-012:** UI DEVE ser acessível apenas para usuários admin

---

## 11. Próximos Passos (Roadmap)

### Segurança

**SPEC-QI-NEXT-001:** TODO: Adicionar autenticação em `/admin/queues`

**SPEC-QI-NEXT-002:** TODO: Validar permissão `admin.queues` via `/api/1/auth/authorize`

### API de Jobs

**SPEC-QI-NEXT-003:** TODO: Criar rotas `POST /api/jobs/:queueName` (adicionar job)

**SPEC-QI-NEXT-004:** TODO: Criar rota `GET /api/jobs/:queueName/:jobId` (status)

**SPEC-QI-NEXT-005:** TODO: Criar rota `DELETE /api/jobs/:queueName/:jobId` (cancelar)

### Monitoring

**SPEC-QI-NEXT-006:** TODO: Adicionar métricas Prometheus (BullMQ metrics exporter)

**SPEC-QI-NEXT-007:** TODO: Alertas para filas com muitos jobs `failed`

**SPEC-QI-NEXT-008:** TODO: Dashboard de performance (job throughput)

### Advanced Features

**SPEC-QI-NEXT-009:** TODO: Rate limiting por fila (BullMQ rate limiter)

**SPEC-QI-NEXT-010:** TODO: Priority queues (BullMQ priorities)

**SPEC-QI-NEXT-011:** TODO: Job dependencies (BullMQ flows)

**SPEC-QI-NEXT-012:** TODO: Scheduled jobs (cron syntax)

---

## 12. Testes Realizados

### Teste de Instalação

**SPEC-QI-TEST-001:** EXECUTADO: `npm install bullmq @bull-board/api @bull-board/express`

**SPEC-QI-TEST-002:** RESULTADO: 29 packages adicionados, 0 vulnerabilidades

**SPEC-QI-TEST-003:** VERIFICADO: `package.json` contém dependências

### Teste de Inicialização

**SPEC-QI-TEST-004:** EXECUTADO: Backend iniciado com workers

**SPEC-QI-TEST-005:** OBSERVADO: Logs mostram "All workers started"

**SPEC-QI-TEST-006:** OBSERVADO: 4 workers ativos (file, notifications, external-api, scheduled)

### Teste de Bull-Board

**SPEC-QI-TEST-007:** EXECUTADO: Acessar `http://localhost:3003/admin/queues`

**SPEC-QI-TEST-008:** RESULTADO: UI do Bull-Board carrega corretamente

**SPEC-QI-TEST-009:** VERIFICADO: 4 filas visíveis na interface

**SPEC-QI-TEST-010:** TESTADO: Adicionar job manual via UI → Job processado com sucesso

---

## 13. Limitações Conhecidas

### Autenticação

**SPEC-QI-LIMIT-001:** Bull-Board NÃO tem autenticação (placeholder implementado)

**SPEC-QI-LIMIT-002:** Produção REQUER autenticação antes de deploy

**SPEC-QI-LIMIT-003:** TODO comentado no código: `// TODO: Adicionar middleware de autenticação`

### API de Jobs

**SPEC-QI-LIMIT-004:** Endpoint `/api/jobs/*` NÃO foi criado

**SPEC-QI-LIMIT-005:** Jobs DEVEM ser adicionados via Bull-Board UI (manual)

**SPEC-QI-LIMIT-006:** Produção REQUER endpoints para adicionar jobs via código

### Workers Separation

**SPEC-QI-LIMIT-007:** Workers rodam no mesmo processo do API server

**SPEC-QI-LIMIT-008:** Escalabilidade horizontal REQUER separação de processos

**SPEC-QI-LIMIT-009:** Código JÁ permite separação (basta importar workers separadamente)

---

## 14. Referências

### Documentação Oficial

**SPEC-QI-REF-001:** BullMQ Docs: https://docs.bullmq.io/

**SPEC-QI-REF-002:** Bull-Board Docs: https://github.com/felixmosh/bull-board

**SPEC-QI-REF-003:** Redis Docs: https://redis.io/docs/

### Decisões de Design

**SPEC-QI-REF-004:** Baseado em: SPEC-queues.md (especificação geral)

**SPEC-QI-REF-005:** Baseado em: PLAN_SSE.md FASE 4 (checklist de implementação)

**SPEC-QI-REF-006:** Padrões da indústria: Bull, Sidekiq, Celery

---

*Esta especificação documenta a implementação concreta do sistema de filas. Para requisitos gerais, consulte SPEC-queues.md.*
