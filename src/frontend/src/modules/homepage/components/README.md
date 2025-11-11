# Components

Componentes React do módulo Homepage.

## Estrutura

```
components/
├── HomePage.tsx              # Componente principal da página
├── sections/                 # Seções da homepage
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   ├── PortalsSection.tsx
│   └── CTASection.tsx
├── animated/                 # Wrappers de componentes animate-ui
│   ├── AnimatedBadge.tsx
│   ├── AnimatedText.tsx
│   └── AnimatedCard.tsx
└── preview/                  # Preview para Setup Module
    └── HomepagePreview.tsx
```

## HomePage.tsx

Componente principal que:
- Recebe `instanceId` via props ou route params
- Busca configuração via `useHomepageConfig(instanceId)`
- Renderiza seções habilitadas na ordem configurada
- Gerencia scroll animations via `useScrollAnimation`
- Fornece contexto de animações (intensidade, enabled)

**Props:**
```typescript
interface HomePageProps {
  instanceId?: string;
}
```

**Estrutura:**
```tsx
<main className="homepage">
  <ScrollAnimationProvider>
    {config.sections.map((section) => (
      section.enabled && (
        <SectionComponent
          key={section.type}
          config={section}
        />
      )
    ))}
  </ScrollAnimationProvider>
</main>
```

## sections/

### HeroSection.tsx

Hero section com título animado, subtítulo e CTAs.

**Props:**
```typescript
interface HeroSectionProps {
  config: HeroSectionConfig;
}
```

**Layouts suportados:**
- `centered` - Conteúdo centralizado
- `split` - Texto 50% + Visual 50%

**Animações:**
- Title: blur-in, pull-up, fade, gradual-spacing
- Subtitle: fade, blur-in, gradual-spacing
- Buttons: animated-shiny-button
- Background: grid, none

### FeaturesSection.tsx

Grid de features com cards opcionalmente flip.

**Props:**
```typescript
interface FeaturesSectionProps {
  config: FeaturesSectionConfig;
}
```

**Card Effects:**
- `flip-hover` - Card vira ao hover
- `hover-lift` - Card levanta ao hover
- `none` - Estático

**Animações:**
- Container: animated-list
- Titles: letter-pull-up
- Badges: animated-badge

### PortalsSection.tsx

Grid ou órbita de portais disponíveis.

**Props:**
```typescript
interface PortalsSectionProps {
  config: PortalsSectionConfig;
}
```

**Layouts:**
- `grid` - Grade de cards
- `orbit` - Órbita circular animada

**Data:**
- Busca portais via JQEL
- Filtra por IDs configurados
- Exibe status (active/inactive)

### CTASection.tsx

Call-to-action final com background animado.

**Props:**
```typescript
interface CTASectionProps {
  config: CTASectionConfig;
}
```

**Background Effects:**
- `ripple` - SVG ripple effect
- `none` - Sólido

**Animações:**
- Title: fade, blur-in, pull-up
- Buttons: animated-shiny-button

## animated/

Wrappers que aplicam configurações globais de animação.

### AnimatedText.tsx

Wrapper universal para textos animados.

```typescript
interface AnimatedTextProps {
  text: string;
  type: 'blur-in' | 'pull-up' | 'fade' | 'gradual-spacing';
  className?: string;
  delay?: number;
}
```

**Funcionalidades:**
- Respeita `prefers-reduced-motion`
- Aplica intensidade configurada
- Fallback para span estático se animações desabilitadas

### AnimatedBadge.tsx

Badge com animação de entrada.

```typescript
interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}
```

### AnimatedCard.tsx

Wrapper para cards com efeitos.

```typescript
interface AnimatedCardProps {
  children: React.ReactNode;
  effect: 'flip-hover' | 'hover-lift' | 'none';
  backContent?: React.ReactNode;
  className?: string;
}
```

## preview/

### HomepagePreview.tsx

Preview da homepage para Setup Module.

**Props:**
```typescript
interface HomepagePreviewProps {
  config: HomepageConfig;
  theme?: 'light' | 'dark';
  scale?: number;
}
```

**Funcionalidades:**
- Renderiza homepage com config fornecida (não busca via JQEL)
- Suporta toggle de tema
- Escala para caber em viewport menor
- Atualização em tempo real

## Convenções

### Naming

- Componentes: PascalCase (`HeroSection`)
- Arquivos: PascalCase matching component (`HeroSection.tsx`)
- Props interfaces: `{Component}Props`

### Imports

```typescript
// shadcn/ui
import { Button } from '@/components/ui/button';

// animate-ui
import { BlurInText } from '@/components/ui/blur-in-text';

// Hooks
import { useHomepageConfig } from '../hooks/useHomepageConfig';

// Types
import type { HeroSectionConfig } from '../types';
```

### Styling

- Use Tailwind utility classes
- Minimize custom CSS
- Use semantic colors (`text-primary`, `bg-muted`)
- Responsive: mobile-first
- Dark mode: automatic via theme

### Accessibility

- Use semantic HTML (`<section>`, `<article>`, `<nav>`)
- Proper heading hierarchy (H1 → H2 → H3)
- `aria-label` on icon-only buttons
- `aria-hidden="true"` on decorative elements
- Focus visible styles
- Keyboard navigation support

## Testing

### Unit Tests

```typescript
// HeroSection.test.tsx
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders title', () => {
    const config = { /* ... */ };
    render(<HeroSection config={config} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('applies centered layout', () => {
    // ...
  });
});
```

### Visual Regression

```typescript
// HeroSection.stories.tsx
export default {
  title: 'Homepage/Sections/Hero',
  component: HeroSection,
};

export const Centered = {
  args: {
    config: { /* ... */ }
  }
};

export const Split = {
  args: {
    config: { layout: 'split', /* ... */ }
  }
};
```

## Referências

- [SPEC-module-homepage.md](../../../../../../spec/SPEC-module-homepage.md)
- [SPEC-ui-homepage.md](../../../../../../spec/ui/SPEC-ui-homepage.md)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
