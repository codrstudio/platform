# Workflows v2 - API Plugável

Esta pasta contém a versão refatorada dos workflows n8n com separação entre **Platform Workflows** (genéricos) e **API Workflows** (específicos do cliente).

## Estrutura

```
v2/
├── api/                    # Funções API plugáveis (cliente implementa)
│   ├── auth/              # 8 funções de autenticação
│   ├── system/            # 6 funções de sistema
│   └── chat/              # 3 funções de chat
├── auth/                  # Workflows platform de autenticação
├── system/                # Workflows platform de sistema
├── channels/              # Workflows platform de eventos
├── _contracts.md          # Documentação completa dos contratos
└── README.md              # Este arquivo
```

## Conceito: Platform vs. API

### Platform Workflows (workflows/v2/{auth,system,channels})

- **Genéricos**: Funcionam para qualquer cliente sem modificação
- **Evoluem com a plataforma**: Bugs corrigidos beneficiam todos os clientes
- **Chamam funções API**: Usam `Execute Workflow` para chamar `fn_*`
- **Nunca modificados pelo cliente**

**Exemplos de lógica platform**:
- JWT emission e validation
- Request routing (JQEL)
- Event publishing (SSE)
- Authentication flow control

### API Workflows (workflows/v2/api/{auth,system,chat})

- **Específicos do cliente**: Cada cliente implementa conforme sua necessidade
- **Contratos bem definidos**: Input/output padronizados (ver `_contracts.md`)
- **Flexibilidade de tecnologia**: MySQL, PostgreSQL, MongoDB, REST API, etc.
- **Esqueletos fornecidos**: Implementação inicial com JSON mock (Edit Fields)

**Exemplos de lógica API**:
- User database queries
- Permission validation
- JQEL query execution
- Agent configuration

## Status Atual

### ✅ Completo

1. **17 workflows API criados** com esqueletos (JSON mock)
   - `api/auth/fn_*.json` (8 funções)
   - `api/system/fn_*.json` (6 funções)
   - `api/chat/fn_*.json` (3 funções)

2. **5 workflows platform copiados** (100% genéricos, sem mudanças)
   - `auth/lib/fn-jwt-emission.json`
   - `auth/lib/fn-jwt-validation.json`
   - `system/health.json`
   - `channels/fn-notification.json`
   - `channels/fn-task.json`

3. **Documentação completa** dos contratos
   - `_contracts.md` - Input/output de todas as 17 funções

### ⏳ Pendente

**Refatorar workflows platform** para chamar funções API:

1. `auth/auth-login.json`
   - Substituir chamada de `fn-find-user` por `api/auth/fn_find_user`
   - Substituir DataTable upsert por `api/auth/fn_store_refresh_token`

2. `auth/auth-logout.json`
   - Substituir DataTable update por `api/auth/fn_revoke_refresh_token`

3. `auth/auth-logout-all.json`
   - Substituir DataTable bulk update por `api/auth/fn_revoke_all_user_sessions`

4. `auth/auth-refresh.json`
   - Substituir DataTable get por `api/auth/fn_get_refresh_token`
   - Substituir family revoke por `api/auth/fn_revoke_token_family`
   - Substituir consumed mark por `api/auth/fn_mark_token_consumed`
   - Substituir `fn-find-user` por `api/auth/fn_find_user`

5. `auth/authorize.json`
   - Substituir hardcoded permission map por `api/auth/fn_get_user_permissions`

6. `system/chat.json`
   - Substituir hardcoded agents por `api/chat/fn_list_agents`
   - Substituir hardcoded models por `api/chat/fn_list_models`
   - Adicionar chamada a `api/chat/fn_get_agent_config`

7. `system/request.json`
   - Substituir hardcoded schemas por `api/system/fn_list_schemas`
   - Substituir database introspection por `api/system/fn_introspect_database`
   - Substituir DataTable operations por `api/system/fn_query_datatable`

8. Criar `system/request_database.json` (refatorado)
   - Substituir stored procedure execution por `api/system/fn_execute_jqel_query`
   - Substituir audit procedure por `api/system/fn_audit_mutation`

## Como Implementar as Funções API

### 1. Escolha uma função para implementar

Consulte `_contracts.md` para ver input/output esperados.

Prioridade recomendada:
1. **ALTA**: Funções de auth (fn_find_user, fn_get_user_permissions, etc.)
2. **MÉDIA**: fn_execute_jqel_query, fn_list_entities
3. **BAIXA**: fn_audit_mutation, fn_list_models

### 2. Edite o workflow esqueleto

Abra o arquivo `api/{domain}/fn_*.json` no n8n.

**Estrutura atual** (mock):
```
[Execute Workflow Trigger] → [Mock Response (Edit Fields)] → [Output]
```

**Substitua o node "Mock Response"** pela sua implementação:

#### Opção A: Database Query (MySQL)
```
[Execute Workflow Trigger] → [MySQL] → [Transform Data] → [Output]
```

#### Opção B: Database Query (PostgreSQL)
```
[Execute Workflow Trigger] → [PostgreSQL] → [Transform Data] → [Output]
```

#### Opção C: MongoDB
```
[Execute Workflow Trigger] → [MongoDB] → [Transform Data] → [Output]
```

#### Opção D: REST API
```
[Execute Workflow Trigger] → [HTTP Request] → [Transform Data] → [Output]
```

#### Opção E: Stored Procedure (SQL Server)
```
[Execute Workflow Trigger] → [Microsoft SQL] → [Transform Data] → [Output]
```

### 3. Valide o contrato

Certifique-se que sua implementação:
- ✅ Aceita todos os campos de input esperados
- ✅ Retorna estrutura de output correta
- ✅ Usa codes HTTP corretos (200, 404, 403, 500)
- ✅ Trata erros gracefully

### 4. Teste isoladamente

Execute o workflow com dados de teste:

```javascript
// Input de teste para fn_find_user
{
  "username": "test@example.com",
  "password": "secret123"
}

// Output esperado
{
  "code": 200,
  "data": {
    "senha_hash": "$2a$10$...",
    "payload": {
      "sub": "user-123",
      "iss": "platform",
      "aud": "client",
      "tenant": [1],
      "roles": ["Admin"],
      "name": "Test User",
      "email": "test@example.com"
    }
  }
}
```

## Migração do Cliente Atual (MySQL + DataTable)

Para migrar a implementação existente:

### 1. fn_find_user (auth)

**Origem**: `workflows/auth/lib/fn-find-user.json`

**Ação**:
- Copiar node MySQL com query de users
- Copiar node de transformação de payload
- Adaptar para retornar formato do contrato

### 2. fn_store_refresh_token (auth)

**Origem**: `workflows/auth/auth-login.json` (linha ~444)

**Ação**:
- Extrair node DataTable upsert
- Transformar para usar tabela do cliente (não DataTable)
- Retornar `{ code: 200, message: "..." }`

### 3. fn_get_user_permissions (auth)

**Origem**: `workflows/auth/authorize.json` (linha ~419)

**Ação**:
- Migrar hardcoded permission map para tabela de banco
- Implementar lógica de wildcard matching
- Retornar `{ code: 200|403, data: { isGranted: boolean } }`

### 4. fn_execute_jqel_query (system)

**Origem**: `workflows/system/request_database.json` (linha ~320)

**Ação**:
- Manter padrão de stored procedures (jsql__*)
- OU migrar para query builder
- Implementar suporte a todos operadores JQEL

## Testando a Integração

### 1. Teste unitário da função API

```bash
# Execute workflow API isoladamente
curl -X POST http://n8n.domain/webhook-test/fn_find_user \
  -H "Content-Type: application/json" \
  -d '{"username": "test@example.com"}'
```

### 2. Teste do workflow platform

```bash
# Teste auth-login (que chama fn_find_user)
curl -X POST http://n8n.domain/webhook/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test@example.com", "password": "secret"}'
```

### 3. Teste end-to-end

```bash
# 1. Login
TOKEN=$(curl -X POST .../auth/login -d '...' | jq -r '.data.tokens.access_token')

# 2. Authorize
curl -X POST .../auth/authorize \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"schema": "cia", "select": "users"}'

# 3. Logout
curl -X POST .../auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## Vantagens da Nova Arquitetura

### Para a Plataforma

✅ **Workflows genéricos**: Funcionam para qualquer cliente
✅ **Atualizações simples**: Bugs corrigidos uma vez, beneficiam todos
✅ **Testabilidade**: Pode testar com mocks das funções API
✅ **Documentação clara**: Contratos explícitos em `_contracts.md`

### Para o Cliente

✅ **Flexibilidade**: Escolhe tecnologia (MySQL, PostgreSQL, MongoDB, API)
✅ **Controle**: Lógica sensível (permissions, queries) fica privada
✅ **Performance**: Otimiza queries para seu schema
✅ **Segurança**: Implementa regras de negócio customizadas
✅ **Migração gradual**: Implementa fn_* conforme necessidade

## Próximos Passos

1. **Implementar funções API de auth** (prioridade ALTA)
   - Começar com `fn_find_user`
   - Depois `fn_get_user_permissions`
   - Por último, token management functions

2. **Refatorar workflows platform** para chamar API functions
   - Atualizar `auth-login.json`
   - Atualizar `authorize.json`
   - Testar fluxo completo de autenticação

3. **Implementar funções API de system**
   - `fn_execute_jqel_query` (mais complexa)
   - `fn_list_entities`
   - `fn_list_schemas`

4. **Implementar funções API de chat** (opcional)
   - `fn_list_agents`
   - `fn_get_agent_config`

5. **Deploy gradual**
   - Testar em ambiente de dev
   - Validar com usuários beta
   - Migrar produção

## Suporte

- Consulte `_contracts.md` para contratos detalhados
- Veja `api/{domain}/fn_*.json` (notes) para exemplos de implementação
- Analise workflows originais em `workflows/` (não v2) para referência da lógica atual
