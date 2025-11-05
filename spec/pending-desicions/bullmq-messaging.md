# Approved Decision: BullMQ Messaging System

**Date**: 2025-11-05
**Status**: ✅ APPROVED
**Approval Date**: 2025-11-05
**Related SPEC**: SPEC-queues.md, SPEC-events.md, SPEC-architecture.md, SPEC-data-access.md, SPEC-error-handling.md

---

## Context

A plataforma atualmente usa **Redis Pub/Sub** para eventos em tempo real (SSE - Server-Sent Events). No entanto, existem cenários onde precisamos de processamento assíncrono de tarefas com recursos avançados:

### Casos de Uso Identificados

1. **Processamento em Background**
   - Geração de relatórios complexos
   - Processamento de uploads (imagens, vídeos, documentos)
   - Envio de emails em massa
   - Sincronização com sistemas externos

2. **Tarefas Agendadas**
   - Limpeza de dados temporários
   - Envio de notificações programadas
   - Backups automáticos
   - Reprocessamento de falhas

3. **Jobs com Retry e Prioridade**
   - Integração com APIs externas (com retry em caso de falha)
   - Processamento de webhooks de terceiros
   - Tarefas críticas que não podem ser perdidas

### Limitações do Redis Pub/Sub Atual

❌ **Sem persistência**: Se nenhum subscriber estiver ativo, mensagens são perdidas
❌ **Sem retry**: Falhas no processamento não têm reprocessamento automático
❌ **Sem priorização**: Todas as mensagens têm mesma prioridade
❌ **Sem rastreamento**: Não há histórico ou status de processamento
❌ **Sem agendamento**: Não é possível processar tarefas em horário específico
❌ **Sem concorrência controlada**: Não há limite de processamento simultâneo

---

## Proposed Solution

Adicionar **BullMQ** como sistema de mensageria para processamento assíncrono de tarefas, mantendo Redis Pub/Sub para eventos em tempo real (SSE).

### Por que BullMQ?

✅ **Baseado em Redis**: Usa a mesma infraestrutura já existente
✅ **Persistência**: Jobs são salvos e não perdem dados
✅ **Retry automático**: Configurável por job ou fila
✅ **Priorização**: Jobs podem ter diferentes prioridades
✅ **Agendamento**: Suporte a delayed jobs e cron
✅ **Rastreamento**: Status completo (waiting, active, completed, failed)
✅ **Concorrência**: Controle de workers e rate limiting
✅ **TypeScript nativo**: Tipos bem definidos
✅ **UI de monitoramento**: BullBoard para visualização

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  EVENTOS EM TEMPO REAL (SSE)                                │
│  - Notificações instantâneas                                │
│  - Chat messages                                            │
│  - Atualizações de UI                                       │
│  Tech: Redis Pub/Sub → SSE Stream                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PROCESSAMENTO ASSÍNCRONO (Jobs)                            │
│  - Tarefas em background                                    │
│  - Jobs agendados                                           │
│  - Processamento com retry                                  │
│  Tech: BullMQ + Redis                                       │
└─────────────────────────────────────────────────────────────┘
```

### Quando usar cada um?

| Redis Pub/Sub (SSE) | BullMQ |
|---------------------|--------|
| Notificações instantâneas | Processamento pesado |
| Eventos de UI | Tarefas agendadas |
| Chat em tempo real | Jobs com retry |
| Atualizações de status | Integração com APIs |
| Broadcast simples | Processamento em lote |

---

## Implementation Details

### 1. Dependencies

```json
{
  "dependencies": {
    "bullmq": "^5.0.0",
    "@bull-board/api": "^5.0.0",
    "@bull-board/express": "^5.0.0"
  }
}
```

### 2. Queue Structure

**File**: `src/prototype-X/backend/src/queues/index.ts`

```typescript
import { Queue, Worker, QueueEvents } from 'bullmq';

// Configuração de conexão Redis (reutiliza conexão existente)
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

// Definição de filas por domínio
export const queues = {
  // Processamento de arquivos
  fileProcessing: new Queue('file-processing', {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100, // Mantém últimos 100 jobs concluídos
      removeOnFail: 500,     // Mantém últimos 500 jobs falhados
    },
  }),

  // Notificações e emails
  notifications: new Queue('notifications', {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
    },
  }),

  // Integração com sistemas externos
  externalApi: new Queue('external-api', {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 10,
      backoff: { type: 'exponential', delay: 5000 },
    },
  }),

  // Tarefas agendadas (cron)
  scheduled: new Queue('scheduled', {
    connection: redisConnection,
  }),
};
```

### 3. Workers

**File**: `src/prototype-X/backend/src/workers/fileProcessing.worker.ts`

```typescript
import { Worker, Job } from 'bullmq';
import { queues } from '../queues';

interface FileJobData {
  fileId: string;
  fileUrl: string;
  userId: string;
  operation: 'thumbnail' | 'compress' | 'convert';
}

// Worker processa jobs de forma assíncrona
const fileProcessingWorker = new Worker<FileJobData>(
  'file-processing',
  async (job: Job<FileJobData>) => {
    const { fileId, fileUrl, operation } = job.data;

    // Atualiza progresso
    await job.updateProgress(10);

    // Executa operação
    switch (operation) {
      case 'thumbnail':
        await generateThumbnail(fileUrl);
        break;
      case 'compress':
        await compressFile(fileUrl);
        break;
      case 'convert':
        await convertFile(fileUrl);
        break;
    }

    await job.updateProgress(100);

    return { fileId, status: 'completed' };
  },
  {
    connection: redisConnection,
    concurrency: 5, // Processa até 5 jobs simultaneamente
  }
);

// Eventos do worker
fileProcessingWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
  // Opcional: Emitir evento SSE para notificar frontend
});

fileProcessingWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

export default fileProcessingWorker;
```

### 4. API Integration

**File**: `src/prototype-X/backend/src/routes/jobs.routes.ts`

```typescript
import { Router } from 'express';
import { queues } from '../queues';

const router = Router();

// Adicionar job à fila
router.post('/jobs/file-processing', async (req, res) => {
  const { fileId, fileUrl, operation } = req.body;

  const job = await queues.fileProcessing.add(
    'process-file',
    {
      fileId,
      fileUrl,
      userId: req.user.id,
      operation,
    },
    {
      priority: 1, // Maior = mais prioritário
    }
  );

  res.json({ jobId: job.id });
});

// Consultar status de job
router.get('/jobs/:jobId', async (req, res) => {
  const { jobId } = req.params;

  const job = await queues.fileProcessing.getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const state = await job.getState();
  const progress = job.progress;

  res.json({
    id: job.id,
    state, // 'waiting' | 'active' | 'completed' | 'failed'
    progress,
    data: job.data,
    returnvalue: job.returnvalue,
  });
});

// Agendar job (delayed)
router.post('/jobs/scheduled', async (req, res) => {
  const { task, executeAt } = req.body;

  const job = await queues.scheduled.add(
    task,
    { ...req.body },
    {
      delay: new Date(executeAt).getTime() - Date.now(),
    }
  );

  res.json({ jobId: job.id });
});

export default router;
```

### 5. BullBoard UI (Monitoring)

**File**: `src/prototype-X/backend/src/index.ts`

```typescript
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { queues } from './queues';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(queues.fileProcessing),
    new BullMQAdapter(queues.notifications),
    new BullMQAdapter(queues.externalApi),
    new BullMQAdapter(queues.scheduled),
  ],
  serverAdapter,
});

// Proteger com autenticação
app.use('/admin/queues', authMiddleware, serverAdapter.getRouter());
```

---

## Integration with n8n Backbone

BullMQ pode ser integrado com n8n de três formas:

### ⭐ Opção A: n8n-nodes-bullmq (RECOMENDADO)

**Usar nodo BullMQ oficial para n8n**: https://github.com/minhlucvan/n8n-nodes-bullmq

n8n workflows se conectam **diretamente ao Redis** via nodo BullMQ:

```
n8n → BullMQ Node → Redis (adiciona job) → Worker processa
```

**Vantagens**:
- ✅ **Performance superior**: Conexão direta ao Redis (sem overhead de HTTP)
- ✅ **Latência mínima**: ~5-10ms vs ~50-100ms da API HTTP
- ✅ **Interface visual**: Configurar jobs via UI do n8n
- ✅ **Features completas**: Acesso a 100% das features do BullMQ
- ✅ **Monitoramento nativo**: n8n pode monitorar e reagir a eventos de jobs
- ✅ **Menos código**: Não precisa criar endpoints HTTP customizados
- ✅ **Manutenção**: Nodo mantido pela comunidade

**Instalação**:
```bash
# No servidor n8n
npm install n8n-nodes-bullmq

# Ou adicionar ao Dockerfile do n8n
RUN npm install -g n8n-nodes-bullmq
```

**Uso no Workflow**:
1. Adicionar nodo "BullMQ - Add Job"
2. Configurar conexão Redis (mesma do backend)
3. Selecionar fila (ex: `file-processing`)
4. Configurar dados do job
5. (Opcional) Configurar opções: priority, delay, attempts, backoff

**Monitoramento**:
- Usar nodo "BullMQ - Get Job" para consultar status
- Usar nodo "BullMQ - Listen" para reagir a eventos (completed, failed, progress)

**Quando usar**:
- ✅ Principal método para n8n adicionar jobs
- ✅ n8n precisa monitorar status de jobs
- ✅ Performance é crítica
- ✅ Workflows complexos com múltiplas filas

---

### Opção B: n8n como Producer via HTTP API

n8n workflows podem adicionar jobs às filas via HTTP:

```
n8n → POST /api/jobs/file-processing → Backend adiciona job → Worker processa
```

**Vantagens**:
- ✅ Funciona sem instalar nodo adicional
- ✅ Pode adicionar validação customizada no backend
- ✅ Útil se n8n não tem acesso direto ao Redis

**Desvantagens**:
- ❌ Maior latência (HTTP overhead)
- ❌ Features limitadas às expostas pela API
- ❌ Requer criar e manter endpoints HTTP

**Quando usar**:
- 🔧 Fallback se nodo BullMQ não disponível
- 🔧 n8n em rede isolada sem acesso ao Redis
- 🔧 Precisa de validação/transformação antes de adicionar job

---

### Opção C: n8n como Consumer (Webhook)

Workers podem chamar webhooks n8n quando jobs completam:

```
Worker processa → Webhook n8n → Workflow executa lógica de negócio
```

**Vantagens**:
- ✅ Lógica de negócio centralizada no n8n (Backbone)
- ✅ Workers leves (apenas processamento)
- ✅ Fácil de modificar lógica sem redeployar workers

**Quando usar**:
- ✅ Worker precisa de lógica de negócio complexa
- ✅ Lógica muda frequentemente
- ✅ Reutilizar workflows existentes

**Combinação recomendada**:
- n8n adiciona jobs via **Opção A (nodo BullMQ)**
- Workers chamam webhooks n8n quando precisam de lógica de negócio (**Opção C**)

---

### Comparação de Opções

| Aspecto | Nodo BullMQ (A) | HTTP API (B) | Webhook (C) |
|---------|-----------------|--------------|-------------|
| **Latência** | 5-10ms | 50-100ms | 50-200ms |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Setup** | npm install | Criar API | Criar webhook |
| **Features BullMQ** | 100% | Limitado | N/A |
| **Monitoramento** | Built-in | Manual | N/A |
| **Manutenção** | Baixa | Média | Baixa |
| **Uso Principal** | Producer | Fallback | Consumer |

**Decisão Final**: Usar **Nodo BullMQ (Opção A)** como método principal para n8n adicionar jobs, combinado com **Webhooks (Opção C)** quando workers precisam de lógica de negócio do Backbone.

---

## Frontend Integration

### Adicionar job

```typescript
// Frontend envia requisição para criar job
const response = await fetch('/api/jobs/file-processing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileId: 'abc123',
    fileUrl: 'https://...',
    operation: 'thumbnail',
  }),
});

const { jobId } = await response.json();
```

### Monitorar progresso

**Opção 1**: Polling (simples)

```typescript
const checkJobStatus = async (jobId: string) => {
  const response = await fetch(`/api/jobs/${jobId}`);
  const job = await response.json();

  return job; // { state, progress, data, returnvalue }
};

// Poll a cada 2 segundos
const interval = setInterval(async () => {
  const job = await checkJobStatus(jobId);

  if (job.state === 'completed' || job.state === 'failed') {
    clearInterval(interval);
  }
}, 2000);
```

**Opção 2**: SSE (recomendado)

Backend emite evento SSE quando job completa:

```typescript
// Worker emite evento ao completar
fileProcessingWorker.on('completed', (job) => {
  redisPublisher.publish('platform:events', JSON.stringify({
    type: 'job-completed',
    target: `user:${job.data.userId}`,
    data: { jobId: job.id, result: job.returnvalue },
  }));
});

// Frontend recebe via SSE
useEffect(() => {
  const handleJobCompleted = (event: MessageEvent) => {
    const { jobId, result } = JSON.parse(event.data).data;
    // Atualiza UI
  };

  eventSource.addEventListener('job-completed', handleJobCompleted);
}, []);
```

---

## Expected Behavior

### Exemplo: Upload e processamento de imagem

1. **User**: Faz upload de imagem (10MB)
2. **Frontend**: Envia arquivo para `/api/upload`
3. **Backend**: Salva arquivo, retorna `fileId`, adiciona job à fila
   ```typescript
   await queues.fileProcessing.add('process-image', {
     fileId: 'img123',
     fileUrl: 'https://storage/img123.jpg',
     userId: 'user456',
     operation: 'thumbnail',
   });
   ```
4. **Worker**: Pega job da fila e processa
   - Atualiza progresso: 10%, 50%, 100%
   - Gera thumbnail
   - Salva resultado
5. **Worker**: Ao completar, emite evento SSE
6. **Frontend**: Recebe evento, atualiza UI com thumbnail

**Benefícios**:
- ✅ Upload não bloqueia (retorna imediatamente)
- ✅ Se processing falhar, retry automático
- ✅ User pode fechar navegador, processing continua
- ✅ Múltiplos uploads processados em paralelo (concurrency: 5)
- ✅ UI atualizada em tempo real via SSE

---

## Benefits

### Confiabilidade
✅ **Persistência**: Jobs não são perdidos mesmo se servidor reiniciar
✅ **Retry automático**: Falhas temporárias são reprocessadas
✅ **Dead letter queue**: Jobs falhados permanentemente são isolados
✅ **Idempotência**: Jobs podem ser reprocessados com segurança

### Escalabilidade
✅ **Concorrência controlada**: Evita sobrecarga do servidor
✅ **Rate limiting**: Controla taxa de processamento
✅ **Priorização**: Jobs críticos processados primeiro
✅ **Workers distribuídos**: Pode rodar em múltiplos servidores

### Monitoramento
✅ **Dashboard visual**: BullBoard para visualização
✅ **Métricas**: Throughput, latência, taxa de erro
✅ **Logs estruturados**: Histórico completo de cada job
✅ **Alertas**: Notificações quando fila atinge threshold

### Developer Experience
✅ **TypeScript nativo**: Tipos bem definidos
✅ **API simples**: Fácil de usar e entender
✅ **Documentação completa**: Guias e exemplos
✅ **Comunidade ativa**: Problemas resolvidos rapidamente

---

## Risks

### Performance

**Concern**: Adicionar BullMQ pode aumentar latência?

**Mitigation**:
- BullMQ usa Redis (já presente na stack)
- Overhead mínimo: ~1-5ms por job
- Workers rodam em processos separados (não bloqueia API)
- Pode escalar horizontalmente com múltiplos workers

### Complexity

**Concern**: Mais uma tecnologia para gerenciar

**Mitigation**:
- Baseado em Redis (infraestrutura existente)
- API simples e intuitiva
- BullBoard fornece UI pronta
- Já usado por empresas como Vercel, Twilio, Shopify

### Learning Curve

**Concern**: Desenvolvedores precisam aprender BullMQ?

**Mitigation**:
- Documentação excelente
- Patterns bem estabelecidos
- Exemplos prontos no projeto
- Encapsulado em serviços (abstração)

---

## Spec Changes Required

Esta decisão requer adições a **SPEC-architecture.md** e **SPEC-events.md**:

### SPEC-architecture.md

**Nova seção**: Backend - Queue System

**SPEC-B-QUEUE-001**: Backend MUST use BullMQ for asynchronous job processing
**SPEC-B-QUEUE-002**: Backend MUST define separate queues for different domains (file-processing, notifications, external-api, scheduled)
**SPEC-B-QUEUE-003**: Workers MUST run in separate processes from API server
**SPEC-B-QUEUE-004**: Jobs MUST have retry configuration with exponential backoff
**SPEC-B-QUEUE-005**: Completed jobs SHOULD be retained for 100 executions
**SPEC-B-QUEUE-006**: Failed jobs SHOULD be retained for 500 executions
**SPEC-B-QUEUE-007**: Queue monitoring MUST be accessible via BullBoard UI
**SPEC-B-QUEUE-008**: BullBoard UI MUST be protected by authentication

### SPEC-events.md

**Novas seções**: Queue Events

**SPEC-EV-QUEUE-001**: Workers MAY emit SSE events when jobs complete
**SPEC-EV-QUEUE-002**: Job completion events MUST include jobId and result
**SPEC-EV-QUEUE-003**: Job failure events MUST include jobId and error message
**SPEC-EV-QUEUE-004**: Job progress updates SHOULD be emitted via SSE for long-running tasks
**SPEC-EV-QUEUE-005**: Frontend SHOULD use SSE for job monitoring instead of polling

### Novo arquivo: SPEC-queues.md

Criar especificação detalhada sobre:
- Estrutura de filas
- Naming conventions
- Retry strategies
- Priority levels
- Monitoring e alertas
- Integração com n8n

---

## Alternative Considered

### Alternative 1: Custom Redis Queue

**Pros**:
- Controle total sobre implementação
- Sem dependência externa

**Cons**:
❌ Reinventar a roda (100+ horas de desenvolvimento)
❌ Bugs e edge cases não descobertos
❌ Sem UI de monitoramento
❌ Sem comunidade para suporte

**Conclusion**: Não vale o esforço quando BullMQ resolve tudo.

### Alternative 2: AWS SQS / Google Cloud Tasks

**Pros**:
- Gerenciado (sem infraestrutura)
- Escalabilidade automática

**Cons**:
❌ Vendor lock-in
❌ Custo adicional
❌ Latência maior (network calls)
❌ Complexidade de configuração
❌ Não usa Redis existente

**Conclusion**: Overkill para esta plataforma.

### Alternative 3: Agenda.js

**Pros**:
- Focado em scheduled jobs
- MongoDB-based

**Cons**:
❌ Requer MongoDB (nova dependência)
❌ Menos features que BullMQ
❌ Comunidade menor
❌ Performance inferior ao Redis

**Conclusion**: BullMQ é superior em todos aspectos.

---

## Recommendation

**APPROVE** a adição de BullMQ como sistema de mensageria para processamento assíncrono de tarefas.

**Reasoning**:
1. **Industry standard**: Usado por empresas de grande porte
2. **Zero infra changes**: Usa Redis existente
3. **Complementa SSE**: Não substitui, adiciona capability
4. **Developer friendly**: API simples, TypeScript nativo
5. **Battle tested**: Milhões de jobs processados em produção
6. **Monitoring included**: BullBoard fornece UI pronta
7. **Low risk**: Não afeta funcionalidades existentes

---

## Next Steps (if approved)

### Phase 1: Setup (Prototype-2)
1. ✅ Instalar dependências (`bullmq`, `@bull-board/api`, `@bull-board/express`)
2. ✅ Criar estrutura de filas (`src/backend/src/queues/index.ts`)
3. ✅ Configurar BullBoard UI (`/admin/queues`)
4. ✅ Documentar padrões de uso

### Phase 2: Implement First Use Case
5. ✅ Criar fila de exemplo (`file-processing`)
6. ✅ Implementar worker (`fileProcessing.worker.ts`)
7. ✅ Adicionar rotas de API (`POST /jobs/file-processing`, `GET /jobs/:jobId`)
8. ✅ Integrar com SSE para notificações
9. ✅ Testar fluxo completo

### Phase 3: Documentation
10. ✅ Criar `SPEC-queues.md`
11. ✅ Atualizar `SPEC-architecture.md` (seção Queue System)
12. ✅ Atualizar `SPEC-events.md` (Queue Events)
13. ✅ Adicionar exemplos ao prototype's PLAN.md

### Phase 4: Iterate
14. ✅ Adicionar mais filas conforme necessidade (notifications, external-api, etc.)
15. ✅ Configurar alertas e monitoring
16. ✅ Otimizar concurrency e rate limiting
17. ✅ Implementar integração com n8n workflows

---

## References

- **BullMQ Documentation**: https://docs.bullmq.io/
- **BullBoard**: https://github.com/felixmosh/bull-board
- **Redis Best Practices**: https://redis.io/docs/manual/patterns/
- **Job Queue Patterns**: https://www.enterpriseintegrationpatterns.com/patterns/messaging/

---

## Questions for Discussion

1. **Naming**: As filas propostas (`file-processing`, `notifications`, `external-api`, `scheduled`) cobrem os casos de uso iniciais?

2. **Retention**: Manter 100 jobs concluídos e 500 falhados é suficiente? Ou precisamos de mais histórico?

3. **Monitoring**: BullBoard UI deve estar em `/admin/queues` ou outro path?

4. **Workers**: Devem rodar no mesmo processo do servidor ou em processos separados (Docker containers)?

5. **Integration**: Preferência por n8n como producer (adiciona jobs) ou consumer (recebe webhooks)?

6. **Priorities**: Quais tipos de jobs precisam de prioridade alta vs baixa?

7. **Rate Limiting**: Algum job precisa de rate limiting específico (ex: max 10 requests/min para API externa)?
