# DESIGN_COMPOSITION.md - Sistema de Composições de Layout

**Objetivo**: Definir um sistema de composições de layout baseado em slots nomeados com HTML semântico, permitindo que portais e módulos componham interfaces flexíveis e reutilizáveis.

---

## 📋 VISÃO GERAL

O Sistema de Composições permite:
- Portais definirem estruturas de layout reutilizáveis
- Módulos oferecerem componentes para slots específicos
- Páginas escolherem qual composição usar
- Acesso programático a áreas do layout via IDs padronizados
- HTML semântico para acessibilidade e SEO

---

## 🎯 CONCEITOS FUNDAMENTAIS

### 1. Slot

**Definição**: Posição nomeada na composição onde um componente pode ser renderizado.

**Slots Disponíveis**:
- `navbar` - Barra de navegação superior
- `sidebar` - Barra lateral esquerda (navegação/menu)
- `companion` - Barra lateral direita (chat/ferramentas/assistentes)
- `breadcrumb` - Navegação hierárquica
- `desktop` - Área principal de conteúdo (obrigatória)
- `footer` - Rodapé

**HTML Semântico**:
```html
<div id="portal-root">
  <nav id="navbar"></nav>              <!-- Navbar -->
  <aside id="sidebar"></aside>          <!-- Sidebar (esquerda) -->
  <nav id="breadcrumb"></nav>           <!-- Breadcrumb -->
  <article id="main-content"></article> <!-- Desktop (obrigatório) -->
  <aside id="companion"></aside>        <!-- Companion (direita) -->
  <footer id="footer"></footer>         <!-- Footer -->
</div>
```

### 2. Slot Component

**Definição**: Componente React oferecido por módulo ou portal para preencher um slot específico.

**Estrutura**:
```typescript
interface SlotComponent {
  slot: 'navbar' | 'sidebar' | 'companion' | 'breadcrumb' | 'footer';
  componentId: string;           // ID único (ex: 'menu-navbar')
  component: React.ComponentType;
  providedBy: string;            // moduleId ou 'platform'
  name: string;                  // Nome legível
  metadata?: Record<string, any>; // Metadados opcionais
}
```

**Exemplo**:
```typescript
{
  slot: 'companion',
  componentId: 'chat-companion',
  component: ChatCompanion,
  providedBy: 'chat',
  name: 'Chat Assistant'
}
```

### 3. Composição

**Definição**: Estrutura de layout que define quais slots renderizar, qual componente usar em cada slot, e configurações visuais.

**Estrutura**:
```typescript
interface Composition {
  id: string;                    // 'default', 'app-layout', 'settings'
  name: string;                  // Nome legível
  providedBy: string;            // 'platform' | moduleId | 'portal:id'

  slots: {                       // Quais slots estão disponíveis
    navbar?: boolean;
    sidebar?: boolean;
    companion?: boolean;
    breadcrumb?: boolean;
    desktop: true;               // Obrigatório
    footer?: boolean;
  };

  components: {                  // Componentes selecionados (referência por ID)
    navbar?: string;
    sidebar?: string;
    companion?: string;
    breadcrumb?: string;
    footer?: string;
  };

  layout: {
    width: 'full-size' | 'centered';
    size?: 'sm' | 'md' | 'lg';   // Se centered (default: md)
  };

  metadata?: Record<string, any>; // Metadados opcionais
}
```

---

## 🏗️ COMPOSIÇÕES BASE DA PLATAFORMA

### Composição 'default'

**Propósito**: Layout minimalista com apenas breadcrumb e conteúdo (comportamento atual).

**Definição**:
```typescript
{
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
}
```

**HTML Renderizado**:
```html
<div id="portal-root" class="max-w-screen-md mx-auto">
  <nav id="breadcrumb">
    <!-- Platform Breadcrumb Component -->
  </nav>
  <article id="main-content">
    <!-- Page Content -->
  </article>
</div>
```

### Composição 'settings'

**Propósito**: Layout para páginas de configuração com navbar e breadcrumb.

**Definição**:
```typescript
{
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
    // navbar não especificado - portal deve configurar
  },

  layout: {
    width: 'centered',
    size: 'md'
  }
}
```

---

## 🧩 SLOT COMPONENTS DA PLATAFORMA

### Platform Breadcrumb

**Único componente oferecido pela plataforma por padrão.**

```typescript
{
  slot: 'breadcrumb',
  componentId: 'platform-breadcrumb',
  component: PlatformBreadcrumb,
  providedBy: 'platform',
  name: 'Platform Breadcrumb'
}
```

**Responsabilidade**:
- Renderizar navegação hierárquica baseada em rotas
- Integrar com React Router
- Suportar tema claro/escuro

**Todos os outros slots (navbar, sidebar, companion, footer) são preenchidos por módulos.**

---

## 🔌 MÓDULOS OFERECEM COMPONENTES

### Exemplo: Módulo Menu

```typescript
// modules/menu/manifest.ts
export const manifest = {
  id: 'menu',
  name: 'Menu',
  version: '1.0.0',
  type: 'components'
};

// modules/menu/slotComponents.ts
export const slotComponents: SlotComponent[] = [
  {
    slot: 'navbar',
    componentId: 'menu-navbar',
    component: MenuNavbar,
    providedBy: 'menu',
    name: 'Menu Navbar'
  },
  {
    slot: 'sidebar',
    componentId: 'menu-sidebar',
    component: MenuSidebar,
    providedBy: 'menu',
    name: 'Menu Sidebar'
  }
];

// modules/menu/index.ts
export { manifest } from './manifest';
export { slotComponents } from './slotComponents';
```

**Ao ativar módulo "menu" no portal**:
- Componentes são registrados no SlotComponentRegistry
- Portal pode criar composições usando esses componentes

### Exemplo: Módulo Chat

```typescript
// modules/chat/slotComponents.ts
export const slotComponents: SlotComponent[] = [
  {
    slot: 'companion',
    componentId: 'chat-companion',
    component: ChatCompanion,
    providedBy: 'chat',
    name: 'Chat Assistant'
  }
];
```

---

## 🎨 PORTAL CRIA COMPOSIÇÕES

### Exemplo: App Layout

```typescript
{
  id: 'app-layout',
  name: 'App Layout',
  providedBy: 'portal:main',

  slots: {
    navbar: true,
    sidebar: true,
    breadcrumb: true,
    desktop: true,
    companion: true
  },

  components: {
    navbar: 'menu-navbar',
    sidebar: 'menu-sidebar',
    breadcrumb: 'platform-breadcrumb',
    companion: 'chat-companion'
  },

  layout: {
    width: 'full-size'
  }
}
```

**HTML Renderizado**:
```html
<div id="portal-root" class="w-full">
  <nav id="navbar">
    <!-- MenuNavbar Component -->
  </nav>

  <aside id="sidebar">
    <!-- MenuSidebar Component -->
  </aside>

  <nav id="breadcrumb">
    <!-- Platform Breadcrumb -->
  </nav>

  <article id="main-content" class="w-full">
    <!-- Page Content -->
  </article>

  <aside id="companion">
    <!-- ChatCompanion Component -->
  </aside>
</div>
```

---

## 🖥️ USO EM PÁGINAS

### Component `<Page>`

**Wrapper que renderiza a composição especificada.**

```typescript
interface PageProps {
  composition?: string;          // ID da composição (default: 'default')
  children: React.ReactNode;
}

// Uso
<Page composition="app-layout">
  <DashboardContent />
</Page>

// Ou usa 'default' se não especificado
<Page>
  <SimpleContent />
</Page>

// Módulo pode especificar composição própria
<Page composition="chat-fullscreen">
  <ChatInterface />
</Page>
```

### Exemplo em Rota

```typescript
// modules/dashboard/routes.ts
import { lazy } from 'react';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));

export const routes = [
  {
    path: '/dashboard',
    component: DashboardPage,
    requiresAuth: true
  }
];

// modules/dashboard/pages/DashboardPage.tsx
import { Page } from '@/core/composition';

export default function DashboardPage() {
  return (
    <Page composition="app-layout">
      <DashboardContent />
    </Page>
  );
}
```

---

## 📐 LAYOUT WIDTH

### Full-size

```typescript
layout: {
  width: 'full-size'
}
```

**CSS**:
```css
max-width: none;
width: 100%;
```

**Uso**: Dashboards, aplicativos, interfaces complexas

### Centered

```typescript
layout: {
  width: 'centered',
  size: 'md'  // sm | md | lg
}
```

**Tamanhos**:
- `sm`: 640px (max-w-screen-sm)
- `md`: 768px (max-w-screen-md) - padrão
- `lg`: 1024px (max-w-screen-lg)

**CSS**:
```css
max-width: {size}px;
margin-left: auto;
margin-right: auto;
```

**Uso**: Páginas de conteúdo, formulários, configurações

---

## 🔍 ACESSO PROGRAMÁTICO A ÁREAS

### IDs Padronizados

**Especificação**:
- `#portal-root` - Root da composição
- `#navbar` - Barra de navegação
- `#sidebar` - Barra lateral esquerda
- `#companion` - Barra lateral direita
- `#breadcrumb` - Breadcrumb
- `#main-content` - Área principal (obrigatória)
- `#footer` - Rodapé

**Garantias**:
- IDs são únicos e consistentes em todas as composições
- Áreas não renderizadas não têm elemento no DOM
- `#main-content` sempre existe

### Hook: useCompositionArea

```typescript
/**
 * Hook para acessar área da composição via ID
 * @param areaId - ID da área (ex: 'main-content', 'sidebar')
 * @returns HTMLElement ou null se área não existir
 */
export function useCompositionArea(areaId: string): HTMLElement | null {
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setElement(document.getElementById(areaId));
  }, [areaId]);

  return element;
}
```

**Uso**:
```typescript
// Chat captura contexto do conteúdo principal
function ChatAssistant() {
  const mainContent = useCompositionArea('main-content');

  const getPageContext = () => {
    return mainContent?.innerText || '';
  };

  const handleMessage = (userMessage: string) => {
    const context = getPageContext();

    sendToAI({
      message: userMessage,
      context: context
    });
  };

  // ...
}
```

### Acesso Direto via DOM

```typescript
// Módulo pode acessar diretamente
const mainContent = document.getElementById('main-content');
const pageText = mainContent?.innerText || '';

const sidebar = document.getElementById('sidebar');
const hasSidebar = sidebar !== null;
```

**Casos de Uso**:
- Chat captura contexto do article#main-content
- Módulo de anotações captura seleção em #main-content
- Módulo de tour guiado destaca elementos por ID
- Módulo de screenshot captura #portal-root

---

## 🗂️ REGISTRIES

### CompositionRegistry

**Responsabilidade**: Gerenciar composições disponíveis no portal.

```typescript
class CompositionRegistry {
  private compositions: Map<string, Composition> = new Map();

  register(composition: Composition): void;
  unregister(compositionId: string): void;
  get(compositionId: string): Composition | undefined;
  getAll(): Composition[];
  getByProvider(providedBy: string): Composition[];
}
```

**Uso**:
```typescript
// Platform registra composições base
compositionRegistry.register({
  id: 'default',
  // ...
});

// Módulo registra composição customizada
compositionRegistry.register({
  id: 'dashboard-layout',
  providedBy: 'dashboard',
  // ...
});

// Portal cria composição
compositionRegistry.register({
  id: 'app-layout',
  providedBy: 'portal:main',
  // ...
});

// Page usa composição
const composition = compositionRegistry.get('app-layout');
```

### SlotComponentRegistry

**Responsabilidade**: Gerenciar componentes oferecidos para slots.

```typescript
class SlotComponentRegistry {
  private components: Map<string, SlotComponent> = new Map();

  register(component: SlotComponent): void;
  unregister(componentId: string): void;
  get(componentId: string): SlotComponent | undefined;
  getBySlot(slot: string): SlotComponent[];
  getAll(): SlotComponent[];
}
```

**Uso**:
```typescript
// Platform registra breadcrumb
slotComponentRegistry.register({
  slot: 'breadcrumb',
  componentId: 'platform-breadcrumb',
  // ...
});

// Módulo menu registra componentes
slotComponentRegistry.register({
  slot: 'navbar',
  componentId: 'menu-navbar',
  // ...
});

slotComponentRegistry.register({
  slot: 'sidebar',
  componentId: 'menu-sidebar',
  // ...
});

// Listar componentes disponíveis para slot
const navbarComponents = slotComponentRegistry.getBySlot('navbar');
// → [{ componentId: 'menu-navbar', ... }]
```

---

## ⚛️ REACT CONTEXT

### CompositionProvider

**Responsabilidade**: Disponibilizar composições e componentes via React Context.

```typescript
interface CompositionContextValue {
  // Registries
  compositionRegistry: CompositionRegistry;
  slotComponentRegistry: SlotComponentRegistry;

  // Current composition
  currentComposition: Composition | null;
  setCurrentComposition: (compositionId: string) => void;

  // Utilities
  getSlotComponent: (componentId: string) => SlotComponent | undefined;
  resolveComposition: (compositionId: string) => ResolvedComposition;
}

interface ResolvedComposition extends Composition {
  resolvedComponents: {
    navbar?: React.ComponentType;
    sidebar?: React.ComponentType;
    companion?: React.ComponentType;
    breadcrumb?: React.ComponentType;
    footer?: React.ComponentType;
  };
}
```

**Uso**:
```typescript
// App.tsx
<CompositionProvider>
  <PortalRouter />
</CompositionProvider>

// Hook
function useComposition() {
  return useContext(CompositionContext);
}

// Componente
function Page({ composition = 'default', children }) {
  const { resolveComposition } = useComposition();
  const resolved = resolveComposition(composition);

  return <CompositionRenderer composition={resolved}>{children}</CompositionRenderer>;
}
```

---

## 🎨 COMPOSITIONRENDERER

**Responsabilidade**: Renderizar a estrutura de layout baseada na composição.

```typescript
interface CompositionRendererProps {
  composition: ResolvedComposition;
  children: React.ReactNode;
}

function CompositionRenderer({ composition, children }: CompositionRendererProps) {
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

---

## 🔄 INTEGRAÇÃO COM MODULEREGISTRY

### Auto-registro de Slot Components

```typescript
// ModuleRegistry ao carregar módulo
class ModuleRegistry {
  register(moduleExports: any) {
    const { manifest, slotComponents, compositions } = moduleExports;

    // Registrar módulo
    this.modules.set(manifest.id, manifest);

    // Registrar slot components (se houver)
    if (slotComponents) {
      slotComponents.forEach((sc: SlotComponent) => {
        slotComponentRegistry.register({
          ...sc,
          providedBy: manifest.id
        });
      });
    }

    // Registrar composições (se houver)
    if (compositions) {
      compositions.forEach((comp: Composition) => {
        compositionRegistry.register({
          ...comp,
          providedBy: manifest.id
        });
      });
    }
  }
}
```

### Desativação de Módulo

```typescript
// Ao desativar módulo
function deactivateModule(moduleId: string) {
  // Remover slot components do módulo
  const components = slotComponentRegistry.getAll();
  components
    .filter(c => c.providedBy === moduleId)
    .forEach(c => slotComponentRegistry.unregister(c.componentId));

  // Remover composições do módulo
  const compositions = compositionRegistry.getByProvider(moduleId);
  compositions.forEach(c => compositionRegistry.unregister(c.id));
}
```

---

## 💾 ARMAZENAMENTO VIA JQEL

### Composições Customizadas de Portal

**Schema**: `backend`
**Entity**: `composition`

```typescript
// Salvar composição customizada
{
  schema: 'backend',
  mutate: 'composition',
  action: 'insert',
  values: {
    id: 'app-layout',
    portalId: 'main',
    name: 'App Layout',
    providedBy: 'portal:main',
    slots: { navbar: true, sidebar: true, desktop: true },
    components: { navbar: 'menu-navbar', sidebar: 'menu-sidebar' },
    layout: { width: 'full-size' }
  }
}

// Buscar composições do portal
{
  schema: 'backend',
  select: 'composition',
  where: { portalId: { $eq: 'main' } }
}
```

### Configuração de Composição Padrão

**Portal pode definir composição padrão a ser usada quando `<Page>` não especifica.**

```typescript
// config/portals.json
{
  "portalId": "main",
  "name": "Main Portal",
  "defaultComposition": "app-layout"
}
```

---

## 🧪 EXEMPLOS DE USO

### Exemplo 1: Website Simples

**Módulos ativos**: Nenhum módulo que oferece componentes de slot

**Composição usada**: `default`

```typescript
<Page>
  <HomePage />
</Page>
```

**HTML**:
```html
<div id="portal-root" class="max-w-screen-md mx-auto">
  <nav id="breadcrumb">...</nav>
  <article id="main-content">
    <HomePage />
  </article>
</div>
```

### Exemplo 2: App com Menu

**Módulos ativos**: `menu`

**Portal cria composição**: `app-layout`

```typescript
<Page composition="app-layout">
  <DashboardPage />
</Page>
```

**HTML**:
```html
<div id="portal-root" class="w-full">
  <nav id="navbar">
    <MenuNavbar />
  </nav>
  <aside id="sidebar">
    <MenuSidebar />
  </aside>
  <nav id="breadcrumb">...</nav>
  <article id="main-content">
    <DashboardPage />
  </article>
</div>
```

### Exemplo 3: App com Menu + Chat

**Módulos ativos**: `menu`, `chat`

**Portal cria composição**: `app-with-chat`

```typescript
<Page composition="app-with-chat">
  <DocumentEditor />
</Page>
```

**HTML**:
```html
<div id="portal-root" class="w-full">
  <nav id="navbar">
    <MenuNavbar />
  </nav>
  <aside id="sidebar">
    <MenuSidebar />
  </aside>
  <nav id="breadcrumb">...</nav>
  <article id="main-content">
    <DocumentEditor />
  </article>
  <aside id="companion">
    <ChatCompanion /> <!-- Acessa #main-content para contexto -->
  </aside>
</div>
```

### Exemplo 4: Módulo com Composição Própria

**Módulo**: `chat` oferece composição `chat-fullscreen`

```typescript
// modules/chat/compositions.ts
export const compositions: Composition[] = [
  {
    id: 'chat-fullscreen',
    name: 'Chat Fullscreen',
    providedBy: 'chat',
    slots: { desktop: true },
    components: {},
    layout: { width: 'full-size' }
  }
];

// Page
<Page composition="chat-fullscreen">
  <ChatFullscreen />
</Page>
```

**HTML**:
```html
<div id="portal-root" class="w-full">
  <article id="main-content" class="w-full h-screen">
    <ChatFullscreen />
  </article>
</div>
```

---

## 📊 DIAGRAMA DE ARQUITETURA

```
┌─────────────────────────────────────────────────────────────┐
│                       PLATFORM                              │
│  - CompositionRegistry                                      │
│  - SlotComponentRegistry                                    │
│  - Composições base (default, settings)                    │
│  - SlotComponent: platform-breadcrumb                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       MODULES                               │
│  Module Menu:                                               │
│    - SlotComponents: menu-navbar, menu-sidebar             │
│  Module Chat:                                               │
│    - SlotComponents: chat-companion                        │
│    - Compositions: chat-fullscreen                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       PORTAL                                │
│  - Cria composições customizadas (app-layout)              │
│  - Seleciona componentes para slots                        │
│  - Define composição padrão                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       PAGE                                  │
│  <Page composition="app-layout">                           │
│    <PageContent />                                          │
│  </Page>                                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  COMPOSITIONRENDERER                        │
│  - Resolve componentes dos slots                           │
│  - Renderiza HTML semântico com IDs                        │
│  - Aplica layout width                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ BENEFÍCIOS

1. **HTML Semântico**: Melhora acessibilidade, SEO e compreensão do código
2. **IDs Padronizados**: Módulos podem acessar áreas programaticamente
3. **Interoperabilidade**: Chat captura contexto do #main-content automaticamente
4. **Modular**: Portal começa limpo, módulos adicionam funcionalidades
5. **Flexível**: Diferentes composições para diferentes casos de uso
6. **Reutilizável**: Composições podem ser compartilhadas entre portais
7. **Type-Safe**: TypeScript garante type safety em toda a estrutura
8. **Desacoplado**: Módulos não conhecem uns aos outros, apenas os slots

---

## 🎯 CASOS DE USO

### Website Simples
- Composição: `default`
- Slots: breadcrumb, desktop
- Layout: centered (md)

### Aplicativo Web
- Composição: `app-layout`
- Slots: navbar, sidebar, breadcrumb, desktop
- Layout: full-size

### Dashboard com Chat
- Composição: `app-with-chat`
- Slots: navbar, sidebar, breadcrumb, desktop, companion
- Layout: full-size

### Página de Configurações
- Composição: `settings`
- Slots: navbar, breadcrumb, desktop
- Layout: centered (md)

### Chat Fullscreen
- Composição: `chat-fullscreen`
- Slots: desktop
- Layout: full-size

---

## 🚀 PRÓXIMOS PASSOS

Ver `PLAN_COMPOSITION.md` para plano de implementação detalhado.
