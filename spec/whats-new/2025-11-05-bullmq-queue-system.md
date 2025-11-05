# What's New: Sistema de Filas com BullMQ

**Data**: 2025-11-05
**Versão**: 1.0.0
**Tipo**: Nova Funcionalidade
**Impacto**: Infraestrutura, Backend, Integração n8n

---

## 📋 Resumo

A plataforma agora suporta **processamento assíncrono de tarefas** usando BullMQ como sistema de filas. Esta adição complementa o sistema existente de eventos em tempo real (SSE) e viabiliza casos de uso que requerem persistência, retry automático e agendamento.

---

## ✨ Novidades

### 1. Sistema de Filas BullMQ

**O que é**: Sistema de mensageria assíncrona baseado em Redis para processamento de tarefas em background.

**Benefícios**:
- ✅ **Persistência**: Jobs não são perdidos, mesmo com restart do servidor
- ✅ **Retry Automático**: Falhas temporárias são reprocessadas automaticamente
- ✅ **Priorização**: Jobs críticos processados primeiro
- ✅ **Agendamento**: Suporte a delayed jobs e cron jobs
- ✅ **Monitoramento**: UI visual (BullBoard) para acompanhar status

### 2. Filas Obrigatórias

A plataforma define 4 filas padrão:

| Fila | Uso | Retry | Concorrência |
|------|-----|-------|--------------|
| `file-processing` | Upload e processamento de arquivos | 3x (2s backoff) | 5 jobs |
| `notifications` | Envio de emails e notificações | 5x (1s backoff) | 10 jobs |
| `external-api` | Integração com APIs externas | 10x (5s backoff) | 3 jobs |
| `scheduled` | Tarefas agendadas (cron) | Configurável | 2 jobs |

### 3. Integração com n8n (⭐ RECOMENDADO)

**Nodo BullMQ oficial**: https://github.com/minhlucvan/n8n-nodes-bullmq

n8n agora pode adicionar jobs **diretamente ao Redis** via nodo BullMQ:

```
n8n → BullMQ Node → Redis → Worker processa
```

**Vantagens sobre HTTP API**:
- 🚀 Latência: ~5-10ms (vs ~50-100ms via HTTP)
- 🎯 Features completas: 100% das funcionalidades BullMQ
- 👁️ Monitoramento nativo dentro do n8n
- 🛠️ Interface visual para configurar jobs

### 4. BullBoard UI

Interface web para monitoramento de filas:

- **Acesso**: `/admin/queues` (autenticação obrigatória)
- **Recursos**:
  - Visualizar jobs por status (waiting, active, completed, failed)
  - Retry manual de jobs falhados
  - Pausar/resumir filas
  - Ver logs e stack traces
  - Métricas de performance

### 5. API de Jobs

**Adicionar Job**:
```http
POST /api/jobs/file-processing
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "name": "compress-image",
  "data": {
    "fileId": "file123",
    "fileUrl": "https://...",
    "operation": "compress"
  },
  "options": {
    "priority": 7,
    "attempts": 3
  }
}
```

**Consultar Status**:
```http
GET /api/jobs/{jobId}
Authorization: Bearer <jwt>
```

---

## 📚 Especificações Atualizadas

### Novas Especificações

#### SPEC-queues.md (NOVO)
Especificação completa do sistema de filas com 10 seções:
1. Conceitos Fundamentais
2. Arquitetura de Filas
3. Jobs (criação, status, progresso)
4. Retry e Backoff
5. Priorização
6. Agendamento (delayed e cron)
7. Monitoramento (BullBoard)
8. **Integração com n8n** (3 opções)
9. Segurança
10. Performance

### Especificações Modificadas

#### SPEC-architecture.md
**Seção 2 - Infraestrutura**:
- **SPEC-A-S-022** (NOVO): Plataforma DEVE usar BullMQ
- **SPEC-A-S-023** (NOVO): BullMQ DEVE usar mesma infraestrutura Redis

**Seção 3 - Sistema de Filas (NOVA)**:
- 14 novos requisitos (SPEC-A-Q-001 a SPEC-A-Q-014)
- Definição de workers, retenção, monitoramento e integração n8n

**Renumeração**: Seções 3-10 renumeradas para 4-11

#### SPEC-events.md
**Seção 9 - Eventos de Filas (NOVA)**:
- 11 novos requisitos (SPEC-EV-QUEUE-001 a SPEC-EV-QUEUE-011)
- Definição de eventos de jobs (completed, failed, progress)
- Formato de payload de eventos
- Integração com SSE

#### SPEC-data-access.md
**Seção 5.3 - Invalidação por Jobs (NOVA)**:
- 4 novos requisitos (SPEC-DA-JOB-001 a SPEC-DA-JOB-004)
- Invalidação de cache quando jobs completam
- Exemplo de fluxo Worker → SSE → Frontend

#### SPEC-error-handling.md
**Seção 2.4 - Erros de Filas (NOVA)**:
- 4 novos tipos de erro (SPEC-ERR-QUEUE-001 a SPEC-ERR-QUEUE-004)
- Tratamento de timeout, falhas múltiplas, dependências e validação

**Seção 6.2 - Retry para Jobs (NOVA)**:
- 7 novos requisitos (SPEC-ERR-JOB-RETRY-001 a SPEC-ERR-JOB-RETRY-007)
- Estratégias de retry específicas para jobs

---

## 🔄 Casos de Uso

### Antes (sem filas)
❌ Upload de arquivo grande travava o navegador
❌ Envio de 1000 emails bloqueava API
❌ Falha em API externa perdia dados
❌ Sem agendamento de tarefas recorrentes

### Agora (com filas)
✅ Upload retorna imediatamente, processamento em background
✅ Emails enfileirados, enviados gradualmente
✅ Retry automático em caso de falha
✅ Cron jobs para limpeza, backups, relatórios

### Exemplos Práticos

**1. Processar Upload de Arquivo**
```typescript
// Frontend: adiciona job
const { jobId } = await createJob('file-processing', {
  fileId: 'img123',
  fileUrl: 'https://storage/img123.jpg',
  operation: 'thumbnail'
});

// Frontend: monitora via SSE
eventSource.addEventListener('job-completed', (event) => {
  if (event.data.jobId === jobId) {
    // Atualiza UI com thumbnail gerado
  }
});
```

**2. Workflow n8n**
```
1. Webhook recebe upload
2. BullMQ - Add Job node
   └─ Queue: file-processing
   └─ Data: { fileId, fileUrl }
3. Worker processa arquivo
4. Worker chama webhook n8n
5. n8n envia notificação ao usuário
```

**3. Cron Job (Limpeza Diária)**
```typescript
await queue.add('cleanup-temp', {}, {
  repeat: {
    cron: '0 2 * * *'  // Todo dia às 2am
  }
});
```

---

## 🚀 Migração e Implementação

### Para Desenvolvedores

**Instalação**:
```bash
npm install bullmq @bull-board/api @bull-board/express
```

**Estrutura de Pastas**:
```
src/backend/
├── queues/
│   └── index.ts          # Definição das filas
├── workers/
│   ├── fileProcessing.worker.ts
│   ├── notifications.worker.ts
│   └── externalApi.worker.ts
└── routes/
    └── jobs.routes.ts    # API de jobs
```

### Para Administradores n8n

**1. Instalar nodo BullMQ**:
```bash
npm install n8n-nodes-bullmq
```

**2. Configurar credenciais Redis**:
- Host: (mesmo do backend)
- Port: 6379
- Database: 0

**3. Criar workflow**:
- Adicionar nodo "BullMQ - Add Job"
- Selecionar fila
- Configurar dados e opções

### Para Operações

**Monitoramento**:
- Acessar `/admin/queues` (credenciais de admin)
- Verificar status das filas
- Analisar jobs falhados
- Fazer retry manual se necessário

**Alertas Recomendados**:
- Fila > 1000 jobs waiting
- Taxa de erro > 5% em 5 minutos
- Worker inativo por > 5 minutos

---

## 📊 Performance e Métricas

### Targets

| Métrica | Valor | Status |
|---------|-------|--------|
| Throughput | 1000 jobs/min | ✅ Suportado |
| Latência (adicionar job) | < 100ms | ✅ ~10-50ms |
| Latência (processar job simples) | < 500ms (P95) | ✅ Configurável |
| Uptime | 99.9% | ✅ Retry automático |

### Retenção

- **Jobs completados**: Últimos 100 (configurável)
- **Jobs falhados**: Últimos 500 (configurável)
- **Limpeza automática**: Diária

---

## 🔗 Recursos Adicionais

### Documentação

- **SPEC-queues.md**: Especificação completa
- **SPEC-architecture.md**: Seção 3 - Sistema de Filas
- **SPEC-events.md**: Seção 9 - Eventos de Filas
- **bullmq-messaging.md**: Decisão aprovada com detalhes técnicos

### Links Externos

- **BullMQ Docs**: https://docs.bullmq.io/
- **Nodo BullMQ para n8n**: https://github.com/minhlucvan/n8n-nodes-bullmq
- **BullBoard**: https://github.com/felixmosh/bull-board

### Exemplos de Código

Veja apêndices em `spec/pending-decisions/bullmq-messaging.md`:
- Worker completo
- API route completa
- Frontend hook

---

## ❓ FAQ

**P: Filas substituem SSE?**
R: Não. Filas processam tarefas assíncronas. SSE envia eventos em tempo real. São complementares.

**P: Preciso usar HTTP API ou nodo BullMQ?**
R: **Recomendamos nodo BullMQ** (melhor performance, mais features). HTTP API é fallback.

**P: Como monitorar jobs em produção?**
R: Use BullBoard UI em `/admin/queues` ou exporte métricas para Grafana/Prometheus.

**P: Posso criar novas filas?**
R: Sim. Siga naming convention kebab-case e documente no código.

**P: Jobs sobrevivem a restart?**
R: Sim. Jobs são persistidos no Redis e retomados automaticamente.

---

## 🎯 Próximos Passos

1. ✅ Especificações aprovadas e atualizadas
2. 🔜 Implementar em Prototype-2 (Phase 1-2)
3. 🔜 Criar workflows n8n de exemplo
4. 🔜 Documentar padrões e best practices
5. 🔜 Treinar equipe

---

**Dúvidas?** Consulte as especificações ou abra uma issue no repositório.
