# SPEC-channels.md

## Especificação: Canais de Comunicação

### Escopo
Este documento define os canais de comunicação entre Frontend e Backend, seus contratos, protocolos e requisitos de segurança.

---

## 1. Definição de Canais

### Conceito

**SPEC-CH-D-001:** Canais são os meios oficiais de comunicação entre Frontend e Backend

**SPEC-CH-D-002:** A plataforma DEVE ter exatamente 4 canais oficiais

**SPEC-CH-D-003:** Os canais DEVEM ser: Autenticação, Dados, Agentes e Eventos

**SPEC-CH-D-004:** Nenhum canal adicional PODE ser criado sem análise e especificação prévia

**SPEC-CH-D-005:** Frontend NÃO DEVE comunicar com Backend por meios não especificados

### Análise para Novos Canais

**SPEC-CH-D-006:** Proposta de novo canal DEVE incluir justificativa técnica

**SPEC-CH-D-007:** Proposta de novo canal DEVE demonstrar que canais existentes são insuficientes

**SPEC-CH-D-008:** Proposta de novo canal DEVE especificar protocolo, rota e responsabilidades

**SPEC-CH-D-009:** Novo canal DEVE ser aprovado antes de implementação

---

## 2. Canal de Autenticação

### Definição

**SPEC-CH-A-001:** Canal de Autenticação gerencia sessões e permissões

**SPEC-CH-A-002:** Canal de Autenticação usa protocolo HTTP

**SPEC-CH-A-003:** Canal de Autenticação usa método POST

**SPEC-CH-A-004:** Canal de Autenticação usa prefixo `/api/1/auth/*`

### Responsabilidade

**SPEC-CH-A-005:** Autenticação DEVE ser processada pelo Backbone (n8n)

**SPEC-CH-A-006:** Backend DEVE atuar como proxy para rotas de autenticação

**SPEC-CH-A-007:** Backend PODE executar validações básicas antes de repassar ao Backbone

### Rotas Obrigatórias

**SPEC-CH-A-008:** DEVE existir rota `POST /api/1/auth/login`

**SPEC-CH-A-009:** DEVE existir rota `POST /api/1/auth/refresh`

**SPEC-CH-A-010:** DEVE existir rota `POST /api/1/auth/logout`

**SPEC-CH-A-011:** DEVE existir rota `POST /api/1/auth/logout-all`

**SPEC-CH-A-012:** DEVE existir rota `POST /api/1/auth/authorize`

### Rota: /api/1/auth/login

**SPEC-CH-A-013:** Entrada DEVE aceitar: `realm`, `schema`, `username`, `password`

**SPEC-CH-A-014:** Saída DEVE retornar: `code`, `access_token`, `refresh_token`, `token_type`, `expires_in`, `payload`

**SPEC-CH-A-015:** `access_token` DEVE ser JWT

**SPEC-CH-A-016:** `refresh_token` DEVE permitir renovação de sessão

**SPEC-CH-A-017:** Login com credenciais inválidas DEVE retornar erro 401

### Rota: /api/1/auth/refresh

**SPEC-CH-A-018:** Entrada DEVE aceitar `refresh_token` no JSON ou cookie

**SPEC-CH-A-019:** Saída DEVE retornar novo JWT e rotação do refresh token

**SPEC-CH-A-020:** DEVE detectar reuso de refresh token

**SPEC-CH-A-021:** Reuso detectado DEVE revogar família de tokens

**SPEC-CH-A-022:** Refresh token inválido DEVE retornar erro 401

### Rota: /api/1/auth/logout

**SPEC-CH-A-023:** Entrada DEVE aceitar `refresh_token` no JSON ou cookie

**SPEC-CH-A-024:** DEVE revogar o refresh token específico

**SPEC-CH-A-025:** Saída DEVE retornar `code` e mensagem de sucesso/erro

### Rota: /api/1/auth/logout-all

**SPEC-CH-A-026:** Entrada DEVE aceitar `access_token` no JSON, header `Authorization` ou cookie

**SPEC-CH-A-027:** DEVE revogar todas as sessões do usuário autenticado

**SPEC-CH-A-028:** Saída DEVE retornar `code` e mensagem de sucesso/erro

### Rota: /api/1/auth/authorize

**SPEC-CH-A-029:** Entrada DEVE aceitar `access_token` via body/header/cookie

**SPEC-CH-A-030:** Entrada PODE aceitar `schema` + `permission` OU query JQEL

**SPEC-CH-A-031:** `permission` DEVE seguir formato `{operation}.{entity}[.{action}]`

**SPEC-CH-A-032:** Exemplos: `read.users`, `write.orders.approve`, `delete.posts`

**SPEC-CH-A-033:** DEVE validar JWT

**SPEC-CH-A-034:** DEVE checar permissão específica

**SPEC-CH-A-035:** Resultado DEVE ser cacheado em Redis

**SPEC-CH-A-036:** Saída DEVE retornar `code`, payload do usuário e decisão de permissão

**SPEC-CH-A-037:** Token inválido DEVE retornar erro 401

**SPEC-CH-A-038:** Permissão negada DEVE retornar erro 403

---

## 3. Canal de Dados

### Definição

**SPEC-CH-DA-001:** Canal de Dados gerencia queries e mutations via JQEL

**SPEC-CH-DA-002:** Canal de Dados usa protocolo HTTP

**SPEC-CH-DA-003:** Canal de Dados usa método POST

**SPEC-CH-DA-004:** Canal de Dados usa rota `/api/jqel`

### Responsabilidade

**SPEC-CH-DA-005:** Backend DEVE receber queries JQEL do Frontend

**SPEC-CH-DA-006:** Backend DEVE repassar queries ao Backbone (n8n)

**SPEC-CH-DA-007:** Backend PODE validar estrutura da query antes de repassar

**SPEC-CH-DA-008:** Backbone DEVE processar queries e retornar resultados

### Requisitos de Entrada

**SPEC-CH-DA-009:** Entrada DEVE ser JSON válido

**SPEC-CH-DA-010:** Entrada DEVE seguir especificação JQEL

**SPEC-CH-DA-011:** Entrada DEVE incluir `schema`

**SPEC-CH-DA-012:** Entrada DEVE incluir `operation` (read, write, delete, etc)

**SPEC-CH-DA-013:** Entrada PODE incluir filtros, paginação, ordenação

### Requisitos de Saída

**SPEC-CH-DA-014:** Saída DEVE ser JSON válido

**SPEC-CH-DA-015:** Saída DEVE incluir `code` indicando sucesso/erro

**SPEC-CH-DA-016:** Saída DEVE incluir `data` com resultado da query

**SPEC-CH-DA-017:** Erro DEVE incluir `message` descritivo

### Schemas Reservados

**SPEC-CH-DA-018:** Schema `platform` DEVE ser processado pelo Backbone

**SPEC-CH-DA-019:** Schema `backend` DEVE ser processado pelo Backend

**SPEC-CH-DA-020:** Schema `system` DEVE ser processado conforme configuração

**SPEC-CH-DA-021:** Outros schemas DEVEM ser considerados schemas da aplicação

### Integração com TanStack Query

**SPEC-CH-DA-022:** Frontend DEVE encapsular JQEL via TanStack Query

**SPEC-CH-DA-023:** Queries JQEL DEVEM usar `useQuery` do TanStack Query

**SPEC-CH-DA-024:** Mutations JQEL DEVEM usar `useMutation` do TanStack Query

**SPEC-CH-DA-025:** Cache DEVE ser gerenciado pelo TanStack Query

---

## 4. Canal de Agentes

### Definição

**SPEC-CH-AG-001:** Canal de Agentes permite invocar workflows externos (n8n)

**SPEC-CH-AG-002:** Canal de Agentes usa protocolo HTTP

**SPEC-CH-AG-003:** Canal de Agentes usa método GET

**SPEC-CH-AG-004:** Canal de Agentes usa rota `/api/agent/:provider/*`

### Responsabilidade

**SPEC-CH-AG-005:** Backend DEVE receber requisições de agentes

**SPEC-CH-AG-006:** Backend DEVE rotear para o provider especificado (ex: n8n)

**SPEC-CH-AG-007:** Backend DEVE adicionar autenticação necessária

**SPEC-CH-AG-008:** Provider DEVE processar e retornar resultado

### Requisitos

**SPEC-CH-AG-009:** `:provider` DEVE identificar o sistema externo (ex: `n8n`)

**SPEC-CH-AG-010:** Rota completa exemplo: `/api/agent/n8n/workflow-id`

**SPEC-CH-AG-011:** Backend DEVE validar que provider é permitido

**SPEC-CH-AG-012:** Backend DEVE adicionar headers de autenticação (`X-Platform-Key`)

**SPEC-CH-AG-013:** Timeout DEVE ser configurável por provider

**SPEC-CH-AG-014:** Erros do provider DEVEM ser repassados ao Frontend

---

## 5. Canal de Eventos

### Definição

**SPEC-CH-EV-001:** Canal de Eventos entrega notificações e tasks em tempo real

**SPEC-CH-EV-002:** Canal de Eventos usa Server-Sent Events (SSE)

**SPEC-CH-EV-003:** Canal de Eventos usa método GET para estabelecer conexão

**SPEC-CH-EV-004:** Canal de Eventos mantém conexão aberta Frontend ↔ Backend

### Responsabilidade

**SPEC-CH-EV-005:** Backbone DEVE publicar eventos no Redis

**SPEC-CH-EV-006:** Backend DEVE escutar eventos do Redis (Pub/Sub)

**SPEC-CH-EV-007:** Backend DEVE enviar eventos via SSE para Frontend

**SPEC-CH-EV-008:** Frontend DEVE invalidar queries TanStack Query ao receber eventos

**SPEC-CH-EV-009:** Frontend DEVE buscar dados completos via Canal de Dados (JQEL)

### Arquitetura com Redis

**SPEC-CH-EV-010:** Backbone DEVE publicar em Redis Pub/Sub para entrega imediata

**SPEC-CH-EV-011:** Backbone DEVE publicar em Redis Streams para buffer (24h)

**SPEC-CH-EV-012:** Backend DEVE se inscrever no Redis Pub/Sub

**SPEC-CH-EV-013:** Backend DEVE rotear eventos para usuários corretos via SSE

**SPEC-CH-EV-014:** Redis Streams DEVE manter últimas 1000 mensagens OU 24h (o que vier primeiro)

### Conexão SSE

**SPEC-CH-EV-015:** Frontend DEVE abrir conexão SSE com `GET /api/events/stream`

**SPEC-CH-EV-016:** Backend DEVE autenticar conexão SSE via JWT

**SPEC-CH-EV-017:** Backend DEVE identificar usuário via JWT

**SPEC-CH-EV-018:** Conexão DEVE permanecer aberta enquanto usuário estiver online

**SPEC-CH-EV-019:** Navegador DEVE reconectar automaticamente se conexão cair

**SPEC-CH-EV-020:** Backend DEVE limpar recursos ao fechar conexão

### Payload de Eventos

**SPEC-CH-EV-021:** Eventos DEVEM conter apenas metadados mínimos

**SPEC-CH-EV-022:** Evento DEVE incluir `type` (notification, task, etc)

**SPEC-CH-EV-023:** Evento DEVE incluir `id` único

**SPEC-CH-EV-024:** Evento DEVE incluir `userId` ou lista de usuários

**SPEC-CH-EV-025:** Evento PODE incluir `category` ou outros metadados

**SPEC-CH-EV-026:** Evento DEVE incluir `timestamp`

**SPEC-CH-EV-027:** Evento NÃO DEVE conter dados completos (apenas referência)

**SPEC-CH-EV-028:** Payload DEVE ser JSON válido

### Exemplo de Payload

**SPEC-CH-EV-029:** Formato de evento:
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

### Fluxo Completo

**SPEC-CH-EV-030:** Backbone (n8n) DEVE publicar evento diretamente no Redis (Pub/Sub + Stream)

**SPEC-CH-EV-031:** Backend recebe via Pub/Sub → Envia via SSE para usuário

**SPEC-CH-EV-032:** Frontend recebe evento → Invalida query TanStack Query

**SPEC-CH-EV-033:** Frontend busca dados completos via JQEL (Canal de Dados)

**SPEC-CH-EV-034:** Se usuário estava offline → Frontend busca eventos perdidos via JQEL ao reconectar

### Publicação de Eventos (Backbone → Redis)

**SPEC-CH-EV-035:** Backbone DEVE usar a lógica de publicação direta no Redis

**SPEC-CH-EV-036:** Backbone DEVE validar payload antes de publicar no Redis

**SPEC-CH-EV-037:** Publicação DEVE ser assíncrona (não bloquear workflow)

---

## 6. Segurança entre Plataforma e Backbone

### Autenticação Mútua

**SPEC-CH-S-001:** Comunicação entre Plataforma e Backbone DEVE ser autenticada

**SPEC-CH-S-002:** Autenticação DEVE usar shared secret

**SPEC-CH-S-003:** Shared secret DEVE ser configurado via `.env`

**SPEC-CH-S-004:** Shared secret DEVE ser o mesmo em Plataforma e Backbone

### Header de Autenticação

**SPEC-CH-S-005:** Requisições DEVEM incluir header `X-Platform-Key`

**SPEC-CH-S-006:** Valor do header DEVE ser o shared secret

**SPEC-CH-S-007:** Backend DEVE validar `X-Platform-Key` antes de processar

**SPEC-CH-S-008:** Backbone DEVE validar `X-Platform-Key` em webhooks

**SPEC-CH-S-009:** Requisição sem `X-Platform-Key` válido DEVE retornar 401 Unauthorized

### Configuração

**SPEC-CH-S-010:** `.env` da Plataforma DEVE incluir: `N8N_BASE_URL=https://n8n.example.com`

`N8N_SHARED_SECRET=secret_abc123`

**SPEC-CH-S-011:** `.env` do n8n DEVE incluir: `PLATFORM_BASE_URL=https://api.example.com`

`PLATFORM_SHARED_SECRET=secret_abc123`

**SPEC-CH-S-012:** Shared secret DEVE ter mínimo 32 caracteres

**SPEC-CH-S-013:** Shared secret DEVE ser alfanumérico aleatório

**SPEC-CH-S-014:** Shared secret NÃO DEVE ser versionado em Git

### Transporte

**SPEC-CH-S-015:** Toda comunicação DEVE usar HTTPS em produção

**SPEC-CH-S-016:** HTTP PODE ser usado apenas em desenvolvimento local

**SPEC-CH-S-017:** HTTPS criptografa headers, incluindo `X-Platform-Key`

**SPEC-CH-S-018:** Certificados SSL DEVEM ser válidos

---

## 7. Requisitos Gerais

### Formato de Resposta

**SPEC-CH-G-001:** Todas as respostas DEVEM ser JSON (exceto SSE)

**SPEC-CH-G-002:** Respostas DEVEM incluir campo `code` indicando status

**SPEC-CH-G-003:** Erros DEVEM incluir campo `message` descritivo

**SPEC-CH-G-004:** Erros PODEM incluir campo `details` com informações adicionais

### Status HTTP

**SPEC-CH-G-005:** Sucesso DEVE usar status 200 OK

**SPEC-CH-G-006:** Criação DEVE usar status 201 Created

**SPEC-CH-G-007:** Erro de autenticação DEVE usar status 401 Unauthorized

**SPEC-CH-G-008:** Erro de autorização DEVE usar status 403 Forbidden

**SPEC-CH-G-009:** Recurso não encontrado DEVE usar status 404 Not Found

**SPEC-CH-G-010:** Erro de validação DEVE usar status 400 Bad Request

**SPEC-CH-G-011:** Erro interno DEVE usar status 500 Internal Server Error

### Headers

**SPEC-CH-G-012:** Requisições DEVEM incluir `Content-Type: application/json`

**SPEC-CH-G-013:** Respostas DEVEM incluir `Content-Type: application/json`

**SPEC-CH-G-014:** SSE DEVE usar `Content-Type: text/event-stream`

**SPEC-CH-G-015:** CORS DEVE ser configurado apropriadamente em produção

### Timeout

**SPEC-CH-G-016:** Requisições DEVEM ter timeout configurável

**SPEC-CH-G-017:** Timeout padrão DEVE ser 30 segundos

**SPEC-CH-G-018:** Operações longas DEVEM usar timeout maior

**SPEC-CH-G-019:** Timeout excedido DEVE retornar erro apropriado

---

*Esta especificação define contratos dos canais de comunicação. Implementação de rotas, autenticação e eventos em detalhes nas especificações correspondentes.*
