# PLAN_HOMEPAGE.md - Implementação do Módulo Homepage

**Objetivo**: Implementar módulo Homepage com landing page configurável, seções modulares (Hero, Features, Portals, CTA) e animações sofisticadas usando animate-ui

---

## 📋 RESUMO EXECUTIVO

### Problemas Identificados
1. ❌ Plataforma não possui landing page configurável para portais
2. ❌ Não há forma de apresentar funcionalidades e portais disponíveis de forma visual
3. ❌ Falta integração com autenticação em páginas públicas
4. ⚠️ Ausência de componentes animados para melhorar experiência visual

### Solução (Baseada em Padrões)
- ✅ Módulo Homepage configurável via instâncias JQEL com seções habilitáveis
- ✅ Componentes animate-ui para animações profissionais (60fps, WCAG compliant)
- ✅ Integração com Auth Module para CTAs de signup/login
- ✅ Preview em tempo real no Setup Module para configuração visual

---

## 🎯 FASE 1: FUNDAÇÃO - TYPES E VALIDAÇÃO

### 1.1. Criar TypeScript Types

- [x] Criar `src/frontend/src/modules/homepage/types/index.ts`
  - [x] Definir `HomepageConfig` interface
  - [x] Definir `AnimationConfig`, `BackgroundConfig`, `ThemeConfig`
  - [x] Definir `SectionConfig` union type (Hero, Features, Portals, CTA)
  - [x] Definir `CTAButton`, `FeatureItem`, `PortalItem` interfaces
  - [x] Definir types para props de componentes
  - [x] Definir types para return de hooks
  - [x] Exportar todos os types
- [x] ✅ **Checkpoint**: Compilação TypeScript sem erros

**Leitura de Referência**:
- `spec/SPEC-module-homepage.md` - Seção "Configuração de Instância"
- `src/frontend/src/modules/homepage/types/README.md`

**Código de Referência**:
```typescript
// types/index.ts
export interface HomepageConfig {
  route: string;
  animations?: AnimationConfig;
  background?: BackgroundConfig;
  sections: SectionConfig[];
  theme?: ThemeConfig;
  integrations?: IntegrationConfig;
}

export type SectionConfig =
  | HeroSectionConfig
  | FeaturesSectionConfig
  | PortalsSectionConfig
  | CTASectionConfig;
```

---

### 1.2. Criar Schemas Zod de Validação

- [x] Criar `src/frontend/src/modules/homepage/utils/validateConfig.ts`
  - [x] Definir `HomepageConfigSchema` principal
  - [x] Definir schemas para cada tipo de seção
  - [x] Definir schemas para items (CTAButton, FeatureItem, PortalItem)
  - [x] Adicionar refinamentos customizados (Hero first, etc)
  - [x] Criar funções `validateHomepageConfig()` e `parseHomepageConfig()`
  - [x] Exportar default values (DEFAULT_ANIMATION_CONFIG, etc)
- [x] ✅ **Checkpoint**: Validação funciona com configs válidas e inválidas

**Leitura de Referência**:
- `src/frontend/src/modules/homepage/utils/README.md`
- `spec/SPEC-module-homepage.md` - Seção "Configuração de Instância"

**Código de Referência**:
```typescript
// utils/validateConfig.ts
export const HomepageConfigSchema = z.object({
  route: z.string().min(1).default('/'),
  animations: AnimationConfigSchema.optional(),
  sections: z.array(SectionConfigSchema).min(1),
  theme: ThemeConfigSchema.optional(),
}).refine(
  (config) => {
    const heroIndex = config.sections.findIndex(s => s.type === 'hero' && s.enabled);
    return heroIndex <= 0;
  },
  { message: 'Hero section must be first if enabled' }
);
```

---

### 1.3. Testar Fase 1 Completa

**Checklist de Testes**:
- [x] **Teste 1: Types compilam sem erros**
  - [x] Executar `npm run type-check` no frontend
  - [x] ✅ **Verificar**: Zero erros de TypeScript

- [x] **Teste 2: Validação Zod funciona**
  - [x] Criar config válida e validar
  - [x] Criar config inválida (sem sections) e validar
  - [x] Criar config com Hero não-first e validar
  - [x] ✅ **Resultado**: Validação aceita válidas e rejeita inválidas

**✅ CHECKPOINT FASE 1**: Types e schemas de validação criados e funcionais

---

## 🎯 FASE 2: DATA ACCESS - HOOKS

### 2.1. Criar Hook useHomepageConfig

- [ ] Criar `src/frontend/src/modules/homepage/hooks/useHomepageConfig.ts`
  - [ ] Implementar com TanStack Query
  - [ ] Configurar JQEL query (schema: 'platform', select: 'instance')
  - [ ] Definir queryKey: `['module', 'homepage', 'instance', instanceId]`
  - [ ] Configurar staleTime (5 min) e cacheTime (30 min)
  - [ ] Retornar `{ config, isLoading, isError, error, refetch }`
- [ ] ✅ **Checkpoint**: Hook retorna config mockada do JQEL

**Leitura de Referência**:
- `src/frontend/src/modules/homepage/hooks/README.md`
- `spec/SPEC-module-homepage.md` - Seção "Data Access"

**Código de Referência**:
```typescript
// hooks/useHomepageConfig.ts
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
          where: { instanceId: { $eq: instanceId } },
          output: ['config']
        })
      });
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

---

### 2.2. Criar Hook useUpdateHomepageConfig

- [ ] Criar mutation hook para updates
  - [ ] Implementar com TanStack Query useMutation
  - [ ] Configurar JQEL mutation (schema: 'platform', mutate: 'instance', action: 'update')
  - [ ] Invalidar queries após sucesso
  - [ ] Retornar `{ mutate, mutateAsync, isLoading, isError, isSuccess, error }`
- [ ] ✅ **Checkpoint**: Mutation atualiza config e invalida cache

**Código de Referência**:
```typescript
// hooks/useUpdateHomepageConfig.ts
export function useUpdateHomepageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ instanceId, config }) => {
      const response = await fetch('/api/jqel', {
        method: 'POST',
        body: JSON.stringify({
          schema: 'platform',
          mutate: 'instance',
          action: 'update',
          values: { config },
          where: { instanceId: { $eq: instanceId } }
        })
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['module', 'homepage', 'instance', variables.instanceId]);
    },
  });
}
```

---

### 2.3. Criar Hooks Auxiliares

- [ ] Criar `hooks/useScrollAnimation.ts`
  - [ ] Implementar com Intersection Observer
  - [ ] Threshold 20% (0.2)
  - [ ] Marcar animação como executada (execute once)
  - [ ] Retornar `{ ref, isVisible, hasAnimated }`
- [ ] Criar `hooks/useReducedMotion.ts`
  - [ ] Implementar com matchMedia('prefers-reduced-motion: reduce')
  - [ ] Listener para mudanças
  - [ ] Retornar boolean
- [ ] Criar `hooks/usePortalsList.ts`
  - [ ] Query JQEL (schema: 'backend', select: 'portal', where: visibility = 'public')
  - [ ] Retornar `{ portals, isLoading, isError, error }`
- [ ] ✅ **Checkpoint**: Todos os hooks funcionam isoladamente

**Leitura de Referência**:
- `src/frontend/src/modules/homepage/hooks/README.md`

---

### 2.4. Testar Fase 2 Completa

**Checklist de Testes**:
- [ ] **Teste 1: useHomepageConfig busca configuração**
  - [ ] Renderizar hook com instanceId mockado
  - [ ] ✅ **Verificar**: isLoading true → config retornada → isLoading false

- [ ] **Teste 2: useUpdateHomepageConfig atualiza config**
  - [ ] Executar mutação com nova config
  - [ ] ✅ **Verificar**: Cache invalidado e query refaz fetch

- [ ] **Teste 3: useScrollAnimation detecta visibilidade**
  - [ ] Renderizar componente com hook
  - [ ] Simular scroll até elemento
  - [ ] ✅ **Verificar**: isVisible muda para true

**✅ CHECKPOINT FASE 2**: Hooks de data access e utilitários funcionais

---

## 🎯 FASE 3: COMPONENTES ANIMATE-UI

### 3.1. Instalar Componentes animate-ui

- [ ] Executar script de instalação
  - [ ] `npm install framer-motion@^11.x`
  - [ ] Instalar BlurInText, LetterPullUpText, FadeText, GradualSpacingText
  - [ ] Instalar AnimatedShinyButton, AnimatedBadge, CardFlipHover
  - [ ] Instalar AnimatedList, OrbitRotation
  - [ ] Instalar Grid, NovatrixBackground, HackerBackground, SVGRippleEffect
- [ ] ✅ **Checkpoint**: 13 componentes em `src/components/ui/`

**Leitura de Referência**:
- `src/frontend/src/modules/homepage/ANIMATE-UI-SETUP.md`

**Código de Referência**:
```bash
# install-animate-ui-components.sh
npx shadcn@latest add https://animate-ui.com/r/blur-in-text
npx shadcn@latest add https://animate-ui.com/r/letter-pull-up-text
npx shadcn@latest add https://animate-ui.com/r/animated-shiny-button
# ... (mais 10 componentes)
```

---

### 3.2. Criar Wrappers de Componentes Animados

- [ ] Criar `components/animated/AnimatedText.tsx`
  - [ ] Wrapper universal para textos (blur-in, pull-up, fade, gradual-spacing)
  - [ ] Respeitar useReducedMotion()
  - [ ] Aplicar intensidade da config (subtle/normal/intense)
  - [ ] Fallback para span estático se animações desabilitadas
- [ ] Criar `components/animated/AnimatedBadge.tsx`
  - [ ] Wrapper para Badge com animação de entrada
  - [ ] Respeitar reduced motion
- [ ] Criar `components/animated/AnimatedCard.tsx`
  - [ ] Wrapper para cards com effects (flip-hover, hover-lift, none)
  - [ ] Suporte a backContent para flip cards
- [ ] ✅ **Checkpoint**: Wrappers renderizam com animações funcionais

**Leitura de Referência**:
- `src/frontend/src/modules/homepage/components/README.md`
- `spec/ui/SPEC-ui-homepage.md` - Seção "Componentes Compartilhados"

**Código de Referência**:
```typescript
// components/animated/AnimatedText.tsx
export function AnimatedText({ text, type, className, delay }: AnimatedTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const { config } = useHomepageConfig();

  if (prefersReducedMotion || !config?.animations?.enabled) {
    return <span className={className}>{text}</span>;
  }

  const intensity = config.animations.intensity;
  const adjustedDelay = {
    subtle: delay ? delay * 0.5 : 0,
    normal: delay || 0,
    intense: delay ? delay * 1.5 : 0
  }[intensity];

  switch (type) {
    case 'blur-in':
      return <BlurInText text={text} className={className} delay={adjustedDelay} />;
    // ... outros casos
  }
}
```

---

### 3.3. Testar Fase 3 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Componentes animate-ui importam sem erro**
  - [ ] Importar cada um dos 13 componentes
  - [ ] ✅ **Verificar**: Sem erros de build

- [ ] **Teste 2: Wrappers respeitam reduced motion**
  - [ ] Renderizar AnimatedText com prefers-reduced-motion: reduce
  - [ ] ✅ **Verificar**: Renderiza span estático sem animação

- [ ] **Teste 3: Intensidade de animação funciona**
  - [ ] Renderizar com intensity: 'subtle', 'normal', 'intense'
  - [ ] ✅ **Verificar**: Delays ajustados conforme intensidade

**✅ CHECKPOINT FASE 3**: Componentes animate-ui instalados e wrappers funcionais

---

## 🎯 FASE 4: SEÇÕES DA HOMEPAGE

### 4.1. Implementar HeroSection

- [ ] Criar `components/sections/HeroSection.tsx`
  - [ ] Renderizar layout 'centered' ou 'split' baseado em config
  - [ ] Título com AnimatedText (blur-in, pull-up, fade, gradual-spacing)
  - [ ] Subtítulo com AnimatedText
  - [ ] Background effect (Grid, NovatrixBackground, HackerBackground)
  - [ ] CTAs com AnimatedShinyButton
  - [ ] Background image com overlay se configurado
  - [ ] Responsivo (stack em mobile, side-by-side em desktop para split)
- [ ] ✅ **Checkpoint**: Hero renderiza ambos layouts corretamente

**Leitura de Referência**:
- `spec/ui/SPEC-ui-homepage.md` - Seção "Hero Section"
- `spec/SPEC-module-homepage.md` - SPEC-M-HP-SEC-001 a SPEC-M-HP-SEC-005

**Código de Referência**:
```typescript
// components/sections/HeroSection.tsx
export function HeroSection({ config }: HeroSectionProps) {
  return (
    <section className="hero-section relative overflow-hidden">
      {config.backgroundEffect === 'grid' && <Grid opacity={0.1} />}

      <Container className="relative z-10 py-24 md:py-32">
        <div className={cn(
          "flex flex-col items-center text-center space-y-8",
          config.layout === 'split' && "lg:grid lg:grid-cols-2 lg:text-left"
        )}>
          <AnimatedText
            text={config.title.text}
            type={config.title.animation}
            className="hero-title"
            delay={0.2}
          />

          {/* ... subtítulo e CTAs */}
        </div>
      </Container>
    </section>
  );
}
```

---

### 4.2. Implementar FeaturesSection

- [ ] Criar `components/sections/FeaturesSection.tsx`
  - [ ] Grid responsivo (columns config → 2 em tablet → 1 em mobile)
  - [ ] Container com AnimatedList (animated-list) ou fade-in
  - [ ] FeatureCard com CardFlipHover ou hover-lift
  - [ ] Renderizar icon (Lucide), badge (AnimatedBadge), title, description
  - [ ] BackContent no verso para flip cards
- [ ] Criar subcomponente `FeatureCard.tsx`
  - [ ] Suporte a flip-hover, hover-lift, none effects
  - [ ] AnimatedBadge se badge configurado
  - [ ] Title com AnimatedText (pull-up animation)
- [ ] ✅ **Checkpoint**: Features grid renderiza com animações

**Leitura de Referência**:
- `spec/ui/SPEC-ui-homepage.md` - Seção "Features Section"
- `spec/SPEC-module-homepage.md` - SPEC-M-HP-SEC-006 a SPEC-M-HP-SEC-009

---

### 4.3. Implementar PortalsSection

- [ ] Criar `components/sections/PortalsSection.tsx`
  - [ ] Buscar portais com usePortalsList()
  - [ ] Filtrar por IDs configurados em config.portals
  - [ ] Layout grid ou orbit (OrbitRotation)
  - [ ] Renderizar PortalCard para cada portal
- [ ] Criar subcomponente `PortalCard.tsx`
  - [ ] Screenshot (AspectRatio)
  - [ ] Portal icon e nome
  - [ ] Badge "Featured" se highlight: true
  - [ ] Badge de status (Active/Coming Soon)
  - [ ] Link para portal se ativo
  - [ ] CardFlipHover se cardEffect configurado
- [ ] ✅ **Checkpoint**: Portals renderizam em grid e orbit

**Leitura de Referência**:
- `spec/ui/SPEC-ui-homepage.md` - Seção "Portals Section"
- `spec/SPEC-module-homepage.md` - SPEC-M-HP-SEC-010 a SPEC-M-HP-SEC-013

---

### 4.4. Implementar CTASection

- [ ] Criar `components/sections/CTASection.tsx`
  - [ ] Background com SVGRippleEffect se backgroundEffect: 'ripple'
  - [ ] Title com AnimatedText (fade, blur-in, pull-up)
  - [ ] Description text
  - [ ] Primary button com AnimatedShinyButton
  - [ ] Secondary button (opcional)
  - [ ] Trust indicators (checkmarks)
  - [ ] Centralizado com max-width
- [ ] ✅ **Checkpoint**: CTA renderiza com ripple background

**Leitura de Referência**:
- `spec/ui/SPEC-ui-homepage.md` - Seção "CTA Section"
- `spec/SPEC-module-homepage.md` - SPEC-M-HP-SEC-014 a SPEC-M-HP-SEC-016

---

### 4.5. Testar Fase 4 Completa

**Checklist de Testes**:
- [ ] **Teste 1: HeroSection renderiza layouts**
  - [ ] Renderizar com layout: 'centered'
  - [ ] Renderizar com layout: 'split'
  - [ ] ✅ **Verificar**: Layouts diferentes, animações funcionam

- [ ] **Teste 2: FeaturesSection com flip cards**
  - [ ] Renderizar com cardEffect: 'flip-hover'
  - [ ] Hover em card
  - [ ] ✅ **Verificar**: Card vira mostrando backContent

- [ ] **Teste 3: PortalsSection busca dados**
  - [ ] Mock de portais públicos via JQEL
  - [ ] ✅ **Verificar**: Apenas portais configurados aparecem

- [ ] **Teste 4: CTASection com ripple**
  - [ ] Renderizar com backgroundEffect: 'ripple'
  - [ ] ✅ **Verificar**: SVGRippleEffect animando

**✅ CHECKPOINT FASE 4**: Todas as seções renderizam corretamente com animações

---

## 🎯 FASE 5: COMPOSITOR E ROTAS

### 5.1. Implementar HomePage Principal

- [ ] Criar `components/HomePage.tsx`
  - [ ] Receber instanceId via props ou route params
  - [ ] Buscar config com useHomepageConfig(instanceId)
  - [ ] Renderizar loading skeleton se isLoading
  - [ ] Renderizar error state se isError
  - [ ] Renderizar empty state se sem sections
  - [ ] Mapear sections e renderizar componente apropriado
  - [ ] Garantir Hero sempre primeiro se habilitado
  - [ ] Wrapper com ScrollAnimationProvider (context)
- [ ] ✅ **Checkpoint**: HomePage renderiza todas as seções configuradas

**Leitura de Referência**:
- `src/frontend/src/modules/homepage/components/README.md`
- `spec/SPEC-module-homepage.md` - SPEC-M-HP-F-004 a SPEC-M-HP-F-007

**Código de Referência**:
```typescript
// components/HomePage.tsx
export function HomePage({ instanceId }: HomePageProps) {
  const { config, isLoading, isError } = useHomepageConfig(instanceId);

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState />;
  if (!config || config.sections.length === 0) return <EmptyState />;

  return (
    <main className="homepage">
      {config.sections.map((section) => {
        if (!section.enabled) return null;

        switch (section.type) {
          case 'hero':
            return <HeroSection key="hero" config={section} />;
          case 'features':
            return <FeaturesSection key="features" config={section} />;
          case 'portals':
            return <PortalsSection key="portals" config={section} />;
          case 'cta':
            return <CTASection key="cta" config={section} />;
        }
      })}
    </main>
  );
}
```

---

### 5.2. Criar Manifest e Routes

- [ ] Criar `manifest.ts`
  - [ ] Definir id: "homepage"
  - [ ] name: "Home Page", version: "1.0.0"
  - [ ] type: "functionality"
  - [ ] dependencies: ["auth"]
  - [ ] icon: "Home", category: "content"
- [ ] Criar `routes.ts`
  - [ ] Exportar array de rotas
  - [ ] path configurável (padrão: '/')
  - [ ] component: lazy(() => import('./components/HomePage'))
  - [ ] requiresAuth: false
- [ ] Criar `index.ts`
  - [ ] Exportar manifest
  - [ ] Exportar routes
  - [ ] Exportar componentes públicos (para uso por outros módulos)
  - [ ] Exportar hooks
  - [ ] Exportar types
- [ ] ✅ **Checkpoint**: Módulo exporta manifest, routes corretamente

**Leitura de Referência**:
- `spec/SPEC-module-homepage.md` - Seção "Arquitetura do Módulo"

**Código de Referência**:
```typescript
// manifest.ts
export const manifest = {
  id: "homepage",
  name: "Home Page",
  version: "1.0.0",
  type: "functionality",
  description: "Beautiful, animated landing page with customizable sections",
  author: "Platform Team",
  dependencies: ["auth"],
  icon: "Home",
  category: "content"
};

// routes.ts
export const routes = [
  {
    path: '/', // Configurável por instância
    component: lazy(() => import('./components/HomePage')),
    requiresAuth: false
  }
];
```

---

### 5.3. Testar Fase 5 Completa

**Checklist de Testes**:
- [ ] **Teste 1: HomePage renderiza config completa**
  - [ ] Mock config com todas as 4 seções habilitadas
  - [ ] ✅ **Verificar**: Hero, Features, Portals, CTA renderizam em ordem

- [ ] **Teste 2: Seções desabilitadas não renderizam**
  - [ ] Config com features.enabled: false
  - [ ] ✅ **Verificar**: FeaturesSection não renderiza

- [ ] **Teste 3: Módulo carrega via lazy loading**
  - [ ] Importar módulo dinamicamente
  - [ ] ✅ **Verificar**: Manifest e routes disponíveis

**✅ CHECKPOINT FASE 5**: Módulo completo e funcional, pronto para integração

---

## 🎯 FASE 6: INTEGRAÇÃO COM AUTH E SETUP

### 6.1. Integração com Auth Module

- [ ] Adicionar lógica de autenticação no HomePage
  - [ ] Usar hook useAuth() do auth module
  - [ ] Renderizar botões Login/Signup no header se não autenticado
  - [ ] Renderizar avatar/menu se autenticado
  - [ ] Implementar redirect se redirectAfterLogin configurado
- [ ] Implementar ações de CTAs
  - [ ] action: 'signup' → redirect para signup route
  - [ ] action: 'login' → redirect para login route
  - [ ] action: 'scroll-to' → smooth scroll para target
  - [ ] action: 'link' → router navigation
  - [ ] action: 'external' → window.open
- [ ] ✅ **Checkpoint**: Integração com auth funcional

**Leitura de Referência**:
- `spec/SPEC-module-homepage.md` - Seção "Integração com Outros Módulos"
- `spec/SPEC-module-auth.md`

---

### 6.2. Criar Preview para Setup Module

- [ ] Criar `components/preview/HomepagePreview.tsx`
  - [ ] Aceitar config via props (não buscar via JQEL)
  - [ ] Renderizar mesma estrutura do HomePage
  - [ ] Aplicar scale transform para caber em viewport menor
  - [ ] Suporte a theme toggle (light/dark) via prop
  - [ ] Atualização em tempo real quando config muda
- [ ] ✅ **Checkpoint**: Preview renderiza e atualiza em tempo real

**Leitura de Referência**:
- `spec/SPEC-module-homepage.md` - SPEC-M-HP-INT-006 a SPEC-M-HP-INT-008

**Código de Referência**:
```typescript
// components/preview/HomepagePreview.tsx
export function HomepagePreview({ config, theme, scale = 0.5 }: HomepagePreviewProps) {
  return (
    <div
      className={cn("homepage-preview", theme)}
      style={{ transform: `scale(${scale})` }}
    >
      {/* Renderiza sections igual HomePage mas sem fetch */}
      {config.sections.map((section) => {
        if (!section.enabled) return null;
        // ... render sections
      })}
    </div>
  );
}
```

---

### 6.3. Testar Fase 6 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Auth integration funciona**
  - [ ] Mock usuário não autenticado
  - [ ] ✅ **Verificar**: Botões Login/Signup aparecem

- [ ] **Teste 2: CTAs executam ações corretas**
  - [ ] Click em CTA com action: 'signup'
  - [ ] ✅ **Verificar**: Redirect para signup route

- [ ] **Teste 3: Preview atualiza em tempo real**
  - [ ] Mudar config (ex: title text)
  - [ ] ✅ **Verificar**: Preview atualiza instantaneamente

**✅ CHECKPOINT FASE 6**: Integrações com Auth e Setup funcionais

---

## 🎯 FASE 7: ESTADOS E REFINAMENTO

### 7.1. Implementar Estados de Loading/Error

- [ ] Criar `components/LoadingSkeleton.tsx`
  - [ ] Skeleton para Hero (title + subtitle + buttons)
  - [ ] Skeleton para Features (grid de cards)
  - [ ] Skeleton para Portals
  - [ ] Skeleton para CTA
  - [ ] Usar componente Skeleton do shadcn/ui
- [ ] Criar `components/ErrorState.tsx`
  - [ ] Alert com mensagem de erro
  - [ ] Botão "Retry" que chama refetch
  - [ ] Icon AlertCircle
- [ ] Criar `components/EmptyState.tsx`
  - [ ] Mensagem "No sections configured"
  - [ ] Link para Setup module
  - [ ] Icon Home
- [ ] ✅ **Checkpoint**: Estados de loading/error/empty renderizam

**Leitura de Referência**:
- `spec/ui/SPEC-ui-homepage.md` - Seção "Estados"

---

### 7.2. Otimizações de Performance

- [ ] Implementar lazy loading de seções abaixo da dobra
  - [ ] Usar Intersection Observer
  - [ ] Lazy load FeaturesSection, PortalsSection, CTASection
  - [ ] Hero sempre carrega imediatamente
- [ ] Otimizar imagens
  - [ ] Adicionar loading="lazy" em imgs
  - [ ] Usar srcset para responsive images
  - [ ] WebP format com fallback
- [ ] Aplicar will-change apenas durante animações
  - [ ] Adicionar className durante animação
  - [ ] Remover após animação completa
- [ ] ✅ **Checkpoint**: Performance targets alcançados (TTI <1s, 60fps)

**Leitura de Referência**:
- `spec/SPEC-module-homepage.md` - Seção "Performance"

---

### 7.3. Validações de Acessibilidade

- [ ] Validar estrutura semântica HTML
  - [ ] `<main>` wrapper
  - [ ] `<section>` para cada seção com aria-labelledby
  - [ ] Headings hierárquicos (H1 → H2 → H3)
- [ ] Validar contraste de cores
  - [ ] Verificar com ferramenta (WebAIM Contrast Checker)
  - [ ] Garantir 4.5:1 para texto normal
- [ ] Validar keyboard navigation
  - [ ] Tab através de todos os elementos interativos
  - [ ] Enter/Space ativa botões
  - [ ] Focus visible em todos os elementos
- [ ] Testar com screen reader
  - [ ] NVDA (Windows) ou VoiceOver (macOS)
  - [ ] Verificar labels descritivos
- [ ] ✅ **Checkpoint**: WCAG 2.1 AA compliant

**Leitura de Referência**:
- `spec/SPEC-module-homepage.md` - Seção "Acessibilidade"
- `spec/ui/SPEC-ui-homepage.md` - Seção "Acessibilidade"

---

### 7.4. Testar Fase 7 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Loading skeleton aparece**
  - [ ] Mock delayed response do JQEL
  - [ ] ✅ **Verificar**: Skeleton renderiza durante loading

- [ ] **Teste 2: Performance targets**
  - [ ] Lighthouse audit em 3G throttling
  - [ ] ✅ **Verificar**: TTI <1s, FCP <0.5s

- [ ] **Teste 3: Acessibilidade**
  - [ ] axe-core automated scan
  - [ ] Keyboard navigation manual
  - [ ] ✅ **Verificar**: Zero violations WCAG AA

**✅ CHECKPOINT FASE 7**: Estados, performance e acessibilidade completos

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais

- **Wrappers de Componentes Animados**: Criados para centralizar lógica de reduced-motion e intensidade, evitando repetição em cada seção
- **Scroll Observer Context**: Usado para evitar múltiplos Intersection Observers, performance otimizada
- **Lazy Loading de Seções**: Apenas seções abaixo da dobra são lazy-loaded, Hero sempre carrega para evitar CLS
- **JQEL Exclusivo**: Todo data access via JQEL conforme SPEC-data-access.md, nunca fetch direto
- **Zod + React Hook Form**: Validação em tempo de configuração no Setup Module garante configs sempre válidas

### Limitações Conhecidas

- **Orbit Layout**: OrbitRotation recomendado para máximo 6 portais, mais que isso fica visualmente poluído
  - Mitigação: Limitar seleção a 6 no Setup Module
  - Alternativa futura: Carousel para mais portais

- **Flip Cards em Mobile**: CardFlipHover usa hover, em mobile precisa de tap
  - Mitigação: animate-ui já trata isso com touch events
  - Alternativa futura: Considerar modal em vez de flip em mobile

- **Background Animado Performance**: Backgrounds complexos (hacker, novatrix) podem impactar performance em dispositivos lentos
  - Mitigação: Reduzir opacity, desabilitar em reduced-motion
  - Alternativa futura: Detectar device capability e ajustar automaticamente

- **Bundle Size com Todos Componentes**: 13 componentes animate-ui aumentam bundle inicial
  - Mitigação: Tree-shaking remove não utilizados, lazy load seções
  - Alternativa futura: Carregar componentes animate-ui sob demanda baseado em config

### Referências

- `spec/SPEC-module-homepage.md` - Especificação funcional completa
- `spec/ui/SPEC-ui-homepage.md` - Especificação UI/UX com wireframes
- `spec/SPEC-modules.md` - Padrões de módulos da plataforma
- `spec/SPEC-data-access.md` - JQEL integration patterns
- `spec/SPEC-module-auth.md` - Auth integration
- `spec/SPEC-theming.md` - Theme system
- `src/frontend/src/modules/homepage/README.md` - Overview do módulo
- `src/frontend/src/modules/homepage/ANIMATE-UI-SETUP.md` - Setup animate-ui
- https://animate-ui.com/docs - Documentação animate-ui
- https://ui.shadcn.com/docs - Documentação shadcn/ui
- https://tanstack.com/query/latest - TanStack Query docs
- https://www.w3.org/WAI/WCAG21/quickref/ - WCAG 2.1 guidelines
