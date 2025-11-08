# PLAN_2-State-Management-Zustand.md - Gerenciamento de Estado com Zustand

**Objetivo**: Implementar camada de state management centralizado usando Zustand para persistência local de configurações, com sincronização automática via SSE e TanStack Query.

**⚠️ DEPENDÊNCIA**: Requer PLAN_1-SSE-Anonymous.md completo (SSE funcionando)

---

## 📋 RESUMO EXECUTIVO

### Problemas Identificados
1. ❌ **Sem gerenciador de estado centralizado** - Apenas React Contexts dispersos
2. ❌ **localStorage fragmentado** - Chaves espalhadas sem namespace consistente
3. ❌ **Queries redundantes** - Cada component refaz mesmas queries JQEL
4. ⚠️ **Sem sincronização multi-aba** - Mudanças em uma aba não refletem em outras

### Solução (Baseada em Padrões)
- ✅ **Zustand Store** com persist middleware (localStorage automático)
- ✅ **Integração TanStack Query** (onSuccess atualiza Zustand)
- ✅ **SSE Invalidation** (eventos → invalidate → refetch → update store)
- ✅ **Redux DevTools** para debugging e time-travel

---

## 🎯 FASE 1: INSTALAÇÃO E SETUP

### 1.1. Instalar Dependências

- [ ] Navegar para `src/frontend`
- [ ] Instalar Zustand:
  ```bash
  npm install zustand
  ```
- [ ] Verificar package.json atualizado
- [ ] ✅ **Checkpoint**: Zustand instalado (versão ~4.x)

### 1.2. Criar Estrutura de Diretórios

- [ ] Criar `src/frontend/src/stores/`
- [ ] Criar `src/frontend/src/stores/index.ts` (barrel export)
- [ ] ✅ **Checkpoint**: Estrutura criada

---

## 🎯 FASE 2: CONFIGURAÇÃO DO CONFIGSTORE

### 2.1. Criar Interface TypeScript

- [ ] Criar `src/frontend/src/stores/configStore.ts`
- [ ] Definir tipos de dados:
  ```typescript
  import { Realm, Portal, Module, Instance } from '@/types';

  interface ThemeConfig {
    mode: 'light' | 'dark' | 'system';
    brandColor: string | null;
  }

  interface ConfigState {
    // Dados
    realms: Realm[];
    portals: Portal[];
    modules: Module[];
    instances: Instance[];
    theme: ThemeConfig;

    // Estados
    isLoaded: boolean;
    lastSync: number | null;

    // Actions
    setRealms: (realms: Realm[]) => void;
    setPortals: (portals: Portal[]) => void;
    setModules: (modules: Module[]) => void;
    setInstances: (instances: Instance[]) => void;
    setTheme: (theme: ThemeConfig) => void;

    // Helpers
    getRealmById: (realmId: string) => Realm | undefined;
    getPortalById: (portalId: string) => Portal | undefined;
    getPortalsByRealm: (realmId: string) => Portal[];

    // Cache management
    clearCache: () => void;
    markSynced: () => void;
  }
  ```
- [ ] ✅ **Checkpoint**: Tipos definidos

**Leitura de Referência**:
- `spec/pending-decisions/frontend-state-management.md` (seção 3.3)

### 2.2. Implementar Store Base

- [ ] Importar create do Zustand:
  ```typescript
  import { create } from 'zustand';
  ```
- [ ] Criar store:
  ```typescript
  export const useConfigStore = create<ConfigState>((set, get) => ({
    // Estado inicial
    realms: [],
    portals: [],
    modules: [],
    instances: [],
    theme: { mode: 'system', brandColor: null },
    isLoaded: false,
    lastSync: null,

    // Actions
    setRealms: (realms) => set({ realms, lastSync: Date.now() }),
    setPortals: (portals) => set({ portals, lastSync: Date.now() }),
    setModules: (modules) => set({ modules, lastSync: Date.now() }),
    setInstances: (instances) => set({ instances, lastSync: Date.now() }),
    setTheme: (theme) => set({ theme, lastSync: Date.now() }),

    // Helpers
    getRealmById: (realmId) => get().realms.find(r => r.realmId === realmId),
    getPortalById: (portalId) => get().portals.find(p => p.portalId === portalId),
    getPortalsByRealm: (realmId) => get().portals.filter(p => p.realmId === realmId),

    // Cache management
    clearCache: () => set({
      realms: [],
      portals: [],
      modules: [],
      instances: [],
      isLoaded: false,
      lastSync: null
    }),
    markSynced: () => set({ lastSync: Date.now() }),
  }));
  ```
- [ ] ✅ **Checkpoint**: Store básica funcional

### 2.3. Adicionar Persist Middleware

- [ ] Importar middleware:
  ```typescript
  import { persist } from 'zustand/middleware';
  ```
- [ ] Envolver store com persist:
  ```typescript
  export const useConfigStore = create<ConfigState>()(
    persist(
      (set, get) => ({
        // ... estado e actions
      }),
      {
        name: 'platform-config-storage', // localStorage key
        version: 1, // Schema version
        partialize: (state) => ({
          // Salvar apenas dados, não estados derivados
          realms: state.realms,
          portals: state.portals,
          modules: state.modules,
          instances: state.instances,
          theme: state.theme,
          lastSync: state.lastSync,
        }),
      }
    )
  );
  ```
- [ ] ✅ **Checkpoint**: Dados persistem em localStorage

### 2.4. Adicionar DevTools (Dev Only)

- [ ] Importar devtools middleware:
  ```typescript
  import { devtools } from 'zustand/middleware';
  ```
- [ ] Adicionar camada de devtools:
  ```typescript
  export const useConfigStore = create<ConfigState>()(
    devtools(
      persist(
        (set, get) => ({ /* ... */ }),
        { name: 'platform-config-storage' }
      ),
      { name: 'ConfigStore', enabled: import.meta.env.DEV }
    )
  );
  ```
- [ ] ✅ **Checkpoint**: DevTools habilitado em desenvolvimento

### 2.5. Testar Fase 2 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Store Inicial**
  - [ ] Criar componente de teste: `<ConfigStoreTest />`
  - [ ] Ler estado: `const realms = useConfigStore(state => state.realms);`
  - [ ] Verificar array vazio inicialmente
  - [ ] ✅ **Verificar**: Store acessível

- [ ] **Teste 2: Persistência**
  - [ ] Chamar `setRealms([{ realmId: 'test', name: 'Test' }])`
  - [ ] Verificar DevTools → Application → Local Storage
  - [ ] Chave: `platform-config-storage`
  - [ ] Valor: JSON com realms
  - [ ] Recarregar página (F5)
  - [ ] Verificar dados ainda existem
  - [ ] ✅ **Resultado**: Persistência funciona

- [ ] **Teste 3: Redux DevTools**
  - [ ] Instalar extensão Redux DevTools no navegador
  - [ ] Abrir DevTools → Redux
  - [ ] Executar action: `setPortals([...])`
  - [ ] Verificar action aparece no log
  - [ ] ✅ **Verificar**: Time-travel debugging funciona

**✅ CHECKPOINT FASE 2**: ConfigStore criada com persist e devtools

---

## 🎯 FASE 3: INTEGRAÇÃO COM TANSTACK QUERY

### 3.1. Criar Custom Hooks de Query

- [ ] Criar `src/frontend/src/hooks/useConfigQuery.ts`
- [ ] Implementar `useRealmsQuery`:
  ```typescript
  import { useQuery, useQueryClient } from '@tanstack/react-query';
  import { useConfigStore } from '@/stores/configStore';
  import { jqel } from '@/services/jqel';

  export function useRealmsQuery() {
    const setRealms = useConfigStore(state => state.setRealms);

    return useQuery({
      queryKey: ['realms'],
      queryFn: async () => {
        const result = await jqel({
          schema: 'backend',
          select: 'realm',
        });
        return result.data || [];
      },
      onSuccess: (data) => {
        setRealms(data); // Atualiza Zustand
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    });
  }
  ```
- [ ] Implementar `usePortalsQuery` (similar)
- [ ] Implementar `useModulesQuery` (similar)
- [ ] ✅ **Checkpoint**: Queries atualizam Zustand automaticamente

**Código de Referência**:
```typescript
export function usePortalsQuery() {
  const setPortals = useConfigStore(state => state.setPortals);

  return useQuery({
    queryKey: ['portals'],
    queryFn: async () => {
      const result = await jqel({
        schema: 'backend',
        select: 'portal',
      });
      return result.data || [];
    },
    onSuccess: (data) => {
      setPortals(data);
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

### 3.2. Criar Mutation Hooks com Optimistic Updates

- [ ] Implementar `useUpdateRealmMutation`:
  ```typescript
  import { useMutation, useQueryClient } from '@tanstack/react-query';
  import { useConfigStore } from '@/stores/configStore';

  export function useUpdateRealmMutation() {
    const queryClient = useQueryClient();
    const setRealms = useConfigStore(state => state.setRealms);

    return useMutation({
      mutationFn: async ({ realmId, data }: { realmId: string; data: Partial<Realm> }) => {
        // Optimistic update no Zustand
        const currentRealms = useConfigStore.getState().realms;
        const optimisticRealms = currentRealms.map(r =>
          r.realmId === realmId ? { ...r, ...data } : r
        );
        setRealms(optimisticRealms);

        // Mutation JQEL
        return await jqel({
          schema: 'backend',
          mutate: 'realm',
          action: 'update',
          values: data,
          where: { realmId: { $eq: realmId } },
        });
      },
      onSuccess: () => {
        // Backend emitirá SSE, que invalidará a query
        queryClient.invalidateQueries(['realms']);
      },
      onError: () => {
        // Reverte optimistic update
        queryClient.invalidateQueries(['realms']);
      },
    });
  }
  ```
- [ ] Implementar mutations para Portal, Module, Instance
- [ ] ✅ **Checkpoint**: Mutations com optimistic updates funcionam

### 3.3. Migrar Components para Zustand

- [ ] Identificar components que usam `usePortal()` diretamente
- [ ] Substituir por leitura do Zustand:
  ```typescript
  // ANTES
  const { data: portalResult } = usePortal(portalId);
  const portal = portalResult?.data?.[0];

  // DEPOIS
  const portal = useConfigStore(state => state.getPortalById(portalId!));
  ```
- [ ] Garantir query inicial: `usePortalsQuery()` no componente raiz
- [ ] ✅ **Checkpoint**: Components leem de Zustand, não de queries diretas

**Leitura de Referência**:
- `spec/pending-decisions/frontend-state-management.md` (seção 3.4)

### 3.4. Testar Fase 3 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Query → Zustand**
  - [ ] Limpar localStorage
  - [ ] Recarregar app
  - [ ] Verificar query dispara automaticamente
  - [ ] Verificar Zustand populado com dados
  - [ ] ✅ **Verificar**: Dados fluem JQEL → Query → Zustand

- [ ] **Teste 2: Optimistic Update**
  - [ ] Editar nome de um portal
  - [ ] Verificar UI atualiza IMEDIATAMENTE
  - [ ] Verificar mutation completa em background
  - [ ] Se falhar, verificar rollback
  - [ ] ✅ **Resultado**: UX instantâneo

- [ ] **Teste 3: Cache Hit**
  - [ ] Abrir lista de portais (query dispara)
  - [ ] Navegar para outra página
  - [ ] Voltar para lista de portais
  - [ ] Verificar dados vêm do Zustand (sem query)
  - [ ] ✅ **Verificar**: Performance melhorada

**✅ CHECKPOINT FASE 3**: TanStack Query integrado com Zustand

---

## 🎯 FASE 4: SINCRONIZAÇÃO VIA SSE

### 4.1. Atualizar Hook useSSE

- [ ] Abrir `src/frontend/src/hooks/useSSE.ts`
- [ ] Localizar handler `config-changed`
- [ ] Verificar invalidação de queries:
  ```typescript
  else if (event.type === 'config-changed' && 'data' in event) {
    const { entity, entityId, action } = event.data;

    if (entity === 'realm') {
      queryClient.invalidateQueries({ queryKey: ['realms'] });
      if (action !== 'create') {
        queryClient.invalidateQueries({ queryKey: ['realm', entityId] });
      }
    } else if (entity === 'portal') {
      queryClient.invalidateQueries({ queryKey: ['portals'] });
    }
    // ... outros
  }
  ```
- [ ] TanStack Query refetch → onSuccess → atualiza Zustand (automático)
- [ ] ✅ **Checkpoint**: SSE invalida queries que atualizam Zustand

### 4.2. Implementar Storage Event Listener

- [ ] Criar `src/frontend/src/hooks/useStorageSync.ts`:
  ```typescript
  import { useEffect } from 'react';
  import { useConfigStore } from '@/stores/configStore';

  export function useStorageSync() {
    useEffect(() => {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'platform-config-storage' && e.newValue) {
          // Outra aba atualizou o store
          const newState = JSON.parse(e.newValue);
          useConfigStore.setState(newState.state);
        }
      };

      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }, []);
  }
  ```
- [ ] Adicionar hook no componente raiz (`App.tsx`):
  ```typescript
  useStorageSync();
  ```
- [ ] ✅ **Checkpoint**: Mudanças sincronizam entre abas

### 4.3. Adicionar Timestamp de Sincronização

- [ ] Criar método `getLastSync()` no store:
  ```typescript
  getLastSync: () => {
    const lastSync = get().lastSync;
    if (!lastSync) return 'Nunca';

    const diff = Date.now() - lastSync;
    if (diff < 60000) return 'Agora há pouco';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutos atrás`;
    return new Date(lastSync).toLocaleString();
  }
  ```
- [ ] Exibir em algum lugar da UI (footer, settings)
- [ ] ✅ **Checkpoint**: User sabe quando foi última sincronização

### 4.4. Testar Fase 4 Completa

**Checklist de Testes**:
- [ ] **Teste 1: SSE → Zustand**
  - [ ] Abrir DevTools → Redux
  - [ ] Criar portal em outra aba
  - [ ] Verificar action `setPortals` dispara automaticamente
  - [ ] Verificar UI atualiza sem F5
  - [ ] ✅ **Verificar**: Sincronização automática via SSE

- [ ] **Teste 2: Multi-Aba Sincronização**
  - [ ] Abrir 2 abas do app
  - [ ] Editar realm na Aba 1
  - [ ] Verificar Aba 2 atualiza automaticamente
  - [ ] Verificar storage event disparado
  - [ ] ✅ **Resultado**: Abas sincronizadas

- [ ] **Teste 3: Offline → Online**
  - [ ] Desconectar SSE (simular offline)
  - [ ] Editar configurações
  - [ ] Reconectar SSE
  - [ ] Verificar queries invalidam e refetch
  - [ ] Verificar Zustand atualizado com dados do servidor
  - [ ] ✅ **Verificar**: Resiliência a desconexões

**✅ CHECKPOINT FASE 4**: SSE sincroniza Zustand automaticamente

---

## 🎯 FASE 5: MIGRAÇÃO DO THEMECONTEXT

### 5.1. Mover Lógica de Tema para Zustand

- [ ] Adicionar slice de tema no ConfigStore:
  ```typescript
  // Já existe no estado
  theme: { mode: 'system', brandColor: null },

  // Adicionar actions específicas
  setThemeMode: (mode: 'light' | 'dark' | 'system') =>
    set(state => ({ theme: { ...state.theme, mode } })),

  setBrandColor: (color: string | null) =>
    set(state => ({ theme: { ...state.theme, brandColor: color } })),

  toggleTheme: () =>
    set(state => ({
      theme: {
        ...state.theme,
        mode: state.theme.mode === 'dark' ? 'light' : 'dark'
      }
    })),
  ```
- [ ] ✅ **Checkpoint**: Actions de tema no Zustand

### 5.2. Criar Hook useTheme

- [ ] Criar `src/frontend/src/hooks/useTheme.ts`:
  ```typescript
  import { useConfigStore } from '@/stores/configStore';
  import { useEffect } from 'react';

  export function useTheme() {
    const { theme, setThemeMode, setBrandColor, toggleTheme } = useConfigStore(
      state => ({
        theme: state.theme,
        setThemeMode: state.setThemeMode,
        setBrandColor: state.setBrandColor,
        toggleTheme: state.toggleTheme,
      })
    );

    // Auto-detect system preference
    useEffect(() => {
      if (theme.mode === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
          document.documentElement.classList.toggle('dark', mediaQuery.matches);
        };

        handleChange();
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        document.documentElement.classList.toggle('dark', theme.mode === 'dark');
      }
    }, [theme.mode]);

    return { theme, setThemeMode, setBrandColor, toggleTheme };
  }
  ```
- [ ] ✅ **Checkpoint**: Hook de tema funcional

### 5.3. Remover ThemeContext Antigo

- [ ] Identificar components que usam `useThemeContext()`
- [ ] Substituir por `useTheme()` do Zustand
- [ ] Deletar `src/frontend/src/contexts/ThemeContext.tsx`
- [ ] Remover Provider do `App.tsx`
- [ ] ✅ **Checkpoint**: ThemeContext migrado para Zustand

### 5.4. Testar Fase 5 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Toggle Tema**
  - [ ] Alternar light/dark
  - [ ] Verificar UI muda imediatamente
  - [ ] Recarregar página
  - [ ] Verificar tema persiste
  - [ ] ✅ **Verificar**: Tema funciona via Zustand

- [ ] **Teste 2: System Mode**
  - [ ] Configurar tema: "system"
  - [ ] Mudar preferência do OS (dark/light)
  - [ ] Verificar app acompanha
  - [ ] ✅ **Resultado**: Auto-detect funciona

**✅ CHECKPOINT FASE 5**: Tema gerenciado por Zustand

---

## 📊 CHECKLIST GERAL DE VALIDAÇÃO

### ✅ Funcionalidades Implementadas

- [ ] **ConfigStore (Zustand)**
  - [ ] Estado: realms, portals, modules, instances, theme
  - [ ] Actions: set*, get*, helpers
  - [ ] Persist middleware (localStorage)
  - [ ] DevTools middleware (dev only)

- [ ] **Integração TanStack Query**
  - [ ] Custom hooks: useRealmsQuery, usePortalsQuery, etc.
  - [ ] Mutations com optimistic updates
  - [ ] onSuccess atualiza Zustand

- [ ] **Sincronização**
  - [ ] SSE invalida queries → refetch → Zustand
  - [ ] Storage events sincronizam abas
  - [ ] Timestamp de última sincronização

- [ ] **Migração de Tema**
  - [ ] ThemeContext removido
  - [ ] useTheme hook do Zustand
  - [ ] Auto-detect system preference

### ✅ Testes de Integração

- [ ] **Fluxo Completo: JQEL → Query → Zustand → UI**
  1. [ ] Limpar localStorage
  2. [ ] Abrir app
  3. [ ] Queries disparam automaticamente
  4. [ ] Zustand populado
  5. [ ] UI renderiza dados
  6. [ ] Criar novo portal
  7. [ ] SSE → invalidate → refetch → Zustand
  8. [ ] UI atualiza sem reload

- [ ] **Fluxo Multi-Aba**
  1. [ ] Abrir 2 abas
  2. [ ] Editar configuração na Aba 1
  3. [ ] Aba 2 recebe storage event
  4. [ ] Zustand sincronizado
  5. [ ] UI de ambas atualizadas

- [ ] **Fluxo Optimistic Update**
  1. [ ] Editar nome de portal
  2. [ ] UI atualiza IMEDIATAMENTE (Zustand)
  3. [ ] Mutation roda em background
  4. [ ] SSE confirma mudança
  5. [ ] Zustand atualizado com dado real

### ✅ Verificações de Código

- [ ] TypeScript sem erros (`npm run type-check`)
- [ ] Build sem warnings (`npm run build`)
- [ ] Redux DevTools funciona (action log, time-travel)
- [ ] localStorage com chave `platform-config-storage`
- [ ] Storage events entre abas (DevTools → Application → Storage)

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais
- **Zustand vs Redux**: Escolhido pela simplicidade, menos boilerplate, TypeScript nativo
- **Persist em localStorage**: sessionStorage descartado, preferimos persistência entre sessões
- **onSuccess em queries**: Padrão para atualizar Zustand, evita duplicação de lógica
- **Optimistic updates**: Melhor UX, rollback automático em caso de erro
- **Storage events**: Sincronização multi-aba sem polling ou SSE duplicado

### Limitações Conhecidas
- **localStorage limite 5-10MB**: Não cachear listas grandes (usar pagination)
  - Mitigação: Apenas configurações essenciais no Zustand
  - Alternativa futura: IndexedDB para dados maiores
- **onSuccess deprecated no React Query v5**: Migrar para `queryClient.setQueryData()` no futuro
  - Mitigação: Funciona por enquanto, planejar migração
- **Storage events não disparam na mesma aba**: Por design do browser
  - Mitigação: Zustand já sincroniza internamente, não é problema

### Referências
- `spec/pending-decisions/frontend-state-management.md` - Análise completa e comparação com Vuex
- Zustand Docs: https://github.com/pmndrs/zustand
- Persist Middleware: https://docs.pmnd.rs/zustand/integrations/persisting-store-data
- TanStack Query: https://tanstack.com/query/latest
- Storage Events: https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
