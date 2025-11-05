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

### n8n como Producer via Nodo BullMQ (RECOMENDADO)

**SPEC-Q-N8N-001:** n8n DEVE usar nodo BullMQ para adicionar jobs

**SPEC-Q-N8N-002:** Nodo BullMQ: https://github.com/minhlucvan/n8n-nodes-bullmq

**SPEC-Q-N8N-003:** n8n DEVE se conectar diretamente ao Redis (mesma instância do backend)

**SPEC-Q-N8N-004:** Workflow n8n exemplo:
```
1. Trigger (webhook, schedule, etc)
2. BullMQ - Add Job node
   - Queue: file-processing
   - Data: { fileId, fileUrl, operation }
   - Options: { priority, attempts, backoff }
3. Recebe jobId do nodo
4. (Opcional) BullMQ - Listen node para eventos
```

**SPEC-Q-N8N-005:** Nodo BullMQ oferece operações:
- Add Job: Adicionar job à fila
- Get Job: Consultar status de job
- Listen: Escutar eventos (completed, failed, progress)

### n8n como Producer via HTTP API (Fallback)

**SPEC-Q-N8N-006:** n8n PODE adicionar jobs via HTTP POST (fallback)

**SPEC-Q-N8N-007:** Endpoint: `POST /api/jobs/:queueName`

**SPEC-Q-N8N-008:** n8n DEVE incluir JWT no header Authorization

### Workers chamam n8n

**SPEC-Q-N8N-009:** Workers PODEM chamar webhooks n8n para lógica de negócio

**SPEC-Q-N8N-010:** Worker DEVE fazer POST para webhook n8n com dados do job

**SPEC-Q-N8N-011:** n8n processa lógica e retorna resultado

**SPEC-Q-N8N-012:** Worker armazena resultado no job

**SPEC-Q-N8N-013:** Fluxo recomendado: n8n como producer (SPEC-Q-N8N-001 a 005)

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

*Esta especificação define o sistema de filas. Para eventos em tempo real, ver SPEC-events.md. Para integração completa com n8n, consultar documentação de workflows.*
