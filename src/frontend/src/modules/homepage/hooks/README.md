# Hooks

Custom React hooks do módulo Homepage.

## useHomepageConfig

Busca e gerencia configuração da instância do módulo.

### Signature

```typescript
function useHomepageConfig(instanceId: string): UseHomepageConfigReturn
```

### Return Type

```typescript
interface UseHomepageConfigReturn {
  config: HomepageConfig | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
```

### Implementação

```typescript
import { useQuery } from '@tanstack/react-query';

export function useHomepageConfig(instanceId: string) {
  return useQuery({
    queryKey: ['module', 'homepage', 'instance', instanceId],
    queryFn: async () => {
      const response = await fetch('/api/jqel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema: 'platform',
          select: 'instance',
          where: {
            instanceId: { $eq: instanceId }
          },
          output: ['config']
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch homepage config');
      }

      const data = await response.json();
      return data.config as HomepageConfig;
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

### Uso

```typescript
function HomePage({ instanceId }: HomePageProps) {
  const { config, isLoading, isError } = useHomepageConfig(instanceId);

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState />;
  if (!config) return <EmptyState />;

  return (
    <main>
      {config.sections.map((section) => (
        // Render sections
      ))}
    </main>
  );
}
```

---

## useUpdateHomepageConfig

Atualiza configuração da instância (usado pelo Setup Module).

### Signature

```typescript
function useUpdateHomepageConfig(): UseUpdateHomepageConfigReturn
```

### Return Type

```typescript
interface UseUpdateHomepageConfigReturn {
  mutate: (params: UpdateParams) => void;
  mutateAsync: (params: UpdateParams) => Promise<void>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
}

interface UpdateParams {
  instanceId: string;
  config: Partial<HomepageConfig>;
}
```

### Implementação

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateHomepageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ instanceId, config }: UpdateParams) => {
      const response = await fetch('/api/jqel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema: 'platform',
          mutate: 'instance',
          action: 'update',
          values: { config },
          where: {
            instanceId: { $eq: instanceId }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update homepage config');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries(['module', 'homepage', 'instance', variables.instanceId]);
      queryClient.invalidateQueries(['module', 'homepage']);
    },
  });
}
```

---

## useScrollAnimation

Gerencia animações triggered por scroll usando Intersection Observer.

### Signature

```typescript
function useScrollAnimation<T extends HTMLElement>(): UseScrollAnimationReturn<T>
```

### Return Type

```typescript
interface UseScrollAnimationReturn<T> {
  ref: React.RefObject<T>;
  isVisible: boolean;
  hasAnimated: boolean;
}
```

### Implementação

```typescript
import { useEffect, useRef, useState } from 'react';

export function useScrollAnimation<T extends HTMLElement>(
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      {
        threshold: 0.2, // 20% visible
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated, options]);

  return { ref, isVisible, hasAnimated };
}
```

### Uso

```typescript
function FeaturesSection({ config }: FeaturesSectionProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>();

  return (
    <section ref={ref}>
      <AnimatedList shouldAnimate={isVisible}>
        {config.items.map((item) => (
          <FeatureCard key={item.title} {...item} />
        ))}
      </AnimatedList>
    </section>
  );
}
```

---

## useReducedMotion

Detecta preferência do usuário por animações reduzidas.

### Signature

```typescript
function useReducedMotion(): boolean
```

### Implementação

```typescript
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  return prefersReducedMotion;
}
```

### Uso

```typescript
function AnimatedText({ text, type }: AnimatedTextProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span>{text}</span>;
  }

  return <BlurInText text={text} />;
}
```

---

## usePortalsList

Busca lista de portais públicos (para Portals Section).

### Signature

```typescript
function usePortalsList(): UsePortalsListReturn
```

### Return Type

```typescript
interface UsePortalsListReturn {
  portals: Portal[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

interface Portal {
  portalId: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  visibility: 'public' | 'private';
}
```

### Implementação

```typescript
import { useQuery } from '@tanstack/react-query';

export function usePortalsList() {
  const { data, ...rest } = useQuery({
    queryKey: ['portals', 'public'],
    queryFn: async () => {
      const response = await fetch('/api/jqel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema: 'backend',
          select: 'portal',
          where: {
            visibility: { $eq: 'public' }
          },
          output: ['portalId', 'name', 'description', 'icon', 'active']
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portals');
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000,  // 10 minutes
    cacheTime: 60 * 60 * 1000,  // 1 hour
  });

  return {
    portals: data || [],
    ...rest,
  };
}
```

---

## Convenções

### Naming

- Hooks: `use` prefix + camelCase
- Retorna objeto (não tuple) para clarity
- Consistent naming: `isLoading`, `isError`, `error`

### Error Handling

```typescript
// Throw errors, let TanStack Query handle them
if (!response.ok) {
  throw new Error('Descriptive error message');
}
```

### Caching

- `staleTime`: Quanto tempo data é considerada fresh
- `cacheTime`: Quanto tempo mantém cache inativo

### TypeScript

- Sempre tipar return types
- Usar generics quando aplicável
- Export types junto com hooks

## Testing

```typescript
// useHomepageConfig.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHomepageConfig } from './useHomepageConfig';

describe('useHomepageConfig', () => {
  it('fetches config successfully', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(
      () => useHomepageConfig('homepage-main'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.config).toBeDefined();
  });
});
```

## Referências

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Hooks](https://react.dev/reference/react)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
