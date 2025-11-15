# Plano: Módulo Blueprint + Sistema de Homepage

## 1. Criar Módulo Blueprint (Single-Instance)

**Estrutura:**
```
src/frontend/src/modules/blueprint/
├── assets/
│   └── banner.svg                    # Asset de exemplo
├── components/
│   └── BlueprintCard.tsx            # Componente que usa asset
├── pages/
│   └── BlueprintPage.tsx            # Página principal (/ola)
├── hooks/
│   └── useBlueprintConfig.ts        # Hook para buscar config via JQEL
├── types/
│   └── index.ts                     # Types da config
├── manifest.ts                      # singleInstance: true
├── routes.tsx                       # Rota /ola fixa
├── index.ts                         # Auto-registro
└── README.md                        # 📘 Documentação de padrões
```

**README.md:** Documentar padrões de criação de módulos:
- Estrutura de pastas obrigatória
- Como usar JQEL (nunca criar rotas no backend)
- Como importar assets (path relativo)
- Single vs Multi-instance
- Lazy-loading de componentes
- Auto-registro no moduleRegistry

**BlueprintPage:** Exibir:
- Banner SVG importado de assets
- Dados da config da instância (via JQEL)
- Botão "Usar como homepage do portal"
- Exemplos de código comentados

## 2. Sistema de Homepage do Portal

### 2.1. Backend: Adicionar campo `homepage` em Portal

**Arquivo:** `src/backend/config/portals.json`

Adicionar campo:
```typescript
{
  portalId: string;
  name: string;
  // ... campos existentes
  homepage?: {
    type: 'none' | 'subroute';
    value?: string;  // Ex: "/ola"
  };
}
```

### 2.2. Backend: Tipos TypeScript

**Arquivo:** `src/types/portal.ts`

Atualizar interface `Portal` com campo `homepage`.

### 2.3. Frontend: Hook de Homepage

**Arquivo:** `src/hooks/usePortalHomepage.ts`

Criar hook para:
- Buscar homepage config via `usePortal()`
- Mutation para atualizar homepage

### 2.4. Frontend: PortalRouter - Redirect Logic

**Arquivo:** `src/components/routing/PortalRouter.tsx`

Adicionar lógica:
```typescript
if (portal.homepage?.type === 'subroute' && portal.homepage.value) {
  // Adicionar redirect na rota index "/"
  <Route path="/" element={<Navigate to={portal.homepage.value} replace />} />
}
```

### 2.5. Frontend: UI de Configuração de Homepage

**Arquivo:** `src/modules/setup/pages/PortalEdit.tsx` (ou similar)

Adicionar seção:
- Radio buttons: Nenhum / Subrota / Componente (desativado)
- Input de texto para subrota quando selecionado
- Salvar via JQEL mutation

## 3. Feature: "Usar como Homepage"

**Arquivo:** `src/modules/blueprint/components/HomepageToggle.tsx`

Componente que:
- Busca portal atual via `useCurrentPortal()`
- Verifica se `/ola` já é homepage
- Botão toggle para ativar/desativar
- Ao ativar: JQEL mutation atualizando `portal.homepage = { type: 'subroute', value: '/ola' }`
- Ao desativar: JQEL mutation setando `portal.homepage = { type: 'none' }`
- Toast de feedback

## 4. Ativação do Módulo

**Arquivo:** `src/frontend/src/modules/index.ts`

Adicionar:
```typescript
export const ACTIVE_MODULES = [
  'setup',
  'auth',
  'chatify',
  'blueprint',  // ← Novo
] as const;

import './blueprint';  // ← Auto-registro
```

**Arquivo:** `src/backend/config/modules.json`

Adicionar metadados do blueprint.

**Arquivo:** `src/backend/config/instances.json`

Adicionar instância default:
```json
{
  "instanceId": "default",
  "portalId": "setup",
  "moduleId": "blueprint",
  "config": {},
  "active": true
}
```

## Resumo das Mudanças

- ✅ 11 novos arquivos (módulo blueprint)
- ✅ 1 README.md com padrões de desenvolvimento
- ✅ 3 arquivos modificados (portals.json schema, PortalRouter, types)
- ✅ 2 arquivos de config atualizados (modules.json, instances.json)
- ✅ Sistema de homepage totalmente funcional
