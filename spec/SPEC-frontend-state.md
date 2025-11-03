# SPEC-frontend-state.md

## Especificação: Gerenciamento de Estado do Frontend

### Escopo
Este documento especifica como o estado global da plataforma é gerenciado no frontend, incluindo portais, módulos, autenticação, cache e persistência.

---

## 1. Definição

### Propósito
Definir estratégia unificada de gerenciamento de estado que suporta lazy loading de módulos, múltiplos portais, autenticação e sincronização com backend via JQEL.

### Princípios
- **Single Source of Truth**: Estado autoritativo vem do backend via JQEL
- **Optimistic Updates**: UI atualiza imediatamente, sincroniza depois
- **Cache Inteligente**: TanStack Query gerencia cache e invalidação
- **Persistência Mínima**: Apenas dados essenciais sobrevivem refresh

---

## 2. Camadas de Estado

### SPEC-STATE-L-001
Frontend DEVE ter 4 camadas de estado:

1. **Platform State** - Configuração de portais e módulos
2. **Auth State** - Sessão e permissões do usuário
3. **Data State** - Dados da aplicação (via JQEL)
4. **UI State** - Estado efêmero da interface

---

## 3. Platform State

### Definição

**SPEC-STATE-P-001:** Platform State contém configuração estrutural da plataforma

**SPEC-STATE-P-002:** Platform State DEVE incluir:
```typescript
{
  portals: Portal[];              // Todos os portais
  currentPortal: string;          // Portal ativo (portalId)
  loadedModules: Set<string>;     // Módulos carregados em memória
  activeModules: Map<string, string[]>; // portalId → moduleIds ativos
}
```

### Carregamento Inicial

**SPEC-STATE-P-003:** Ao iniciar aplicação, DEVE carregar via JQEL:
```typescript
// Buscar todos os portais
{
  schema: 'platform',
  operation: 'select',
  entity: 'portal'
}

// Buscar módulos ativos do portal atual
{
  schema: 'platform',
  operation: 'select',
  entity: 'module_activation',
  where: { portalId: currentPortalId }
}
```

**SPEC-STATE-P-004:** Platform State DEVE ser carregado antes de renderizar aplicação

**SPEC-STATE-P-005:** Durante carregamento, DEVE exibir splash screen ou skeleton

### Atualização

**SPEC-STATE-P-006:** Mudanças em Platform State via módulo Setup DEVEM:
1. Persistir via JQEL
2. Invalidar cache do TanStack Query
3. Atualizar estado local
4. Recarregar módulos afetados se necessário

**SPEC-STATE-P-007:** Mudanças estruturais (criar/remover portal) PODEM requerer refresh completo

### Persistência

**SPEC-STATE-P-008:** Platform State NÃO DEVE ser persistido no browser

**SPEC-STATE-P-009:** Platform State DEVE ser recarregado a cada inicialização

---

## 4. Auth State

### Definição

**SPEC-STATE-A-001:** Auth State contém informações de sessão e autenticação

**SPEC-STATE-A-002:** Auth State DEVE incluir:
```typescript
{
  user: User | null;              // Usuário autenticado
  accessToken: string | null;     // JWT
  refreshToken: string | null;    // Refresh token
  isAuthenticated: boolean;       // Derivado de user !== null
  isLoading: boolean;             // Carregando auth
  permissions: string[];          // Permissões cached
}
```

### Gerenciamento

**SPEC-STATE-A-003:** Auth State DEVE ser gerenciado via React Context

**SPEC-STATE-A-004:** Context DEVE estar disponível globalmente:
```typescript
<AuthProvider>
  <App />
</AuthProvider>
```

**SPEC-STATE-A-005:** Context DEVE expor:
```typescript
{
  ...authState,
  login: (credentials) => Promise<void>,
  logout: () => Promise<void>,
  refresh: () => Promise<void>,
  hasPermission: (permission) => boolean
}
```

### Persistência

**SPEC-STATE-A-006:** Access token PODE ser armazenado em memória (React state)

**SPEC-STATE-A-007:** Refresh token DEVE ser armazenado em HttpOnly cookie (preferencial)

**SPEC-STATE-A-008:** Refresh token PODE ser armazenado em sessionStorage se cookie não disponível

**SPEC-STATE-A-009:** Tokens NÃO DEVEM ser armazenados em localStorage

**SPEC-STATE-A-010:** Ao recarregar página, Auth State DEVE:
1. Verificar existência de refresh token
2. Se existe, tentar renovar via `/api/1/auth/refresh`
3. Se sucesso, restaurar sessão
4. Se falha, limpar estado (logout)

### Renovação Automática

**SPEC-STATE-A-011:** Sistema DEVE renovar access token antes de expirar

**SPEC-STATE-A-012:** Renovação DEVE ocorrer quando:
- Access token expira em < 5 minutos
- Ou imediatamente antes de request importante

**SPEC-STATE-A-013:** Se renovação falhar, DEVE fazer logout automático

---

## 5. Data State (JQEL + TanStack Query)

### Definição

**SPEC-STATE-D-001:** Data State contém dados da aplicação consultados via JQEL

**SPEC-STATE-D-002:** Data State DEVE ser gerenciado exclusivamente por TanStack Query

**SPEC-STATE-D-003:** TanStack Query NÃO DEVE ser usado para Platform State ou Auth State

### Query Keys

**SPEC-STATE-D-004:** Queries DEVEM usar keys estruturadas:
```typescript
// Padrão: [schema, operation, entity, ...params]
['app', 'select', 'usuario', { where: { id: 123 } }]
['sac', 'select', 'ticket', { limit: 10 }]
['platform', 'select', 'portal']
```

**SPEC-STATE-D-005:** Query keys DEVEM ser hierárquicas para invalidação granular:
```typescript
// Invalidar todos os usuarios
queryClient.invalidateQueries(['app', 'select', 'usuario']);

// Invalidar usuario específico
queryClient.invalidateQueries(['app', 'select', 'usuario', { where: { id: 123 } }]);
```

### Configuração Global

**SPEC-STATE-D-006:** TanStack Query DEVE ser configurado globalmente:
```typescript
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

**SPEC-STATE-D-007:** QueryClient DEVE ter configuração:
```typescript
{
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutos
      cacheTime: 1000 * 60 * 30,     // 30 minutos
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 0
    }
  }
}
```

### Queries

**SPEC-STATE-D-008:** Queries DEVEM usar hook customizado:
```typescript
const { data, isLoading, error } = useJQEL({
  schema: 'app',
  operation: 'select',
  entity: 'usuario',
  where: { status: 'active' },
  limit: 10
});
```

**SPEC-STATE-D-009:** Hook `useJQEL` DEVE:
1. Construir query key
2. Chamar TanStack Query useQuery
3. Executar JQEL via `/api/jqel`
4. Retornar dados formatados

### Mutations

**SPEC-STATE-D-010:** Mutations DEVEM usar hook customizado:
```typescript
const { mutate, isLoading } = useJQELMutation({
  schema: 'app',
  operation: 'mutate',
  entity: 'usuario',
  action: 'update',
  onSuccess: () => {
    // Invalidar queries relacionadas
    queryClient.invalidateQueries(['app', 'select', 'usuario']);
  }
});
```

**SPEC-STATE-D-011:** Mutations DEVEM invalidar queries relacionadas após sucesso

**SPEC-STATE-D-012:** Mutations PODEM usar optimistic updates:
```typescript
const { mutate } = useJQELMutation({
  onMutate: async (newData) => {
    // Cancel queries
    await queryClient.cancelQueries(['app', 'select', 'usuario']);
    
    // Snapshot atual
    const previous = queryClient.getQueryData(['app', 'select', 'usuario']);
    
    // Update otimista
    queryClient.setQueryData(['app', 'select', 'usuario'], (old) => {
      return [...old, newData];
    });
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Reverter em caso de erro
    queryClient.setQueryData(['app', 'select', 'usuario'], context.previous);
  }
});
```

### Invalidação por Eventos

**SPEC-STATE-D-013:** Sistema de eventos (SSE) DEVE invalidar queries quando relevante:
```typescript
// Recebe evento via SSE
onEvent((event) => {
  if (event.type === 'task' && event.category === 'data_updated') {
    // Invalida queries do schema/entity afetado
    queryClient.invalidateQueries([event.schema, 'select', event.entity]);
  }
});
```

**SPEC-STATE-D-014:** Invalidação por evento DEVE ser seletiva, não global

---

## 6. UI State

### Definição

**SPEC-STATE-U-001:** UI State contém estado efêmero da interface

**SPEC-STATE-U-002:** Exemplos de UI State:
- Modals abertos/fechados
- Sidebar expandido/colapsado
- Tabs ativas
- Filtros temporários
- Seleções temporárias
- Estado de formulários

### Gerenciamento

**SPEC-STATE-U-003:** UI State DEVE ser local (useState, useReducer)

**SPEC-STATE-U-004:** UI State NÃO DEVE usar Context desnecessariamente

**SPEC-STATE-U-005:** UI State NÃO DEVE usar TanStack Query

**SPEC-STATE-U-006:** UI State compartilhado PODE usar Context:
```typescript
// Estado de sidebar compartilhado
<SidebarProvider>
  <Layout />
</SidebarProvider>
```

### Persistência Opcional

**SPEC-STATE-U-007:** UI State PODE ser persistido em localStorage para UX:
- Preferência de sidebar (expandido/colapsado)
- Última tab ativa
- Configurações de visualização

**SPEC-STATE-U-008:** Persistência de UI State DEVE ser opcional e degradar gracefully

**SPEC-STATE-U-009:** UI State persistido DEVE usar prefixo claro:
```typescript
localStorage.setItem('ui:sidebar:collapsed', 'true');
localStorage.setItem('ui:theme:mode', 'dark');
```

---

## 7. Sincronização entre Camadas

### Platform ↔ Auth

**SPEC-STATE-S-001:** Mudança de portal PODE requerer nova autenticação

**SPEC-STATE-S-002:** Logout DEVE limpar Data State (invalidar todas as queries)

### Auth ↔ Data

**SPEC-STATE-S-003:** Access token DEVE ser incluído em todas as queries JQEL

**SPEC-STATE-S-004:** Se access token expirar durante query, DEVE:
1. Pausar query
2. Tentar renovar token
3. Se sucesso, retry query
4. Se falha, fazer logout

**SPEC-STATE-S-005:** Hook useJQEL DEVE integrar automaticamente com Auth Context

### Events ↔ Data

**SPEC-STATE-S-006:** Eventos SSE DEVEM invalidar Data State via TanStack Query

**SPEC-STATE-S-007:** Mapeamento de eventos para invalidação:
```typescript
{
  'task_completed': (event) => {
    queryClient.invalidateQueries(['system', 'select', 'task']);
  },
  'user_updated': (event) => {
    queryClient.invalidateQueries(['app', 'select', 'usuario', { where: { id: event.userId } }]);
  }
}
```

---

## 8. Persistência e Hydration

### O que Persiste

**SPEC-STATE-H-001:** Sobrevive refresh da página:
- ✅ Refresh token (cookie ou sessionStorage)
- ✅ UI preferences (localStorage, opcional)
- ❌ Platform State (recarrega via JQEL)
- ❌ Access token (renova via refresh)
- ❌ Data State (cache do TanStack Query é limpo)

### Hydration ao Carregar

**SPEC-STATE-H-002:** Ordem de hydration:
```
1. Verificar refresh token
2. Se existe, renovar access token
3. Carregar Platform State (portais, módulos)
4. Detectar portal atual (via rota)
5. Carregar módulos do portal
6. Renderizar aplicação
```

**SPEC-STATE-H-003:** Durante hydration, exibir loading global

**SPEC-STATE-H-004:** Se hydration falhar em etapa crítica, exibir erro e permitir retry

---

## 9. Performance

### Memoization

**SPEC-STATE-PERF-001:** Contexts DEVEM usar useMemo para valores:
```typescript
const authValue = useMemo(() => ({
  user,
  isAuthenticated,
  login,
  logout
}), [user, isAuthenticated]);
```

**SPEC-STATE-PERF-002:** Evitar re-renders desnecessários via split de contexts:
```typescript
// Ruim: tudo em um context
<AuthContext.Provider value={{ user, theme, sidebar }} />

// Bom: contexts separados
<AuthContext.Provider>
  <ThemeContext.Provider>
    <SidebarContext.Provider>
```

### Lazy Queries

**SPEC-STATE-PERF-003:** Queries PODEM ser lazy (não executam automaticamente):
```typescript
const { refetch } = useJQEL({
  schema: 'app',
  operation: 'select',
  entity: 'relatorio',
  enabled: false  // Não executa automaticamente
});

// Executar manualmente
const handleGenerate = () => {
  refetch();
};
```

### Prefetching

**SPEC-STATE-PERF-004:** Queries PODEM ser prefetched:
```typescript
// Ao hover em link, prefetch dados
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ['app', 'select', 'dashboard', { id: dashboardId }],
    queryFn: () => fetchDashboard(dashboardId)
  });
};
```

---

## 10. DevTools

**SPEC-STATE-DEV-001:** Em desenvolvimento, DEVE habilitar TanStack Query DevTools

**SPEC-STATE-DEV-002:** DevTools DEVEM permitir:
- Inspecionar queries ativas
- Ver cache
- Invalidar queries manualmente
- Ver histórico de mutations

**SPEC-STATE-DEV-003:** Em produção, DevTools DEVEM estar desabilitados

---

## 11. Tratamento de Erros

### Queries

**SPEC-STATE-ERR-001:** Erro em query crítica DEVE usar Error Boundary

**SPEC-STATE-ERR-002:** Erro em query não-crítica DEVE exibir fallback local

**SPEC-STATE-ERR-003:** Hook useJQEL DEVE retornar error object:
```typescript
const { data, error, isError } = useJQEL({...});

if (isError) {
  return <ErrorMessage error={error} />;
}
```

### Mutations

**SPEC-STATE-ERR-004:** Erro em mutation DEVE exibir toast/notificação

**SPEC-STATE-ERR-005:** Mutations com optimistic update DEVEM reverter em erro

### Network

**SPEC-STATE-ERR-006:** Perda de conexão DEVE:
1. Pausar queries pendentes
2. Exibir banner de "offline"
3. Ao reconectar, retry queries automaticamente

---

## 12. Estrutura de Arquivos Sugerida

```
src/
├─ state/
│  ├─ platform/
│  │  ├─ PlatformProvider.tsx
│  │  ├─ usePlatform.ts
│  │  └─ queries.ts
│  │
│  ├─ auth/
│  │  ├─ AuthProvider.tsx
│  │  ├─ useAuth.ts
│  │  └─ tokens.ts
│  │
│  ├─ jqel/
│  │  ├─ QueryProvider.tsx
│  │  ├─ useJQEL.ts
│  │  ├─ useJQELMutation.ts
│  │  └─ queryClient.ts
│  │
│  └─ events/
│     ├─ EventsProvider.tsx
│     ├─ useEvents.ts
│     └─ eventHandlers.ts
```

---

## 13. Exemplo de Setup Completo

```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlatformProvider } from './state/platform';
import { AuthProvider } from './state/auth';
import { EventsProvider } from './state/events';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformProvider>
        <AuthProvider>
          <EventsProvider>
            <RouterProvider router={router} />
          </EventsProvider>
        </AuthProvider>
      </PlatformProvider>
    </QueryClientProvider>
  );
}
```

---

*Esta especificação define o gerenciamento de estado do frontend. Implementação técnica em código.*