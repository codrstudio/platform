# DESIGN_REFACT.md - Refatoração de Hooks JQEL

**Objetivo**: Organizar hooks JQEL por entidade e centralizar tipos do schema backend, eliminando duplicação e preparando estrutura escalável.

---

## 📋 PROBLEMA IDENTIFICADO

### Situação Atual

**Arquivo `hooks/useJQEL.ts` (407 linhas):**
- Linhas 1-169: Hooks base e conveniência (correto) ✅
- Linhas 175-228: Tipos de domínio (Realm, Portal, Module, Instance) ❌
- Linhas 230-407: Hooks de domínio (usePortals, useRealms, etc.) ❌

**Problemas:**
1. **Tipos duplicados** em múltiplos arquivos:
   - `Portal` definido em: `types/portal.ts` (completo), `useJQEL.ts` (incompleto), `useConfig.ts`
   - `Instance` definido em: `types/module.ts` (ModuleInstance), `useJQEL.ts`, `useConfig.ts`
2. **Arquivo muito grande** (407 linhas) - mistura responsabilidades
3. **Falta tipos centralizados** para `Realm` e `BackendModule`
4. **Falta organização temática** - hooks de diferentes domínios no mesmo arquivo

---

## 🎯 SOLUÇÃO PROPOSTA

### Princípios de Design

1. **Um tipo por arquivo** - escalável e organizado
2. **Hooks por entidade** - clara separação de responsabilidades
3. **useJQEL.ts focado** - apenas hooks base de conformidade TanStack
4. **Tipos refletem backend** - 1:1 com `backend/config/*.json`
5. **SDL via JQEL** - não criar rotas, usar `{ schema: "system", select: "sdl" }`

---

## 📂 ESTRUTURA DE TIPOS (1 arquivo por entidade)

### Backend Schema - Tipos Centralizados

Correspondem às entidades em `src/backend/config/*.json`:

```
types/
├── portal.ts            # [MANTER] Portal (já completo com homepage)
├── module.ts            # [ATUALIZAR] BackendModule + re-export Instance
├── instance.ts          # [NOVO] Re-export ModuleInstance
├── realm.ts             # [NOVO] Realm
├── login-branding.ts    # [MANTER] LoginBranding (já existe)
```

**Justificativa:**
- ✅ Escalável - adicionar nova entidade = criar novo arquivo
- ✅ Sem duplicação - cada tipo tem 1 fonte de verdade
- ✅ Claro - nome do arquivo = entidade do backend

### Detalhamento dos Arquivos

**`types/realm.ts`** (novo):
```typescript
export interface Realm {
  realmId: string
  name: string
  description?: string
  removable: boolean
  config?: {
    theme?: {
      mode?: 'light' | 'dark' | 'system'
      brandColor?: string
      radius?: string
    }
  }
  metadata?: Record<string, unknown>
}
```

**`types/instance.ts`** (novo):
```typescript
// Re-export simples
export type { ModuleInstance as Instance } from './module'
```

**`types/module.ts`** (atualizar):
```typescript
// Renomear Module → BackendModule (evita conflito com ModuleExports)
export interface BackendModule {
  moduleId: string
  name: string
  description?: string
  type: 'component' | 'functionality'
  category?: 'system' | 'business' | 'productivity' | 'communication'
  dependencies: string[]
  version: string
  enabled: boolean
  singleInstance?: boolean
  metadata?: Record<string, unknown>
}

// Já existe ModuleInstance, adicionar re-export
export type Instance = ModuleInstance
```

**`types/portal.ts`** (manter):
- Já está completo com campo `homepage`
- Não requer mudanças

**`types/login-branding.ts`** (manter):
- Já existe e está correto
- Não requer mudanças

---

## 🪝 ESTRUTURA DE HOOKS (1 arquivo por entidade)

### Hooks JQEL Organizados

```
hooks/
├── useJQEL.ts           # [LIMPAR] Hooks base apenas
└── jqel/                # [NOVA PASTA]
    ├── usePortal.ts     # Portal CRUD + helpers
    ├── useModule.ts     # BackendModule CRUD
    ├── useInstance.ts   # Instance CRUD
    ├── useRealm.ts      # Realm CRUD
    ├── usePortalConfig.ts  # Context-aware
    └── useSchema.ts     # SDL via JQEL
```

### Detalhamento dos Hooks

**`hooks/jqel/usePortal.ts`** (novo):
- **CRUD**: `usePortals()`, `usePortal(id)`, `useCreatePortal()`, `useUpdatePortal()`, `useDeletePortal()`
- **Helpers**:
  - `usePortalExists(id)` - migrado de `hooks/usePortalExists.ts`
  - `usePortalHomepage(id)` - migrado de `hooks/usePortalHomepage.ts`
- **Imports**: `import type { Portal } from '@/types/portal'`

**`hooks/jqel/useModule.ts`** (novo):
- **CRUD**: `useModules()`, `useModule(id)`, `usePortalModules(portalId)`
- **Imports**: `import type { BackendModule } from '@/types/module'`

**`hooks/jqel/useInstance.ts`** (novo):
- **CRUD**: `useInstances()`, `useInstance()`, `useCreateInstance()`, `useUpdateInstance()`, `useDeleteInstance()`
- **Imports**: `import type { Instance } from '@/types/instance'`

**`hooks/jqel/useRealm.ts`** (novo):
- **CRUD**: `useRealms()`, `useRealm(id)`, `useCreateRealm()`, `useUpdateRealm()`, `useDeleteRealm()`
- **Imports**: `import type { Realm } from '@/types/realm'`

**`hooks/jqel/usePortalConfig.ts`** (renomear):
- Migrar `hooks/useConfig.ts` → `hooks/jqel/usePortalConfig.ts`
- Remover tipos duplicados (Portal, Instance)
- Importar de `@/types/portal` e `@/types/instance`
- **Context-aware**: detecta portal pela URL automaticamente

**`hooks/jqel/useSchema.ts`** (migrar):
- Migrar `hooks/useSchemaDiscovery.ts` → `hooks/jqel/useSchema.ts`
- **MUDAR**: `fetch('/api/jqel/schemas')` → `useJQELQuery({ schema: "system", select: "sdl" })`
- Manter helpers e tipos SDL

**`hooks/useJQEL.ts`** (limpar):
- **REMOVER**: Tipos de domínio (linhas 175-228)
- **REMOVER**: Hooks de domínio (linhas 230-407)
- **MANTER**: Hooks base (`useJQELQuery`, `useJQELMutation`)
- **MANTER**: Hooks conveniência (`useJQELList`, `useJQELDetail`, `useJQELInsert`, `useJQELUpdate`, `useJQELDelete`)
- **Resultado**: 407 → 170 linhas (redução de 58%)

---

## 🔧 BACKEND - SDL VIA JQEL

### Implementação de `{ schema: "system", select: "sdl" }`

**Problema Atual:**
- `useSchemaDiscovery.ts` usa `fetch('/api/jqel/schemas')` - endpoint não implementado via JQEL ❌

**Solução:**
- Adicionar entidade `sdl` no handler do backend schema
- Usar `SchemaDiscoveryService` existente para retornar SDL document

**Arquivo:** `src/backend/src/routes/jqel.routes.ts`

**Mudanças:**

1. **Importar SchemaDiscoveryService** (linha ~6):
```typescript
import { schemaDiscoveryService } from '../services/SchemaDiscoveryService.js'
```

2. **Validação de entidades** (linha ~95):
```typescript
// Adicionar 'sdl' na lista
if (!['portal', 'portals', 'module', 'modules', 'instance', 'instances', 'realm', 'realms', 'login-branding', 'sdl'].includes(entity!)) {
```

3. **Handler SELECT** (linha ~127):
```typescript
case 'sdl':
  const document = await schemaDiscoveryService.getSchemas()
  data = [document] // SDL retorna array com 1 documento
  break
```

**Nota:** SDL é read-only (sem INSERT/UPDATE/DELETE)

---

## 📦 ARQUIVOS A DELETAR

Após migração, deletar arquivos antigos:
- `hooks/useConfig.ts` → migrado para `jqel/usePortalConfig.ts`
- `hooks/usePortalExists.ts` → integrado em `jqel/usePortal.ts`
- `hooks/usePortalHomepage.ts` → integrado em `jqel/usePortal.ts`
- `hooks/useSchemaDiscovery.ts` → migrado para `jqel/useSchema.ts`

---

## 🔄 ATUALIZAÇÃO DE IMPORTS

### Padrão de Substituição

Buscar e substituir em todo o projeto frontend:

**useConfig:**
```typescript
// Antes
import { useConfig } from '@/hooks/useConfig'

// Depois
import { usePortalConfig } from '@/hooks/jqel/usePortalConfig'
```

**usePortalExists:**
```typescript
// Antes
import { usePortalExists } from '@/hooks/usePortalExists'

// Depois
import { usePortalExists } from '@/hooks/jqel/usePortal'
```

**usePortalHomepage:**
```typescript
// Antes
import { usePortalHomepage } from '@/hooks/usePortalHomepage'

// Depois
import { usePortalHomepage } from '@/hooks/jqel/usePortal'
```

**useSchemaDiscovery:**
```typescript
// Antes
import { useSchemaDiscovery } from '@/hooks/useSchemaDiscovery'

// Depois
import { useSchemaDiscovery } from '@/hooks/jqel/useSchema'
```

**Hooks de backend do useJQEL:**
```typescript
// Antes
import { usePortals, useRealms } from '@/hooks/useJQEL'

// Depois
import { usePortals } from '@/hooks/jqel/usePortal'
import { useRealms } from '@/hooks/jqel/useRealm'
```

---

## ✅ BENEFÍCIOS DA REFATORAÇÃO

1. **Eliminação de duplicação** - cada tipo definido 1 vez
2. **Separação clara** - useJQEL.ts focado em conformidade TanStack
3. **Organização temática** - hooks agrupados por entidade
4. **Escalabilidade** - adicionar nova entidade = 2 arquivos (type + hook)
5. **Padrão estabelecido** - modelo para futuros hooks (useChat, useOrganization, etc.)
6. **Redução de tamanho** - useJQEL.ts: 407 → 170 linhas (-58%)
7. **Alinhamento backend** - tipos 1:1 com `backend/config/*.json`

---

## 📊 ESTRUTURA FINAL

```
src/
├── backend/
│   ├── config/
│   │   ├── portals.json         # ← Portal type
│   │   ├── modules.json         # ← BackendModule type
│   │   ├── instances.json       # ← Instance type
│   │   ├── realms.json          # ← Realm type
│   │   └── login-branding.json  # ← LoginBranding type
│   ├── routes/
│   │   └── jqel.routes.ts       # [ATUALIZAR] + case 'sdl'
│   └── services/
│       └── SchemaDiscoveryService.ts  # [USAR] para SDL
│
└── frontend/
    ├── types/
    │   ├── portal.ts            # [MANTER] Portal
    │   ├── module.ts            # [ATUALIZAR] + BackendModule, Instance
    │   ├── instance.ts          # [NOVO] Re-export Instance
    │   ├── realm.ts             # [NOVO] Realm
    │   └── login-branding.ts    # [MANTER] LoginBranding
    │
    └── hooks/
        ├── useJQEL.ts           # [LIMPAR] 407→170 linhas
        └── jqel/                # [NOVA PASTA]
            ├── usePortal.ts     # [NOVO] Portal + helpers
            ├── useModule.ts     # [NOVO] BackendModule
            ├── useInstance.ts   # [NOVO] Instance
            ├── useRealm.ts      # [NOVO] Realm
            ├── usePortalConfig.ts  # [MIGRAR] useConfig
            └── useSchema.ts     # [MIGRAR] useSchemaDiscovery + JQEL
```
