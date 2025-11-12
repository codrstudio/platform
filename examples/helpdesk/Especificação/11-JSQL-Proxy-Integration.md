# Paper 11: Integração JSQL - Frontend → Backend → N8N

## 📋 Visão Geral

Este documento descreve a integração completa entre **Frontend React**, **Backend Express (proxy)**, **N8N** e **SQL Server** usando **JSQL** como linguagem de comunicação única.

**Princípio fundamental:**
> Frontend monta queries JSON (JSQL) → Backend proxy repassa → N8N executa procedures SQL → Retorna envelope JSON

---

## 🏗️ Arquitetura de Comunicação

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND REACT                             │
│  ┌───────────────────────────────────────────────────┐ │
│  │  jsqlClient.ts                                    │ │
│  │                                                    │ │
│  │  • Monta JSQL Query (JSON)                        │ │
│  │  • POST /api/jsql                                 │ │
│  │  • Trata resposta (envelope)                      │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
                    POST /api/jsql
                    Content-Type: application/json
                    Body: { "select": "usuario", ... }
                          ↓
┌─────────────────────────────────────────────────────────┐
│           BACKEND EXPRESS (Proxy)                       │
│  ┌───────────────────────────────────────────────────┐ │
│  │  server/routes/jsql.ts                            │ │
│  │                                                    │ │
│  │  • Recebe JSQL do frontend                        │ │
│  │  • Valida estrutura básica                        │ │
│  │  • Repassa Cookie/Authorization header            │ │
│  │  • POST para N8N webhook                          │ │
│  │  • Retorna resposta ao frontend                   │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
          POST https://n8n.url/webhook/coletivos/api/1/requisicao
          Cookie: access_token=...
          Body: { "select": "usuario", ... }
                          ↓
┌─────────────────────────────────────────────────────────┐
│              N8N WORKFLOW                               │
│  coletivos-requisicao.json                              │
│                                                         │
│  1. Extrai access_token (cookie/header/body)           │
│  2. Valida JWT (coletivos-autorizar)                   │
│  3. Monta procedure name: {schema}.jsql__{op}__{entity}│
│  4. Executa no SQL Server                              │
│  5. Parse JSON resposta                                │
│  6. Registra auditoria (se mutate)                     │
│  7. Retorna envelope JSON                              │
└─────────────────────────────────────────────────────────┘
                          ↓
              EXEC sac.jsql__select__usuario
              @user='{"id":1,"email":"admin@..."}'
              @jsql='{"where":{"status":...},"output":[...]}'
                          ↓
┌─────────────────────────────────────────────────────────┐
│              SQL SERVER                                 │
│  database/schemata/sac/                                 │
│                                                         │
│  • Procedure JSQL (sac.jsql__select__usuario)          │
│  • Parse JSON @jsql                                 │
│  • Valida permissões (@user)                           │
│  • Executa SELECT dinâmico                             │
│  • Retorna envelope JSON:                              │
│    SELECT '{"code":200,"data":[...],"message":"OK"}'   │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Referências de Documentação

### JSQL (Linguagem de Consulta)

**Localização:** `/docs/JSQL/`

| Documento | Descrição | Para quem |
|-----------|-----------|-----------|
| [README.md](../../JSQL/README.md) | Visão geral e quick start | Todos |
| [sintaxe.md](../../JSQL/sintaxe.md) | Como construir queries (where, options, output) | Frontend |
| [operacoes.md](../../JSQL/operacoes.md) | Select e Mutate (consultas e modificações) | Frontend |
| [respostas.md](../../JSQL/respostas.md) | Interpretar envelope e status codes | Frontend |
| [mapeamento.md](../../JSQL/mapeamento.md) | Regras JSON ↔ Procedures | Backend SQL |
| [procedures.md](../../JSQL/procedures.md) | Como criar procedures SQL | Backend SQL |
| [referencia.md](../../JSQL/referencia.md) | Operadores, exemplos, convenções | Consulta rápida |

### N8N Workflows

**Localização:** `/n8n/`

| Workflow | Propósito | Endpoint |
|----------|-----------|----------|
| [coletivos-requisicao.json](../../n8n/coletivos-requisicao.json) | **Principal** - Processa JSQL | `/webhook/coletivos/api/1/requisicao` |
| [coletivos-autenticar.json](../../n8n/coletivos-autenticar.json) | Autentica usuário (JWT) | `/webhook/coletivos/api/1/autenticar` |
| [coletivos-autorizar.json](../../n8n/coletivos-autorizar.json) | Valida permissões | `/webhook/coletivos/api/1/autorizar` |
| [coletivos-auditoria.json](../../n8n/coletivos-auditoria.json) | Registra logs de auditoria | Chamado por requisicao |

### SQL Server Procedures

**Localização:** `/database/schemata/sac/`

**Pattern:** `sac.jsql__{operation}__{entity}[__{action}].sql`

**Procedures Existentes (exemplos):**
```
sac.jsql__select__usuario.sql
sac.jsql__select__permissao.sql
sac.jsql__select__permissao_efetiva.sql
sac.jsql__mutate__usuario.sql
sac.jsql__mutate__papel.sql
sac.jsql__mutate__papel_permissao.sql
sac.jsql__mutate__usuario_papel.sql
sac.jsql__mutate__usuario_permissao.sql
```

---

## 🔌 Implementação Frontend

### 1. Cliente JSQL (API Client)

```typescript
// src/core/api/jsqlClient.ts

interface JSQLQuery {
  schema?: string
  select?: string
  mutate?: string
  action?: string
  where?: Record<string, any>
  values?: Record<string, any>
  options?: {
    limit?: number
    offset?: number
    orderBy?: Array<{ field: string; direction: 'ASC' | 'DESC' }>
  }
  output?: string[]
}

interface JSQLResponse<T = any> {
  code: number
  message?: string
  data?: T
  field?: string
  warnings?: Array<{ code: number; message: string }>
}

class JSQLClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api/jsql') {
    this.baseUrl = baseUrl
  }

  /**
   * Executa query JSQL (select ou mutate)
   */
  async query<T = any>(query: JSQLQuery): Promise<JSQLResponse<T>> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // IMPORTANTE: envia cookies
      body: JSON.stringify(query)
    })

    const data: JSQLResponse<T> = await response.json()

    // Trata erros HTTP
    if (!response.ok) {
      throw new JSQLError(data.message || 'Erro ao processar requisição', data.code)
    }

    // Trata erros de negócio
    if (data.code >= 400) {
      throw new JSQLError(data.message || 'Erro na operação', data.code, data.field)
    }

    return data
  }

  /**
   * SELECT - Consulta de dados
   */
  async select<T = any>(
    entity: string,
    params?: {
      where?: Record<string, any>
      options?: JSQLQuery['options']
      output?: string[]
      schema?: string
    }
  ): Promise<JSQLResponse<T[]>> {
    return this.query<T[]>({
      schema: params?.schema || 'sac',
      select: entity,
      where: params?.where,
      options: params?.options,
      output: params?.output
    })
  }

  /**
   * MUTATE - Modificação de dados
   */
  async mutate<T = any>(
    entity: string,
    params: {
      action?: string
      values?: Record<string, any>
      where?: Record<string, any>
      output?: string[]
      schema?: string
    }
  ): Promise<JSQLResponse<T>> {
    return this.query<T>({
      schema: params.schema || 'sac',
      mutate: entity,
      action: params.action,
      values: params.values,
      where: params.where,
      output: params.output
    })
  }
}

// Error customizado
class JSQLError extends Error {
  constructor(
    message: string,
    public code: number,
    public field?: string
  ) {
    super(message)
    this.name = 'JSQLError'
  }
}

// Singleton export
export const jsqlClient = new JSQLClient()
export { JSQLError }
export type { JSQLQuery, JSQLResponse }
```

### 2. Hook Customizado (React)

```typescript
// src/core/hooks/useJSQLQuery.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jsqlClient, JSQLQuery, JSQLResponse } from '../api/jsqlClient'

/**
 * Hook para queries JSQL (SELECT)
 */
export function useJSQLQuery<T = any>(
  key: string[],
  query: JSQLQuery,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: key,
    queryFn: () => jsqlClient.query<T>(query),
    enabled: options?.enabled,
    staleTime: options?.staleTime || 5 * 60 * 1000 // 5 min padrão
  })
}

/**
 * Hook para mutations JSQL (MUTATE)
 */
export function useJSQLMutation<TData = any, TVariables = any>(
  options?: {
    onSuccess?: (data: JSQLResponse<TData>) => void
    onError?: (error: Error) => void
    invalidateQueries?: string[][]
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (query: JSQLQuery) => jsqlClient.query<TData>(query),
    onSuccess: (data) => {
      // Invalida queries relacionadas
      options?.invalidateQueries?.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      options?.onSuccess?.(data)
    },
    onError: options?.onError
  })
}
```

### 3. Exemplos de Uso

#### SELECT - Listar Usuários

```typescript
// src/pages/Users/UserList.tsx

import { useJSQLQuery } from '@/core/hooks/useJSQLQuery'

export function UserList() {
  const { data, isLoading, error } = useJSQLQuery(
    ['users', 'active'],
    {
      select: 'usuario',
      where: {
        ativo: { eq: true }
      },
      options: {
        limit: 50,
        orderBy: [{ field: 'nome_exibicao', direction: 'ASC' }]
      },
      output: ['id_usuario', 'nome_exibicao', 'email_usuario', 'ultimo_login']
    }
  )

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error.message}</div>

  return (
    <ul>
      {data?.data?.map(user => (
        <li key={user.id_usuario}>
          {user.nome_exibicao} - {user.email_usuario}
        </li>
      ))}
    </ul>
  )
}
```

#### SELECT - Busca com LIKE (Busca Global)

```typescript
// src/components/GlobalSearch.tsx

async function searchGlobal(termo: string) {
  // Buscar chamados
  const chamados = await jsqlClient.select('chamado', {
    where: {
      OR: [
        { numero_protocolo: { like: `${termo}%` } },
        { titulo_chamado: { like: `%${termo}%` } }
      ]
    },
    options: { limit: 5 },
    output: ['id_chamado', 'numero_protocolo', 'titulo_chamado', 'id_status_chamado']
  })

  // Buscar clientes
  const clientes = await jsqlClient.select('cliente', {
    where: {
      OR: [
        { nome_cliente: { like: `%${termo}%` } },
        { nome_fantasia: { like: `%${termo}%` } },
        { cnpj: { like: `%${termo}%` } }
      ]
    },
    options: { limit: 5 },
    output: ['id_cliente', 'nome_cliente', 'cnpj']
  })

  // Buscar contatos
  const contatos = await jsqlClient.select('contato', {
    where: {
      OR: [
        { nome_contato: { like: `%${termo}%` } },
        { email_contato: { like: `%${termo}%` } }
      ]
    },
    options: { limit: 5 },
    output: ['id_contato', 'nome_contato', 'email_contato', 'id_cliente']
  })

  return { chamados, clientes, contatos }
}
```

#### MUTATE - Criar Usuário

```typescript
// src/pages/Users/UserForm.tsx

import { useJSQLMutation } from '@/core/hooks/useJSQLQuery'

export function UserForm() {
  const createUser = useJSQLMutation({
    onSuccess: (data) => {
      toast.success('Usuário criado com sucesso!')
      navigate('/users')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    invalidateQueries: [['users']]
  })

  async function handleSubmit(values: any) {
    await createUser.mutateAsync({
      mutate: 'usuario',
      action: 'insert',
      values: {
        email_usuario: values.email,
        nome_exibicao: values.nome,
        fuso_horario: 'America/Sao_Paulo',
        idioma: 'pt',
        ativo: true
      },
      output: ['id_usuario', 'nome_exibicao', 'email_usuario']
    })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

#### MUTATE - Atualizar Usuário

```typescript
// src/pages/Users/UserEdit.tsx

async function handleUpdate(userId: number, values: any) {
  const result = await jsqlClient.mutate('usuario', {
    action: 'update',
    where: { id_usuario: { eq: userId } },
    values: {
      nome_exibicao: values.nome,
      fuso_horario: values.timezone,
      idioma: values.language
    },
    output: ['id_usuario', 'nome_exibicao', 'data_ultima_atualizacao']
  })

  if (result.code === 200) {
    toast.success('Usuário atualizado!')
  }
}
```

---

## 🔌 Implementação Backend (Express Proxy)

### server/routes/jsql.ts

```typescript
import { Router, Request, Response } from 'express'
import fetch from 'node-fetch'
import { N8N_CONFIG } from '../config/n8n.js'

const router = Router()

/**
 * POST /api/jsql
 *
 * Proxy para N8N workflow coletivos-requisicao
 * Repassa JSQL query do frontend para N8N
 */
router.post('/jsql', async (req: Request, res: Response) => {
  try {
    const jsqlQuery = req.body

    // Validação básica da query
    if (!jsqlQuery.select && !jsqlQuery.mutate) {
      return res.status(400).json({
        code: 400,
        message: 'Query JSQL inválida: deve conter "select" ou "mutate"',
        field: jsqlQuery.select ? 'mutate' : 'select'
      })
    }

    // Validação de schema
    const allowedSchemas = ['sac', 'jsql']
    const schema = jsqlQuery.schema || 'sac'
    if (!allowedSchemas.includes(schema)) {
      return res.status(400).json({
        code: 400,
        message: `Schema inválido: ${schema}. Permitidos: ${allowedSchemas.join(', ')}`,
        field: 'schema'
      })
    }

    // Monta URL do N8N
    const n8nUrl = `${N8N_CONFIG.baseUrl}${N8N_CONFIG.endpoints.requisicao}`

    // Prepara headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Repassa Cookie de autenticação (prioridade)
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie
    }

    // Repassa Authorization header (alternativa)
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization
    }

    // Log em dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`[JSQL] ${jsqlQuery.select || jsqlQuery.mutate}`, {
        schema,
        action: jsqlQuery.action,
        hasWhere: !!jsqlQuery.where,
        hasValues: !!jsqlQuery.values
      })
    }

    // Faz request para N8N
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(jsqlQuery),
      timeout: N8N_CONFIG.timeout
    })

    // Parse resposta
    const data = await response.json()

    // Log warnings em dev
    if (process.env.NODE_ENV === 'development' && data.warnings) {
      console.warn('[JSQL] Warnings:', data.warnings)
    }

    // Retorna com mesmo status code do N8N
    res.status(response.status).json(data)

  } catch (error: any) {
    console.error('[JSQL] Erro ao processar requisição:', error)

    // Timeout
    if (error.type === 'request-timeout') {
      return res.status(504).json({
        code: 504,
        message: 'Timeout ao processar requisição. Tente novamente.'
      })
    }

    // Erro de conexão com N8N
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        code: 503,
        message: 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.'
      })
    }

    // Erro genérico
    res.status(500).json({
      code: 500,
      message: 'Erro interno ao processar requisição JSQL',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router
```

### server/config/n8n.ts

```typescript
export const N8N_CONFIG = {
  baseUrl: process.env.N8N_URL || 'https://n8n.codrstudio.dev',
  endpoints: {
    requisicao: '/webhook/coletivos/api/1/requisicao',
    autenticar: '/webhook/coletivos/api/1/autenticar',
    autorizar: '/webhook/coletivos/api/1/autorizar'
  },
  timeout: Number(process.env.N8N_TIMEOUT) || 30000 // 30 segundos
}
```

---

## 🗄️ Procedures JSQL no SQL Server

### Estrutura Padrão de uma Procedure

**Arquivo:** `database/schemata/sac/sac.jsql__select__usuario.sql`

```sql
-- =============================================
-- Procedure: sac.jsql__select__usuario
-- Descrição: Consulta usuários com filtros JSQL
-- =============================================

IF OBJECT_ID(N'sac.jsql__select__usuario', 'P') IS NOT NULL
    DROP PROCEDURE sac.jsql__select__usuario;
GO

CREATE PROCEDURE sac.jsql__select__usuario
    @user NVARCHAR(MAX),      -- JSON: { "id": 1, "email": "...", "is_admin": true }
    @jsql NVARCHAR(MAX)    -- JSON: { "where": {...}, "options": {...}, "output": [...] }
AS
BEGIN
    SET NOCOUNT ON;

    -- Variáveis
    DECLARE @code INT = 200;
    DECLARE @message NVARCHAR(500) = 'OK';
    DECLARE @data NVARCHAR(MAX);

    -- Parse JSON payload
    DECLARE @where NVARCHAR(MAX) = JSON_VALUE(@jsql, '$.where');
    DECLARE @options NVARCHAR(MAX) = JSON_VALUE(@jsql, '$.options');
    DECLARE @output NVARCHAR(MAX) = JSON_VALUE(@jsql, '$.output');

    -- Parse user
    DECLARE @user_id INT = CAST(JSON_VALUE(@user, '$.id') AS INT);
    DECLARE @is_admin BIT = CAST(JSON_VALUE(@user, '$.is_admin') AS BIT);

    BEGIN TRY
        -- Valida permissão (select__usuario)
        IF @is_admin = 0
        BEGIN
            -- Checa permissão via sac.n8n_get_permissao_efetiva
            DECLARE @has_permission BIT;
            EXEC @has_permission = sac.n8n_get_permissao_efetiva
                @id_usuario = @user_id,
                @codigo_permissao = 'select__usuario';

            IF @has_permission = 0
            BEGIN
                SET @code = 403;
                SET @message = 'Você não tem permissão para visualizar usuários';
                GOTO ReturnResponse;
            END
        END

        -- Monta query dinâmica (simplificado)
        -- TODO: Parse completo de @where e @options
        DECLARE @sql NVARCHAR(MAX);
        SET @sql = N'
            SELECT
                DFid_usuario AS id_usuario,
                DFemail_usuario AS email_usuario,
                DFnome_exibicao AS nome_exibicao,
                DFultimo_login AS ultimo_login,
                DFativo AS ativo
            FROM sac.TBusuario
            WHERE DFativo = 1
        ';

        -- Executa e retorna JSON
        SET @data = (SELECT * FROM sac.TBusuario FOR JSON PATH);

        ReturnResponse:
        -- Retorna envelope JSQL
        SELECT @code AS code, @message AS message, @data AS data FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;

    END TRY
    BEGIN CATCH
        -- Erro SQL
        SELECT
            500 AS code,
            ERROR_MESSAGE() AS message
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
    END CATCH
END
GO
```

### Procedures que Devem Existir para Busca Global

1. **`sac.jsql__select__chamado`** - Buscar chamados
   - Deve suportar filtro `numero_protocolo` com `like`
   - Deve suportar filtro `titulo_chamado` com `like`
   - Deve filtrar por permissões do usuário

2. **`sac.jsql__select__cliente`** - Buscar clientes
   - Deve suportar filtro `nome_cliente` com `like`
   - Deve suportar filtro `nome_fantasia` com `like`
   - Deve suportar filtro `cnpj` com `like`

3. **`sac.jsql__select__contato`** - Buscar contatos
   - Deve suportar filtro `nome_contato` com `like`
   - Deve suportar filtro `email_contato` com `like`
   - Deve retornar `id_cliente` (para exibir cliente do contato)

### Verificar Procedures Existentes

```bash
# Listar procedures JSQL no schema sac
ls database/schemata/sac/sac.jsql__*.sql
```

---

## 📊 Envelope de Resposta JSQL

### Estrutura Padrão

```json
{
  "code": 200,
  "message": "OK",
  "data": [...],
  "field": null,
  "warnings": []
}
```

### Códigos HTTP e JSQL

| Code | Significado | Quando usar |
|------|-------------|-------------|
| 200 | OK | Select bem-sucedido |
| 201 | Created | Insert bem-sucedido |
| 204 | No Content | Delete bem-sucedido |
| 400 | Bad Request | Query JSQL inválida |
| 401 | Unauthorized | Token JWT inválido/expirado |
| 403 | Forbidden | Sem permissão para operação |
| 404 | Not Found | Registro não encontrado |
| 422 | Unprocessable Entity | Validação de negócio falhou |
| 500 | Internal Error | Erro SQL ou exceção |
| 503 | Service Unavailable | N8N/SQL Server offline |
| 504 | Gateway Timeout | Timeout na procedure |

### Exemplos de Respostas

**Sucesso (200):**
```json
{
  "code": 200,
  "data": [
    { "id_usuario": 1, "nome_exibicao": "Admin", "email": "admin@exemplo.com" }
  ]
}
```

**Erro de Validação (422):**
```json
{
  "code": 422,
  "message": "Email já cadastrado no sistema",
  "field": "email_usuario"
}
```

**Erro de Permissão (403):**
```json
{
  "code": 403,
  "message": "Você não tem permissão para executar esta ação"
}
```

**Offline (503 - do Service Worker):**
```json
{
  "code": 503,
  "message": "Você está offline. Conecte-se à internet para continuar.",
  "offline": true
}
```

---

## 🧪 Testes

### Testar Procedure SQL Direto

```sql
-- Teste no SQL Server Management Studio

DECLARE @user NVARCHAR(MAX) = '{"id":1,"email":"admin@processa.com","is_admin":true}';
DECLARE @jsql NVARCHAR(MAX) = '{
  "where": {"ativo": {"eq": true}},
  "options": {"limit": 10},
  "output": ["id_usuario", "nome_exibicao", "email_usuario"]
}';

EXEC sac.jsql__select__usuario @user=@user, @jsql=@jsql;
```

### Testar via N8N Direto

```bash
# POST para N8N
curl -X POST https://n8n.codrstudio.dev/webhook/coletivos/api/1/requisicao \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=SEU_TOKEN_JWT" \
  -d '{
    "select": "usuario",
    "where": {"ativo": {"eq": true}},
    "options": {"limit": 5},
    "output": ["id_usuario", "nome_exibicao", "email_usuario"]
  }'
```

### Testar via Backend Express

```bash
# POST para backend local (dev)
curl -X POST http://localhost:4000/api/jsql \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=SEU_TOKEN_JWT" \
  -d '{
    "select": "usuario",
    "where": {"ativo": {"eq": true}},
    "options": {"limit": 5},
    "output": ["id_usuario", "nome_exibicao"]
  }'
```

### Testar via Frontend (Browser Console)

```javascript
// No console do browser (com app rodando)
await fetch('/api/jsql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    select: 'usuario',
    where: { ativo: { eq: true } },
    options: { limit: 5 },
    output: ['id_usuario', 'nome_exibicao', 'email_usuario']
  })
}).then(r => r.json()).then(console.log)
```

---

## ✅ Checklist de Implementação

### Frontend
- [ ] Criar `src/core/api/jsqlClient.ts` (cliente JSQL)
- [ ] Criar `src/core/hooks/useJSQLQuery.ts` (hooks React Query)
- [ ] Configurar TanStack Query no `main.tsx`
- [ ] Implementar error handling (JSQLError)
- [ ] Implementar toast notifications para erros

### Backend Express
- [ ] Criar `server/routes/jsql.ts` (proxy route)
- [ ] Criar `server/config/n8n.ts` (config N8N)
- [ ] Integrar rota no `server/index.ts`
- [ ] Adicionar error handler
- [ ] Adicionar logs (dev mode)
- [ ] Configurar timeout (30s)

### SQL Server
- [ ] Verificar se procedures existem:
  - [ ] `sac.jsql__select__chamado`
  - [ ] `sac.jsql__select__cliente`
  - [ ] `sac.jsql__select__contato`
- [ ] Criar procedures faltantes (se necessário)
- [ ] Testar procedures com payloads JSQL
- [ ] Criar índices para campos de busca (LIKE)
- [ ] Validar permissões nas procedures

### N8N
- [ ] Validar workflow `coletivos-requisicao` ativo
- [ ] Testar endpoint direto com curl
- [ ] Validar autenticação (Cookie/Authorization)
- [ ] Validar auditoria (mutations)

### Testes
- [ ] Testar SELECT via frontend
- [ ] Testar MUTATE via frontend
- [ ] Testar busca global (3 entidades)
- [ ] Testar error handling (400, 403, 500)
- [ ] Testar offline (Service Worker)
- [ ] Testar validação de permissões

---

## 🎯 Resumo Executivo

### O que é JSQL?
Linguagem de consulta JSON que traduz para procedures SQL no SQL Server.

### Como funciona?
1. Frontend monta JSON
2. Backend proxy repassa para N8N
3. N8N executa procedure SQL
4. SQL retorna envelope JSON
5. Frontend renderiza resposta

### Vantagens?
- ✅ **Sem SQL direto** no frontend (segurança)
- ✅ **Validação de permissões** no backend (RBAC)
- ✅ **Auditoria automática** (N8N)
- ✅ **Type-safe** com TypeScript
- ✅ **Cache inteligente** (React Query)
- ✅ **Offline support** (Service Worker)

### Onde estudar?
- **Sintaxe:** [docs/JSQL/sintaxe.md](../../JSQL/sintaxe.md)
- **Operações:** [docs/JSQL/operacoes.md](../../JSQL/operacoes.md)
- **Respostas:** [docs/JSQL/respostas.md](../../JSQL/respostas.md)

---

**Última atualização:** 2025-10-02
**Autor:** Claude Code
**Status:** ✅ Especificação Completa
