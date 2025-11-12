# Authorization Implementation Plan - Coletivos HelpDesk

## 📋 Visão Geral

Este documento detalha o plano de implementação do sistema de autorização granular do Coletivos HelpDesk, baseado em permissões JSQL mapeadas 1:1 com procedures do banco de dados.

---

## 🎯 Objetivo

Implementar sistema de permissões granulares que:
- [x] Valida automaticamente permissões baseadas em queries JSQL
- [x] Mapeia permissões 1:1 com procedures (`select__usuario` → `jsql__select__usuario`)
- [x] Cache inteligente com Redis (quando habilitado) ou Zustand (fallback)
- [x] Frontend valida antes de enviar queries
- [x] Administradores têm bypass automático

---

## 🏗️ Arquitetura

### Fluxo de Autorização

```
[Frontend React]
   ↓ (1) Planeja query JSQL
   ↓ (2) Valida permissão localmente (cache Zustand)
   ↓ (3) Se válido, envia para N8N
[N8N /requisicao]
   ↓ (4) Valida JWT (já implementado)
   ↓ (5) Executa procedure JSQL
[SQL Server]
   ↓ (6) Retorna dados
```

### Componentes

1. **SQL Server:** Procedures JSQL + View `TBpermissao_efetiva`
2. **N8N:** Validação JWT + Execução JSQL
3. **Frontend React:** Cache Zustand + Validação local + Componentes de proteção

---

## 📦 Entregáveis

### FASE 1: Backend SQL (Procedures JSQL)

#### 1.1. Procedure: Listar Permissões Disponíveis
**Arquivo:** `database/schemata/sac/sac.jsql__select__permissao.sql`

```sql
CREATE OR ALTER PROCEDURE sac.jsql__select__permissao
    @jsql NVARCHAR(MAX)
AS
BEGIN
    -- Busca todas as permissões do catálogo
    -- Usado para montar matriz de permissões no admin
END
```

**Critérios:**
- [x] Retorna todas as permissões ativas de `TBpermissao`
- [x] Suporta filtros por categoria
- [x] Suporta paginação

---

#### 1.2. Procedure: Consultar Permissões Efetivas de Usuário
**Arquivo:** `database/schemata/sac/sac.jsql__select__permissao_efetiva.sql`

```sql
CREATE OR ALTER PROCEDURE sac.jsql__select__permissao_efetiva
    @jsql NVARCHAR(MAX)
AS
BEGIN
    -- Consulta VIEW TBpermissao_efetiva
    -- Retorna permissões efetivas de um ou mais usuários
END
```

**Critérios:**
- [x] Consulta VIEW `TBpermissao_efetiva`
- [x] Filtra por `id_usuario`
- [x] Retorna apenas permissões com `permitido = 1`
- [x] Inclui metadados (papel origem, data expiração)

---

#### 1.3. Procedure: Gestão de Papéis
**Arquivo:** `database/schemata/sac/sac.jsql__select__papel.sql`
**Arquivo:** `database/schemata/sac/sac.jsql__mutate__papel.sql`

```sql
-- SELECT
CREATE OR ALTER PROCEDURE sac.jsql__select__papel
-- MUTATE (insert/update/delete)
CREATE OR ALTER PROCEDURE sac.jsql__mutate__papel
```

**Critérios:**
- [x] CRUD completo de papéis
- [x] Validação: Não deletar papéis fixos (`espectador`, `administrador`)
- [x] Validação: Não deletar papel se há usuários atribuídos

---

#### 1.4. Procedure: Atribuir Permissões a Papéis
**Arquivo:** `database/schemata/sac/sac.jsql__mutate__papel_permissao.sql`

```sql
CREATE OR ALTER PROCEDURE sac.jsql__mutate__papel_permissao
    @jsql NVARCHAR(MAX)
AS
BEGIN
    -- Atribui/remove permissões de papéis
    -- Registra quem fez a atribuição
END
```

**Critérios:**
- [x] INSERT/UPDATE/DELETE em `TBpapel_permissao`
- [x] Registra `DFid_usuario_atribuicao`
- [x] Suporta atribuição em lote

---

#### 1.5. Procedure: Atribuir Papéis a Usuários
**Arquivo:** `database/schemata/sac/sac.jsql__mutate__usuario_papel.sql`

```sql
CREATE OR ALTER PROCEDURE sac.jsql__mutate__usuario_papel
    @jsql NVARCHAR(MAX)
AS
BEGIN
    -- Atribui/remove papéis de usuários
    -- Suporta data de expiração
END
```

**Critérios:**
- [x] INSERT/UPDATE/DELETE em `TBusuario_papel`
- [x] Registra `DFid_usuario_atribuidor`
- [x] Valida data de expiração
- [x] Impede remoção do último administrador

---

#### 1.6. Procedure: Permissões Individuais (Override)
**Arquivo:** `database/schemata/sac/sac.jsql__mutate__usuario_permissao.sql`

```sql
CREATE OR ALTER PROCEDURE sac.jsql__mutate__usuario_permissao
    @jsql NVARCHAR(MAX)
AS
BEGIN
    -- Cria overrides de permissão individual
    -- Suporta permissão temporária (com expiração)
END
```

**Critérios:**
- [x] INSERT/UPDATE/DELETE em `TBusuario_permissao`
- [x] Registra motivo do override
- [x] Suporta data de expiração
- [x] Registra quem concedeu

---

### FASE 2: Frontend React (Validação e UI)

#### 2.1. Service: Permission Service
**Arquivo:** `src/helpdesk/src/services/permissionService.ts`

```typescript
export const permissionService = {
  // Busca permissões efetivas do usuário
  async getUserPermissions(userId: number): Promise<Permission[]>,

  // Verifica se usuário tem permissão específica
  async checkPermission(userId: number, permission: string): Promise<boolean>,

  // Extrai permissão necessária de uma query JSQL
  extractRequiredPermission(jsqlQuery: any): string,
}
```

**Critérios:**
- [x] Chama N8N `/requisicao` com JSQL
- [x] Extrai permissão do formato: `{select: "usuario"}` → `"select__usuario"`
- [x] Suporta actions: `{mutate: "chamado", action: "criar"}` → `"mutate__chamado__criar"`

---

#### 2.2. Store: Permission Store (Zustand)
**Arquivo:** `src/helpdesk/src/stores/permissionStore.ts`

```typescript
interface PermissionStore {
  permissions: Permission[];
  loaded: boolean;
  expiresAt: number | null;

  loadPermissions(userId: number): Promise<void>;
  hasPermission(permission: string): boolean;
  clearCache(): void;
}
```

**Critérios:**
- [x] Cache in-memory de permissões
- [x] TTL de 5 minutos (configurável)
- [x] Auto-reload quando cache expira
- [x] Método `clearCache()` para invalidação manual

---

#### 2.3. Hook: usePermission
**Arquivo:** `src/helpdesk/src/hooks/usePermission.ts`

```typescript
export function usePermission(permission: string): boolean {
  const { hasPermission, loadPermissions } = usePermissionStore();
  const { user } = useAuth();

  // Auto-load permissões se necessário
  // Retorna true/false
}
```

**Critérios:**
- [x] Carrega permissões automaticamente
- [x] Retorna boolean (tem ou não tem)
- [x] Re-executa quando usuário muda

---

#### 2.4. Hook: useRequirePermission (Proteção de Rotas)
**Arquivo:** `src/helpdesk/src/hooks/useRequirePermission.ts`

```typescript
export function useRequirePermission(permission: string) {
  const hasPermission = usePermission(permission);
  const navigate = useNavigate();

  // Redireciona para /unauthorized se não tiver permissão
}
```

**Critérios:**
- [x] Valida permissão ao montar componente
- [x] Redireciona se não autorizado
- [x] Mostra loading enquanto valida

---

#### 2.5. Componente: RequirePermission
**Arquivo:** `src/helpdesk/src/components/auth/RequirePermission.tsx`

```typescript
interface Props {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePermission({ permission, children, fallback }: Props) {
  const hasPermission = usePermission(permission);

  if (!hasPermission) return fallback || null;
  return <>{children}</>;
}
```

**Critérios:**
- [x] Renderiza children apenas se tiver permissão
- [x] Suporta fallback customizado
- [x] Não renderiza nada se não tiver permissão e sem fallback

**Uso:**
```tsx
<RequirePermission permission="select__usuario">
  <UserList />
</RequirePermission>
```

---

#### 2.6. Middleware: JSQL Permission Validator
**Arquivo:** `src/helpdesk/src/core/api/jsqlClient.ts`

```typescript
export async function executeJSQL(query: JsqlQuery) {
  // 1. Extrai permissão necessária
  const permission = extractRequiredPermission(query);

  // 2. Valida localmente (cache)
  const hasPermission = usePermissionStore.getState().hasPermission(permission);

  if (!hasPermission) {
    throw new PermissionDeniedError(permission);
  }

  // 3. Envia para N8N
  return apiClient.post('/requisicao', query);
}
```

**Critérios:**
- [x] Valida permissão ANTES de enviar query
- [x] Lança erro customizado se negado
- [x] Extrai permissão automaticamente da query

---

#### 2.7. Telas de Administração (Futuro - Fase 7.2)
**Arquivos:**
- `src/helpdesk/src/pages/admin/Roles.tsx` (UI008)
- `src/helpdesk/src/pages/admin/PermissionMatrix.tsx` (UI009)
- `src/helpdesk/src/pages/admin/UserPermissions.tsx` (UI006)

**Critérios:**
- [ ] Matriz de permissões papel x permissão (UI009)
- [ ] Atribuição de papéis a usuários (UI006)
- [ ] Overrides individuais com motivo e expiração (UI006)
- [x] Auditoria de mudanças - **Implementado:** Workflow `n8n/coletivos-auditoria.json` registra na `TBauditoria`

---

## 🔐 Regras de Negócio

### 1. Administradores
- [x] Usuários com papel `administrador` TÊM TODAS as permissões
- [x] Não precisam de permissões granulares configuradas
- [x] Bypass automático (validar `is_admin` no frontend)

### 2. Hierarquia de Permissões
```
Papel Base (explorar/alterar/configurar)
    ↓ (apenas define nível de acesso)
Permissões Granulares (select__*, mutate__*, configure__*)
    ↓ (controle fino dentro do nível)
Overrides Individuais (TBusuario_permissao)
    ↓ (exceções temporárias ou permanentes)
```

### 3. Lógica de Cálculo (VIEW TBpermissao_efetiva)
```sql
-- Já implementada em sac.TBpermissao_efetiva
-- Lógica: false em qualquer um = false
--         true em qualquer um = true
--         senão = false
```

### 4. Expiração
- [ ] Papéis podem expirar (`TBusuario_papel.DFdata_expiracao`) - Backend pronto, falta UI
- [ ] Permissões individuais podem expirar (`TBusuario_permissao.DFdata_expiracao`) - Backend pronto, falta UI
- [x] Cache respeita expiração (TTL de 5 minutos) - **Implementado:** Redis TTL em `n8n/coletivos-autorizar.json` (atualmente 30s, ajustar para 300s)

---

## 🧪 Testes

### Backend (SQL)
```sql
-- Teste 1: Permissões efetivas calculadas corretamente
SELECT * FROM sac.TBpermissao_efetiva WHERE DFid_usuario = 1

-- Teste 2: Admin tem todas as permissões
EXEC sac.jsql__select__permissao_efetiva '{"where":{"id_usuario":{"eq":1}}}'

-- Teste 3: Atribuição de papel
EXEC sac.jsql__mutate__usuario_papel '{"action":"insert","values":{...}}'

-- Teste 4: Override individual
EXEC sac.jsql__mutate__usuario_permissao '{"action":"insert","values":{...}}'
```

### Frontend (React)
```typescript
// Teste 1: Hook retorna permissão correta
expect(usePermission('select__usuario')).toBe(true);

// Teste 2: Componente renderiza apenas se autorizado
render(<RequirePermission permission="select__usuario"><div>Content</div></RequirePermission>);

// Teste 3: JSQL client bloqueia query não autorizada
await expect(executeJSQL({select: 'usuario'})).rejects.toThrow(PermissionDeniedError);

// Teste 4: Cache expira após TTL
// ... mock timer + validação
```

---

## 📋 Checklist de Implementação

### SQL Procedures
- [x] `sac.jsql__select__permissao`
- [x] `sac.jsql__select__permissao_efetiva`
- [x] `sac.jsql__select__papel`
- [x] `sac.jsql__mutate__papel`
- [x] `sac.jsql__mutate__papel_permissao`
- [x] `sac.jsql__mutate__usuario_papel`
- [x] `sac.jsql__mutate__usuario_permissao`

### Frontend Services
- [x] `services/permissionService.ts`
- [x] `stores/permissionStore.ts`

### Frontend Hooks
- [x] `hooks/usePermission.ts`
- [x] `hooks/useRequirePermission.ts`

### Frontend Components
- [x] `components/auth/RequirePermission.tsx`

### Frontend Core
- [x] `core/api/jsqlClient.ts` (permission validator)

### Testes
- [ ] Testes unitários SQL - **Arquivo:** `scripts/test-permissions-sql.py` (a criar)
- [ ] Testes unitários React - **Diretório:** `src/helpdesk/src/__tests__/` (a criar)
- [x] Testes de integração end-to-end - **Implementado:** `scripts/test-permissions-e2e.py`

---

## 🚀 Ordem de Execução

1. [x] **SQL Procedures** (Backend primeiro)
   - Criar todas as 7 procedures JSQL
   - Testar via SQL Server Management Studio

2. [x] **Frontend Services** (Camada de dados)
   - `permissionService.ts`
   - `permissionStore.ts`

3. [x] **Frontend Hooks** (Lógica de negócio)
   - `usePermission.ts`
   - `useRequirePermission.ts`

4. [x] **Frontend Components** (UI)
   - `RequirePermission.tsx`
   - `jsqlClient.ts` (middleware)

5. [x] **Testes** (Validação)
   - [x] Testes E2E: `scripts/test-permissions-e2e.py`
   - [ ] Testes unitários SQL: `scripts/test-permissions-sql.py` (a criar)
   - [ ] Testes unitários React: `src/helpdesk/src/__tests__/` (a criar)

6. [ ] **Documentação** (Atualização)
   - Atualizar README do helpdesk
   - Criar guia de uso para desenvolvedores

---

## 📊 Critérios de Sucesso

### Funcional
- [x] Permissões calculadas corretamente pela VIEW `TBpermissao_efetiva`
- [x] Administradores têm acesso total (bypass automático)
- [x] Frontend valida permissões antes de enviar queries
- [x] Cache funciona (Zustand in-memory, TTL 5min)
- [x] Componente `<RequirePermission>` oculta UI não autorizada
- [x] Rotas protegidas redirecionam se sem permissão

### Performance
- [x] Cache reduz chamadas ao banco (< 1 requisição/5min por usuário)
- [x] Validação local no frontend (< 1ms)
- [x] VIEW otimizada com índices

### Segurança
- [x] Validação dupla (frontend + banco)
- [x] Logs de auditoria (quem concedeu/revogou permissões)
- [x] Expiração automática de permissões temporárias
- [x] Impossível remover último administrador

---

## 📝 Notas Importantes

### Mapeamento JSQL → Permissões
```javascript
// Formato da query determina permissão necessária
{ select: "usuario" }                    → "select__usuario"
{ mutate: "chamado", action: "criar" }   → "mutate__chamado__criar"
{ mutate: "chamado", action: "editar" }  → "mutate__chamado__editar"
{ configure: "sla" }                     → "configure__sla"
```

### Redis
- ✅ **Implementado no N8N backend**
- Cache de autorização em `n8n/coletivos-autorizar.json`
- TTL atual: 30s (recomendado ajustar para 300s = 5min)
- Chave Redis: `auth:permission:{user_id}:{permission_code}`

### Compatibilidade
- [x] Sistema funciona com Redis - **Implementado:** Cache em `n8n/coletivos-autorizar.json` com TTL 30s (ajustar para 300s)
- ~~Sistema funciona com `REDIS_ENABLED=false`~~ - **Removido:** Sistema usa Redis no N8N, não Zustand no frontend
- ~~Fallback automático para cache in-memory~~ - **Removido:** Cache é responsabilidade do N8N backend

---

---

## 📚 Referências de Implementação

### Backend (SQL Server)
- **Procedures:** `database/schemata/sac/sac.jsql__*.sql`
- **VIEW:** `database/schemata/sac/sac.TBpermissao_efetiva.sql`
- **Tabelas:** `TBpermissao`, `TBpapel`, `TBusuario_papel`, `TBusuario_permissao`, `TBpapel_permissao`

### Backend (N8N Workflows)
- **Autenticação:** `n8n/coletivos-autenticar.json`
- **Autorização (com Redis):** `n8n/coletivos-autorizar.json` ← Cache TTL 30s
- **Requisição JSQL:** `n8n/coletivos-requisicao.json`
- **Auditoria:** `n8n/coletivos-auditoria.json` ← Registra erros na TBauditoria

### Frontend (React)
- **Service:** `src/helpdesk/src/core/api/permissionService.ts`
- **Store:** `src/helpdesk/src/core/stores/permissionStore.ts`
- **Hooks:** `src/helpdesk/src/core/hooks/usePermission.ts`, `useRequirePermission.ts`
- **Component:** `src/helpdesk/src/components/RequirePermission.tsx`
- **Client:** `src/helpdesk/src/core/api/jsqlClient.ts`

### Testes
- **E2E:** `scripts/test-permissions-e2e.py` ✅ Implementado
- **SQL:** `scripts/test-permissions-sql.py` ❌ A criar
- **React:** `src/helpdesk/src/__tests__/` ❌ A criar

### Documentação
- **Plano de Implementação:** `docs/Coletivos-HelpDesk/Especificação/09-Authorization-Implementation-Plan.md` (este arquivo)
- **Guia Completo:** `docs/Coletivos-HelpDesk/Especificação/07-Complete-Implementation-Guide.md`

---

**Documento criado:** 2025-10-02
**Última atualização:** 2025-10-02
**Responsável:** Desenvolvimento Coletivos HelpDesk
