# PLAN_COMPOSITION.md - Sistema de Composições de Layout

**Objetivo**: Implementar sistema de composições de layout baseado em slots nomeados com HTML semântico, permitindo que portais e módulos componham interfaces flexíveis e reutilizáveis.

---

## 📋 RESUMO EXECUTIVO

### Problemas Identificados
1. ❌ Não há sistema de layout reutilizável - cada página implementa estrutura manualmente
2. ❌ Módulos não podem oferecer componentes de navegação/sidebar de forma padronizada
3. ❌ Impossível para módulos acessarem áreas do layout programaticamente (ex: Chat capturar contexto)
4. ⚠️ Falta HTML semântico consistente para acessibilidade e SEO

### Solução (Baseada em Padrões)
- ✅ CompositionRegistry + SlotComponentRegistry para gerenciar composições e componentes
- ✅ Composições base da plataforma (default, settings) prontas para uso
- ✅ Módulos registram componentes para slots (navbar, sidebar, companion, breadcrumb, footer)
- ✅ Component `<Page>` permite páginas escolherem qual composição usar
- ✅ HTML semântico com IDs padronizados (#navbar, #sidebar, #main-content, #companion, #footer)
- ✅ Hook `useCompositionArea()` para acesso programático a áreas do layout

---

## 🎯 FASE 1: REGISTRIES E TIPOS

### 1.1. Criar Tipos TypeScript

- [x] Criar `src/frontend/src/core/composition/types.ts`
  - [x] Interface `SlotComponent`
  - [x] Interface `Composition`
  - [x] Interface `ResolvedComposition`
  - [x] Type `SlotType` = 'navbar' | 'sidebar' | 'companion' | 'breadcrumb' | 'footer'
  - [x] Type `LayoutWidth` = 'full-size' | 'centered'
  - [x] Type `LayoutSize` = 'sm' | 'md' | 'lg'

**Leitura de Referência**
- `specs/DESIGN_COMPOSITION.md` - Seção "Estrutura de Dados"

**Código de Referência**:
```typescript
export interface SlotComponent {
  slot: 'navbar' | 'sidebar' | 'companion' | 'breadcrumb' | 'footer';
  componentId: string;
  component: React.ComponentType;
  providedBy: string;
  name: string;
  metadata?: Record<string, any>;
}

export interface Composition {
  id: string;
  name: string;
  providedBy: string;
  slots: {
    navbar?: boolean;
    sidebar?: boolean;
    companion?: boolean;
    breadcrumb?: boolean;
    desktop: true;
    footer?: boolean;
  };
  components: {
    navbar?: string;
    sidebar?: string;
    companion?: string;
    breadcrumb?: string;
    footer?: string;
  };
  layout: {
    width: 'full-size' | 'centered';
    size?: 'sm' | 'md' | 'lg';
  };
  metadata?: Record<string, any>;
}
```

### 1.2. Implementar CompositionRegistry

- [x] Criar `src/frontend/src/core/composition/CompositionRegistry.ts`
  - [x] Classe `CompositionRegistry`
  - [x] Método `register(composition: Composition): void`
  - [x] Método `unregister(compositionId: string): void`
  - [x] Método `get(compositionId: string): Composition | undefined`
  - [x] Método `getAll(): Composition[]`
  - [x] Método `getByProvider(providedBy: string): Composition[]`
  - [x] Exportar singleton `compositionRegistry`

**Código de Referência**:
```typescript
class CompositionRegistry {
  private compositions: Map<string, Composition> = new Map();

  register(composition: Composition): void {
    this.compositions.set(composition.id, composition);
  }

  unregister(compositionId: string): void {
    this.compositions.delete(compositionId);
  }

  get(compositionId: string): Composition | undefined {
    return this.compositions.get(compositionId);
  }

  getAll(): Composition[] {
    return Array.from(this.compositions.values());
  }

  getByProvider(providedBy: string): Composition[] {
    return this.getAll().filter(c => c.providedBy === providedBy);
  }
}

export const compositionRegistry = new CompositionRegistry();
```

### 1.3. Implementar SlotComponentRegistry

- [x] Criar `src/frontend/src/core/composition/SlotComponentRegistry.ts`
  - [x] Classe `SlotComponentRegistry`
  - [x] Método `register(component: SlotComponent): void`
  - [x] Método `unregister(componentId: string): void`
  - [x] Método `get(componentId: string): SlotComponent | undefined`
  - [x] Método `getBySlot(slot: string): SlotComponent[]`
  - [x] Método `getAll(): SlotComponent[]`
  - [x] Exportar singleton `slotComponentRegistry`

---

## 🎯 FASE 2: COMPOSIÇÕES BASE DA PLATAFORMA

### 2.1. Criar Platform Breadcrumb Component

- [x] Criar `src/frontend/src/core/composition/components/PlatformBreadcrumb.tsx`
  - [x] Componente React que renderiza breadcrumb
  - [x] Integrar com React Router para navegação hierárquica
  - [x] Suportar tema claro/escuro
  - [x] Usar componente Breadcrumb do shadcn/ui

### 2.2. Registrar Platform Breadcrumb

- [x] Criar `src/frontend/src/core/composition/platform/registerPlatformComponents.ts`
  - [x] Função `registerPlatformComponents()`
  - [x] Registrar `platform-breadcrumb` no `slotComponentRegistry`

**Código de Referência**:
```typescript
import { slotComponentRegistry } from '../SlotComponentRegistry';
import { PlatformBreadcrumb } from '../components/PlatformBreadcrumb';

export function registerPlatformComponents() {
  slotComponentRegistry.register({
    slot: 'breadcrumb',
    componentId: 'platform-breadcrumb',
    component: PlatformBreadcrumb,
    providedBy: 'platform',
    name: 'Platform Breadcrumb'
  });
}
```

### 2.3. Criar Composições Base

- [x] Criar `src/frontend/src/core/composition/platform/registerPlatformCompositions.ts`
  - [x] Função `registerPlatformCompositions()`
  - [x] Registrar composição `default`
  - [x] Registrar composição `settings`

**Código de Referência**:
```typescript
import { compositionRegistry } from '../CompositionRegistry';

export function registerPlatformCompositions() {
  // Composição 'default'
  compositionRegistry.register({
    id: 'default',
    name: 'Default Layout',
    providedBy: 'platform',
    slots: {
      breadcrumb: true,
      desktop: true
    },
    components: {
      breadcrumb: 'platform-breadcrumb'
    },
    layout: {
      width: 'centered',
      size: 'md'
    }
  });

  // Composição 'settings'
  compositionRegistry.register({
    id: 'settings',
    name: 'Settings Layout',
    providedBy: 'platform',
    slots: {
      navbar: true,
      breadcrumb: true,
      desktop: true
    },
    components: {
      breadcrumb: 'platform-breadcrumb'
    },
    layout: {
      width: 'centered',
      size: 'md'
    }
  });
}
```

### 2.4. Inicializar Platform

- [x] Criar `src/frontend/src/core/composition/platform/index.ts`
  - [x] Exportar função `initializePlatformCompositions()`
  - [x] Chamar `registerPlatformComponents()`
  - [x] Chamar `registerPlatformCompositions()`

- [x] Chamar `initializePlatformCompositions()` em `src/frontend/src/App.tsx` antes de renderizar rotas

---

## 🎯 FASE 3: COMPOSITIONPROVIDER E CONTEXT

### 3.1. Criar CompositionContext

- [x] Criar `src/frontend/src/core/composition/CompositionContext.tsx`
  - [x] Interface `CompositionContextValue`
  - [x] `React.createContext<CompositionContextValue>()`
  - [x] Provider component `CompositionProvider`
  - [x] Hook `useComposition()`

**Código de Referência**:
```typescript
interface CompositionContextValue {
  compositionRegistry: CompositionRegistry;
  slotComponentRegistry: SlotComponentRegistry;
  currentComposition: Composition | null;
  setCurrentComposition: (compositionId: string) => void;
  getSlotComponent: (componentId: string) => SlotComponent | undefined;
  resolveComposition: (compositionId: string) => ResolvedComposition;
}

export function CompositionProvider({ children }: { children: React.ReactNode }) {
  const [currentComposition, setCurrentCompositionState] = useState<Composition | null>(null);

  const setCurrentComposition = (compositionId: string) => {
    const composition = compositionRegistry.get(compositionId);
    setCurrentCompositionState(composition || null);
  };

  const getSlotComponent = (componentId: string) => {
    return slotComponentRegistry.get(componentId);
  };

  const resolveComposition = (compositionId: string): ResolvedComposition => {
    const composition = compositionRegistry.get(compositionId);
    if (!composition) {
      throw new Error(`Composition "${compositionId}" not found`);
    }

    const resolvedComponents: any = {};

    Object.entries(composition.components).forEach(([slot, componentId]) => {
      if (componentId) {
        const slotComponent = slotComponentRegistry.get(componentId);
        if (slotComponent) {
          resolvedComponents[slot] = slotComponent.component;
        }
      }
    });

    return {
      ...composition,
      resolvedComponents
    };
  };

  const value: CompositionContextValue = {
    compositionRegistry,
    slotComponentRegistry,
    currentComposition,
    setCurrentComposition,
    getSlotComponent,
    resolveComposition
  };

  return (
    <CompositionContext.Provider value={value}>
      {children}
    </CompositionContext.Provider>
  );
}

export function useComposition() {
  const context = useContext(CompositionContext);
  if (!context) {
    throw new Error('useComposition must be used within CompositionProvider');
  }
  return context;
}
```

### 3.2. Adicionar Provider em App.tsx

- [x] Envolver aplicação com `<CompositionProvider>` em `src/frontend/src/App.tsx`

---

## 🎯 FASE 4: COMPOSITIONRENDERER E PAGE COMPONENT

### 4.1. Criar CompositionRenderer

- [x] Criar `src/frontend/src/core/composition/CompositionRenderer.tsx`
  - [x] Component `CompositionRenderer`
  - [x] Renderizar HTML semântico com IDs padronizados
  - [x] Aplicar layout width (full-size ou centered)
  - [x] Renderizar slots condicionalmente
  - [x] Renderizar componentes resolvidos em cada slot

**Leitura de Referência**
- `specs/DESIGN_COMPOSITION.md` - Seção "CompositionRenderer"
- `specs/DESIGN_COMPOSITION.md` - Seção "HTML Semântico"

**Código de Referência**:
```typescript
interface CompositionRendererProps {
  composition: ResolvedComposition;
  children: React.ReactNode;
}

export function CompositionRenderer({ composition, children }: CompositionRendererProps) {
  const { slots, resolvedComponents, layout } = composition;

  const widthClass = layout.width === 'full-size'
    ? 'w-full'
    : `max-w-screen-${layout.size || 'md'} mx-auto`;

  return (
    <div id="portal-root" className={widthClass}>
      {slots.navbar && resolvedComponents.navbar && (
        <nav id="navbar">
          <resolvedComponents.navbar />
        </nav>
      )}

      {slots.sidebar && resolvedComponents.sidebar && (
        <aside id="sidebar">
          <resolvedComponents.sidebar />
        </aside>
      )}

      {slots.breadcrumb && resolvedComponents.breadcrumb && (
        <nav id="breadcrumb">
          <resolvedComponents.breadcrumb />
        </nav>
      )}

      <article id="main-content">
        {children}
      </article>

      {slots.companion && resolvedComponents.companion && (
        <aside id="companion">
          <resolvedComponents.companion />
        </aside>
      )}

      {slots.footer && resolvedComponents.footer && (
        <footer id="footer">
          <resolvedComponents.footer />
        </footer>
      )}
    </div>
  );
}
```

### 4.2. Criar Page Component

- [x] Criar `src/frontend/src/core/composition/Page.tsx`
  - [x] Component `Page` com prop `composition?: string`
  - [x] Default composition = 'default'
  - [x] Usar `useComposition()` para resolver composição
  - [x] Renderizar `<CompositionRenderer>`

**Código de Referência**:
```typescript
interface PageProps {
  composition?: string;
  children: React.ReactNode;
}

export function Page({ composition = 'default', children }: PageProps) {
  const { resolveComposition } = useComposition();

  const resolved = resolveComposition(composition);

  return (
    <CompositionRenderer composition={resolved}>
      {children}
    </CompositionRenderer>
  );
}
```

### 4.3. Exportar do core/composition

- [x] Criar `src/frontend/src/core/composition/index.ts`
  - [x] Exportar tipos
  - [x] Exportar registries
  - [x] Exportar `Page` component
  - [x] Exportar `useComposition` hook
  - [x] Exportar `CompositionProvider`
  - [x] Exportar `initializePlatformCompositions`

---

## 🎯 FASE 5: INTEGRAÇÃO COM MODULEREGISTRY

### 5.1. Modificar ModuleRegistry para registrar SlotComponents

- [x] Editar `src/frontend/src/core/modules/ModuleRegistry.ts`
  - [x] No método `register()`, verificar se módulo exporta `slotComponents`
  - [x] Se sim, registrar cada componente no `slotComponentRegistry`
  - [x] Adicionar `providedBy: manifest.id` ao registrar

**Código de Referência**:
```typescript
register(moduleExports: any) {
  const { manifest, routes, slotComponents, compositions } = moduleExports;

  // Registrar módulo
  this.modules.set(manifest.id, manifest);
  this.routes.set(manifest.id, routes || []);

  // Registrar slot components
  if (slotComponents) {
    slotComponents.forEach((sc: SlotComponent) => {
      slotComponentRegistry.register({
        ...sc,
        providedBy: manifest.id
      });
    });
  }

  // Registrar composições
  if (compositions) {
    compositions.forEach((comp: Composition) => {
      compositionRegistry.register({
        ...comp,
        providedBy: manifest.id
      });
    });
  }
}
```

### 5.2. Modificar ModuleRegistry para limpar ao desativar

- [x] Criar método `unregisterModuleCompositions(moduleId: string)`
  - [x] Remover slot components do módulo
  - [x] Remover composições do módulo

**Código de Referência**:
```typescript
unregisterModuleCompositions(moduleId: string) {
  // Remover slot components
  const components = slotComponentRegistry.getAll();
  components
    .filter(c => c.providedBy === moduleId)
    .forEach(c => slotComponentRegistry.unregister(c.componentId));

  // Remover composições
  const compositions = compositionRegistry.getByProvider(moduleId);
  compositions.forEach(c => compositionRegistry.unregister(c.id));
}
```

---

## 🎯 FASE 6: HOOKS DE ACESSO PROGRAMÁTICO

### 6.1. Criar useCompositionArea Hook

- [x] Criar `src/frontend/src/core/composition/hooks/useCompositionArea.ts`
  - [x] Hook que recebe `areaId: string`
  - [x] Retorna `HTMLElement | null`
  - [x] Usa `useEffect` para buscar elemento por ID
  - [x] Re-executa quando `areaId` muda

**Leitura de Referência**
- `specs/DESIGN_COMPOSITION.md` - Seção "Acesso Programático a Áreas"

**Código de Referência**:
```typescript
export function useCompositionArea(areaId: string): HTMLElement | null {
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById(areaId);
    setElement(el);
  }, [areaId]);

  return element;
}
```

### 6.2. Exportar hook

- [x] Adicionar export em `src/frontend/src/core/composition/index.ts`

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais
- **Slots nomeados**: sidebar (esquerda) e companion (direita) para clareza semântica
- **HTML semântico**: Usar tags corretas (nav, aside, article, footer) para acessibilidade
- **IDs padronizados**: Permitem acesso programático consistente por módulos
- **Registries singleton**: CompositionRegistry e SlotComponentRegistry globais
- **React Context**: CompositionProvider disponibiliza registries e utilities
- **Composições base**: Platform oferece 'default' e 'settings' prontos
- **Auto-registro**: Módulos registram componentes automaticamente via ModuleRegistry

### Limitações Conhecidas
- **Apenas uma composição por página**: Não suporta layouts aninhados
  - Mitigação: Composições podem ter estruturas complexas, slots podem ter sub-layouts
  - Alternativa futura: Sistema de templates aninhados se necessário

- **Componentes de slot devem ser React Components**: Não suporta outros formatos
  - Mitigação: Padrão da plataforma é React, adequado para todos os casos

- **IDs globais**: Possível conflito se múltiplos portais na mesma página
  - Mitigação: Plataforma renderiza apenas um portal por vez
  - Alternativa futura: Prefixar IDs com portalId se necessário

### Referências
- `specs/DESIGN_COMPOSITION.md` - Especificação técnica completa
- `spec/SPEC-modules.md` - Integração com sistema de módulos
- `spec/SPEC-routing.md` - Integração com roteamento
- shadcn/ui Breadcrumb: https://ui.shadcn.com/docs/components/breadcrumb
