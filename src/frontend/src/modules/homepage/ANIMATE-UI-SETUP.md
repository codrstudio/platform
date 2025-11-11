# animate-ui Setup Guide

**Módulo:** Homepage
**Última Atualização:** 2025-11-10

## Visão Geral

Este documento lista todos os componentes do animate-ui necessários para o módulo Homepage e fornece comandos de instalação.

## Sobre animate-ui

- **Website:** https://animate-ui.com
- **Docs:** https://animate-ui.com/docs
- **Tipo:** Componentes React com Tailwind CSS e Framer Motion
- **Compatibilidade:** shadcn/ui registry
- **Licença:** Open Source

### Características

- Animações fluidas e profissionais
- Built on Framer Motion
- Integração perfeita com shadcn/ui
- Componentes copy-paste (sem dependência de pacote)
- Totalmente customizável

## Instalação

### Pré-requisitos

```bash
# Framer Motion (dependency do animate-ui)
npm install framer-motion@^11.x
```

### Método de Instalação

Os componentes animate-ui são instalados via shadcn CLI como registry components:

```bash
npx shadcn@latest add https://animate-ui.com/r/[component-name]
```

Isso copia o código do componente diretamente para seu projeto em `src/components/ui/`.

## Componentes Necessários

### Textos Animados

#### BlurInText
**Uso:** Hero title
**Descrição:** Texto que aparece com efeito de blur in (desfoque gradual)
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/blur-in-text
```
**Documentação:** https://animate-ui.com/docs/components/blur-in-text

#### LetterPullUpText
**Uso:** Section titles, feature titles
**Descrição:** Texto com letras que sobem animadamente uma por uma
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/letter-pull-up-text
```
**Documentação:** https://animate-ui.com/docs/components/letter-pull-up-text

#### FadeText
**Uso:** Subtitles, descriptions
**Descrição:** Texto com fade in simples e suave
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/fade-text
```
**Documentação:** https://animate-ui.com/docs/components/fade-text

#### GradualSpacingText
**Uso:** Hero subtitle (opcional)
**Descrição:** Texto com animação de espaçamento gradual entre letras
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/gradual-spacing-text
```
**Documentação:** https://animate-ui.com/docs/components/gradual-spacing-text

---

### Componentes Interativos

#### AnimatedShinyButton
**Uso:** Primary CTAs
**Descrição:** Botão com efeito de brilho animado que percorre o elemento
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/animated-shiny-button
```
**Documentação:** https://animate-ui.com/docs/components/animated-shiny-button

#### AnimatedBadge
**Uso:** Badges, tags, status indicators
**Descrição:** Badge com animação de entrada suave
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/animated-badge
```
**Documentação:** https://animate-ui.com/docs/components/animated-badge

#### CardFlipHover
**Uso:** Feature cards, portal cards
**Descrição:** Card que vira (flip) ao hover revelando conteúdo no verso
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/card-flip-hover
```
**Documentação:** https://animate-ui.com/docs/components/card-flip-hover

---

### Layouts Animados

#### AnimatedList
**Uso:** Features grid, portals grid
**Descrição:** Lista/grid com animação sequencial de entrada dos itens
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/animated-list
```
**Documentação:** https://animate-ui.com/docs/components/animated-list

#### OrbitRotation
**Uso:** Portals orbit layout (opcional)
**Descrição:** Elementos em órbita circular com rotação contínua
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/orbit-rotation
```
**Documentação:** https://animate-ui.com/docs/components/orbit-rotation

---

### Backgrounds Animados

#### Grid
**Uso:** Hero background
**Descrição:** Grid animado de fundo com efeito de pulsação sutil
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/grid
```
**Documentação:** https://animate-ui.com/docs/components/grid

#### NovatrixBackground
**Uso:** Alternative hero background
**Descrição:** Grid estilo "novatrix" com efeito de grade futurista
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/novatrix-background
```
**Documentação:** https://animate-ui.com/docs/components/novatrix-background

#### HackerBackground
**Uso:** Alternative hero background (tech theme)
**Descrição:** Efeito de código cascata estilo "Matrix"
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/hacker-background
```
**Documentação:** https://animate-ui.com/docs/components/hacker-background

#### SVGRippleEffect
**Uso:** CTA section background
**Descrição:** Efeito de ondulação SVG animado em loop
**Instalação:**
```bash
npx shadcn@latest add https://animate-ui.com/r/svg-ripple-effect
```
**Documentação:** https://animate-ui.com/docs/components/svg-ripple-effect

---

## Script de Instalação em Lote

Para instalar todos os componentes de uma vez:

```bash
#!/bin/bash
# install-animate-ui-components.sh

echo "Installing animate-ui components for Homepage module..."

# Text animations
npx shadcn@latest add https://animate-ui.com/r/blur-in-text
npx shadcn@latest add https://animate-ui.com/r/letter-pull-up-text
npx shadcn@latest add https://animate-ui.com/r/fade-text
npx shadcn@latest add https://animate-ui.com/r/gradual-spacing-text

# Interactive components
npx shadcn@latest add https://animate-ui.com/r/animated-shiny-button
npx shadcn@latest add https://animate-ui.com/r/animated-badge
npx shadcn@latest add https://animate-ui.com/r/card-flip-hover

# Layout components
npx shadcn@latest add https://animate-ui.com/r/animated-list
npx shadcn@latest add https://animate-ui.com/r/orbit-rotation

# Background effects
npx shadcn@latest add https://animate-ui.com/r/grid
npx shadcn@latest add https://animate-ui.com/r/novatrix-background
npx shadcn@latest add https://animate-ui.com/r/hacker-background
npx shadcn@latest add https://animate-ui.com/r/svg-ripple-effect

echo "✓ All animate-ui components installed!"
```

**Uso:**
```bash
chmod +x install-animate-ui-components.sh
./install-animate-ui-components.sh
```

---

## Estrutura Após Instalação

Os componentes serão instalados em:

```
src/components/ui/
├── blur-in-text.tsx
├── letter-pull-up-text.tsx
├── fade-text.tsx
├── gradual-spacing-text.tsx
├── animated-shiny-button.tsx
├── animated-badge.tsx
├── card-flip-hover.tsx
├── animated-list.tsx
├── orbit-rotation.tsx
├── grid.tsx
├── novatrix-background.tsx
├── hacker-background.tsx
└── svg-ripple-effect.tsx
```

## Uso nos Componentes

### Importação

```typescript
// components/sections/HeroSection.tsx
import { BlurInText } from '@/components/ui/blur-in-text';
import { AnimatedShinyButton } from '@/components/ui/animated-shiny-button';
import { Grid } from '@/components/ui/grid';

export function HeroSection({ config }: HeroSectionProps) {
  return (
    <section className="relative">
      <Grid opacity={0.1} />

      <BlurInText
        text={config.title.text}
        className="text-5xl font-bold"
        delay={0.2}
      />

      <AnimatedShinyButton>
        Get Started
      </AnimatedShinyButton>
    </section>
  );
}
```

### Wrapper Pattern

Para aplicar configurações globais (intensidade, reduced-motion), criar wrappers em `components/animated/`:

```typescript
// components/animated/AnimatedText.tsx
import { useHomepageConfig } from '@/hooks/useHomepageConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { BlurInText } from '@/components/ui/blur-in-text';
import { FadeText } from '@/components/ui/fade-text';
// ... outros imports

interface AnimatedTextProps {
  text: string;
  type: 'blur-in' | 'pull-up' | 'fade' | 'gradual-spacing';
  className?: string;
  delay?: number;
}

export function AnimatedText({ text, type, className, delay }: AnimatedTextProps) {
  const { config } = useHomepageConfig();
  const prefersReducedMotion = useReducedMotion();

  // Desabilita animações se necessário
  if (prefersReducedMotion || !config?.animations?.enabled) {
    return <span className={className}>{text}</span>;
  }

  // Ajusta delay baseado na intensidade
  const adjustedDelay = {
    subtle: delay ? delay * 0.5 : 0,
    normal: delay || 0,
    intense: delay ? delay * 1.5 : 0
  }[config?.animations?.intensity || 'normal'];

  // Renderiza componente apropriado
  switch (type) {
    case 'blur-in':
      return <BlurInText text={text} className={className} delay={adjustedDelay} />;
    case 'fade':
      return <FadeText text={text} className={className} delay={adjustedDelay} />;
    // ... outros casos
  }
}
```

---

## Customização

### Timing e Easing

Componentes animate-ui podem ser customizados via props ou CSS:

```typescript
<BlurInText
  text="Custom animation"
  delay={0.3}
  duration={0.6}
  className="custom-text"
/>
```

### Tema (Light/Dark)

Componentes respeitam automaticamente CSS custom properties do tema:

```css
/* Cores se adaptam ao tema */
.animated-component {
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}
```

---

## Performance

### Tree Shaking

Como componentes são copiados individualmente, apenas os usados serão incluídos no bundle.

### Code Splitting

Lazy load sections que usam componentes pesados:

```typescript
const PortalsOrbitSection = lazy(() =>
  import('./sections/PortalsOrbitSection')
);
```

### will-change

Aplicar apenas durante animação:

```typescript
// Hook personalizado
function useWillChange(isAnimating: boolean) {
  useEffect(() => {
    if (isAnimating) {
      element.style.willChange = 'transform, opacity';
    } else {
      element.style.willChange = 'auto';
    }
  }, [isAnimating]);
}
```

---

## Troubleshooting

### Animações não aparecem

1. Verificar se Framer Motion está instalado
2. Verificar se componente foi instalado corretamente
3. Verificar se `prefers-reduced-motion` não está ativo
4. Verificar console por erros

### Performance ruim

1. Verificar se `will-change` está sendo aplicado apenas durante animação
2. Reduzir número de elementos animados simultaneamente
3. Usar `useReducedMotion` para desabilitar em dispositivos lentos
4. Lazy load seções abaixo da dobra

### TypeScript errors

1. Verificar se tipos estão exportados do componente
2. Adicionar tipos manualmente se necessário
3. Atualizar `@types/react` se incompatibilidade

---

## Referências

- **animate-ui Docs:** https://animate-ui.com/docs
- **animate-ui Components:** https://animate-ui.com/docs/components
- **Framer Motion Docs:** https://www.framer.com/motion/
- **shadcn/ui Registry:** https://ui.shadcn.com/docs/cli

---

## Changelog

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0.0 | 2025-11-10 | Versão inicial - 13 componentes documentados |

---

**Nota:** Este documento será atualizado conforme novos componentes forem adicionados ou removidos durante a implementação.
