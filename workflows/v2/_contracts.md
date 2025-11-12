# API Plugável - Contratos de Entrada/Saída

Este documento define os contratos de todas as funções API plugáveis (`fn_*`) que devem ser implementadas pelo cliente.

## Visão Geral

- **17 funções API** organizadas por domínio (auth, system, chat)
- Cada função tem contrato de entrada e saída bem definido
- Cliente implementa conforme sua tecnologia (MySQL, PostgreSQL, MongoDB, REST API, etc.)
- Platform workflows chamam essas funções via `Execute Workflow`

---

## 1. Autenticação (8 funções)

### 1.1 `fn_find_user`

**Propósito**: Buscar usuário e validar credenciais

**Input**:
```typescript
{
  id?: string,           // User ID (alternativa a username)
  username?: string,     // Email ou username
  email?: string,        // Email (alternativa a username)
  password?: string      // Opcional: se fornecido, valida senha
}
```

**Output**:
```typescript
{
  code: 200 | 404 | 500,
  message?: string,
  data?: {
    senha_hash: string,              // Hash bcrypt ($2a$ format)
    payload: {
      sub: string,                   // User ID
      iss: string,                   // Issuer (e.g., "platform")
      aud: string,                   // Audience (e.g., "client")
      tenant: number[],              // Tenant IDs para multi-tenancy
      roles: string[],               // Nome dos roles
      name: string,                  // Nome de exibição
      email: string,                 // Email
      [key: string]: any             // Campos customizados permitidos
    }
  }
}
```

**Chamado por**: `auth-login`, `auth-refresh`

**Implementação**:
- Query user database por `id`, `username`, ou `email`
- Retornar hash bcrypt em formato Node.js (`$2a$`, não `$2y$`)
- Construir payload JWT com claims obrigatórios
- Suportar multi-tenancy via array `tenant`

---

### 1.2 `fn_store_refresh_token`

**Propósito**: Persistir refresh token no banco

**Input**:
```typescript
{
  token_hash: string,      // Hash SHA-256 do refresh token
  family_id: string,       // UUID v4 para família de tokens
  user_id: string,         // User ID do JWT sub claim
  expires_at: string       // ISO 8601 datetime
}
```

**Output**:
```typescript
{
  code: 200 | 500,
  message?: string
}
```

**Chamado por**: `auth-login`, `auth-refresh`

**Implementação**:
- Upsert (insert or update) token record
- Usar `token_hash` como chave primária/única
- Definir `consumed_at = NULL` e `revoked = false` na criação
- Recomendar TTL de 7 dias

---

### 1.3 `fn_revoke_refresh_token`

**Propósito**: Invalidar um único refresh token

**Input**:
```typescript
{
  token_hash: string       // Hash SHA-256 do token a revogar
}
```

**Output**:
```typescript
{
  code: 200 | 404 | 500,
  message?: string
}
```

**Chamado por**: `auth-logout`

**Implementação**:
- Update token record: `SET revoked = true`
- Retornar 404 se token não encontrado
- Operação atômica recomendada

---

### 1.4 `fn_revoke_all_user_sessions`

**Propósito**: Invalidar todos os refresh tokens de um usuário

**Input**:
```typescript
{
  user_id: string          // User ID do JWT sub claim
}
```

**Output**:
```typescript
{
  code: 200 | 500,
  message?: string,
  count?: number           // Número de tokens revogados
}
```

**Chamado por**: `auth-logout-all`

**Implementação**:
- Bulk update: `SET revoked = true WHERE user_id = ?`
- Retornar count de linhas afetadas
- Operação atômica recomendada

---

### 1.5 `fn_get_refresh_token`

**Propósito**: Buscar metadata do refresh token por hash

**Input**:
```typescript
{
  token_hash: string       // Hash SHA-256 do token
}
```

**Output**:
```typescript
{
  code: 200 | 404 | 500,
  message?: string,
  data?: {
    id: string,                // ID interno do registro
    token_hash: string,
    family_id: string,
    user_id: string,
    consumed_at: string | null,  // ISO 8601 ou null
    expires_at: string,          // ISO 8601
    revoked: boolean
  }
}
```

**Chamado por**: `auth-refresh`

**Implementação**:
- Query por `token_hash` (match exato)
- Retornar 404 se não encontrado
- Incluir todos os campos para lógica de detecção de reuso

---

### 1.6 `fn_revoke_token_family`

**Propósito**: Invalidar todos os tokens de uma família (detecção de reuso)

**Input**:
```typescript
{
  family_id: string        // UUID v4 da família de tokens
}
```

**Output**:
```typescript
{
  code: 200 | 500,
  message?: string,
  count?: number           // Número de tokens revogados
}
```

**Chamado por**: `auth-refresh` (quando reuso detectado)

**Implementação**:
- Bulk update: `SET revoked = true WHERE family_id = ?`
- Retornar count de linhas afetadas
- **CRÍTICO**: Deve ser atômico (medida de segurança)

---

### 1.7 `fn_mark_token_consumed`

**Propósito**: Marcar refresh token como usado (consumido)

**Input**:
```typescript
{
  token_hash: string,            // Token a marcar
  consumed_at: string            // ISO 8601 datetime do consumo
}
```

**Output**:
```typescript
{
  code: 200 | 404 | 500,
  message?: string
}
```

**Chamado por**: `auth-refresh` (após emitir novos tokens)

**Implementação**:
- Update token: `SET consumed_at = ? WHERE token_hash = ?`
- Retornar 404 se token não encontrado
- Habilita detecção de reuso em tentativas subsequentes

---

### 1.8 `fn_get_user_permissions`

**Propósito**: Validar permissão do usuário para operação específica

**Input**:
```typescript
{
  user_roles: string[],          // Nomes dos roles do JWT
  requested_permission: string,  // Chave da permissão (e.g., "mutate.users.create")
  schema: string                 // Contexto do schema para permissão
}
```

**Output**:
```typescript
{
  code: 200 | 403 | 500,
  message?: string,
  data?: {
    isGranted: boolean,
    matched_permission?: string  // Permissão que concedeu acesso (pode ser wildcard)
  }
}
```

**Chamado por**: `authorize`

**Implementação**:
- Query mapeamento role-permission do banco (**NÃO hardcoded**)
- Suportar wildcards:
  - `*` concede todas permissões
  - `operation.*` concede todas entidades da operação
  - `operation.entity.*` concede todas ações da entidade
- Match user roles contra requirements de permissão
- Retornar `isGranted = true` se **QUALQUER** role tiver permissão
- Cache em Redis opcional (platform já faz)

---

## 2. Sistema (6 funções)

### 2.1 `fn_list_schemas`

**Propósito**: Listar todos os schemas JQEL disponíveis

**Input**:
```typescript
{}
```

**Output**:
```typescript
{
  code: 200 | 500,
  data: Array<{ name: string }>
}
```

**Chamado por**: `request` (query `select schema`)

**Implementação**:
- Retornar lista de nomes de schemas
- Sempre incluir "platform" e "backend"
- Adicionar schemas específicos do cliente (e.g., "cia", "sac")

---

### 2.2 `fn_list_entities`

**Propósito**: Listar entidades de um schema com metadata

**Input**:
```typescript
{
  schema: string           // Schema a introspectar
}
```

**Output**:
```typescript
{
  code: 200 | 404 | 500,
  data: Array<{
    name: string,                    // Nome da entidade
    schema: string,                  // Schema pai
    properties: {
      [field: string]: {
        type: "string" | "number" | "integer" | "boolean" | "array" | "object",
        description?: string
      }
    },
    required?: string[]              // Campos obrigatórios
  }>
}
```

**Chamado por**: `request` (query `select entity`)

**Implementação**:
- Para schemas de banco: introspectar tables/collections
- Para schemas de API: retornar metadata predefinida
- Converter tipos nativos para tipos JSON Schema
- Incluir descriptions se disponível

---

### 2.3 `fn_execute_jqel_query`

**Propósito**: Executar query JQEL contra banco do cliente

**Input**:
```typescript
{
  schema: string,
  operation: "select" | "mutate",
  entity: string,
  action?: string,                   // Para operações mutate
  values?: { [field: string]: any }, // Para operações mutate
  where?: {
    [field: string]: {
      eq?: any,
      ne?: any,
      gt?: any,
      gte?: any,
      lt?: any,
      lte?: any,
      in?: any[],
      like?: string,
      between?: [any, any]
    }
  },
  options?: {
    limit?: number,
    offset?: number,
    orderBy?: Array<{ field: string, direction: "ASC" | "DESC" }>
  }
}
```

**Output**:
```typescript
{
  code: 200 | 404 | 500,
  message?: string,
  data?: any[]
}
```

**Chamado por**: `request_database`

**Implementação** (MAIS COMPLEXA):
- Suportar múltiplos backends de banco
- Implementar operadores JQEL na linguagem de query nativa
- Fazer pagination e sorting
- Retornar erros padronizados (404 para not found, 500 para errors)
- **Para SQL**: usar queries parametrizadas (prevenir SQL injection)
- **Para NoSQL**: mapear JQEL para sintaxe de query nativa

**Opções de implementação**:
- Stored procedures (padrão atual)
- Bibliotecas ORM (TypeORM, Sequelize, Mongoose)
- Query builders (Knex, Prisma)
- Drivers diretos de banco
- Wrapper de REST API

---

### 2.4 `fn_audit_mutation`

**Propósito**: Registrar log de auditoria de mutações de dados

**Input**:
```typescript
{
  user: {                      // Payload JWT
    sub: string,
    email?: string,
    name?: string,
    [key: string]: any
  },
  payload: {                   // Query JQEL original
    schema: string,
    operation: "mutate",
    entity: string,
    action?: string,
    values?: any,
    where?: any
  },
  status: {                    // Resultado da query
    code: number,
    message?: string
  }
}
```

**Output**:
```typescript
{
  code: 200 | 500,
  warnings?: Array<{
    code: number,
    message: string
  }>
}
```

**Chamado por**: `request_database` (após mutações)

**Implementação**:
- Armazenar entrada de audit log (banco, arquivo, serviço externo)
- Incluir: timestamp, user info, operation details, result
- Retornar warnings (não errors) em caso de falha
- Platform continua execução mesmo se audit falhar
- **Opcional**: Pode ser desabilitado por cliente

---

### 2.5 `fn_query_datatable`

**Propósito**: Query n8n DataTable ou storage equivalente

**Input**:
```typescript
{
  table_name: string,
  filters?: {
    [field: string]: {
      eq?: any,
      ne?: any,
      gt?: any,
      lt?: any,
      in?: any[],
      like?: string
    }
  },
  limit?: number,
  offset?: number
}
```

**Output**:
```typescript
{
  code: 200 | 404 | 500,
  data: any[]
}
```

**Chamado por**: `request` (operações DataTable)

**Implementação**:
- Suportar operadores básicos de filtro
- Implementar pagination
- Retornar array vazio se sem resultados (NÃO error)
- Mapear nomes de tabela para storage real (DataTable, Redis, etc.)

---

### 2.6 `fn_introspect_database`

**Propósito**: Introspectar schema de banco (tables/columns)

**Input**:
```typescript
{
  schema: string,          // Nome do schema do banco
  database_type?: "mysql" | "postgresql" | "mssql" | "mongodb"
}
```

**Output**:
```typescript
{
  code: 200 | 404 | 500,
  data: Array<{
    name: string,                    // Nome da table/collection
    schema: string,
    properties: { [field: string]: { type: string } },
    required?: string[]
  }>
}
```

**Chamado por**: `request` (query `select entity` quando schema é database-backed)

**Implementação**:
- Query `INFORMATION_SCHEMA` para bancos SQL
- Query metadata de collection para bancos NoSQL
- Mapear tipos nativos para tipos JSON Schema
- Retornar array vazio se schema não encontrado (NÃO 404)

---

## 3. Chat (3 funções)

### 3.1 `fn_list_agents`

**Propósito**: Listar agentes IA disponíveis

**Input**:
```typescript
{}
```

**Output**:
```typescript
{
  object: "list",
  data: Array<{
    id: string,
    name: string,
    description: string,
    type: "agent",
    model: string,
    capabilities: string[],
    status: "active" | "inactive",
    enabled: boolean,
    title: string,
    icon: string,
    color: string,
    tags: string[],
    reasoningEffort: "low" | "medium" | "high" | "default",
    requiresAuth: boolean
  }>
}
```

**Chamado por**: `chat` (endpoint `GET /api/1/agents`)

**Implementação**:
- Query configuração de agentes do banco/config
- Retornar apenas agentes ativos
- Incluir metadata para renderização na UI (icon, color, tags)

---

### 3.2 `fn_list_models`

**Propósito**: Listar modelos LLM disponíveis (compatível com OpenAI)

**Input**:
```typescript
{}
```

**Output**:
```typescript
{
  object: "list",
  data: Array<{
    id: string,
    object: "model",
    created: number,            // Unix timestamp
    owned_by: string,
    permission: any[],          // Formato OpenAI
    root: string,
    parent: string | null
  }>
}
```

**Chamado por**: `chat` (endpoint `GET /api/1/models`)

**Implementação**:
- Retornar modelos configurados para este cliente
- Seguir formato da API OpenAI
- Pode mapear nomes internos de modelo para IDs externos

---

### 3.3 `fn_get_agent_config`

**Propósito**: Obter configuração do agente (system prompt, model, tools)

**Input**:
```typescript
{
  agent_id: string
}
```

**Output**:
```typescript
{
  code: 200 | 404 | 500,
  data?: {
    system_prompt: string,
    model: string,
    tools?: string[],
    temperature?: number,
    max_tokens?: number,
    [key: string]: any          // Config adicional do LLM
  }
}
```

**Chamado por**: `chat` (antes de invocar agente IA)

**Implementação**:
- Query configuração do agente por ID
- Retornar 404 se agente não encontrado
- Incluir system prompt com instruções específicas do cliente
- Especificar modelo a usar (gpt-4o, claude-sonnet-4, etc.)

---

## Resumo de Prioridades

### ALTA (Críticas para Auth):
1. `fn_find_user`
2. `fn_get_user_permissions`
3. `fn_store_refresh_token`
4. `fn_revoke_refresh_token`
5. `fn_get_refresh_token`
6. `fn_revoke_token_family`
7. `fn_mark_token_consumed`

### MÉDIA:
8. `fn_execute_jqel_query` (complexa mas essencial)
9. `fn_list_entities`
10. `fn_list_agents`
11. `fn_get_agent_config`
12. `fn_list_schemas`
13. `fn_introspect_database`

### BAIXA:
14. `fn_revoke_all_user_sessions`
15. `fn_query_datatable`
16. `fn_audit_mutation`
17. `fn_list_models`

---

## Notas de Implementação

### Padrão de Chamada

Os workflows platform chamam funções API usando `Execute Workflow`:

```javascript
// n8n Execute Workflow node
{
  "workflowId": "fn_find_user",
  "data": {
    "username": "user@example.com",
    "password": "secret"
  }
}
```

### Formato de Resposta

Todas as funções DEVEM retornar objeto JSON com estrutura consistente:

```typescript
{
  code: number,        // HTTP status code
  message?: string,    // Mensagem de erro/sucesso
  data?: any,          // Payload de resposta
  warnings?: any[]     // Warnings (não bloqueiam execução)
}
```

### Tratamento de Erros

- `200-299`: Sucesso
- `404`: Recurso não encontrado
- `403`: Acesso negado
- `500-599`: Erro interno

### Segurança

- **SEMPRE** usar queries parametrizadas (prevenir SQL injection)
- **NUNCA** expor detalhes internos em mensagens de erro
- **VALIDAR** todos os inputs antes de processar
- **AUDITAR** operações sensíveis (auth, mutations)

### Performance

- Implementar caching onde apropriado (Redis recomendado)
- Usar índices de banco para campos frequently queried
- Limitar tamanho de resultados (default: 100 registros)
- Considerar pagination para datasets grandes

---

## Benefícios da Arquitetura

✅ **Platform Workflows**: Genéricos, evoluem independente do cliente
✅ **Flexibilidade**: Cliente escolhe tecnologia (MySQL, PostgreSQL, MongoDB, etc.)
✅ **Segurança**: Lógica sensível (permissions, user lookup) fica sob controle do cliente
✅ **Manutenibilidade**: Melhorias no platform beneficiam todos os clientes
✅ **Testabilidade**: Platform pode ser testado com mocks, cliente testa suas implementações
