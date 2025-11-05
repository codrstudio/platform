# Plano de Aceite: BullMQ Messaging System

**Data de Criação**: 2025-11-05
**Status**: Aguardando Aprovação
**Decisão Relacionada**: `bullmq-messaging.md`
**Responsável**: Arquitetura da Plataforma

---

## 1. Sumário Executivo

### Proposta
Adicionar **BullMQ** como sistema de mensageria para processamento assíncrono de tarefas, complementando o Redis Pub/Sub existente (usado para SSE).

### Justificativa
- Redis Pub/Sub é excelente para eventos em tempo real, mas não persiste mensagens
- Casos de uso como processamento de arquivos, envio de emails em massa e integrações com APIs externas requerem:
  - ✅ Persistência de jobs
  - ✅ Retry automático
  - ✅ Priorização e agendamento
  - ✅ Rastreamento de status
- BullMQ usa a mesma infraestrutura Redis já existente (zero mudanças de infra)

### Impacto
- **Custo**: Baixo (reutiliza Redis existente)
- **Risco**: Baixo (não afeta funcionalidades existentes)
- **Benefício**: Alto (novos casos de uso viabilizados)
- **Esforço**: Médio (2-3 sprints para implementação completa)

---

## 2. Análise de Alinhamento com Especificações

### 2.1. SPEC-architecture.md

#### ✅ Alinhamentos Existentes

| Requisito | Status | Observação |
|-----------|--------|------------|
| **SPEC-A-S-019**: Uso de Redis para Pub/Sub | ✅ Compatível | BullMQ usa o mesmo Redis |
| **SPEC-A-S-020**: Uso de Redis Streams | ✅ Compatível | BullMQ não conflita com Streams SSE |
| **SPEC-A-S-021**: Redis para cache (opcional) | ✅ Compatível | BullMQ não usa cache Redis |
| **SPEC-A-L-016**: Backend NÃO contém lógica de negócio | ✅ Compatível | Workers apenas executam, lógica fica no Backbone |

#### 📝 Novos Requisitos Necessários

**Seção Nova**: Backend - Queue System

```markdown
## X. Sistema de Filas (Queue System)

### Requisitos Obrigatórios

**SPEC-A-Q-001:** Backend DEVE usar BullMQ para processamento assíncrono de tarefas

**SPEC-A-Q-002:** Sistema de filas DEVE usar Redis como message broker

**SPEC-A-Q-003:** Sistema DEVE definir filas separadas por domínio funcional

**SPEC-A-Q-004:** Workers DEVEM rodar em processos separados do servidor API

**SPEC-A-Q-005:** Jobs DEVEM ter configuração de retry com backoff exponencial

### Retenção e Limpeza

**SPEC-A-Q-006:** Jobs completados DEVEM ser retidos por no mínimo 100 execuções

**SPEC-A-Q-007:** Jobs falhados DEVEM ser retidos por no mínimo 500 execuções

**SPEC-A-Q-008:** Jobs antigos DEVEM ser removidos automaticamente após retenção

### Monitoramento

**SPEC-A-Q-009:** Sistema DEVE fornecer UI de monitoramento via BullBoard

**SPEC-A-Q-010:** UI de monitoramento DEVE ser protegida por autenticação

**SPEC-A-Q-011:** Monitoramento DEVE ser acessível em rota administrativa (ex: /admin/queues)

### Integração com Backbone

**SPEC-A-Q-012:** Backbone (n8n) PODE adicionar jobs às filas via API

**SPEC-A-Q-013:** Workers PODEM chamar webhooks n8n para processar lógica de negócio

**SPEC-A-Q-014:** Jobs NÃO DEVEM conter lógica de negócio complexa (delegada ao Backbone)
```

### 2.2. SPEC-events.md

#### ✅ Alinhamentos Existentes

| Requisito | Status | Observação |
|-----------|--------|------------|
| **SPEC-EV-AR-005**: Redis como message broker | ✅ Compatível | BullMQ é outra camada sobre Redis |
| **SPEC-EV-AR-006**: Redis Pub/Sub para entrega imediata | ✅ Compatível | SSE continua usando Pub/Sub |
| **SPEC-EV-AR-007**: Redis Streams para buffer | ✅ Compatível | Streams SSE independentes de BullMQ |

#### 📝 Novos Requisitos Necessários

**Seção Nova**: Queue Events

```markdown
## X. Eventos de Filas (Queue Events)

### Integração com SSE

**SPEC-EV-QUEUE-001:** Workers PODEM emitir eventos SSE quando jobs completam

**SPEC-EV-QUEUE-002:** Evento de conclusão DEVE incluir `type: "job-completed"`

**SPEC-EV-QUEUE-003:** Evento de conclusão DEVE incluir `jobId` e `result`

**SPEC-EV-QUEUE-004:** Evento de falha DEVE incluir `type: "job-failed"`

**SPEC-EV-QUEUE-005:** Evento de falha DEVE incluir `jobId` e mensagem de erro

**SPEC-EV-QUEUE-006:** Eventos de progresso DEVEM ser emitidos para jobs de longa duração

**SPEC-EV-QUEUE-007:** Frontend DEVE usar SSE para monitorar jobs (preferencial) ou polling (fallback)

### Payload de Evento

**SPEC-EV-QUEUE-008:** Formato de evento de job:
```json
{
  "type": "job-completed" | "job-failed" | "job-progress",
  "id": "evt_<timestamp>_<random>",
  "userId": "user_123",
  "timestamp": "2025-11-05T10:30:00Z",
  "data": {
    "jobId": "job_12345",
    "queueName": "file-processing",
    "status": "completed" | "failed",
    "progress": 100,
    "result": { /* job result */ },
    "error": "error message if failed"
  }
}
```

### Recuperação de Status

**SPEC-EV-QUEUE-009:** Frontend PODE consultar status de job via JQEL

**SPEC-EV-QUEUE-010:** Consulta DEVE usar schema `backend` ou `system`

**SPEC-EV-QUEUE-011:** Resposta DEVE incluir: state, progress, data, returnvalue
```

### 2.3. SPEC-data-access.md

#### ✅ Alinhamentos Existentes

| Requisito | Status | Observação |
|-----------|--------|------------|
| **SPEC-DA-P-001**: JQEL é única forma de acesso | ✅ Compatível | Jobs consultados via JQEL |
| **SPEC-DA-EV-001**: SSE dispara invalidações | ✅ Compatível | Job completion pode invalidar cache |

#### 📝 Novos Requisitos Necessários

**Adição à Seção 5**: Invalidação via Eventos (SSE)

```markdown
### Invalidação por Jobs

**SPEC-DA-JOB-001:** Conclusão de job PODE disparar invalidação de queries

**SPEC-DA-JOB-002:** Worker PODE emitir evento `data_changed` ao completar job

**SPEC-DA-JOB-003:** Frontend DEVE invalidar queries relacionadas ao job

**SPEC-DA-JOB-004:** Exemplo de fluxo:
```typescript
// Worker completa job de processamento de arquivo
fileWorker.on('completed', (job) => {
  // Emitir evento SSE de mudança de dados
  redisPublisher.publish('platform:events', JSON.stringify({
    type: 'data_changed',
    schema: 'storage',
    entity: 'file',
    ids: [job.data.fileId]
  }));

  // Também emitir evento de conclusão de job
  redisPublisher.publish('platform:events', JSON.stringify({
    type: 'job-completed',
    userId: job.data.userId,
    data: { jobId: job.id, result: job.returnvalue }
  }));
});

// Frontend invalida queries
queryClient.invalidateQueries(['storage', 'file', { id: fileId }]);
```
```

### 2.4. SPEC-error-handling.md

#### ✅ Alinhamentos Existentes

| Requisito | Status | Observação |
|-----------|--------|------------|
| **SPEC-ERR-P-001**: Tratar erros gracefully | ✅ Compatível | Jobs têm retry automático |
| **SPEC-ERR-RETRY-001**: Retry automático permitido | ✅ Compatível | BullMQ tem retry built-in |
| **SPEC-ERR-LOG-001**: Usar níveis de log | ✅ Compatível | Workers logam eventos |

#### 📝 Novos Requisitos Necessários

**Adição à Seção 2**: Categorias de Erros

```markdown
### Erros de Filas (Jobs)

**SPEC-ERR-QUEUE-001:** Job timeout
- **Timeout padrão**: Configurável por fila (ex: 10min)
- **Mensagem ao usuário**: "Processamento demorou demais."
- **Ação sugerida**: Retry automático conforme configuração

**SPEC-ERR-QUEUE-002:** Job falha após múltiplas tentativas
- **Mensagem ao usuário**: "Não foi possível processar. Tente novamente mais tarde."
- **Ação sugerida**: Job move para failed queue (análise manual)

**SPEC-ERR-QUEUE-003:** Dependência externa indisponível
- **Mensagem ao usuário**: "Serviço temporariamente indisponível."
- **Ação sugerida**: Retry com backoff exponencial

**SPEC-ERR-QUEUE-004:** Dados de job inválidos
- **Mensagem ao usuário**: "Dados inválidos para processamento."
- **Ação sugerida**: Não fazer retry, mover para failed
```

**Adição à Seção 6**: Retry Strategy

```markdown
### Retry para Jobs (BullMQ)

**SPEC-ERR-JOB-RETRY-001:** Jobs DEVEM ter configuração de retry por fila

**SPEC-ERR-JOB-RETRY-002:** Backoff exponencial DEVE ser padrão: 2s, 4s, 8s, 16s...

**SPEC-ERR-JOB-RETRY-003:** Máximo de tentativas DEVE ser configurável (padrão: 3-10)

**SPEC-ERR-JOB-RETRY-004:** Jobs com dados inválidos NÃO DEVEM ter retry

**SPEC-ERR-JOB-RETRY-005:** Jobs com erro 4xx de API externa NÃO DEVEM ter retry

**SPEC-ERR-JOB-RETRY-006:** Jobs com erro 5xx de API externa DEVEM ter retry

**SPEC-ERR-JOB-RETRY-007:** Jobs que excedem máximo de tentativas movem para failed queue
```

---

## 3. Novo Arquivo de Especificação

### Criar: `SPEC-queues.md`

```markdown
# SPEC-queues.md

## Especificação: Sistema de Filas (Queue System)

### Escopo
Este documento define os requisitos do sistema de filas da plataforma usando BullMQ para processamento assíncrono de tarefas.

---

## 1. Conceitos Fundamentais

### Definições

**SPEC-Q-CO-001:** Sistema de Filas gerencia processamento assíncrono de tarefas

**SPEC-Q-CO-002:** Sistema DEVE usar BullMQ como biblioteca de filas

**SPEC-Q-CO-003:** Sistema DEVE usar Redis como message broker

**SPEC-Q-CO-004:** Filas e SSE são complementares, não substitutos

### Quando Usar Filas vs SSE

**SPEC-Q-CO-005:** Usar Filas para:
- Processamento pesado (>5s)
- Tarefas com retry necessário
- Jobs agendados (delayed/cron)
- Integração com APIs externas
- Processamento em lote

**SPEC-Q-CO-006:** Usar SSE para:
- Notificações em tempo real
- Atualizações de UI instantâneas
- Chat e mensagens
- Eventos de baixa latência

---

## 2. Arquitetura de Filas

### Estrutura

**SPEC-Q-AR-001:** Sistema DEVE ter filas separadas por domínio funcional

**SPEC-Q-AR-002:** Filas obrigatórias:
- `file-processing`: Processamento de uploads/arquivos
- `notifications`: Envio de emails e notificações
- `external-api`: Integração com APIs externas
- `scheduled`: Tarefas agendadas (cron)

**SPEC-Q-AR-003:** Novas filas PODEM ser adicionadas conforme necessidade

**SPEC-Q-AR-004:** Naming convention: kebab-case (ex: `email-sender`, `pdf-generator`)

### Workers

**SPEC-Q-AR-005:** Cada fila DEVE ter um ou mais workers

**SPEC-Q-AR-006:** Workers DEVEM rodar em processos separados do API server

**SPEC-Q-AR-007:** Workers PODEM rodar em máquinas/containers separados

**SPEC-Q-AR-008:** Concorrência de worker DEVE ser configurável

**SPEC-Q-AR-009:** Workers DEVEM se registrar ao iniciar e desregistrar ao parar

---

## 3. Jobs

### Criação

**SPEC-Q-JOB-001:** Jobs são adicionados via API: `POST /api/jobs/:queueName`

**SPEC-Q-JOB-002:** Job DEVE incluir:
```typescript
{
  name: string;           // Nome/tipo do job
  data: object;           // Dados do job
  options?: {
    priority?: number;    // 1-10 (maior = mais prioritário)
    delay?: number;       // Delay em ms
    attempts?: number;    // Max tentativas
    backoff?: {
      type: 'exponential' | 'fixed';
      delay: number;
    };
  };
}
```

**SPEC-Q-JOB-003:** API DEVE retornar `jobId` imediatamente

**SPEC-Q-JOB-004:** Job DEVE ser persistido no Redis antes de retornar

### Status

**SPEC-Q-JOB-005:** Job PODE ter status:
- `waiting`: Na fila, aguardando processamento
- `active`: Sendo processado
- `completed`: Concluído com sucesso
- `failed`: Falhou após todas tentativas
- `delayed`: Agendado para futuro

**SPEC-Q-JOB-006:** Status DEVE ser consultável via `GET /api/jobs/:jobId`

**SPEC-Q-JOB-007:** Consulta DEVE retornar:
```typescript
{
  id: string;
  state: JobStatus;
  progress: number;       // 0-100
  data: object;           // Dados originais
  returnvalue?: any;      // Resultado (se completed)
  failedReason?: string;  // Erro (se failed)
  attemptsMade: number;
  timestamp: string;
}
```

### Progresso

**SPEC-Q-JOB-008:** Jobs de longa duração DEVEM reportar progresso

**SPEC-Q-JOB-009:** Progresso DEVE ser 0-100

**SPEC-Q-JOB-010:** Worker atualiza progresso via `job.updateProgress(percent)`

**SPEC-Q-JOB-011:** Progresso PODE disparar evento SSE (opcional)

---

## 4. Retry e Backoff

### Configuração

**SPEC-Q-RETRY-001:** Cada fila DEVE ter configuração de retry padrão

**SPEC-Q-RETRY-002:** Jobs individuais PODEM sobrescrever config da fila

**SPEC-Q-RETRY-003:** Backoff exponencial DEVE ser padrão

**SPEC-Q-RETRY-004:** Configuração padrão sugerida:
```typescript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000  // 2s, 4s, 8s
  }
}
```

### Estratégias

**SPEC-Q-RETRY-005:** Filas PODEM ter estratégias diferentes:
- `file-processing`: 3 tentativas, 2s backoff
- `notifications`: 5 tentativas, 1s backoff
- `external-api`: 10 tentativas, 5s backoff

**SPEC-Q-RETRY-006:** Jobs críticos PODEM ter mais tentativas

**SPEC-Q-RETRY-007:** Jobs não-críticos PODEM não ter retry

---

## 5. Priorização

### Níveis

**SPEC-Q-PRIO-001:** Jobs PODEM ter prioridade 1-10

**SPEC-Q-PRIO-002:** Prioridade padrão: 5 (normal)

**SPEC-Q-PRIO-003:** Níveis sugeridos:
- 1-3: Baixa prioridade (relatórios, limpeza)
- 4-6: Normal (processamento geral)
- 7-8: Alta (requisições de usuário)
- 9-10: Urgente (crítico, segurança)

**SPEC-Q-PRIO-004:** Worker DEVE processar jobs de maior prioridade primeiro

**SPEC-Q-PRIO-005:** Jobs de mesma prioridade processados em FIFO

---

## 6. Agendamento

### Delayed Jobs

**SPEC-Q-SCHED-001:** Jobs PODEM ser agendados para futuro via `delay` (ms)

**SPEC-Q-SCHED-002:** Delayed jobs NÃO ocupam worker até hora agendada

**SPEC-Q-SCHED-003:** Jobs agendados DEVEM mover para `waiting` na hora certa

### Cron Jobs

**SPEC-Q-SCHED-004:** Filas PODEM ter jobs recorrentes (cron pattern)

**SPEC-Q-SCHED-005:** Cron jobs DEVEM usar sintaxe cron padrão

**SPEC-Q-SCHED-006:** Exemplo:
```typescript
await queue.add('cleanup', { ... }, {
  repeat: {
    cron: '0 2 * * *'  // Todo dia às 2am
  }
});
```

**SPEC-Q-SCHED-007:** Cron jobs DEVEM persistir mesmo após restart

---

## 7. Monitoramento

### BullBoard UI

**SPEC-Q-MON-001:** Sistema DEVE fornecer UI via BullBoard

**SPEC-Q-MON-002:** UI DEVE ser acessível em `/admin/queues`

**SPEC-Q-MON-003:** UI DEVE ser protegida por autenticação

**SPEC-Q-MON-004:** UI DEVE mostrar:
- Listagem de filas
- Jobs por status (waiting, active, completed, failed)
- Detalhes de cada job
- Logs e stack traces
- Métricas (throughput, latência)

**SPEC-Q-MON-005:** UI DEVE permitir:
- Visualizar jobs
- Retry manual de jobs falhados
- Deletar jobs
- Pausar/resumir filas

### Métricas

**SPEC-Q-MON-006:** Sistema DEVE coletar métricas:
- Jobs processados/min
- Taxa de sucesso/falha
- Latência média
- Tamanho das filas

**SPEC-Q-MON-007:** Métricas PODEM ser exportadas para Prometheus/Grafana

---

## 8. Integração com n8n (Backbone)

### n8n como Producer

**SPEC-Q-N8N-001:** n8n PODE adicionar jobs via HTTP POST

**SPEC-Q-N8N-002:** Endpoint: `POST /api/jobs/:queueName`

**SPEC-Q-N8N-003:** n8n DEVE incluir JWT no header Authorization

**SPEC-Q-N8N-004:** Workflow n8n exemplo:
```
1. HTTP Request Node → POST /api/jobs/file-processing
2. Payload: { name: "compress", data: { fileId: "..." } }
3. Recebe jobId
4. (Opcional) Aguardar webhook de completion
```

### Workers chamam n8n

**SPEC-Q-N8N-005:** Workers PODEM chamar webhooks n8n para lógica de negócio

**SPEC-Q-N8N-006:** Worker DEVE fazer POST para webhook n8n com dados do job

**SPEC-Q-N8N-007:** n8n processa lógica e retorna resultado

**SPEC-Q-N8N-008:** Worker armazena resultado no job

**SPEC-Q-N8N-009:** Fluxo recomendado: n8n como producer (SPEC-Q-N8N-001 a 004)

---

## 9. Segurança

### Autenticação

**SPEC-Q-SEC-001:** API de jobs DEVE requerer autenticação

**SPEC-Q-SEC-002:** Apenas usuários autorizados PODEM adicionar jobs

**SPEC-Q-SEC-003:** BullBoard UI DEVE requerer autenticação

**SPEC-Q-SEC-004:** Apenas admins DEVEM acessar BullBoard

### Validação

**SPEC-Q-SEC-005:** Dados de job DEVEM ser validados antes de adicionar

**SPEC-Q-SEC-006:** Jobs com dados inválidos DEVEM ser rejeitados (HTTP 400)

**SPEC-Q-SEC-007:** Workers DEVEM validar dados novamente ao processar

### Rate Limiting

**SPEC-Q-SEC-008:** API de jobs PODE ter rate limiting

**SPEC-Q-SEC-009:** Limite sugerido: 100 jobs/min por usuário

**SPEC-Q-SEC-010:** Exceder limite DEVE retornar HTTP 429

---

## 10. Performance

### Concorrência

**SPEC-Q-PERF-001:** Workers DEVEM ter concorrência configurável

**SPEC-Q-PERF-002:** Concorrência padrão sugerida: 5 jobs simultâneos

**SPEC-Q-PERF-003:** Ajustar conforme recursos do servidor

### Rate Limiting de Workers

**SPEC-Q-PERF-004:** Workers PODEM ter rate limiting

**SPEC-Q-PERF-005:** Exemplo: max 10 requests/min para API externa

**SPEC-Q-PERF-006:** Configuração via limiter do BullMQ

### Limpeza

**SPEC-Q-PERF-007:** Jobs antigos DEVEM ser removidos automaticamente

**SPEC-Q-PERF-008:** Retenção padrão:
- Completed: últimos 100 jobs
- Failed: últimos 500 jobs

**SPEC-Q-PERF-009:** Limpeza DEVE rodar periodicamente (ex: diariamente)

---

*Esta especificação define o sistema de filas. Para eventos em tempo real, ver SPEC-events.md.*
```

---

## 4. Impacto em Protótipos

### Prototype-2 (Recomendado para Implementação)

**Razão**: Prototype-2 está mais maduro e já tem estrutura de Backend + Frontend definida.

**Tarefas**:
1. ✅ Instalar dependências BullMQ
2. ✅ Criar estrutura de filas em `src/prototype-2/backend/src/queues/`
3. ✅ Implementar workers em `src/prototype-2/backend/src/workers/`
4. ✅ Adicionar rotas de API em `src/prototype-2/backend/src/routes/jobs.routes.ts`
5. ✅ Configurar BullBoard em `/admin/queues`
6. ✅ Integrar com SSE para notificações de conclusão
7. ✅ Documentar no PLAN.md do prototype-2

### Outros Prototypes

**Prototype-1**: Pode implementar posteriormente se necessário
**Prototype-3**: Aguardar maturidade antes de adicionar

---

## 5. Roadmap de Implementação

### Phase 1: Setup e Infraestrutura (Sprint 1 - Semana 1-2)

**Objetivo**: Configurar BullMQ e validar conceito

#### Tarefas

1. **Atualizar Especificações**
   - [ ] Criar `spec/SPEC-queues.md` completo
   - [ ] Atualizar `spec/SPEC-architecture.md` (seção Queue System)
   - [ ] Atualizar `spec/SPEC-events.md` (seção Queue Events)
   - [ ] Atualizar `spec/SPEC-data-access.md` (invalidação por jobs)
   - [ ] Atualizar `spec/SPEC-error-handling.md` (erros de filas)
   - **Estimativa**: 4 horas
   - **Responsável**: Arquitetura

2. **Instalar Dependências (Prototype-2)**
   - [ ] `npm install bullmq @bull-board/api @bull-board/express`
   - [ ] Atualizar `package.json`
   - **Estimativa**: 15 min
   - **Responsável**: Dev Backend

3. **Criar Estrutura de Filas**
   - [ ] Criar `src/prototype-2/backend/src/queues/index.ts`
   - [ ] Definir 4 filas iniciais (file-processing, notifications, external-api, scheduled)
   - [ ] Configurar conexão Redis
   - [ ] Configurar options padrão (retry, retention)
   - **Estimativa**: 2 horas
   - **Responsável**: Dev Backend

4. **Configurar BullBoard**
   - [ ] Criar adapter BullBoard em `src/prototype-2/backend/src/index.ts`
   - [ ] Configurar rota `/admin/queues`
   - [ ] Adicionar middleware de autenticação
   - [ ] Testar acesso à UI
   - **Estimativa**: 2 horas
   - **Responsável**: Dev Backend

5. **Documentação Inicial**
   - [ ] Atualizar `src/prototype-2/PLAN.md`
   - [ ] Adicionar seção "Sistema de Filas"
   - [ ] Documentar estrutura de pastas
   - [ ] Adicionar exemplos de uso básico
   - **Estimativa**: 1 hora
   - **Responsável**: Dev Backend

**Entregáveis**:
- ✅ Especificações atualizadas
- ✅ BullMQ instalado e configurado
- ✅ BullBoard acessível em `/admin/queues`
- ✅ Documentação básica

**Critérios de Aceite**:
- [ ] BullBoard UI carrega e mostra 4 filas vazias
- [ ] Autenticação funciona (apenas admin acessa)
- [ ] Redis conecta sem erros

---

### Phase 2: Primeiro Use Case (Sprint 1-2 - Semana 2-3)

**Objetivo**: Implementar processamento de arquivos como caso de uso piloto

#### Tarefas

6. **Criar Worker de File Processing**
   - [ ] Criar `src/prototype-2/backend/src/workers/fileProcessing.worker.ts`
   - [ ] Implementar job processor
   - [ ] Adicionar handlers de eventos (completed, failed)
   - [ ] Configurar concorrência (5 jobs simultâneos)
   - **Estimativa**: 4 horas
   - **Responsável**: Dev Backend

7. **Criar Rotas de API**
   - [ ] Criar `src/prototype-2/backend/src/routes/jobs.routes.ts`
   - [ ] Implementar `POST /api/jobs/file-processing` (criar job)
   - [ ] Implementar `GET /api/jobs/:jobId` (consultar status)
   - [ ] Adicionar validação de payload com Zod
   - [ ] Adicionar autenticação (JWT)
   - **Estimativa**: 3 horas
   - **Responsável**: Dev Backend

8. **Integrar com SSE**
   - [ ] Worker emite evento SSE ao completar job
   - [ ] Worker emite evento SSE ao falhar job
   - [ ] Testar recebimento no frontend
   - **Estimativa**: 2 horas
   - **Responsável**: Dev Backend

9. **Frontend: Hook de Job**
   - [ ] Criar `useJobStatus(jobId)` hook
   - [ ] Implementar consulta via JQEL (ou API direta)
   - [ ] Implementar listener SSE para updates
   - [ ] Retornar { state, progress, data, result }
   - **Estimativa**: 3 horas
   - **Responsável**: Dev Frontend

10. **Frontend: Componente de Upload**
    - [ ] Criar componente de exemplo para upload
    - [ ] Ao fazer upload, criar job na fila
    - [ ] Mostrar progresso do job
    - [ ] Mostrar resultado quando completar
    - [ ] Tratar erros
    - **Estimativa**: 4 horas
    - **Responsável**: Dev Frontend

11. **Testes**
    - [ ] Testar criação de job via API
    - [ ] Testar processamento pelo worker
    - [ ] Testar retry em caso de falha
    - [ ] Testar eventos SSE
    - [ ] Testar consulta de status
    - [ ] Validar BullBoard mostra jobs
    - **Estimativa**: 3 horas
    - **Responsável**: QA

**Entregáveis**:
- ✅ Worker de file processing funcionando
- ✅ API de jobs funcionando
- ✅ Integração com SSE funcionando
- ✅ Frontend consumindo jobs
- ✅ Testes passando

**Critérios de Aceite**:
- [ ] Usuário faz upload de arquivo
- [ ] Job é criado e processado automaticamente
- [ ] Frontend mostra progresso em tempo real via SSE
- [ ] Frontend exibe resultado quando job completa
- [ ] Se processing falhar, retry acontece automaticamente
- [ ] BullBoard mostra job com status correto

---

### Phase 3: Casos de Uso Adicionais (Sprint 2-3 - Semana 4-5)

**Objetivo**: Expandir para outros domínios

#### Tarefas

12. **Fila de Notificações**
    - [ ] Criar worker `notifications.worker.ts`
    - [ ] Implementar envio de email (integração com n8n)
    - [ ] Configurar retry (5 tentativas)
    - [ ] Adicionar rota `POST /api/jobs/notifications`
    - **Estimativa**: 4 horas
    - **Responsável**: Dev Backend

13. **Fila de API Externa**
    - [ ] Criar worker `externalApi.worker.ts`
    - [ ] Implementar chamada a API externa (exemplo)
    - [ ] Configurar retry (10 tentativas, backoff 5s)
    - [ ] Adicionar rate limiting (10 req/min)
    - [ ] Adicionar rota `POST /api/jobs/external-api`
    - **Estimativa**: 5 horas
    - **Responsável**: Dev Backend

14. **Jobs Agendados (Cron)**
    - [ ] Criar job recorrente de exemplo (limpeza de temp files)
    - [ ] Configurar cron pattern (`0 2 * * *`)
    - [ ] Testar execução agendada
    - [ ] Validar persistência após restart
    - **Estimativa**: 3 horas
    - **Responsável**: Dev Backend

15. **Delayed Jobs**
    - [ ] Criar exemplo de delayed job (enviar email em 1 hora)
    - [ ] Testar delay funciona corretamente
    - [ ] Validar job move para waiting na hora certa
    - **Estimativa**: 2 horas
    - **Responsável**: Dev Backend

**Entregáveis**:
- ✅ 3 filas adicionais funcionando
- ✅ Cron jobs funcionando
- ✅ Delayed jobs funcionando

**Critérios de Aceite**:
- [ ] Todas as 4 filas processam jobs corretamente
- [ ] Retry funciona em cada fila
- [ ] Cron job executa no horário correto
- [ ] Delayed job executa após delay

---

### Phase 4: Integração com n8n (Sprint 3 - Semana 6)

**Objetivo**: Demonstrar integração com Backbone usando nodo BullMQ nativo

#### Pré-requisito: Instalar n8n-nodes-bullmq

**RECOMENDAÇÃO**: Usar o nodo BullMQ oficial para n8n em vez de HTTP API.

**Benefícios**:
- ✅ Conexão direta ao Redis (sem latência de HTTP)
- ✅ Performance superior (bypass do backend)
- ✅ Interface visual para configurar jobs
- ✅ Suporte nativo a todas features do BullMQ (priority, delay, repeat, etc)
- ✅ Monitoramento de jobs dentro do n8n

**Instalação**:
```bash
# No servidor n8n
npm install n8n-nodes-bullmq

# Ou via Docker
# Adicionar ao Dockerfile:
# RUN npm install -g n8n-nodes-bullmq
```

**Referência**: https://github.com/minhlucvan/n8n-nodes-bullmq

#### Tarefas

16. **Instalar e Configurar n8n-nodes-bullmq**
    - [ ] Instalar nodo no n8n: `npm install n8n-nodes-bullmq`
    - [ ] Reiniciar n8n para carregar nodo
    - [ ] Configurar credenciais Redis (mesmas do backend)
    - [ ] Testar conexão com filas existentes
    - **Estimativa**: 1 hora
    - **Responsável**: DevOps / Dev n8n

17. **n8n como Producer (via Nodo BullMQ)**
    - [ ] Criar workflow exemplo: "Processar Upload de Arquivo"
    - [ ] Usar nodo "BullMQ - Add Job" para adicionar job
    - [ ] Configurar fila: `file-processing`
    - [ ] Configurar dados do job (fileId, fileUrl, operation)
    - [ ] Configurar opções (priority, attempts, backoff)
    - [ ] Testar adição de job via workflow
    - **Estimativa**: 2 horas
    - **Responsável**: Dev n8n

18. **n8n Monitora Jobs (via Nodo BullMQ)**
    - [ ] Criar workflow exemplo: "Monitorar Jobs"
    - [ ] Usar nodo "BullMQ - Get Job" para consultar status
    - [ ] Usar nodo "BullMQ - Listen" para eventos de job
    - [ ] Disparar ações quando job completa (ex: enviar email)
    - [ ] Disparar ações quando job falha (ex: criar ticket)
    - **Estimativa**: 2 horas
    - **Responsável**: Dev n8n

19. **Worker chama n8n para Lógica de Negócio**
    - [ ] Worker faz POST para webhook n8n
    - [ ] n8n processa lógica de negócio
    - [ ] n8n retorna resultado
    - [ ] Worker armazena resultado no job
    - [ ] Worker usa resultado para próximos passos
    - **Estimativa**: 3 horas
    - **Responsável**: Dev Backend + Dev n8n

20. **Workflow Completo: Upload → Processar → Notificar**
    - [ ] n8n adiciona job de processamento (via BullMQ nodo)
    - [ ] Worker processa arquivo
    - [ ] Worker chama webhook n8n com resultado
    - [ ] n8n envia notificação ao usuário
    - [ ] n8n atualiza status no banco de dados
    - **Estimativa**: 3 horas
    - **Responsável**: Dev n8n + Dev Backend

21. **Documentar Integração**
    - [ ] Atualizar `workflows/README.md`
    - [ ] Adicionar exemplos de workflows com screenshots
    - [ ] Documentar configuração do nodo BullMQ
    - [ ] Documentar patterns recomendados
    - [ ] Criar template workflows reutilizáveis
    - **Estimativa**: 3 horas
    - **Responsável**: Dev n8n

**Entregáveis**:
- ✅ Nodo BullMQ instalado e configurado no n8n
- ✅ n8n adiciona jobs diretamente via Redis (BullMQ nodo)
- ✅ n8n monitora e reage a eventos de jobs
- ✅ Workers chamam n8n para lógica de negócio
- ✅ Workflow end-to-end funcionando
- ✅ Documentação completa com templates

**Critérios de Aceite**:
- [ ] Nodo BullMQ aparece na paleta de nodos do n8n
- [ ] Workflow n8n adiciona job com sucesso (sem usar HTTP)
- [ ] n8n monitora status de jobs em tempo real
- [ ] Worker processa job e chama webhook n8n
- [ ] n8n retorna resultado corretamente
- [ ] Workflow completo funciona end-to-end
- [ ] Performance superior ao usar HTTP API (latência < 50% da API)

**Comparação: Nodo BullMQ vs HTTP API**

| Aspecto | Nodo BullMQ (Recomendado) | HTTP API |
|---------|---------------------------|----------|
| **Latência** | ~5-10ms (Redis direto) | ~50-100ms (HTTP + Backend) |
| **Performance** | Alta (sem overhead HTTP) | Média (parsing, validation) |
| **Features BullMQ** | 100% (todas features) | Limitado (apenas o que API expõe) |
| **Monitoramento** | Built-in no n8n | Via polling ou SSE |
| **Configuração** | Visual (UI do n8n) | JSON manual |
| **Debugging** | Fácil (logs no n8n) | Requer logs de backend |
| **Manutenção** | Baixa (nodo mantido) | Média (API custom) |

**Decisão**: Usar **Nodo BullMQ** como método principal, manter HTTP API como fallback/alternativa.

---

### Phase 5: Monitoramento e Otimização (Sprint 3-4 - Semana 7-8)

**Objetivo**: Adicionar observabilidade e otimizar performance

#### Tarefas

19. **Métricas**
    - [ ] Implementar coleta de métricas (throughput, latência)
    - [ ] Exportar métricas para Prometheus (opcional)
    - [ ] Criar dashboard Grafana (opcional)
    - **Estimativa**: 6 horas
    - **Responsável**: DevOps

20. **Logs Estruturados**
    - [ ] Implementar logging estruturado em workers
    - [ ] Incluir jobId, queueName, timestamp em logs
    - [ ] Configurar níveis de log (ERROR, WARN, INFO)
    - **Estimativa**: 3 horas
    - **Responsável**: Dev Backend

21. **Alertas**
    - [ ] Configurar alerta: taxa de erro > 5% em 5min
    - [ ] Configurar alerta: fila > 1000 jobs waiting
    - [ ] Configurar alerta: worker inativo por > 5min
    - **Estimativa**: 4 horas
    - **Responsável**: DevOps

22. **Otimização**
    - [ ] Ajustar concorrência por fila conforme carga
    - [ ] Otimizar retenção de jobs (balancear histórico vs storage)
    - [ ] Implementar limpeza automática de jobs antigos
    - **Estimativa**: 4 horas
    - **Responsável**: Dev Backend

23. **Documentação Final**
    - [ ] Atualizar SPEC-queues.md com learnings
    - [ ] Criar guia de troubleshooting
    - [ ] Criar guia de operação (como pausar fila, retry manual, etc)
    - [ ] Atualizar PLAN.md do prototype-2
    - **Estimativa**: 4 horas
    - **Responsável**: Tech Writer / Dev Backend

**Entregáveis**:
- ✅ Métricas coletadas e visualizadas
- ✅ Logs estruturados
- ✅ Alertas configurados
- ✅ Performance otimizada
- ✅ Documentação completa

**Critérios de Aceite**:
- [ ] Dashboard mostra métricas em tempo real
- [ ] Logs estruturados facilitam debugging
- [ ] Alertas disparam quando thresholds excedidos
- [ ] Sistema processa 1000 jobs/min sem degradação
- [ ] Documentação permite operação sem suporte

---

## 6. Recursos Necessários

### Humanos

| Papel | Esforço Estimado | Quando |
|-------|------------------|--------|
| Arquiteto de Software | 16 horas | Phase 1 (specs) |
| Dev Backend Sênior | 80 horas | Todas phases |
| Dev Frontend Pleno | 24 horas | Phase 2 |
| Dev n8n | 16 horas | Phase 4 |
| DevOps | 20 horas | Phase 5 |
| QA | 16 horas | Phase 2-5 |
| Tech Writer | 8 horas | Phase 5 |

**Total**: ~180 horas (4.5 semanas com 1 dev full-time ou 2.25 semanas com 2 devs)

### Infraestrutura

| Recurso | Custo | Observação |
|---------|-------|------------|
| Redis (existente) | $0 | Já provisionado |
| Storage adicional | ~$5-10/mês | Para retenção de jobs |
| Monitoring (opcional) | $0-50/mês | Prometheus/Grafana self-hosted ou cloud |

**Total**: ~$5-60/mês (dependendo de monitoring)

### Ferramentas

| Ferramenta | Custo | Observação |
|------------|-------|------------|
| BullMQ | $0 | Open-source |
| BullBoard | $0 | Open-source |
| Grafana (opcional) | $0 | Open-source |
| Prometheus (opcional) | $0 | Open-source |

**Total**: $0

---

## 7. Riscos e Mitigações

### Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Redis sobrecarregado** | Baixa | Alto | Monitorar uso de memória; configurar maxmemory; separar Redis para filas se necessário |
| **Workers travam** | Média | Médio | Implementar health checks; auto-restart; monitoramento de heartbeat |
| **Jobs perdidos após crash** | Baixa | Alto | BullMQ persiste jobs no Redis; backup Redis; testar recovery |
| **Deadlock em dependências** | Baixa | Médio | Validar dependências circulares; testes de carga |
| **Memory leak em workers** | Média | Médio | Code review; testes de longa duração; monitorar memória |

### Riscos de Produto

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Casos de uso não cobertos** | Média | Baixo | Começar com use cases bem definidos; iterar |
| **Complexidade excessiva** | Baixa | Médio | Manter documentação atualizada; treinamento |
| **Usuários não entendem status de jobs** | Média | Baixo | UI clara; mensagens amigáveis; documentação |

### Riscos Operacionais

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Falta de skills BullMQ no time** | Média | Médio | Documentação interna; treinamento; pair programming |
| **Dificuldade de debug** | Média | Médio | Logs estruturados; BullBoard UI; documentação de troubleshooting |
| **Mudança de prioridades** | Média | Alto | Implementação incremental; cada phase entrega valor |

---

## 8. Critérios de Sucesso

### Técnicos

- [ ] Sistema processa 1000+ jobs/min sem degradação
- [ ] 99.9% dos jobs completam com sucesso ou retry automático
- [ ] Latência média < 100ms para adicionar job
- [ ] Latência P95 < 500ms para processar job simples
- [ ] Zero perda de jobs após crash/restart
- [ ] Monitoramento funciona 24/7 sem intervenção

### Produto

- [ ] 3+ casos de uso implementados (file processing, notifications, external API)
- [ ] Frontend mostra status de jobs em tempo real
- [ ] Usuários reportam UX satisfatória para processamento assíncrono
- [ ] BullBoard UI acessível e útil para admins

### Negócio

- [ ] Custo de infraestrutura < $50/mês
- [ ] ROI positivo (economiza tempo de dev em implementações futuras)
- [ ] Plataforma viabiliza novos casos de uso antes impossíveis
- [ ] Equipe confortável mantendo/evoluindo o sistema

---

## 9. Aprovação

### Stakeholders

| Papel | Nome | Aprovação | Data | Comentários |
|-------|------|-----------|------|-------------|
| Arquiteto de Software | - | ⏳ Pendente | - | - |
| Tech Lead Backend | - | ⏳ Pendente | - | - |
| Product Owner | - | ⏳ Pendente | - | - |
| DevOps Lead | - | ⏳ Pendente | - | - |

### Decisão Final

**Status**: ⏳ Aguardando Aprovação

**Próximos Passos**:
1. Revisar este plano com stakeholders
2. Coletar feedback e ajustar se necessário
3. Obter aprovação formal
4. Criar issues/tarefas no backlog
5. Iniciar Phase 1

**Data Esperada de Decisão**: [A definir]

---

## 10. Referências

- **Proposta Original**: `spec/pending-decisions/bullmq-messaging.md`
- **BullMQ Docs**: https://docs.bullmq.io/
- **BullBoard**: https://github.com/felixmosh/bull-board
- **Redis Best Practices**: https://redis.io/docs/manual/patterns/
- **Job Queue Patterns**: https://www.enterpriseintegrationpatterns.com/patterns/messaging/

---

## 11. Apêndices

### A. Exemplo Completo de Worker

```typescript
// src/prototype-2/backend/src/workers/fileProcessing.worker.ts
import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';

interface FileJobData {
  fileId: string;
  fileUrl: string;
  userId: string;
  operation: 'thumbnail' | 'compress' | 'convert';
}

const worker = new Worker<FileJobData>(
  'file-processing',
  async (job: Job<FileJobData>) => {
    const { fileId, fileUrl, operation, userId } = job.data;

    console.log(`Processing ${operation} for file ${fileId}`);

    // Atualiza progresso
    await job.updateProgress(10);

    try {
      // Executa operação (exemplo)
      const result = await processFile(fileUrl, operation);

      await job.updateProgress(100);

      // Emitir evento SSE
      await redisPublisher.publish('platform:events', JSON.stringify({
        type: 'job-completed',
        userId,
        timestamp: new Date().toISOString(),
        data: {
          jobId: job.id,
          queueName: 'file-processing',
          status: 'completed',
          result
        }
      }));

      // Invalidar cache via SSE
      await redisPublisher.publish('platform:events', JSON.stringify({
        type: 'data_changed',
        schema: 'storage',
        entity: 'file',
        ids: [fileId]
      }));

      return { fileId, status: 'completed', result };
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);

      // Emitir evento de falha
      await redisPublisher.publish('platform:events', JSON.stringify({
        type: 'job-failed',
        userId,
        timestamp: new Date().toISOString(),
        data: {
          jobId: job.id,
          queueName: 'file-processing',
          status: 'failed',
          error: error.message
        }
      }));

      throw error; // BullMQ fará retry automaticamente
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed after all retries:`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

export default worker;
```

### B. Exemplo de API Route

```typescript
// src/prototype-2/backend/src/routes/jobs.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { queues } from '../queues';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Schema de validação
const fileJobSchema = z.object({
  fileId: z.string(),
  fileUrl: z.string().url(),
  operation: z.enum(['thumbnail', 'compress', 'convert']),
});

// Adicionar job
router.post('/jobs/file-processing', authMiddleware, async (req, res) => {
  try {
    const data = fileJobSchema.parse(req.body);

    const job = await queues.fileProcessing.add(
      'process-file',
      {
        ...data,
        userId: req.user.id,
      },
      {
        priority: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );

    res.json({
      code: 200,
      message: 'Job created successfully',
      data: { jobId: job.id }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid job data',
        errors: error.errors
      });
    }

    res.status(500).json({
      code: 500,
      message: 'Failed to create job',
      error: error.message
    });
  }
});

// Consultar status
router.get('/jobs/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Buscar job em todas as filas (simplificado - melhorar em produção)
    const job = await queues.fileProcessing.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        code: 404,
        message: 'Job not found'
      });
    }

    const state = await job.getState();
    const progress = job.progress;

    res.json({
      code: 200,
      data: {
        id: job.id,
        state,
        progress,
        data: job.data,
        returnvalue: job.returnvalue,
        failedReason: job.failedReason,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Failed to fetch job status',
      error: error.message
    });
  }
});

export default router;
```

### C. Exemplo Frontend Hook

```typescript
// src/prototype-2/frontend/src/hooks/useJobStatus.ts
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface JobStatus {
  id: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: number;
  data: any;
  returnvalue?: any;
  failedReason?: string;
}

export function useJobStatus(jobId: string | null) {
  const [status, setStatus] = useState<JobStatus | null>(null);

  // Query para buscar status
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch job');
      return res.json();
    },
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Se job ainda está rodando, poll a cada 2s
      if (data?.data?.state === 'active' || data?.data?.state === 'waiting') {
        return 2000;
      }
      // Se completou/falhou, para de polling
      return false;
    }
  });

  // Listener SSE para updates em tempo real
  useEffect(() => {
    if (!jobId) return;

    const handleJobUpdate = (event: MessageEvent) => {
      const payload = JSON.parse(event.data);

      if (payload.type === 'job-completed' && payload.data.jobId === jobId) {
        // Job completou, refetch status
        refetch();
      }

      if (payload.type === 'job-failed' && payload.data.jobId === jobId) {
        // Job falhou, refetch status
        refetch();
      }

      if (payload.type === 'job-progress' && payload.data.jobId === jobId) {
        // Atualiza progresso
        setStatus(prev => prev ? { ...prev, progress: payload.data.progress } : null);
      }
    };

    eventSource.addEventListener('job-completed', handleJobUpdate);
    eventSource.addEventListener('job-failed', handleJobUpdate);
    eventSource.addEventListener('job-progress', handleJobUpdate);

    return () => {
      eventSource.removeEventListener('job-completed', handleJobUpdate);
      eventSource.removeEventListener('job-failed', handleJobUpdate);
      eventSource.removeEventListener('job-progress', handleJobUpdate);
    };
  }, [jobId, refetch]);

  useEffect(() => {
    if (data?.data) {
      setStatus(data.data);
    }
  }, [data]);

  return {
    status,
    isLoading,
    error,
    refetch
  };
}
```

---

**Fim do Plano de Aceite**
