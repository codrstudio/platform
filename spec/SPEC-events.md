# SPEC-events.md

## Especificação: Sistema de Eventos

### Escopo
Este documento define os requisitos do sistema de eventos da plataforma, incluindo notificações, tasks, SSE, Redis e integração com n8n.

---

## 1. Conceitos Fundamentais

### Definições

**SPEC-EV-CO-001:** Sistema de Eventos gerencia comunicação assíncrona Backend → Frontend

**SPEC-EV-CO-002:** Sistema DEVE suportar dois tipos de eventos: Notifications e Tasks

**SPEC-EV-CO-003:** Notifications informam o usuário (passivo)

**SPEC-EV-CO-004:** Tasks requerem ação do usuário (ativo, interativo, tem status)

### Notifications

**SPEC-EV-CO-005:** Notification é um evento informativo unidirecional

**SPEC-EV-CO-006:** Notification NÃO requer ação do usuário

**SPEC-EV-CO-007:** Notification PODE ser marcada como visualizada

**SPEC-EV-CO-008:** Exemplos: "Processamento iniciado", "Email enviado", "Erro no log"

### Tasks

**SPEC-EV-CO-009:** Task é um evento que requer ação do usuário

**SPEC-EV-CO-010:** Task DEVE ter status (pending, completed, cancelled, etc)

**SPEC-EV-CO-011:** Task DEVE permitir interação (aprovar, rejeitar, responder, etc)

**SPEC-EV-CO-012:** Task PODE conter formulários embutidos

**SPEC-EV-CO-013:** Exemplos: "Aprovar email", "Fornecer informação X", "Decidir retry ou ignorar erro"

---

## 2. Arquitetura do Sistema

### Fluxo Geral

**SPEC-EV-AR-001:** Backbone publica eventos → Redis → Backend → Frontend

**SPEC-EV-AR-002:** Frontend recebe evento → Invalida query → Busca dados via JQEL

**SPEC-EV-AR-003:** Dados completos NÃO DEVEM trafegar pelo canal de eventos

**SPEC-EV-AR-004:** Eventos DEVEM conter apenas metadados mínimos

### Componentes

**SPEC-EV-AR-005:** Sistema DEVE usar Redis como message broker

**SPEC-EV-AR-006:** Sistema DEVE usar Redis Pub/Sub para entrega imediata

**SPEC-EV-AR-007:** Sistema DEVE usar Redis Streams para buffer de eventos

**SPEC-EV-AR-008:** Sistema DEVE usar Server-Sent Events (SSE) para entrega ao Frontend

**SPEC-EV-AR-009:** Sistema DEVE usar n8n para publicação de eventos

---

## 3. Redis - Pub/Sub

### Propósito

**SPEC-EV-PS-001:** Redis Pub/Sub DEVE ser usado para entrega em tempo real

**SPEC-EV-PS-002:** Pub/Sub DEVE entregar eventos para usuários online

**SPEC-EV-PS-003:** Pub/Sub NÃO persiste mensagens

**SPEC-EV-PS-004:** Se nenhum subscriber está conectado, mensagem se perde (esperado)

### Canais

**SPEC-EV-PS-005:** DEVE existir canal `platform:events` para eventos globais

**SPEC-EV-PS-006:** PODE existir canais por usuário: `platform:events:user:<userId>`

**SPEC-EV-PS-007:** PODE existir canais por tipo: `platform:notifications`, `platform:tasks`

**SPEC-EV-PS-008:** Backend DEVE se inscrever nos canais apropriados

### Publicação

**SPEC-EV-PS-009:** Backbone DEVE publicar eventos no Redis Pub/Sub

**SPEC-EV-PS-010:** Mensagem DEVE ser JSON válido

**SPEC-EV-PS-011:** Publicação DEVE ser assíncrona (não bloquear workflow)

**SPEC-EV-PS-012:** Erro na publicação NÃO DEVE interromper workflow

---

## 4. Redis - Streams

### Propósito

**SPEC-EV-ST-001:** Redis Streams DEVE servir como buffer de eventos

**SPEC-EV-ST-002:** Streams DEVE armazenar eventos para usuários offline

**SPEC-EV-ST-003:** Streams DEVE permitir recuperação de eventos perdidos

**SPEC-EV-ST-004:** Streams complementa Pub/Sub, não substitui

### Configuração

**SPEC-EV-ST-005:** Stream DEVE ter nome `events:<userId>` para cada usuário

**SPEC-EV-ST-006:** Stream DEVE manter últimas 1000 mensagens OU 24 horas (o que vier primeiro)

**SPEC-EV-ST-007:** Mensagens mais antigas DEVEM ser automaticamente removidas

**SPEC-EV-ST-008:** Configuração DEVE usar `MAXLEN ~ 1000` (aproximado para performance)

### Armazenamento

**SPEC-EV-ST-009:** Backbone DEVE adicionar eventos ao Stream via `XADD`

**SPEC-EV-ST-010:** Evento DEVE incluir todos os metadados necessários

**SPEC-EV-ST-011:** Stream DEVE ser criado automaticamente se não existir

**SPEC-EV-ST-012:** Cada evento DEVE ter ID único gerado pelo Redis

### Recuperação

**SPEC-EV-ST-013:** Frontend PODE consultar Stream ao reconectar

**SPEC-EV-ST-014:** Consulta DEVE usar timestamp do último evento recebido

**SPEC-EV-ST-015:** Consulta DEVE ser via JQEL (schema `system` ou `backend`)

**SPEC-EV-ST-016:** Eventos recuperados DEVEM ser processados como eventos novos

---

## 5. Server-Sent Events (SSE)

### Protocolo

**SPEC-EV-SSE-001:** Frontend DEVE se conectar via SSE para receber eventos

**SPEC-EV-SSE-002:** SSE usa HTTP GET com conexão persistente

**SPEC-EV-SSE-003:** SSE é unidirecional (servidor → cliente)

**SPEC-EV-SSE-004:** SSE reconecta automaticamente se conexão cair

### Rota de Conexão

**SPEC-EV-SSE-005:** Frontend DEVE conectar em `GET /api/events/stream`

**SPEC-EV-SSE-006:** Conexão DEVE incluir autenticação (JWT)

**SPEC-EV-SSE-007:** JWT PODE estar em header `Authorization`, query param ou cookie

**SPEC-EV-SSE-008:** Backend DEVE validar JWT antes de aceitar conexão

**SPEC-EV-SSE-009:** Backend DEVE identificar `userId` do JWT

**SPEC-EV-SSE-010:** Backend DEVE rejeitar conexão se JWT inválido (HTTP 401)

### Headers

**SPEC-EV-SSE-011:** Response DEVE ter header `Content-Type: text/event-stream`

**SPEC-EV-SSE-012:** Response DEVE ter header `Cache-Control: no-cache`

**SPEC-EV-SSE-013:** Response DEVE ter header `Connection: keep-alive`

**SPEC-EV-SSE-014:** Response PODE ter header `X-Accel-Buffering: no` (para nginx)

### Gerenciamento de Conexões

**SPEC-EV-SSE-015:** Backend DEVE manter Map de conexões: `userId → WebSocket/Response`

**SPEC-EV-SSE-016:** Uma conexão por usuário DEVE ser suficiente

**SPEC-EV-SSE-017:** Múltiplas abas PODEM compartilhar conexão via BroadcastChannel

**SPEC-EV-SSE-018:** Backend DEVE remover conexão ao fechar (evento `close`)

**SPEC-EV-SSE-019:** Backend DEVE enviar heartbeat periódico (ex: a cada 30s)

### Envio de Eventos

**SPEC-EV-SSE-020:** Backend recebe evento do Redis → Identifica usuário → Envia via SSE

**SPEC-EV-SSE-021:** Formato SSE: `data: <json>\n\n`

**SPEC-EV-SSE-022:** Backend DEVE verificar se usuário está conectado

**SPEC-EV-SSE-023:** Se usuário offline, evento fica apenas no Stream

**SPEC-EV-SSE-024:** Envio DEVE ser assíncrono (não bloquear)

### Reconexão

**SPEC-EV-SSE-025:** Navegador reconecta automaticamente em 3-5 segundos

**SPEC-EV-SSE-026:** Frontend PODE implementar lógica customizada de reconexão

**SPEC-EV-SSE-027:** Ao reconectar, Frontend DEVE buscar eventos perdidos via JQEL

**SPEC-EV-SSE-028:** Frontend DEVE armazenar timestamp do último evento recebido

---

## 6. Payload de Eventos

### Estrutura Mínima

**SPEC-EV-PL-001:** Evento DEVE ser JSON válido

**SPEC-EV-PL-002:** Evento DEVE incluir campo `type` (string)

**SPEC-EV-PL-003:** Evento DEVE incluir campo `id` (string, único)

**SPEC-EV-PL-004:** Evento DEVE incluir campo `userId` (string) OU `userIds` (array)

**SPEC-EV-PL-005:** Evento DEVE incluir campo `timestamp` (ISO 8601 string)

**SPEC-EV-PL-006:** Evento PODE incluir campo `category` (string)

**SPEC-EV-PL-007:** Evento PODE incluir campo `priority` (string: low, normal, high, urgent)

**SPEC-EV-PL-008:** Evento PODE incluir outros metadados relevantes

### Restrições

**SPEC-EV-PL-009:** Evento NÃO DEVE conter dados completos

**SPEC-EV-PL-010:** Evento DEVE conter apenas referência aos dados (ID)

**SPEC-EV-PL-011:** Payload DEVE ser pequeno (< 1KB recomendado)

**SPEC-EV-PL-012:** Dados completos DEVEM ser buscados via JQEL

### Tipos de Eventos

**SPEC-EV-PL-013:** `type` DEVE ser um dos valores: `notification`, `task`

**SPEC-EV-PL-014:** Outros tipos PODEM ser adicionados no futuro

**SPEC-EV-PL-015:** Frontend DEVE ignorar tipos desconhecidos (forward compatibility)

### Exemplo de Payload

**SPEC-EV-PL-016:** Formato de notification:
```json
{
  "type": "notification",
  "id": "notif_12345",
  "userId": "user_123",
  "category": "system",
  "priority": "normal",
  "timestamp": "2025-11-01T10:30:00Z"
}
```

**SPEC-EV-PL-017:** Formato de task:
```json
{
  "type": "task",
  "id": "task_12345",
  "userId": "user_123",
  "category": "email_approval",
  "priority": "high",
  "timestamp": "2025-11-01T10:30:00Z"
}
```

---

## 7. Integração com n8n (Backbone)

### Publicação Direta no Redis

**SPEC-EV-N8-001:** O Backbone (n8n) DEVE publicar eventos **diretamente no Redis**.

**SPEC-EV-N8-002:** A publicação DEVE ser feita usando a lógica de **Pub/Sub** e **Stream** simultaneamente.

**SPEC-EV-N8-003:** O Backbone DEVE validar o payload antes de publicar.

**SPEC-EV-N8-004:** A publicação DEVE ser assíncrona (não bloquear o workflow).

### Conexão com Redis

**SPEC-EV-N8-005:** O n8n DEVE usar credenciais Redis do `.env` do n8n.

**SPEC-EV-N8-006:** O n8n DEVE reusar conexão Redis (pool).

**SPEC-EV-N8-007:** O n8n DEVE ter timeout configurável (padrão: 5s).

**SPEC-EV-N8-008:** Erro de conexão DEVE ser logado.

---

## 8. Processamento no Frontend

### Recebimento de Evento

**SPEC-EV-FR-001:** Frontend DEVE usar o evento para **invalidar queries** no TanStack Query.

**SPEC-EV-FR-002:** Frontend DEVE buscar dados completos via JQEL após a invalidação.

**SPEC-EV-FR-003:** Frontend DEVE exibir notificação visual ao receber evento.

### Recuperação de Eventos Perdidos

**SPEC-EV-FR-004:** Ao reconectar, Frontend DEVE buscar eventos perdidos via JQEL.

**SPEC-EV-FR-005:** A busca DEVE usar o timestamp do último evento recebido.

**SPEC-EV-FR-006:** Eventos recuperados DEVEM ser processados como eventos novos.

---

*Esta especificação detalha o sistema de eventos. Integração com outros canais em SPEC-channels.md.*
