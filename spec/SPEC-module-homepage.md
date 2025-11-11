# SPEC-module-homepage

**Status:** Draft
**Versão:** 1.0.0
**Última Atualização:** 2025-11-10

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Conceitos](#conceitos)
3. [Requisitos Funcionais](#requisitos-funcionais)
4. [Arquitetura do Módulo](#arquitetura-do-módulo)
5. [Configuração de Instância](#configuração-de-instância)
6. [Seções e Componentes](#seções-e-componentes)
7. [Animações](#animações)
8. [Integração com Outros Módulos](#integração-com-outros-módulos)
9. [Data Access](#data-access)
10. [Performance](#performance)
11. [Acessibilidade](#acessibilidade)
12. [Testes](#testes)

---

## Visão Geral

### Propósito

O módulo **Homepage** fornece uma landing page configurável e visualmente impactante para portais da plataforma. Permite criar páginas de entrada personalizadas com seções modulares (Hero, Features, Portais em Destaque, CTA) e animações sofisticadas usando **animate-ui**.

### Principais Características

- **Totalmente Configurável**: Seções habilitáveis/desabilitáveis via instância
- **Animações Profissionais**: Integração com animate-ui e Framer Motion
- **Blocos Modulares**: Hero, Features, Portals, CTA reutilizáveis
- **Multi-Layout**: Layouts diferentes por seção
- **Responsivo**: Mobile-first, adapta-se a todos os breakpoints
- **Acessível**: WCAG 2.1 AA compliant, respeita prefers-reduced-motion
- **Performático**: Lazy loading, scroll-triggered animations, otimizado para <1s load

### Casos de Uso

1. **Landing Page Principal**: Homepage do portal "main" com apresentação da plataforma
2. **Portal Público**: Páginas de entrada para portais específicos (docs, community, marketplace)
3. **Página de Produto**: Apresentação de módulos ou funcionalidades específicas
4. **Splash Page**: Página temporária para lançamentos ou campanhas

---

## Conceitos

### SPEC-M-HP-C-001: Seção

Uma **Seção** é um bloco visual e funcional da homepage que apresenta um tipo específico de conteúdo.

**Tipos de Seção:**
- `hero` - Seção principal de destaque (topo da página)
- `features` - Grade de funcionalidades ou benefícios
- `portals` - Apresentação de portais públicos disponíveis
- `cta` - Call-to-Action para conversão (signup, trial, contact)

### SPEC-M-HP-C-002: Layout de Seção

Cada tipo de seção PODE suportar múltiplos layouts:

- **Hero**: `centered` (padrão), `split` (texto + imagem)
- **Features**: `grid-2`, `grid-3` (padrão), `grid-4`
- **Portals**: `grid` (padrão), `orbit` (layout circular animado)
- **CTA**: `centered` (padrão), `split`

### SPEC-M-HP-C-003: Animação

Uma **Animação** é um efeito visual aplicado a elementos da homepage para melhorar a experiência do usuário.

**Tipos:**
- **Entrada**: Efeitos aplicados quando elemento entra no viewport
- **Interação**: Efeitos em hover, click, focus
- **Background**: Efeitos contínuos em backgrounds (grid, ripple)

### SPEC-M-HP-C-004: Intensidade de Animação

O módulo DEVE suportar 3 níveis de intensidade:

- `subtle` - Animações discretas, curta duração (<200ms)
- `normal` - Animações balanceadas (300-500ms) - padrão
- `intense` - Animações dramáticas, maior duração (>500ms)

---

## Requisitos Funcionais

### Configuração de Módulo

#### SPEC-M-HP-F-001

O módulo DEVE ser ativável em qualquer portal através do manifest.

#### SPEC-M-HP-F-002

O módulo PODE ter múltiplas instâncias no mesmo portal, desde que usem rotas diferentes.

#### SPEC-M-HP-F-003

Cada instância DEVE ter configuração independente armazenada via JQEL com `schema: "platform"`.

### Seções

#### SPEC-M-HP-F-004

A homepage DEVE permitir habilitar/desabilitar seções individualmente via configuração.

#### SPEC-M-HP-F-005

A ordem das seções DEVE ser configurável através do array `sections` na configuração.

#### SPEC-M-HP-F-006

Uma homepage DEVE ter pelo menos uma seção habilitada para ser válida.

#### SPEC-M-HP-F-007

A seção Hero, quando habilitada, DEVE sempre ser renderizada primeiro, independente da ordem no array.

### Conteúdo

#### SPEC-M-HP-F-008

Todo texto da homepage DEVE ser configurável via instância (sem hard-coded strings).

#### SPEC-M-HP-F-009

Ícones DEVEM ser selecionáveis da biblioteca Lucide React via nome de ícone (string).

#### SPEC-M-HP-F-010

Imagens DEVEM suportar URLs absolutas ou caminhos relativos do projeto.

#### SPEC-M-HP-F-011

Links de CTAs DEVEM suportar ações: `signup`, `login`, `link`, `scroll-to`, `external`.

### Animações

#### SPEC-M-HP-F-012

O módulo DEVE permitir desabilitar todas as animações via configuração (`animations.enabled: false`).

#### SPEC-M-HP-F-013

Quando `prefers-reduced-motion: reduce` for detectado, o módulo DEVE desabilitar todas as animações automaticamente, independente da configuração.

#### SPEC-M-HP-F-014

Animações de entrada DEVEM ser triggered por Intersection Observer quando o elemento entra no viewport.

#### SPEC-M-HP-F-015

Animações já executadas NÃO DEVEM repetir ao fazer scroll novamente (execução única por sessão).

---

## Arquitetura do Módulo

### Estrutura de Arquivos

#### SPEC-M-HP-A-001

O módulo DEVE seguir a estrutura padrão:

```
src/frontend/src/modules/homepage/
├── index.ts                    # Exporta manifest, routes, components
├── manifest.ts                 # Metadata do módulo
├── routes.ts                   # Definição de rotas
├── components/
│   ├── HomePage.tsx           # Componente principal
│   ├── sections/              # Componentes de seção
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── PortalsSection.tsx
│   │   └── CTASection.tsx
│   ├── animated/              # Wrappers de animate-ui
│   │   ├── AnimatedBadge.tsx
│   │   ├── AnimatedText.tsx
│   │   └── AnimatedCard.tsx
│   └── preview/               # Preview para Setup
│       └── HomepagePreview.tsx
├── hooks/
│   ├── useHomepageConfig.ts   # Query JQEL
│   └── useScrollAnimation.ts  # Scroll observer
├── types/
│   └── index.ts               # TypeScript types
└── utils/
    └── validateConfig.ts      # Zod schemas
```

### Manifest

#### SPEC-M-HP-A-002

O manifest DEVE declarar:

```typescript
{
  id: "homepage",
  name: "Home Page",
  version: "1.0.0",
  type: "functionality",
  description: "Beautiful, animated landing page with customizable sections",
  author: "Platform Team",
  dependencies: ["auth"],
  icon: "Home",
  category: "content"
}
```

### Rotas

#### SPEC-M-HP-A-003

O módulo DEVE exportar uma rota configurável por instância:

```typescript
export const routes = [
  {
    path: config.route || '/',  // Configurável, padrão '/'
    component: lazy(() => import('./components/HomePage')),
    requiresAuth: false
  }
];
```

### Dependências

#### SPEC-M-HP-A-004

O módulo DEVE declarar dependência do módulo `auth` no manifest.

#### SPEC-M-HP-A-005

O módulo DEVE usar as seguintes bibliotecas:
- `react` ^19.x
- `framer-motion` ^11.x (animate-ui dependency)
- `@tanstack/react-query` ^5.x
- `react-hook-form` ^7.x
- `zod` ^3.x
- `lucide-react` (latest)

---

## Configuração de Instância

### Schema de Configuração

#### SPEC-M-HP-CFG-001

A configuração da instância DEVE seguir o schema TypeScript:

```typescript
interface HomepageConfig {
  route: string;                    // Rota da página (ex: "/")
  animations?: AnimationConfig;     // Configurações de animação
  background?: BackgroundConfig;    // Background da página
  sections: SectionConfig[];        // Array de seções
  theme?: ThemeConfig;              // Customizações de tema
  integrations?: IntegrationConfig; // Integrações com outros módulos
}
```

#### SPEC-M-HP-CFG-002

A configuração de animações DEVE seguir:

```typescript
interface AnimationConfig {
  enabled: boolean;           // Master switch
  intensity: 'subtle' | 'normal' | 'intense';
  reducedMotion: boolean;     // Auto-disable em prefers-reduced-motion
}
```

**Padrão:** `{ enabled: true, intensity: 'normal', reducedMotion: true }`

#### SPEC-M-HP-CFG-003

A configuração de background DEVE seguir:

```typescript
interface BackgroundConfig {
  type: 'grid' | 'novatrix' | 'hacker' | 'solid';
  opacity: number;  // 0.0 a 1.0
}
```

**Padrão:** `{ type: 'grid', opacity: 0.1 }`

#### SPEC-M-HP-CFG-004

Cada seção DEVE ter configuração específica do tipo:

```typescript
type SectionConfig =
  | HeroSectionConfig
  | FeaturesSectionConfig
  | PortalsSectionConfig
  | CTASectionConfig;

interface BaseSectionConfig {
  type: 'hero' | 'features' | 'portals' | 'cta';
  enabled: boolean;
}
```

### Hero Section

#### SPEC-M-HP-CFG-005

A configuração da Hero Section DEVE seguir:

```typescript
interface HeroSectionConfig extends BaseSectionConfig {
  type: 'hero';
  layout: 'centered' | 'split';
  title: {
    text: string;
    animation: 'blur-in' | 'pull-up' | 'fade' | 'gradual-spacing';
  };
  subtitle: {
    text: string;
    animation: 'fade' | 'blur-in' | 'gradual-spacing';
  };
  backgroundEffect?: 'grid' | 'none';
  backgroundImage?: string;  // URL ou path
  ctaButtons: CTAButton[];
}

interface CTAButton {
  label: string;
  action: 'signup' | 'login' | 'scroll-to' | 'link' | 'external';
  target?: string;  // Usado por scroll-to e link
  url?: string;     // Usado por external
  variant: 'shiny' | 'default' | 'outline' | 'ghost';
  icon?: string;    // Nome do ícone Lucide
}
```

### Features Section

#### SPEC-M-HP-CFG-006

A configuração da Features Section DEVE seguir:

```typescript
interface FeaturesSectionConfig extends BaseSectionConfig {
  type: 'features';
  title: string;
  animation: 'animated-list' | 'fade-in' | 'none';
  columns: 2 | 3 | 4;
  cardEffect: 'flip-hover' | 'hover-lift' | 'none';
  items: FeatureItem[];
}

interface FeatureItem {
  icon: string;           // Nome do ícone Lucide
  badge?: string;         // Texto do badge (opcional)
  badgeAnimated: boolean;
  title: string;
  titleAnimation?: 'pull-up' | 'fade' | 'none';
  description: string;
  backContent?: string;   // Conteúdo do verso (flip cards)
}
```

### Portals Section

#### SPEC-M-HP-CFG-007

A configuração da Portals Section DEVE seguir:

```typescript
interface PortalsSectionConfig extends BaseSectionConfig {
  type: 'portals';
  title: string;
  layout: 'grid' | 'orbit';
  animation: 'fade-in' | 'animated-list' | 'none';
  cardEffect: 'flip-hover' | 'hover-lift' | 'none';
  portals: PortalItem[];
}

interface PortalItem {
  portalId: string;
  highlight: boolean;
  description?: string;
  customTitle?: string;  // Override do nome do portal
  screenshot?: string;   // URL de screenshot
}
```

### CTA Section

#### SPEC-M-HP-CFG-008

A configuração da CTA Section DEVE seguir:

```typescript
interface CTASectionConfig extends BaseSectionConfig {
  type: 'cta';
  title: string;
  titleAnimation: 'fade' | 'blur-in' | 'pull-up';
  description: string;
  backgroundEffect: 'ripple' | 'none';
  primaryButton: CTAButton;
  secondaryButton?: CTAButton;
}
```

### Theme

#### SPEC-M-HP-CFG-009

A configuração de tema DEVE seguir:

```typescript
interface ThemeConfig {
  brandColor: string;      // Hex color
  accentColor: string;     // Hex color
  heroGradient?: string;   // Tailwind gradient classes
}
```

### Integrations

#### SPEC-M-HP-CFG-010

A configuração de integrações DEVE seguir:

```typescript
interface IntegrationConfig {
  auth: {
    showLoginButton: boolean;
    showSignupButton: boolean;
    redirectAfterLogin?: string;
  };
}
```

### Validação

#### SPEC-M-HP-CFG-011

O módulo DEVE fornecer schemas Zod para validação de configuração em `utils/validateConfig.ts`.

#### SPEC-M-HP-CFG-012

Configurações inválidas DEVEM resultar em:
1. Log de erro no console (desenvolvimento)
2. Fallback para valores padrão seguros
3. Seção não renderizada (se erro crítico)

---

## Seções e Componentes

### Hero Section

#### SPEC-M-HP-SEC-001

A Hero Section DEVE ser o primeiro elemento visual da página quando habilitada.

#### SPEC-M-HP-SEC-002

Em layout `centered`, todos os elementos DEVEM estar centralizados verticalmente e horizontalmente.

#### SPEC-M-HP-SEC-003

Em layout `split`, o texto DEVE ocupar 50% à esquerda e imagem/visual 50% à direita em desktop, empilhando verticalmente em mobile.

#### SPEC-M-HP-SEC-004

CTAs DEVEM ser limitados a máximo 3 botões por questões de UX.

#### SPEC-M-HP-SEC-005

Quando `backgroundImage` for fornecida, DEVE ter overlay escuro (opacity 0.4-0.6) para garantir legibilidade do texto.

### Features Section

#### SPEC-M-HP-SEC-006

Features DEVEM ser renderizadas em grid responsivo:
- Desktop (≥1024px): configuração `columns`
- Tablet (768-1023px): 2 colunas
- Mobile (<768px): 1 coluna

#### SPEC-M-HP-SEC-007

Quando `cardEffect: 'flip-hover'`, cards DEVEM:
- Virar ao hover (desktop) ou tap (mobile)
- Mostrar `backContent` no verso
- Duração da animação: 500ms
- Eixo de rotação: Y (horizontal flip)

#### SPEC-M-HP-SEC-008

Quando `animation: 'animated-list'`, features DEVEM:
- Animar sequencialmente com delay de 100ms entre items
- Usar fade-in + slide-up
- Triggered por Intersection Observer

#### SPEC-M-HP-SEC-009

Badges animados DEVEM usar componente `AnimatedBadge` do animate-ui.

### Portals Section

#### SPEC-M-HP-SEC-010

A seção DEVE buscar informações dos portais via JQEL (`schema: 'backend'`, `select: 'portal'`).

#### SPEC-M-HP-SEC-011

Portais com `highlight: true` DEVEM ter tratamento visual diferenciado:
- Border com brand color
- Ícone de estrela ou badge "Featured"
- Maior z-index em hover

#### SPEC-M-HP-SEC-012

Cards de portal DEVEM exibir:
- Nome do portal (ou `customTitle`)
- Descrição (configurada ou do portal)
- Screenshot (se disponível)
- Ícone do portal
- Badge de status (ativo/inativo)

#### SPEC-M-HP-SEC-013

Em layout `orbit`, portais DEVEM:
- Ser posicionados em círculo usando `Orbit Rotation` do animate-ui
- Rotacionar continuamente (lento, 30s por volta)
- Parar rotação ao hover
- Máximo 6 portais recomendado

### CTA Section

#### SPEC-M-HP-SEC-014

A CTA Section DEVE ser visualmente destacada com:
- Background diferenciado (gradient ou solid color)
- Maior espaçamento (padding vertical ≥80px)
- Tipografia maior (título 2xl-4xl)

#### SPEC-M-HP-SEC-015

Quando `backgroundEffect: 'ripple'`, DEVE usar `SVGRippleEffect` do animate-ui em background.

#### SPEC-M-HP-SEC-016

Botões de CTA DEVEM ter tamanho grande (`size: 'lg'`) para destaque.

---

## Animações

### Componentes animate-ui

#### SPEC-M-HP-ANI-001

O módulo DEVE utilizar os seguintes componentes do animate-ui:

**Textos:**
- `BlurInText` - Título hero com fade blur
- `LetterPullUpText` - Títulos que sobem letra por letra
- `FadeText` - Fade in simples
- `GradualSpacingText` - Espaçamento gradual

**Interativos:**
- `AnimatedShinyButton` - Botões com efeito de brilho
- `CardFlipHover` - Cards que viram ao hover
- `AnimatedBadge` - Badges com animação de entrada

**Backgrounds:**
- `Grid` - Grid animado de fundo
- `NovatrixBackground` - Grid estilo novatrix
- `HackerBackground` - Código em cascata
- `SVGRippleEffect` - Efeito de ondulação

**Layouts:**
- `AnimatedList` - Lista com entrada sequencial
- `OrbitRotation` - Elementos em órbita

#### SPEC-M-HP-ANI-002

Todos os componentes animate-ui DEVEM ser wrapeados em componentes próprios em `components/animated/` para:
- Aplicar configurações globais de animação
- Respeitar `prefers-reduced-motion`
- Aplicar intensidade configurada

### Timing e Performance

#### SPEC-M-HP-ANI-003

Animações DEVEM usar os seguintes timings baseado na intensidade:

**Subtle:**
- Duração: 150-200ms
- Easing: `ease-out`
- Delay entre items: 50ms

**Normal:**
- Duração: 300-500ms
- Easing: `ease-in-out`
- Delay entre items: 100ms

**Intense:**
- Duração: 600-800ms
- Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` (bounce)
- Delay entre items: 150ms

#### SPEC-M-HP-ANI-004

Animações DEVEM:
- Manter 60fps (usar `will-change` apenas durante animação)
- Usar `transform` e `opacity` (GPU-accelerated)
- Evitar animação de `width`, `height`, `top`, `left`

### Scroll Animations

#### SPEC-M-HP-ANI-005

O hook `useScrollAnimation` DEVE:
- Usar Intersection Observer API
- Trigger quando elemento estiver 20% visível no viewport
- Marcar animação como executada para evitar repetição
- Cleanup observers em unmount

#### SPEC-M-HP-ANI-006

Em dispositivos móveis, o threshold PODE ser reduzido para 10% para melhor experiência.

### Reduced Motion

#### SPEC-M-HP-ANI-007

Quando `prefers-reduced-motion: reduce` for detectado, o módulo DEVE:
- Desabilitar todas as animações de entrada
- Desabilitar backgrounds animados
- Manter apenas transições de estado essenciais (<200ms)
- Respeitar independente da configuração `animations.enabled`

#### SPEC-M-HP-ANI-008

O módulo DEVE fornecer toggle manual de animações para usuários que queiram controlar mesmo sem `prefers-reduced-motion`.

---

## Integração com Outros Módulos

### Auth Module

#### SPEC-M-HP-INT-001

O módulo DEVE usar o hook `useAuth()` do módulo Auth para:
- Detectar estado de autenticação
- Obter informações do usuário logado
- Trigger login/signup

#### SPEC-M-HP-INT-002

Quando `integrations.auth.showLoginButton: true`, DEVE:
- Exibir botão "Login" no header (se não autenticado)
- Esconder botão se usuário já estiver autenticado
- Ao click, redirecionar para rota de login do Auth module

#### SPEC-M-HP-INT-003

Quando `integrations.auth.showSignupButton: true`, DEVE:
- Exibir botão "Sign Up" no header (se não autenticado)
- Esconder botão se usuário já estiver autenticado
- Ao click, redirecionar para rota de signup do Auth module

#### SPEC-M-HP-INT-004

Quando usuário estiver autenticado, DEVE:
- Exibir avatar e menu dropdown no header
- Incluir opções: Profile, Settings, Logout
- Se `redirectAfterLogin` configurado, redirecionar automaticamente

#### SPEC-M-HP-INT-005

CTAs com `action: 'signup'` ou `action: 'login'` DEVEM:
- Usar as rotas configuradas no Auth module
- Passar `returnTo` query param com URL atual para redirect pós-login

### Setup Module

#### SPEC-M-HP-INT-006

O módulo DEVE fornecer componente `HomepagePreview` para preview no Setup Module.

#### SPEC-M-HP-INT-007

O preview DEVE:
- Aceitar configuração via props (não via JQEL)
- Renderizar em tempo real conforme configuração muda
- Suportar toggle de tema (light/dark)
- Escalar para caber em viewport menor (scale transform)

#### SPEC-M-HP-INT-008

O Setup Module DEVE fornecer formulário de configuração com:
- Seções colapsáveis por tipo de seção
- Drag-and-drop para reordenar seções
- Toggle para habilitar/desabilitar
- Campos de texto com preview inline
- Seletor de ícones Lucide visual
- Seletor de portais com busca
- Upload de imagens (hero background, screenshots)

---

## Data Access

### Queries

#### SPEC-M-HP-DATA-001

Busca de configuração DEVE usar:

```typescript
{
  schema: 'platform',
  select: 'instance',
  where: {
    instanceId: { $eq: instanceId }
  },
  output: ['config']
}
```

**Query Key:** `['module', 'homepage', 'instance', instanceId]`

#### SPEC-M-HP-DATA-002

Busca de portais DEVE usar:

```typescript
{
  schema: 'backend',
  select: 'portal',
  where: {
    visibility: { $eq: 'public' }
  },
  output: ['portalId', 'name', 'description', 'icon', 'active']
}
```

**Query Key:** `['portals', 'public']`

### Mutations

#### SPEC-M-HP-DATA-003

Atualização de configuração DEVE usar:

```typescript
{
  schema: 'platform',
  mutate: 'instance',
  action: 'update',
  values: {
    config: newConfig
  },
  where: {
    instanceId: { $eq: instanceId }
  }
}
```

#### SPEC-M-HP-DATA-004

Após mutação bem-sucedida, DEVE invalidar queries:
- `['module', 'homepage', 'instance', instanceId]`
- `['module', 'homepage']` (invalidar todas as instâncias)

### Caching

#### SPEC-M-HP-DATA-005

Configuração DEVE ser cacheada com:
- `staleTime: 5 * 60 * 1000` (5 minutos)
- `cacheTime: 30 * 60 * 1000` (30 minutos)

#### SPEC-M-HP-DATA-006

Lista de portais DEVE ser cacheada com:
- `staleTime: 10 * 60 * 1000` (10 minutos)
- `cacheTime: 60 * 60 * 1000` (1 hora)

---

## Performance

### Loading

#### SPEC-M-HP-PERF-001

O módulo DEVE ser lazy-loaded usando `React.lazy()` e dynamic import.

#### SPEC-M-HP-PERF-002

Seções abaixo da dobra (fold) DEVEM ser lazy-loaded com Intersection Observer.

#### SPEC-M-HP-PERF-003

Imagens DEVEM usar:
- `loading="lazy"` attribute
- `srcset` para imagens responsivas
- WebP format com fallback para PNG/JPG

#### SPEC-M-HP-PERF-004

A homepage completa (JS + CSS + fontes) DEVE ser menor que 200KB gzipped na carga inicial.

### Bundle Size

#### SPEC-M-HP-PERF-005

Componentes animate-ui não utilizados NÃO DEVEM ser incluídos no bundle (tree-shaking).

#### SPEC-M-HP-PERF-006

Framer Motion DEVE ser code-split para carregar apenas recursos necessários.

### Runtime

#### SPEC-M-HP-PERF-007

Animações DEVEM manter ≥60fps em:
- Desktop: Chrome, Firefox, Safari (últimas 2 versões)
- Mobile: iOS Safari, Chrome Android (últimas 2 versões)

#### SPEC-M-HP-PERF-008

Time to Interactive (TTI) DEVE ser <1s em conexão 3G.

#### SPEC-M-HP-PERF-009

First Contentful Paint (FCP) DEVE ser <0.5s em conexão 3G.

---

## Acessibilidade

### WCAG 2.1 AA

#### SPEC-M-HP-A11Y-001

O módulo DEVE cumprir todos os critérios WCAG 2.1 Level AA.

#### SPEC-M-HP-A11Y-002

Contraste de cores DEVE:
- Texto normal: mínimo 4.5:1
- Texto grande (≥18pt): mínimo 3:1
- UI components: mínimo 3:1

#### SPEC-M-HP-A11Y-003

Todos os elementos interativos DEVEM:
- Ter estados de focus visíveis (outline ou ring)
- Ser acessíveis via teclado (tab navigation)
- Ter área mínima de toque de 44x44px (mobile)

### Semântica HTML

#### SPEC-M-HP-A11Y-004

O módulo DEVE usar HTML semântico:
- `<header>` para cabeçalho
- `<nav>` para navegação
- `<main>` para conteúdo principal
- `<section>` para cada seção
- `<article>` para cards de portal/feature
- `<footer>` se houver rodapé

#### SPEC-M-HP-A11Y-005

Headings DEVEM seguir hierarquia lógica:
- H1: Título principal da hero
- H2: Títulos de seção
- H3: Títulos de cards/features
- Sem pulos de nível

### ARIA

#### SPEC-M-HP-A11Y-006

Elementos animados DEVEM ter `aria-live="polite"` quando apropriado.

#### SPEC-M-HP-A11Y-007

Botões de ação DEVEM ter labels descritivos:
- Evitar "Click here", "Learn more" genéricos
- Usar `aria-label` se texto visual for insuficiente

#### SPEC-M-HP-A11Y-008

Imagens decorativas DEVEM ter `alt=""` (vazio).

#### SPEC-M-HP-A11Y-009

Imagens informativas DEVEM ter `alt` descritivo e significativo.

### Keyboard Navigation

#### SPEC-M-HP-A11Y-010

DEVE ser possível navegar toda a homepage apenas com teclado:
- Tab/Shift+Tab: Navegar entre elementos
- Enter/Space: Ativar botões/links
- Escape: Fechar modals/menus (se houver)

#### SPEC-M-HP-A11Y-011

A ordem de foco DEVE seguir a ordem visual e lógica dos elementos.

### Screen Readers

#### SPEC-M-HP-A11Y-012

O módulo DEVE ser totalmente utilizável com screen readers:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

#### SPEC-M-HP-A11Y-013

Animações NÃO DEVEM interferir com leitura do screen reader.

---

## Testes

### Unit Tests

#### SPEC-M-HP-TEST-001

O módulo DEVE ter cobertura de testes ≥80% para:
- `utils/validateConfig.ts` (validação Zod)
- `hooks/useHomepageConfig.ts` (JQEL queries)
- `hooks/useScrollAnimation.ts` (Intersection Observer)

### Component Tests

#### SPEC-M-HP-TEST-002

Cada componente de seção DEVE ter testes com React Testing Library verificando:
- Renderização com configuração válida
- Renderização de fallback com configuração inválida
- Interatividade (clicks, hovers)
- Estados de loading/error

### Integration Tests

#### SPEC-M-HP-TEST-003

DEVE haver testes de integração verificando:
- Homepage completa renderiza com configuração válida
- Seções habilitadas/desabilitadas refletem configuração
- Navegação entre seções (scroll-to)
- Integração com Auth module (login/signup)

### Visual Regression Tests

#### SPEC-M-HP-TEST-004

RECOMENDA-SE testes de regressão visual para:
- Screenshots de cada seção em light/dark theme
- Responsive breakpoints (mobile/tablet/desktop)
- Estados de animação (antes/durante/depois)

### Performance Tests

#### SPEC-M-HP-TEST-005

DEVE haver testes de performance verificando:
- Bundle size <200KB gzipped
- TTI <1s (simulated 3G)
- FCP <0.5s (simulated 3G)
- Animation frame rate ≥60fps

### Accessibility Tests

#### SPEC-M-HP-TEST-006

DEVE haver testes automatizados de acessibilidade usando:
- `axe-core` via `jest-axe`
- Verificação de contraste
- Verificação de estrutura semântica

#### SPEC-M-HP-TEST-007

RECOMENDA-SE testes manuais com:
- Screen readers (NVDA, VoiceOver)
- Navegação apenas por teclado
- Zoom 200%

---

## Referências

- [SPEC-concepts.md](./SPEC-concepts.md) - Portal, Module, Instance
- [SPEC-modules.md](./SPEC-modules.md) - Module system
- [SPEC-data-access.md](./SPEC-data-access.md) - JQEL integration
- [SPEC-module-auth.md](./SPEC-module-auth.md) - Auth integration
- [SPEC-theming.md](./SPEC-theming.md) - Theme system
- [SPEC-ui-homepage.md](./ui/SPEC-ui-homepage.md) - UI/UX specification
- [animate-ui docs](https://animate-ui.com/docs) - Animation components
- [shadcn/ui docs](https://ui.shadcn.com/docs) - Base UI components
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines

---

**Status:** Este documento está em draft e será refinado durante a implementação.

**Histórico de Versões:**

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2025-11-10 | Versão inicial da especificação |
