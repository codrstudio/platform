# SPEC-data-access.md

## Especificação: Acesso a Dados na Plataforma

### Escopo
Este documento especifica como a plataforma acessa dados, integrando JQEL com TanStack Query, gerenciando cache, validação, segurança e performance.

---

## 1. Princípios Fundamentais

### Acesso Único via JQEL

**SPEC-DA-P-001:** JQEL é a ÚNICA forma de acessar dados na plataforma

**SPEC-DA-P-002:** Frontend NÃO DEVE usar fetch/axios diretamente para dados

**SPEC-DA-P-003:** Frontend NÃO DEVE acessar APIs REST tradicionais

**SPEC-DA-P-004:** Toda consulta/mutação DEVE usar JQEL

### TanStack Query Obrigatório

**SPEC-DA-P-005:** Frontend DEVE encapsular JQEL via TanStack Query

**SPEC-DA-P-006:** Acesso direto a JQEL NÃO DEVE ser exposto aos componentes

**SPEC-DA-P-007:** TanStack Query gerencia cache, refetch, invalidação

**SPEC-DA-P-008:** TanStack Query gerencia loading e error states

---

## 2. Wrapper JQEL

### Função Base

**SPEC-DA-W-001:** Plataforma DEVE fornecer função `jqel.query()`

**SPEC-DA-W-002:** Função DEVE aceitar objeto JQEL válido

**SPEC-DA-W-003:** Função DEVE retornar Promise com JResult

**SPEC-DA-W-004:** Estrutura conceitual:
```typescript
interface JQELWrapper {
  query: <T>(query: JQELQuery) => Promise<JResult<T>>;
}
```

### Implementação

**SPEC-DA-W-005:** Wrapper DEVE fazer POST para `/api/jqel`

**SPEC-DA-W-006:** Wrapper DEVE incluir `Content-Type: application/json`

**SPEC-DA-W-007:** Wrapper DEVE incluir JWT automaticamente se disponível

**SPEC-DA-W-008:** Exemplo:
```typescript
const jqel = {
  query: async (queryObject) => {
    const token = getAccessToken();
    
    const response = await fetch('/api/jqel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(queryObject)
    });
    
    if (!response.ok) {
      throw new JQELError(await response.json());
    }
    
    return response.json();
  }
};
```

### Tratamento de Erros

**SPEC-DA-W-009:** Wrapper DEVE lançar exceção em erros HTTP (4xx, 5xx)

**SPEC-DA-W-010:** Exceção DEVE incluir JResult completo do erro

**SPEC-DA-W-011:** Classe de erro sugerida:
```typescript
class JQELError extends Error {
  code: number;
  field?: string;
  jresult: JResult;
  
  constructor(jresult: JResult) {
    super(jresult.message);
    this.code = jresult.code;
    this.field = jresult.field;
    this.jresult = jresult;
  }
}
```

---

## 3. TanStack Query - SELECT

### Hook useQuery

**SPEC-DA-TQ-001:** SELECT DEVE usar `useQuery` do TanStack Query

**SPEC-DA-TQ-002:** Query key DEVE ser estruturada e única

**SPEC-DA-TQ-003:** Query function DEVE chamar `jqel.query()`

**SPEC-DA-TQ-004:** Exemplo básico:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['sac', 'usuario', { status: 'ativo' }],
  queryFn: () => jqel.query({
    schema: 'sac',
    select: 'usuario',
    where: { status: { eq: 'ativo' } }
  })
});
```

### Query Keys

**SPEC-DA-TQ-005:** Query key DEVE seguir estrutura hierárquica

**SPEC-DA-TQ-006:** Formato recomendado: `[schema, entity, params?]`

**SPEC-DA-TQ-007:** Exemplos:
```typescript
// Listar todos os usuários
['sac', 'usuario']

// Usuários ativos
['sac', 'usuario', { status: 'ativo' }]

// Usuário específico
['sac', 'usuario', { id: 123 }]

// Dashboard de atendimentos
['sac', 'atendimento', 'dashboard']
```

**SPEC-DA-TQ-008:** Params DEVEM ser serializáveis (JSON)

**SPEC-DA-TQ-009:** Ordem dos campos em params DEVE ser consistente

### Configurações Úteis

**SPEC-DA-TQ-010:** `staleTime` controla quando refetch automático

**SPEC-DA-TQ-011:** `cacheTime` controla quanto tempo manter cache

**SPEC-DA-TQ-012:** `refetchOnWindowFocus` pode ser desabilitado

**SPEC-DA-TQ-013:** Exemplo com configurações:
```typescript
useQuery({
  queryKey: ['sac', 'usuario'],
  queryFn: () => jqel.query({ ... }),
  staleTime: 5 * 60 * 1000,        // 5 minutos
  cacheTime: 10 * 60 * 1000,       // 10 minutos
  refetchOnWindowFocus: false
});
```

### Queries Dependentes

**SPEC-DA-TQ-014:** Query pode depender de outra usando `enabled`

**SPEC-DA-TQ-015:** Exemplo:
```typescript
// Primeiro: buscar usuário
const { data: user } = useQuery({
  queryKey: ['sac', 'usuario', { id: userId }],
  queryFn: () => jqel.query({ ... })
});

// Depois: buscar atendimentos do usuário
const { data: atendimentos } = useQuery({
  queryKey: ['sac', 'atendimento', { userId: user?.id }],
  queryFn: () => jqel.query({ ... }),
  enabled: !!user?.id  // Só executa se user.id existe
});
```

---

## 4. TanStack Query - MUTATE

### Hook useMutation

**SPEC-DA-MU-001:** MUTATE DEVE usar `useMutation` do TanStack Query

**SPEC-DA-MU-002:** Mutation function DEVE chamar `jqel.query()`

**SPEC-DA-MU-003:** `onSuccess` DEVE invalidar queries relacionadas

**SPEC-DA-MU-004:** Exemplo básico:
```typescript
const mutation = useMutation({
  mutationFn: (data) => jqel.query({
    schema: 'sac',
    mutate: 'usuario',
    action: 'insert',
    values: data
  }),
  onSuccess: () => {
    queryClient.invalidateQueries(['sac', 'usuario']);
  }
});

// Usar
mutation.mutate({
  nome_completo: 'Pedro Alves',
  email: 'pedro@example.com'
});
```

### Invalidação de Cache

**SPEC-DA-MU-005:** Após mutação bem-sucedida, DEVE invalidar queries afetadas

**SPEC-DA-MU-006:** Invalidação PODE ser específica ou ampla

**SPEC-DA-MU-007:** Exemplos de invalidação:
```typescript
// Invalidar todos os usuários
queryClient.invalidateQueries(['sac', 'usuario']);

// Invalidar apenas usuário específico
queryClient.invalidateQueries(['sac', 'usuario', { id: 123 }]);

// Invalidar tudo do schema sac
queryClient.invalidateQueries(['sac']);
```

**SPEC-DA-MU-008:** Invalidação dispara refetch automático de queries ativas

### Optimistic Updates

**SPEC-DA-MU-009:** Mutations PODEM usar optimistic updates

**SPEC-DA-MU-010:** Optimistic update atualiza UI antes da resposta

**SPEC-DA-MU-011:** Se mutation falhar, DEVE reverter mudança

**SPEC-DA-MU-012:** Exemplo:
```typescript
const mutation = useMutation({
  mutationFn: (data) => jqel.query({ ... }),
  
  onMutate: async (newData) => {
    // Cancelar queries em andamento
    await queryClient.cancelQueries(['sac', 'usuario']);
    
    // Snapshot do valor anterior
    const previous = queryClient.getQueryData(['sac', 'usuario']);
    
    // Atualizar otimisticamente
    queryClient.setQueryData(['sac', 'usuario'], (old) => {
      return [...old, newData];
    });
    
    return { previous };
  },
  
  onError: (err, newData, context) => {
    // Reverter em caso de erro
    queryClient.setQueryData(['sac', 'usuario'], context.previous);
  },
  
  onSettled: () => {
    // Refetch para garantir sincronização
    queryClient.invalidateQueries(['sac', 'usuario']);
  }
});
```

### Callbacks

**SPEC-DA-MU-013:** Mutation PODE ter callbacks:
- `onMutate` - Antes de executar
- `onSuccess` - Após sucesso
- `onError` - Após erro
- `onSettled` - Sempre (sucesso ou erro)

**SPEC-DA-MU-014:** Callbacks recebem contexto compartilhado

---

## 5. Invalidação via Eventos (SSE)

### Integração com Canal de Eventos

**SPEC-DA-EV-001:** Eventos SSE DEVEM disparar invalidações de cache

**SPEC-DA-EV-002:** Backend/Backbone PODE enviar eventos de mudança de dados

**SPEC-DA-EV-003:** Frontend DEVE invalidar queries relacionadas

**SPEC-DA-EV-004:** Exemplo de evento:
```json
{
  "type": "data_changed",
  "schema": "sac",
  "entity": "usuario",
  "ids": [123, 456]
}
```

### Listener de Eventos

**SPEC-DA-EV-005:** Plataforma DEVE ter listener global para eventos de dados

**SPEC-DA-EV-006:** Exemplo conceitual:
```typescript
// Setup global
eventSource.addEventListener('data_changed', (event) => {
  const { schema, entity, ids } = JSON.parse(event.data);
  
  if (ids && ids.length > 0) {
    // Invalidar registros específicos
    ids.forEach(id => {
      queryClient.invalidateQueries([schema, entity, { id }]);
    });
  } else {
    // Invalidar toda a entidade
    queryClient.invalidateQueries([schema, entity]);
  }
});
```

### Estratégias de Invalidação

**SPEC-DA-EV-007:** Invalidação PODE ser:
- **Específica**: IDs fornecidos → invalida apenas esses registros
- **Ampla**: Sem IDs → invalida toda entidade
- **Schema-wide**: Invalida tudo do schema

**SPEC-DA-EV-008:** Escolha depende do tipo de mudança

---

## 6. Validação

### Frontend (Client-side)

**SPEC-DA-VAL-001:** Frontend DEVE validar query antes de enviar

**SPEC-DA-VAL-002:** Validação DEVE usar Zod ou similar

**SPEC-DA-VAL-003:** Validação DEVE checar:
- Campos obrigatórios (`schema`, `select`/`mutate`)
- Tipos de dados corretos
- Estrutura de WHERE válida
- Valores de OPTIONS dentro de limites

**SPEC-DA-VAL-004:** Exemplo com Zod:
```typescript
import { z } from 'zod';

const JQELQuerySchema = z.object({
  schema: z.string(),
  select: z.string().optional(),
  mutate: z.string().optional(),
  action: z.string().optional(),
  where: z.record(z.any()).optional(),
  options: z.object({
    limit: z.number().max(1000).optional(),
    offset: z.number().optional(),
    orderBy: z.array(z.record(z.enum(['asc', 'desc']))).optional()
  }).optional(),
  values: z.record(z.any()).optional(),
  output: z.array(z.string()).optional(),
  except: z.array(z.string()).optional()
}).refine(
  data => !!(data.select || data.mutate),
  { message: "Query deve ter 'select' ou 'mutate'" }
);
```

**SPEC-DA-VAL-005:** Erro de validação DEVE impedir envio

**SPEC-DA-VAL-006:** Erro DEVE ser exibido ao usuário claramente

### Backend

**SPEC-DA-VAL-007:** Backend DEVE validar estrutura básica da query

**SPEC-DA-VAL-008:** Backend DEVE validar schema existe

**SPEC-DA-VAL-009:** Backend DEVE validar operação é permitida

**SPEC-DA-VAL-010:** Query inválida DEVE retornar HTTP 400

**SPEC-DA-VAL-011:** Resposta DEVE incluir mensagem clara:
```json
{
  "code": 400,
  "message": "Campo 'schema' é obrigatório",
  "field": "schema"
}
```

### Backbone

**SPEC-DA-VAL-012:** Backbone PODE validar regras de negócio

**SPEC-DA-VAL-013:** Validação de negócio DEVE retornar erro claro

**SPEC-DA-VAL-014:** Exemplo:
```json
{
  "code": 422,
  "message": "Usuário com este email já existe",
  "field": "email"
}
```

---

## 7. Autenticação

### JWT em Queries

**SPEC-DA-AUTH-001:** Queries PODEM requerer autenticação

**SPEC-DA-AUTH-002:** JWT DEVE ser incluído em header `Authorization: Bearer <token>`

**SPEC-DA-AUTH-003:** Wrapper JQEL DEVE incluir JWT automaticamente

**SPEC-DA-AUTH-004:** JWT ausente ou inválido DEVE retornar HTTP 401

### Renovação de Token

**SPEC-DA-AUTH-005:** Se JWT expirou, wrapper DEVE:
1. Detectar HTTP 401
2. Tentar renovar token via `/api/1/auth/refresh`
3. Se sucesso, reenviar query original
4. Se falha, redirecionar para login

**SPEC-DA-AUTH-006:** Renovação DEVE ser transparente ao componente

**SPEC-DA-AUTH-007:** Exemplo conceitual:
```typescript
const jqel = {
  query: async (queryObject) => {
    let response = await fetchWithAuth('/api/jqel', queryObject);
    
    if (response.status === 401) {
      // Tentar renovar
      const refreshed = await refreshToken();
      
      if (refreshed) {
        // Tentar query novamente
        response = await fetchWithAuth('/api/jqel', queryObject);
      } else {
        // Falhou, redirecionar para login
        redirectToLogin();
        throw new Error('Sessão expirada');
      }
    }
    
    return response.json();
  }
};
```

---

## 8. Autorização

### Validação de Permissões

**SPEC-DA-PERM-001:** Queries PODEM requerer permissões específicas

**SPEC-DA-PERM-002:** Backend/Backbone DEVE validar permissões

**SPEC-DA-PERM-003:** Permissão baseada em:
- Schema
- Entity (select/mutate)
- Action (para mutate)

**SPEC-DA-PERM-004:** Sem permissão DEVE retornar HTTP 403

**SPEC-DA-PERM-005:** Exemplo:
```json
{
  "code": 403,
  "message": "Você não tem permissão para deletar usuários"
}
```

### Filtros por Permissão

**SPEC-DA-PERM-006:** Backend/Backbone PODE aplicar filtros automáticos

**SPEC-DA-PERM-007:** Exemplo: usuário só vê registros do seu departamento

**SPEC-DA-PERM-008:** Filtros DEVEM ser transparentes (usuário não sabe que foram aplicados)

---

## 9. Segurança

### Prevenção de Injection

**SPEC-DA-SEC-001:** Backend/Backbone DEVE usar queries parametrizadas

**SPEC-DA-SEC-002:** Valores de WHERE DEVEM ser sanitizados

**SPEC-DA-SEC-003:** Operadores DEVEM ser validados contra whitelist

**SPEC-DA-SEC-004:** Plataforma NÃO DEVE permitir SQL injection

### Campos Sensíveis

**SPEC-DA-SEC-005:** Backend/Backbone PODE filtrar campos sensíveis automaticamente

**SPEC-DA-SEC-006:** Exemplo: nunca retornar `senha_hash`, mesmo se solicitado

**SPEC-DA-SEC-007:** Lista de campos sensíveis DEVE ser configurável

**SPEC-DA-SEC-008:** Filtragem DEVE acontecer antes de retornar dados

### Rate Limiting

**SPEC-DA-SEC-009:** Queries PODEM ter rate limiting

**SPEC-DA-SEC-010:** Limite por usuário, IP ou ambos

**SPEC-DA-SEC-011:** Limite excedido DEVE retornar HTTP 429

**SPEC-DA-SEC-012:** Resposta DEVE incluir:
```json
{
  "code": 429,
  "message": "Muitas requisições. Tente novamente em 60 segundos"
}
```

### HTTPS Obrigatório

**SPEC-DA-SEC-013:** Em produção, JQEL DEVE usar HTTPS

**SPEC-DA-SEC-014:** HTTP DEVE redirecionar para HTTPS

---

## 10. Performance

### Cache no Frontend

**SPEC-DA-PERF-001:** TanStack Query gerencia cache automaticamente

**SPEC-DA-PERF-002:** Cache DEVE ter configuração apropriada:
- `staleTime`: Quando considerar dados "velhos"
- `cacheTime`: Quanto tempo manter em cache

**SPEC-DA-PERF-003:** Configuração padrão sugerida:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutos
      cacheTime: 10 * 60 * 1000,     // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});
```

### Cache no Backend

**SPEC-DA-PERF-004:** Backend PODE cachear queries em Redis

**SPEC-DA-PERF-005:** Cache DEVE ter TTL configurável

**SPEC-DA-PERF-006:** Cache key DEVE incluir:
- Query completa (serializada)
- User ID (se relevante)

**SPEC-DA-PERF-007:** Cache DEVE ser invalidado quando dados mudam

### Otimização de Queries

**SPEC-DA-PERF-008:** SEMPRE usar projeção (`output`/`except`)

**SPEC-DA-PERF-009:** SEMPRE usar paginação (`limit`/`offset`) para listas

**SPEC-DA-PERF-010:** SEMPRE usar `orderBy` com `offset`

**SPEC-DA-PERF-011:** Exemplo otimizado:
```typescript
jqel.query({
  schema: 'sac',
  select: 'usuario',
  where: { status: { eq: 'ativo' } },
  output: ['id_usuario', 'nome_completo', 'email'],
  options: {
    limit: 50,
    offset: page * 50,
    orderBy: [{ data_cadastro: 'desc' }]
  }
})
```

### Debounce

**SPEC-DA-PERF-012:** Queries de busca DEVEM usar debounce

**SPEC-DA-PERF-013:** Debounce recomendado: 300-500ms

**SPEC-DA-PERF-014:** Exemplo com hook customizado:
```typescript
function useDebouncedQuery(searchTerm: string) {
  const debouncedTerm = useDebounce(searchTerm, 300);
  
  return useQuery({
    queryKey: ['sac', 'usuario', { search: debouncedTerm }],
    queryFn: () => jqel.query({
      schema: 'sac',
      select: 'usuario',
      where: { nome_completo: { like: `%${debouncedTerm}%` } }
    }),
    enabled: debouncedTerm.length >= 3
  });
}
```

---

## 11. Tratamento de Erros

### Error States no React

**SPEC-DA-ERR-001:** Componentes DEVEM tratar estados de erro

**SPEC-DA-ERR-002:** `error` do useQuery contém JQELError

**SPEC-DA-ERR-003:** Exemplo:
```typescript
const { data, isLoading, error } = useQuery({ ... });

if (error) {
  if (error.code === 404) {
    return <NotFound />;
  }
  if (error.code === 403) {
    return <Forbidden />;
  }
  return <ErrorMessage error={error} />;
}
```

### Retry Logic

**SPEC-DA-ERR-004:** Queries PODEM ter retry automático

**SPEC-DA-ERR-005:** Retry DEVE ser configurável:
```typescript
useQuery({
  queryKey: ['sac', 'usuario'],
  queryFn: () => jqel.query({ ... }),
  retry: (failureCount, error) => {
    // Não retry em erros 4xx (client error)
    if (error.code >= 400 && error.code < 500) {
      return false;
    }
    // Retry até 3 vezes em erros 5xx
    return failureCount < 3;
  },
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
});
```

### Error Boundary

**SPEC-DA-ERR-006:** Queries críticas DEVEM ter Error Boundary

**SPEC-DA-ERR-007:** Error Boundary captura erros não tratados

**SPEC-DA-ERR-008:** Exemplo:
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <DataComponent />
</ErrorBoundary>
```

---

## 12. Boas Práticas

### Query Keys

**SPEC-DA-BP-001:** Query keys DEVEM ser consistentes em todo projeto

**SPEC-DA-BP-002:** Query keys DEVEM ser documentadas por módulo

**SPEC-DA-BP-003:** Use factory functions para query keys:
```typescript
const userKeys = {
  all: ['sac', 'usuario'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const
};

// Usar
useQuery({ queryKey: userKeys.detail(123), ... });
```

### Separação de Concerns

**SPEC-DA-BP-004:** Criar hooks customizados para queries reutilizáveis

**SPEC-DA-BP-005:** Exemplo:
```typescript
function useUsuarios(filters?: UsuarioFilters) {
  return useQuery({
    queryKey: ['sac', 'usuario', filters],
    queryFn: () => jqel.query({
      schema: 'sac',
      select: 'usuario',
      where: buildWhereFromFilters(filters),
      options: { limit: 50 }
    })
  });
}

// Usar no componente
const { data: usuarios } = useUsuarios({ status: 'ativo' });
```

### Invalidação Inteligente

**SPEC-DA-BP-006:** Invalidar apenas o necessário

**SPEC-DA-BP-007:** Preferir invalidação específica sobre ampla

**SPEC-DA-BP-008:** Exemplo:
```typescript
// ❌ Ruim: invalida tudo
queryClient.invalidateQueries();

// ⚠️ OK: invalida schema inteiro
queryClient.invalidateQueries(['sac']);

// ✅ Melhor: invalida entidade específica
queryClient.invalidateQueries(['sac', 'usuario']);

// ✅ Ideal: invalida registro específico
queryClient.invalidateQueries(['sac', 'usuario', { id: 123 }]);
```

### Loading States

**SPEC-DA-BP-009:** SEMPRE tratar loading states

**SPEC-DA-BP-010:** Usar skeletons em vez de spinners quando possível

**SPEC-DA-BP-011:** Exemplo:
```typescript
const { data, isLoading } = useQuery({ ... });

if (isLoading) {
  return <UserListSkeleton />;
}

return <UserList users={data} />;
```

---

*Esta especificação define integração de JQEL com TanStack Query. Para sintaxe JQEL completa, ver SPEC-jqel.md.*