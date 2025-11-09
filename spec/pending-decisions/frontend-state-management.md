# Decisão Pendente: Gerenciamento de Estado no Frontend (Zustand)

**Data:** 2025-11-07
**Status:** Proposta - Aguardando Implementação
**Prioridade:** Alta
**Relacionado:** `spec/SPEC-frontend-state.md`, `spec/SPEC-data-access.md`, `spec/SPEC-events.md`

---

## 1. CONTEXTO

Durante a análise da implementação do módulo Setup, identificamos que:

1. **Não existe gerenciador de estado centralizado no frontend**
   - Apenas React Contexts dispersos
   - Sem biblioteca de state management (Zustand, Redux, Jotai, etc.)

2. **Problema identificado:**
   - Configurações (portais, ambientes, temas) carregadas repetidamente
   - localStorage fragmentado com chaves dispersas
   - Sem sincronização automática entre abas
   - Risco de cache desatualizado vs backend

3. **Necessidade:**
   - Camada de persistência client-side para configurações
   - Cache local que sincroniza com backend (JQEL)
   - Invalidação automática via SSE
   - Performance melhorada (menos chamadas JQEL)

---

## 2. ESTADO ATUAL

### 2.1 Investigação do Frontend

**Arquivo analisado:** `src/frontend/package.json`

**Dependências de estado encontradas:**
- ✅ `@tanstack/react-query` - Cache e sincronização async
- ✅ `react` - Contexts nativos
- ❌ **Nenhuma biblioteca de state management**
  - Sem Zustand
  - Sem Redux/Redux Toolkit
  - Sem Jotai
  - Sem Recoil
  - Sem MobX

### 2.2 Padrão Atual de State Management

**React Contexts existentes:**

1. **ThemeContext** (`src/frontend/src/contexts/ThemeContext.tsx`)
   - Gerencia modo (light/dark/system)
   - Armazena brand color
   - Usa localStorage direto: `theme-mode`, `realm:{realmId}:brand-color`

2. **Outros contexts (inferidos):**
   - Provavelmente AuthContext para autenticação
   - Possível PortalContext para portal atual

**Problema com abordagem atual:**
```typescript
// ThemeContext usa localStorage diretamente
const storedMode = localStorage.getItem('theme-mode') || 'system';

// PortalModules usa TanStack Query direto
const { data: portalResult } = usePortal(portalId!);

// Sem camada intermediária de cache local
// Sem sincronização entre componentes
```

### 2.3 localStorage Fragmentado

**Chaves encontradas (atuais):**
- `theme-mode` - Modo do tema global
- `realm:{realmId}:brand-color` - Cor do ambiente
- `portal:{portalId}:brand-color` - Cor customizada do portal (sem realmId)

**Problema:**
- Sem namespace consistente
- Sem versionamento de schema
- Sem TTL ou expiração
- Difícil limpar cache completo
- Sem sincronização entre abas

---

## 3. PROPOSTA: ZUSTAND + TANSTACK QUERY + SSE

### 3.1 Arquitetura em 3 Camadas

```
┌──────────────────────────────────────────────┐
│ COMPONENTS (React)                           │
│ - useConfigStore() hook                      │
│ - Lê estado reativo do Zustand               │
└──────────────────────────────────────────────┘
                    ↕
┌──────────────────────────────────────────────┐
│ ZUSTAND STORE (Estado Local)                 │
│ - realms: Realm[]                            │
│ - portals: Portal[]                          │
│ - modules: Module[]                          │
│ - theme: ThemeConfig                         │
│ - Persiste em localStorage                   │
└──────────────────────────────────────────────┘
         ↓ fetch via          ↑ invalidate via
      TanStack Query             SSE events
         ↓                          ↑
┌──────────────────────────────────────────────┐
│ BACKEND (JQEL)                               │
│ - Fonte da verdade                           │
│ - Emite eventos config-changed               │
└──────────────────────────────────────────────┘
```

### 3.2 Fluxo de Dados

#### Leitura (Optimistic)
```
1. Component chama useConfigStore().portals
2. Zustand retorna estado local (se existir)
3. Se não existir, dispara fetch via TanStack Query
4. TanStack Query chama JQEL
5. Resultado salvo no Zustand + localStorage
6. Component re-renderiza com dados
```

#### Escrita
```
1. Component chama updatePortal(portalId, data)
2. Zustand atualiza estado local (optimistic update)
3. TanStack Query mutation chama JQEL
4. Se sucesso: Backend emite SSE config-changed
5. SSE invalida query → refetch
6. Zustand atualiza com dados confirmados
7. Se erro: Zustand reverte estado local
```

#### Sincronização (SSE)
```
1. Backend emite: { type: 'config-changed', data: { entity: 'portal', entityId: 'main' } }
2. useSSE hook recebe evento
3. Invalida TanStack Query: queryClient.invalidateQueries(['portal', 'main'])
4. Query refetch automático
5. onSuccess atualiza Zustand
6. Todos os components reativos re-renderizam
```

### 3.3 Estrutura do ConfigStore (Zustand)

**Arquivo:** `src/frontend/src/stores/configStore.ts`

```typescript
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

const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
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

### 3.4 Integração com TanStack Query

**Custom Hook:** `useConfigQuery.ts`

```typescript
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

### 3.5 Integração com SSE

**Atualização em:** `src/frontend/src/hooks/useSSE.ts`

```typescript
// No handler de config-changed
else if (event.type === 'config-changed' && 'data' in event) {
  const { entity, entityId, action } = event.data;

  // Invalidar queries
  if (entity === 'realm') {
    queryClient.invalidateQueries({ queryKey: ['realms'] });
  } else if (entity === 'portal') {
    queryClient.invalidateQueries({ queryKey: ['portals'] });
  }

  // TanStack Query refetch → onSuccess → atualiza Zustand automaticamente
}
```

---

## 4. COMPARAÇÃO: CONTEXTO vs ZUSTAND

### 4.1 React Context (Abordagem Atual)

**Vantagens:**
- ✅ Nativo do React
- ✅ Zero dependências extras
- ✅ Simples para estados isolados

**Desvantagens:**
- ❌ Re-renderizações desnecessárias (todo consumer re-renderiza)
- ❌ Sem persistência automática
- ❌ Difícil debugar estado global
- ❌ Sem DevTools
- ❌ Boilerplate de Provider/Consumer

### 4.2 Zustand (Proposta)

**Vantagens:**
- ✅ Seletores automáticos (re-renderiza só se valor mudar)
- ✅ Persistência built-in (localStorage/sessionStorage)
- ✅ Redux DevTools integrado
- ✅ API mínima e funcional
- ✅ TypeScript first-class
- ✅ Sem Provider necessário
- ✅ Middleware para persist, devtools, immer

**Desvantagens:**
- ❌ Dependência extra (+13KB gzipped)
- ❌ Curva de aprendizado (mínima)

### 4.3 Comparação com Vuex (Vue.js)

**User mencionou:** "já temos uma camada de persistencia no bewoser? algo q usavas no vue para estocar dados no lado do cliente tipo vuex?"

**Vuex (Vue) vs Zustand (React):**

| Aspecto | Vuex | Zustand |
|---------|------|---------|
| **Store único** | ✅ Sim | ✅ Sim (ou múltiplos) |
| **Mutations** | ✅ Obrigatórias | ❌ Opcional (set direto) |
| **Actions async** | ✅ Sim | ✅ Sim (funções async) |
| **Getters** | ✅ Computed properties | ✅ Seletores (automáticos) |
| **Modules** | ✅ Namespaces | ✅ Slices (pattern) |
| **DevTools** | ✅ Vue DevTools | ✅ Redux DevTools |
| **Persistência** | ❌ Plugin separado | ✅ Built-in (persist middleware) |
| **Boilerplate** | ❌ Alto | ✅ Mínimo |

**Exemplo comparativo:**

```javascript
// Vuex (Vue)
const store = new Vuex.Store({
  state: { portals: [] },
  mutations: {
    SET_PORTALS(state, portals) {
      state.portals = portals;
    }
  },
  actions: {
    async fetchPortals({ commit }) {
      const data = await api.getPortals();
      commit('SET_PORTALS', data);
    }
  },
  getters: {
    activePortals: state => state.portals.filter(p => p.active)
  }
});

// Component
computed: {
  portals() { return this.$store.state.portals; }
}
```

```typescript
// Zustand (React)
const usePortalStore = create((set, get) => ({
  portals: [],
  setPortals: (portals) => set({ portals }),
  fetchPortals: async () => {
    const data = await api.getPortals();
    set({ portals: data });
  },
  activePortals: () => get().portals.filter(p => p.active),
}));

// Component
const portals = usePortalStore(state => state.portals);
```

**Conclusão:** Zustand é o equivalente React mais próximo de Vuex, com menos boilerplate.

---

## 5. BENEFÍCIOS DA SOLUÇÃO

### 5.1 Performance

**Antes (TanStack Query direto):**
```typescript
// Cada component faz query independente
const PortalList = () => {
  const { data } = usePortals(); // Query 1
};

const PortalForm = () => {
  const { data } = usePortals(); // Query 2 (cache compartilhado, mas refetch)
};
```

**Depois (Zustand + TanStack Query):**
```typescript
// Zustand como cache local
const PortalList = () => {
  const portals = useConfigStore(state => state.portals); // Leitura local
};

const PortalForm = () => {
  const portals = useConfigStore(state => state.portals); // Mesma fonte
};

// Query roda uma vez, atualiza Zustand, todos recebem
```

### 5.2 Sincronização Entre Abas

**localStorage events nativos:**
```typescript
// Zustand persist middleware emite storage events
window.addEventListener('storage', (e) => {
  if (e.key === 'platform-config-storage') {
    // Outras abas recebem mudanças automaticamente
    useConfigStore.getState().portals; // Atualizado
  }
});
```

### 5.3 Debugging

**Redux DevTools:**
```typescript
import { devtools } from 'zustand/middleware';

const useConfigStore = create(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'platform-config-storage' }
    ),
    { name: 'ConfigStore' }
  )
);

// Time-travel debugging
// Visualizar ações e estado
// Exportar/importar snapshots
```

### 5.4 Cache Invalidation (The Hard Problem)

**Phil Karlton:** "There are only two hard things in Computer Science: cache invalidation and naming things."

**Solução com SSE + Zustand:**

1. **Backend emite evento:** `config-changed` → `{ entity: 'portal', entityId: 'main' }`
2. **SSE invalida TanStack Query:** `queryClient.invalidateQueries(['portal', 'main'])`
3. **Query refetch automático** → nova data do backend
4. **onSuccess atualiza Zustand** → `setPortals(newData)`
5. **Todos components reativos** → re-renderizam com data fresca

**Sem race conditions, sem cache stale, sem refetch manual.**

---

## 6. PLANO DE IMPLEMENTAÇÃO

### Fase 1: Instalar Zustand
```bash
cd src/frontend
npm install zustand
```

### Fase 2: Criar ConfigStore
1. Criar `src/frontend/src/stores/configStore.ts`
2. Implementar estado inicial (realms, portals, modules, instances, theme)
3. Adicionar persist middleware
4. Adicionar devtools middleware (dev only)

### Fase 3: Migrar ThemeContext
1. Mover lógica de tema para ConfigStore
2. Remover ThemeContext
3. Atualizar components para `useConfigStore(state => state.theme)`

### Fase 4: Integrar com TanStack Query
1. Criar hooks `useRealmsQuery`, `usePortalsQuery`, etc.
2. Adicionar `onSuccess` callbacks para atualizar Zustand
3. Implementar optimistic updates em mutations

### Fase 5: Conectar SSE
1. Atualizar `useSSE.ts` para invalidar queries
2. Testar sincronização multi-aba
3. Validar cache invalidation

### Fase 6: Migrar Components
1. Substituir `usePortal()` direto por `useConfigStore(state => state.portals)`
2. Remover localStorage direto
3. Usar mutations com optimistic updates

---

## 7. DECISÃO PENDENTE

### 7.1 Adotar Zustand?

**Opção A:** Adotar Zustand (RECOMENDADA)
- Persistência automática
- Sincronização entre abas
- DevTools para debugging
- Performance (seletores)
- Padrão consolidado na comunidade React

**Opção B:** Continuar com React Context
- Zero dependências
- Mais trabalho manual
- Sem persistência automática
- Sem DevTools

**Opção C:** Usar Jotai (alternativa)
- Atômico (granular)
- Menos boilerplate que Zustand
- Sem persist built-in

### 7.2 Escopo da Store

**Opção A:** Store única global (ConfigStore)
- Toda configuração em um lugar
- Fácil debugar

**Opção B:** Stores separadas
- `useRealmStore`, `usePortalStore`, `useThemeStore`
- Mais granular
- Mais complexo

**Recomendação:** Opção A (store única), usar slices para organização interna.

### 7.3 localStorage vs sessionStorage

**Opção A:** localStorage (persistente entre sessões)
- Configurações persistem após fechar navegador
- Recomendado para tema, preferências

**Opção B:** sessionStorage (apenas sessão atual)
- Limpa ao fechar aba
- Mais seguro para dados sensíveis

**Opção C:** Híbrido
- localStorage para tema/preferências
- sessionStorage para auth tokens (já usado)

**Recomendação:** Opção C (híbrido).

---

## 8. RISCOS E MITIGAÇÕES

### Risco 1: Cache Desatualizado

**Cenário:** Backend muda dados, Zustand não atualiza.

**Mitigação:**
- SSE invalida queries automaticamente
- TTL em queries (staleTime: 5min)
- Botão "Atualizar" manual em listas
- Verificar lastSync timestamp

### Risco 2: Storage Overflow

**Cenário:** localStorage cheio (limite ~5-10MB).

**Mitigação:**
- Salvar apenas configurações essenciais
- Não cachear listas grandes (usar TanStack Query pagination)
- Implementar LRU (Least Recently Used) eviction

### Risco 3: Migration de Schema

**Cenário:** Estrutura de dados muda entre versões.

**Mitigação:**
- Versionamento no persist: `version: 1`
- Migrate function no middleware:
```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'platform-config-storage',
    version: 2,
    migrate: (persistedState, version) => {
      if (version === 1) {
        // Migrar schema v1 → v2
        return { ...persistedState, newField: 'default' };
      }
      return persistedState;
    },
  }
)
```

---

## 9. REFERÊNCIAS

**Documentação:**
- Zustand: https://github.com/pmndrs/zustand
- TanStack Query: https://tanstack.com/query/latest
- Persist Middleware: https://docs.pmnd.rs/zustand/integrations/persisting-store-data

**Specs Relacionadas:**
- `spec/SPEC-frontend-state.md` - State management strategy
- `spec/SPEC-data-access.md` - JQEL + TanStack Query
- `spec/SPEC-events.md` - SSE real-time events

**Implementação Atual:**
- `src/frontend/src/contexts/ThemeContext.tsx` - Context atual
- `src/frontend/src/hooks/useSSE.ts` - SSE integration
- `src/frontend/package.json` - Dependências

---

## 10. CONCLUSÃO

A adoção de **Zustand + TanStack Query + SSE** resolve os problemas de:

1. ✅ **Cache local persistente** (localStorage automático)
2. ✅ **Sincronização multi-aba** (storage events)
3. ✅ **Performance** (seletores reativos, menos refetches)
4. ✅ **Cache invalidation** (SSE → invalidate → refetch → update store)
5. ✅ **Developer Experience** (Redux DevTools, TypeScript)

**Recomendação:** Implementar na Fase 1 (PLATFORM FOUNDATION) após SSE estar funcional.

**Dependências:**
- SSE anônimo funcionando (ver `sse-anonymous-support.md`)
- Redis Pub/Sub configurado
- Backend emitindo eventos `config-changed`

**Próximo passo:** User implementa SSE, depois adotamos Zustand.
