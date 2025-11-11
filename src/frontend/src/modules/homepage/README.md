# Homepage Module

**Status:** Especificado, aguardando implementação
**Versão:** 1.0.0

## Visão Geral

Módulo de landing page configurável com seções modulares e animações sofisticadas usando animate-ui.

## Especificações

- [SPEC-module-homepage.md](../../../../../spec/SPEC-module-homepage.md) - Especificação funcional formal
- [SPEC-ui-homepage.md](../../../../../spec/ui/SPEC-ui-homepage.md) - Especificação UI/UX com wireframes

## Estrutura de Arquivos

```
homepage/
├── README.md                 # Este arquivo
├── index.ts                  # Entry point - exporta manifest, routes, components
├── manifest.ts               # Metadata do módulo
├── routes.ts                 # Definição de rotas
├── components/               # Componentes React
│   ├── HomePage.tsx         # Componente principal da página
│   ├── sections/            # Componentes de seção
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── PortalsSection.tsx
│   │   └── CTASection.tsx
│   ├── animated/            # Wrappers de componentes animate-ui
│   │   ├── AnimatedBadge.tsx
│   │   ├── AnimatedText.tsx
│   │   └── AnimatedCard.tsx
│   └── preview/             # Preview para Setup Module
│       └── HomepagePreview.tsx
├── hooks/                   # Custom hooks
│   ├── useHomepageConfig.ts
│   └── useScrollAnimation.ts
├── types/                   # TypeScript types
│   └── index.ts
└── utils/                   # Utility functions
    └── validateConfig.ts
```

## Manifest

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

## Dependências

### npm packages
- `react` ^19.x
- `framer-motion` ^11.x
- `@tanstack/react-query` ^5.x
- `react-hook-form` ^7.x
- `zod` ^3.x
- `lucide-react` (latest)

### Componentes animate-ui

Ver [ANIMATE-UI-SETUP.md](./ANIMATE-UI-SETUP.md) para lista completa e comandos de instalação.

### Módulos internos
- `auth` - Integração com autenticação

## Rotas

- Configurável por instância (padrão: `/`)
- Não requer autenticação

## Configuração de Instância

Ver schema completo em [SPEC-module-homepage.md](../../../../../spec/SPEC-module-homepage.md#configuração-de-instância).

Exemplo básico:

```typescript
{
  instanceId: "homepage-main",
  moduleId: "homepage",
  portalId: "main",
  config: {
    route: "/",
    animations: {
      enabled: true,
      intensity: "normal",
      reducedMotion: true
    },
    sections: [
      { type: "hero", enabled: true, ... },
      { type: "features", enabled: true, ... },
      { type: "portals", enabled: true, ... },
      { type: "cta", enabled: true, ... }
    ]
  }
}
```

## Implementação

### Ordem Recomendada

1. ✅ Tipos TypeScript e schemas Zod
2. ✅ Hooks (useHomepageConfig, useScrollAnimation)
3. ✅ Wrappers de componentes animados
4. ✅ Componentes de seção (Hero, Features, Portals, CTA)
5. ✅ HomePage principal (compositor)
6. ✅ Routes e manifest
7. ✅ Preview para Setup Module

### Checklist de Implementação

- [ ] `types/index.ts` - TypeScript types
- [ ] `utils/validateConfig.ts` - Zod schemas
- [ ] `hooks/useHomepageConfig.ts` - JQEL query
- [ ] `hooks/useScrollAnimation.ts` - Intersection Observer
- [ ] `components/animated/` - Wrappers animate-ui
- [ ] `components/sections/HeroSection.tsx`
- [ ] `components/sections/FeaturesSection.tsx`
- [ ] `components/sections/PortalsSection.tsx`
- [ ] `components/sections/CTASection.tsx`
- [ ] `components/HomePage.tsx`
- [ ] `components/preview/HomepagePreview.tsx`
- [ ] `manifest.ts`
- [ ] `routes.ts`
- [ ] `index.ts`
- [ ] Testes (unit, component, integration)
- [ ] Testes de acessibilidade
- [ ] Testes de performance

## Performance Targets

- **Bundle Size:** <200KB gzipped (inicial)
- **TTI:** <1s em 3G
- **FCP:** <0.5s em 3G
- **Animations:** ≥60fps

## Acessibilidade

- **WCAG 2.1 Level AA** compliant
- Keyboard navigation completo
- Screen reader friendly
- `prefers-reduced-motion` support
- Contraste mínimo 4.5:1 (texto normal)

## Status de Desenvolvimento

**Fase Atual:** Especificação completa

**Próximos Passos:**
1. Aguardar implementação da infraestrutura frontend (React + Vite)
2. Implementar tipos e schemas
3. Implementar componentes

**Bloqueios:**
- Frontend ainda não existe (projeto em fase de especificação)
- Auth module ainda não implementado (dependência)

## Referências

- [SPEC-module-homepage.md](../../../../../spec/SPEC-module-homepage.md)
- [SPEC-ui-homepage.md](../../../../../spec/ui/SPEC-ui-homepage.md)
- [animate-ui docs](https://animate-ui.com/docs)
- [shadcn/ui docs](https://ui.shadcn.com/docs)
