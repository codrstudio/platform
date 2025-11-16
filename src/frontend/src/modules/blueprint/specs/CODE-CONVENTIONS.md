# Convenções de Código e Boas Práticas

**Versão**: 1.0.0
**Última Atualização**: 2025-01-16
**Status**: Normativo

## 1. TYPESCRIPT

### 1.1 Tipos vs Interfaces

**Use `interface` para objetos que podem ser estendidos:**

```typescript
// ✅ BOM - Interface para objetos extensíveis
interface UserData {
  id: string;
  name: string;
  email: string;
}

interface AdminUser extends UserData {
  permissions: string[];
}
```

**Use `type` para unions, aliases e tipos utilitários:**

```typescript
// ✅ BOM - Type para unions e aliases
type Status = 'pending' | 'active' | 'inactive';
type ID = string | number;
type Nullable<T> = T | null;
type UserWithPosts = User & { posts: Post[] };
```

### 1.2 Evite `any` - Use Tipos Específicos

```typescript
// ❌ RUIM
function processData(data: any): any {
  return data;
}

// ✅ BOM - Tipo genérico
function processData<T>(data: T): T {
  return data;
}

// ✅ BOM - Unknown quando tipo é desconhecido
function handleUnknown(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  return String(value);
}
```

### 1.3 Tipos de Retorno Explícitos

```typescript
// ❌ RUIM - Retorno implícito
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ BOM - Tipos explícitos
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### 1.4 Enums vs Const Assertions

**Prefira const assertions para valores constantes:**

```typescript
// ❌ EVITE - Enum gera código JavaScript extra
enum Status {
  Pending = 'PENDING',
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

// ✅ PREFIRA - Const assertion
const STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

type Status = typeof STATUS[keyof typeof STATUS];
```

### 1.5 Utility Types

**Use utility types do TypeScript:**

```typescript
// Partial - Todos campos opcionais
type PartialUser = Partial<User>;

// Required - Todos campos obrigatórios
type RequiredConfig = Required<Config>;

// Pick - Selecionar campos específicos
type UserPreview = Pick<User, 'id' | 'name' | 'avatar'>;

// Omit - Remover campos específicos
type PublicUser = Omit<User, 'password' | 'email'>;

// Record - Objeto com chaves específicas
type ErrorMessages = Record<string, string>;

// Readonly - Campos somente leitura
type ImmutableUser = Readonly<User>;
```

## 2. REACT

### 2.1 Componentes Funcionais

**Sempre use componentes funcionais:**

```typescript
// ✅ BOM - Componente funcional
export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

// ❌ EVITE - Class components (obsoleto)
class MyComponent extends React.Component {
  // ...
}
```

### 2.2 Props Interface

**Defina interface de props claramente:**

```typescript
// ✅ BOM - Interface clara e documentada
interface ButtonProps {
  /** Texto do botão */
  label: string;
  /** Callback ao clicar */
  onClick: () => void;
  /** Variante visual do botão */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Se o botão está desabilitado */
  disabled?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Props HTML nativas */
  children?: React.ReactNode;
}

export function Button({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  className,
  children,
}: ButtonProps) {
  // ...
}
```

### 2.3 Hooks - Ordem e Organização

**Mantenha ordem consistente dos hooks:**

```typescript
export function MyComponent() {
  // 1. Hooks de roteamento/navegação
  const navigate = useNavigate();
  const { portalId } = useParams();

  // 2. Hooks de contexto
  const { theme } = useTheme();
  const { user } = useAuth();

  // 3. Hooks de dados (queries/mutations)
  const { data, isLoading } = useQuery();
  const mutation = useMutation();

  // 4. Estado local
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({});

  // 5. Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // 6. Memos/Callbacks
  const processedData = useMemo(() => {
    return data?.filter(item => item.active);
  }, [data]);

  const handleSubmit = useCallback(() => {
    // ...
  }, [dependency]);

  // 7. Effects
  useEffect(() => {
    // Side effect
  }, [dependency]);

  // Render
  return <div>...</div>;
}
```

### 2.4 Conditional Rendering

**Use padrões claros para renderização condicional:**

```typescript
// ✅ BOM - Early return para estados de loading/error
export function DataDisplay() {
  const { data, isLoading, error } = useData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {data.map(item => (
        <ItemCard key={item.id} {...item} />
      ))}
    </div>
  );
}

// ✅ BOM - Operador ternário para casos simples
return (
  <div>
    {showTitle ? <h1>{title}</h1> : null}
    {count > 0 && <Badge>{count}</Badge>}
  </div>
);
```

### 2.5 Event Handlers

**Nomeie handlers consistentemente:**

```typescript
// ✅ BOM - Nomenclatura consistente: handle + Noun + Event
export function Form() {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // ...
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // ...
  };

  const handleButtonClick = () => {
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleInputChange} />
      <button onClick={handleButtonClick}>Submit</button>
    </form>
  );
}
```

## 3. HOOKS CUSTOMIZADOS

### 3.1 Estrutura de Hook

```typescript
/**
 * Hook para gerenciar paginação
 * @param initialPage - Página inicial
 * @param totalPages - Total de páginas
 * @returns Objeto com estado e funções de paginação
 */
export function usePagination(
  initialPage: number = 1,
  totalPages: number
) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return {
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    isFirstPage,
    isLastPage,
  };
}
```

### 3.2 Hook com Cleanup

```typescript
export function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: WindowEventMap[K]) => {
      savedHandler.current(event);
    };

    window.addEventListener(event, listener);

    // Cleanup
    return () => {
      window.removeEventListener(event, listener);
    };
  }, [event]);
}
```

## 4. JQEL PATTERNS

### 4.1 Query Hooks

```typescript
// ✅ BOM - Hook específico com tipos
interface UserProfile {
  id: string;
  name: string;
  bio: string;
}

export function useUserProfile(userId: string) {
  const query = useJQELQuery<UserProfile>({
    schema: 'system',
    select: 'user_profile',
    where: {
      userId: { $eq: userId }
    },
    output: ['id', 'name', 'bio']
  }, {
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,  // Só executa se userId existir
  });

  // Processar dados antes de retornar
  const profile = useMemo(() => {
    if (!query.data?.data?.[0]) return null;
    return query.data.data[0];
  }, [query.data]);

  return {
    profile,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
```

### 4.2 Mutation Hooks

```typescript
// ✅ BOM - Mutation com callbacks
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useJQELMutation({
    schema: 'system',
    mutate: 'user_profile',
    action: 'update',
  }, {
    onSuccess: () => {
      // Invalidar cache
      queryClient.invalidateQueries(['jqel']);

      // Mostrar sucesso
      toast({
        title: 'Perfil atualizado',
        description: 'Suas alterações foram salvas.',
      });
    },
    onError: (error) => {
      // Mostrar erro
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
```

## 5. PERFORMANCE

### 5.1 Memoização

```typescript
// ✅ BOM - useMemo para cálculos pesados
export function DataTable({ items }: { items: Item[] }) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      active: items.filter(i => i.active).length,
      value: items.reduce((sum, i) => sum + i.value, 0),
    };
  }, [items]);

  return (
    <div>
      <Stats {...stats} />
      <Table items={sortedItems} />
    </div>
  );
}
```

### 5.2 Callbacks

```typescript
// ✅ BOM - useCallback para funções passadas como props
export function Parent() {
  const [count, setCount] = useState(0);

  // Sem useCallback, Child re-renderiza sempre
  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);  // Dependências vazias = função estável

  return <Child onIncrement={handleIncrement} />;
}

const Child = React.memo(({ onIncrement }: ChildProps) => {
  console.log('Child rendered');
  return <button onClick={onIncrement}>+</button>;
});
```

### 5.3 Lazy Loading

```typescript
// ✅ BOM - Lazy loading de componentes pesados
const HeavyComponent = lazy(() =>
  import('./HeavyComponent')
);

const ChartLibrary = lazy(() =>
  import('./charts').then(module => ({
    default: module.AdvancedChart
  }))
);

export function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
      <ChartLibrary data={data} />
    </Suspense>
  );
}
```

## 6. ESTADO E FORMS

### 6.1 React Hook Form com Zod

```typescript
// ✅ BOM - Formulário tipado com validação
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  age: z.number().min(18, 'Deve ser maior de 18 anos'),
  terms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos',
  }),
});

type FormData = z.infer<typeof formSchema>;

export function RegistrationForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',  // Validar enquanto digita
    defaultValues: {
      name: '',
      email: '',
      age: 18,
      terms: false,
    },
  });

  // Watch campo específico
  const watchedEmail = watch('email');

  const onSubmit = async (data: FormData) => {
    try {
      await saveData(data);
      reset();  // Limpar formulário
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input {...register('name')} />
        {errors.name && (
          <span className="text-destructive">
            {errors.name.message}
          </span>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isDirty || !isValid || isSubmitting}
      >
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  );
}
```

### 6.2 Estado Complexo com useReducer

```typescript
// ✅ BOM - useReducer para estado complexo
type State = {
  items: Item[];
  filter: string;
  sortBy: 'name' | 'date';
  isLoading: boolean;
  error: string | null;
};

type Action =
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'SET_SORT'; payload: 'name' | 'date' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload, error: null };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

export function ItemList() {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    filter: '',
    sortBy: 'name',
    isLoading: false,
    error: null,
  });

  const loadItems = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const items = await fetchItems();
      dispatch({ type: 'SET_ITEMS', payload: items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Filtrar e ordenar items
  const displayItems = useMemo(() => {
    let filtered = state.items;

    if (state.filter) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(state.filter.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      if (state.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return a.date.getTime() - b.date.getTime();
    });
  }, [state.items, state.filter, state.sortBy]);

  // ...
}
```

## 7. TRATAMENTO DE ERROS

### 7.1 Error Boundaries

```typescript
// ✅ BOM - Error boundary para capturar erros
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Enviar para serviço de logging
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-fallback">
            <h2>Algo deu errado</h2>
            <details>
              <summary>Detalhes do erro</summary>
              <pre>{this.state.error?.message}</pre>
            </details>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Uso
<ErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent />
</ErrorBoundary>
```

### 7.2 Try-Catch em Async

```typescript
// ✅ BOM - Tratamento de erro completo
export function useAsyncOperation() {
  const [state, setState] = useState<{
    data: Data | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });

    try {
      const result = await fetchData();
      setState({ data: result, isLoading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Erro desconhecido';

      setState({
        data: null,
        isLoading: false,
        error: new Error(errorMessage),
      });

      // Log para debugging
      console.error('Failed to fetch data:', error);
    }
  }, []);

  return { ...state, execute };
}
```

## 8. TESTES (Futuro)

### 8.1 Estrutura de Teste

```typescript
// ✅ BOM - Teste bem estruturado
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  // Setup comum
  const defaultProps = {
    title: 'Test Title',
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title correctly', () => {
    render(<MyComponent {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', async () => {
    render(<MyComponent {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('should show error message on invalid input', async () => {
    render(<MyComponent {...defaultProps} />);

    const input = screen.getByLabelText(/email/i);
    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });
});
```

## 9. COMENTÁRIOS E DOCUMENTAÇÃO

### 9.1 JSDoc para Funções Públicas

```typescript
/**
 * Formata um valor monetário para exibição
 *
 * @param value - Valor numérico a formatar
 * @param currency - Código da moeda (padrão: 'BRL')
 * @param locale - Locale para formatação (padrão: 'pt-BR')
 * @returns String formatada com símbolo da moeda
 *
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 * formatCurrency(1234.56, 'USD', 'en-US') // "$1,234.56"
 */
export function formatCurrency(
  value: number,
  currency: string = 'BRL',
  locale: string = 'pt-BR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}
```

### 9.2 Comentários Inline

```typescript
// ✅ BOM - Comentário que explica o "porquê"
export function processData(items: Item[]) {
  // Filtrar items inativos primeiro para reduzir processamento
  // nas operações subsequentes mais pesadas
  const activeItems = items.filter(item => item.active);

  // Usar Map para O(1) lookup ao invés de múltiplos find() O(n)
  const itemMap = new Map(activeItems.map(item => [item.id, item]));

  // Processar em lotes de 100 para evitar bloqueio da UI
  const BATCH_SIZE = 100;
  // ...
}

// ❌ RUIM - Comentário óbvio
export function sum(a: number, b: number) {
  // Soma a e b
  return a + b;  // Retorna a soma
}
```

## 10. IMPORTS E ORGANIZAÇÃO

### 10.1 Ordem de Imports

```typescript
// 1. React e bibliotecas externas
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

// 2. Componentes UI (shadcn)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 3. Hooks e utilitários globais
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// 4. Types e interfaces globais
import type { User, Post } from '@/types';

// 5. Componentes locais do módulo
import { UserCard } from '../components/UserCard';
import { PostList } from '../components/PostList';

// 6. Hooks locais do módulo
import { useModuleData } from '../hooks/useModuleData';

// 7. Types locais do módulo
import type { ModuleConfig } from '../types';

// 8. Estilos (se houver)
import styles from './Component.module.css';
```

## 11. CHECKLIST DE QUALIDADE

### Antes do Commit

- [ ] **TypeScript**: Sem erros de tipo (`npm run type-check`)
- [ ] **Lint**: Sem warnings do ESLint
- [ ] **Imports**: Organizados e sem imports não utilizados
- [ ] **Console**: Remover console.log de debug
- [ ] **Comentários**: Remover comentários de código morto
- [ ] **TODO**: Resolver ou documentar TODOs pendentes
- [ ] **Props**: Interfaces definidas e documentadas
- [ ] **Hooks**: Seguem convenção `use*`
- [ ] **Memoização**: Aplicada onde necessário
- [ ] **Error Handling**: Try-catch em operações async
- [ ] **Loading States**: UI de loading implementada
- [ ] **Empty States**: UI para dados vazios
- [ ] **Accessibility**: Labels, ARIA quando necessário
- [ ] **Responsive**: Funciona em mobile e desktop
- [ ] **Theme**: Funciona em light e dark mode

### Code Smells a Evitar

- [ ] Componentes com mais de 300 linhas
- [ ] Funções com mais de 50 linhas
- [ ] Mais de 5 parâmetros em uma função
- [ ] Nesting de mais de 3 níveis
- [ ] Duplicação de código (DRY)
- [ ] Lógica de negócio em componentes
- [ ] Estado compartilhado sem contexto
- [ ] Mutations diretas de props ou estado
- [ ] useEffect com muitas dependências
- [ ] Imports circulares

---

**Lembre-se**: Código limpo e bem organizado é mais importante que código "esperto". Priorize legibilidade e manutenibilidade!