# SPEC-ui-homepage

**Status:** Draft
**Versão:** 1.0.0
**Última Atualização:** 2025-11-10

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Design System](#design-system)
3. [Hero Section](#hero-section)
4. [Features Section](#features-section)
5. [Portals Section](#portals-section)
6. [CTA Section](#cta-section)
7. [Componentes Compartilhados](#componentes-compartilhados)
8. [Animações](#animações)
9. [Responsividade](#responsividade)
10. [Temas](#temas)
11. [Estados](#estados)
12. [Acessibilidade](#acessibilidade)

---

## Visão Geral

### Propósito

Este documento define a interface do usuário e experiência do módulo Homepage, incluindo wireframes, componentes, animações, e guidelines visuais.

### Princípios de Design

1. **Clean & Modern**: Design minimalista com foco no conteúdo
2. **Motion-First**: Animações suaves que melhoram a experiência
3. **Mobile-First**: Otimizado para dispositivos móveis primeiro
4. **Accessible**: WCAG 2.1 AA compliant em todos os aspectos
5. **Performance**: Animações 60fps, carregamento <1s

### Paleta de Cores Base

```css
/* Light Theme */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 221.2 83.2% 53.3%;      /* Indigo */
--secondary: 210 40% 96.1%;
--accent: 142.1 76.2% 36.3%;        /* Green */
--muted: 210 40% 96.1%;

/* Dark Theme */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--primary: 217.2 91.2% 59.8%;      /* Lighter Indigo */
--secondary: 217.2 32.6% 17.5%;
--accent: 142.1 70.6% 45.3%;        /* Lighter Green */
--muted: 217.2 32.6% 17.5%;
```

---

## Design System

### Tipografia

**Hierarquia de Texto:**

```css
/* Hero Title */
.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Hero Subtitle */
.hero-subtitle {
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  font-weight: 400;
  line-height: 1.6;
  opacity: 0.8;
}

/* Section Title */
.section-title {
  font-size: clamp(1.875rem, 3vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

/* Feature Title */
.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}

/* Body Text */
.body-text {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.7;
}
```

### Espaçamento

**Sistema de Espaços:**

```
2xs: 0.25rem  (4px)
xs:  0.5rem   (8px)
sm:  0.75rem  (12px)
md:  1rem     (16px)
lg:  1.5rem   (24px)
xl:  2rem     (32px)
2xl: 3rem     (48px)
3xl: 4rem     (64px)
4xl: 6rem     (96px)
```

**Seções:**
- Padding vertical: `py-4xl` (96px desktop), `py-2xl` (48px mobile)
- Gap entre seções: `gap-4xl` (96px desktop), `gap-2xl` (48px mobile)

### Componentes shadcn/ui Utilizados

**Base:**
- `Button` - CTAs, links de ação
- `Card` - Features, portais
- `Badge` - Categorias, status
- `Separator` - Divisórias visuais

**Layout:**
- `Container` - Wrapper com max-width
- `Grid` - Layouts responsivos
- `Flex` - Alinhamento de elementos

---

## Hero Section

### Layout: Centered

**Wireframe:**

```
┌──────────────────────────────────────────────┐
│                 [Background Grid]            │
│                                              │
│            ┌──────────────┐                  │
│            │  [Badge]     │                  │
│            └──────────────┘                  │
│                                              │
│        ╔════════════════════════╗            │
│        ║  HERO TITLE ANIMATED   ║            │
│        ╚════════════════════════╝            │
│                                              │
│         Subtitle with description            │
│          appears with fade effect            │
│                                              │
│     [Primary CTA] [Secondary CTA]            │
│                                              │
│         ↓ Scroll indicator (optional)        │
└──────────────────────────────────────────────┘
```

**Estrutura HTML:**

```tsx
<section className="hero-section relative overflow-hidden">
  {/* Background Effect */}
  <GridBackground opacity={0.1} />

  <Container className="relative z-10 py-24 md:py-32 lg:py-40">
    <div className="flex flex-col items-center text-center space-y-8">

      {/* Optional Badge */}
      <AnimatedBadge variant="outline">
        New Feature
      </AnimatedBadge>

      {/* Animated Title */}
      <BlurInText
        text="Build Once, Reuse Infinitely"
        className="hero-title max-w-4xl"
        delay={0.2}
      />

      {/* Animated Subtitle */}
      <FadeText
        text="The modular platform for scalable web applications"
        className="hero-subtitle max-w-2xl"
        delay={0.4}
      />

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <AnimatedShinyButton size="lg">
          <Rocket className="mr-2 h-5 w-5" />
          Get Started
        </AnimatedShinyButton>

        <Button size="lg" variant="outline">
          Watch Demo
        </Button>
      </div>

      {/* Scroll Indicator */}
      <ChevronDown className="animate-bounce mt-8 opacity-50" />
    </div>
  </Container>
</section>
```

### Layout: Split

**Wireframe:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─────────────────────┐   ┌──────────────────┐    │
│  │                     │   │                  │    │
│  │  ╔═══════════════╗  │   │                  │    │
│  │  ║  HERO TITLE   ║  │   │   [Visual/       │    │
│  │  ╚═══════════════╝  │   │    Image/        │    │
│  │                     │   │    Graphic]      │    │
│  │  Subtitle text      │   │                  │    │
│  │                     │   │                  │    │
│  │  [Primary CTA]      │   │                  │    │
│  │  [Secondary CTA]    │   │                  │    │
│  │                     │   │                  │    │
│  └─────────────────────┘   └──────────────────┘    │
│         50% width                50% width         │
└─────────────────────────────────────────────────────┘
```

**Estrutura HTML:**

```tsx
<section className="hero-section relative overflow-hidden">
  <Container className="py-24 md:py-32">
    <div className="grid lg:grid-cols-2 gap-12 items-center">

      {/* Text Content */}
      <div className="space-y-6">
        <BlurInText
          text="Transform Your Workflow"
          className="hero-title"
          delay={0.2}
        />

        <GradualSpacingText
          text="Build modular applications with ease"
          className="hero-subtitle"
          delay={0.4}
        />

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <AnimatedShinyButton size="lg">
            Start Free Trial
          </AnimatedShinyButton>

          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </div>

      {/* Visual Content */}
      <div className="relative">
        <img
          src="/hero-illustration.png"
          alt="Platform illustration"
          className="w-full h-auto rounded-lg shadow-2xl"
        />
      </div>
    </div>
  </Container>
</section>
```

### Componentes Específicos

**GridBackground:**
- Componente do animate-ui: `Grid`
- Opacidade configurável (0.05-0.2)
- Animação sutil de fade in/out
- Respeita tema (light/dark)

**AnimatedShinyButton:**
- Componente do animate-ui: `AnimatedShinyButton`
- Efeito de brilho que percorre o botão
- Cor baseada em `--primary`
- Animação em loop contínuo (lento)

---

## Features Section

### Layout: Grid 3 Columns

**Wireframe:**

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              ╔═══════════════════╗                   │
│              ║  SECTION TITLE    ║                   │
│              ╚═══════════════════╝                   │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ [Icon]   │  │ [Icon]   │  │ [Icon]   │           │
│  │ [Badge]  │  │ [Badge]  │  │ [Badge]  │           │
│  │          │  │          │  │          │           │
│  │ Title    │  │ Title    │  │ Title    │           │
│  │ Desc...  │  │ Desc...  │  │ Desc...  │           │
│  │          │  │          │  │          │           │
│  │ [Hover   │  │ [Hover   │  │ [Hover   │           │
│  │  to flip]│  │  to flip]│  │  to flip]│           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  ...     │  │  ...     │  │  ...     │           │
│  └──────────┘  └──────────┘  └──────────┘           │
└──────────────────────────────────────────────────────┘
```

**Estrutura HTML:**

```tsx
<section className="features-section py-24 md:py-32">
  <Container>
    {/* Section Title */}
    <LetterPullUpText
      text="Why Choose Our Platform"
      className="section-title text-center mb-16"
    />

    {/* Features Grid */}
    <AnimatedList
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      delay={0.1}
    >
      {features.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </AnimatedList>
  </Container>
</section>
```

### FeatureCard Component

**Card com Flip Effect:**

```tsx
<CardFlipHover className="h-full">
  {/* Front Side */}
  <Card className="p-6 h-full flex flex-col">
    {/* Icon */}
    <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-6 h-6 text-primary" />
    </div>

    {/* Badge (optional) */}
    {badge && (
      <AnimatedBadge variant="secondary" className="mb-3 self-start">
        {badge}
      </AnimatedBadge>
    )}

    {/* Title */}
    <LetterPullUpText
      text={title}
      className="feature-title mb-2"
    />

    {/* Description */}
    <p className="body-text text-muted-foreground flex-grow">
      {description}
    </p>

    {/* Hover Indicator */}
    <p className="text-sm text-primary mt-4 flex items-center gap-2">
      Learn more <ArrowRight className="w-4 h-4" />
    </p>
  </Card>

  {/* Back Side (visible on flip) */}
  <Card className="p-6 h-full bg-primary text-primary-foreground">
    <h3 className="feature-title mb-4">{title}</h3>
    <p className="body-text">{backContent}</p>

    <Button variant="secondary" className="mt-6">
      Get Started
    </Button>
  </Card>
</CardFlipHover>
```

### Card sem Flip (Hover Lift)

```tsx
<Card className="p-6 h-full transition-all hover:shadow-xl hover:-translate-y-1">
  <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
    <Icon className="w-6 h-6 text-primary" />
  </div>

  {badge && (
    <AnimatedBadge variant="secondary" className="mb-3">
      {badge}
    </AnimatedBadge>
  )}

  <h3 className="feature-title mb-2">{title}</h3>
  <p className="body-text text-muted-foreground">{description}</p>
</Card>
```

### Componentes Específicos

**AnimatedList:**
- Componente do animate-ui: `AnimatedList`
- Anima children sequencialmente
- Delay de 100ms entre items
- Fade in + slide up de 20px

**CardFlipHover:**
- Componente do animate-ui: `CardFlipHover`
- Rotação em Y-axis (180deg)
- Duração: 500ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Trigger: hover (desktop) / tap (mobile)

**LetterPullUpText:**
- Componente do animate-ui: `LetterPullUpText`
- Cada letra sobe de 20px com opacity 0→1
- Delay de 30ms entre letras
- Triggered por Intersection Observer

---

## Portals Section

### Layout: Grid

**Wireframe:**

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              ╔═══════════════════╗                   │
│              ║  Explore Portals  ║                   │
│              ╚═══════════════════╝                   │
│                                                      │
│  ┌─────────────────┐  ┌─────────────────┐            │
│  │ ⭐ FEATURED     │  │ [Screenshot]    │            │
│  │                 │  │                 │            │
│  │ [Screenshot]    │  │ Portal Name     │            │
│  │                 │  │ Description...  │            │
│  │ Main Portal     │  │                 │            │
│  │ Description...  │  │ [Active Badge]  │            │
│  │                 │  │                 │            │
│  │ [Active Badge]  │  │ [Visit →]       │            │
│  │                 │  │                 │            │
│  │ [Visit →]       │  │                 │            │
│  └─────────────────┘  └─────────────────┘            │
│                                                      │
│  ┌─────────────────┐  ┌─────────────────┐            │
│  │  ...            │  │  ...            │            │
│  └─────────────────┘  └─────────────────┘            │
└──────────────────────────────────────────────────────┘
```

**Estrutura HTML:**

```tsx
<section className="portals-section py-24 md:py-32 bg-muted/50">
  <Container>
    <FadeText
      text="Explore Our Portals"
      className="section-title text-center mb-16"
    />

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {portals.map((portal) => (
        <PortalCard key={portal.portalId} {...portal} />
      ))}
    </div>
  </Container>
</section>
```

### PortalCard Component

```tsx
<CardFlipHover className="h-full">
  <Card className="p-0 overflow-hidden h-full flex flex-col">
    {/* Featured Badge */}
    {highlight && (
      <div className="absolute top-4 right-4 z-10">
        <AnimatedBadge className="bg-yellow-500 text-yellow-950">
          <Star className="w-3 h-3 mr-1" />
          Featured
        </AnimatedBadge>
      </div>
    )}

    {/* Screenshot */}
    {screenshot && (
      <div className="relative aspect-video overflow-hidden">
        <img
          src={screenshot}
          alt={`${name} preview`}
          className="w-full h-full object-cover"
        />
      </div>
    )}

    {/* Content */}
    <div className="p-6 flex-grow flex flex-col">
      {/* Portal Icon & Name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="feature-title">{customTitle || name}</h3>
      </div>

      {/* Description */}
      <p className="body-text text-muted-foreground mb-4 flex-grow">
        {description}
      </p>

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <Badge variant={active ? 'success' : 'secondary'}>
          {active ? 'Active' : 'Coming Soon'}
        </Badge>

        {/* Link */}
        {active && (
          <Link
            to={`/${portalId}`}
            className="text-primary hover:underline flex items-center gap-1"
          >
            Visit <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  </Card>
</CardFlipHover>
```

### Layout: Orbit (Opcional)

**Wireframe:**

```
┌──────────────────────────────────────────┐
│                                          │
│         ╔═══════════════════╗            │
│         ║  Explore Portals  ║            │
│         ╚═══════════════════╝            │
│                                          │
│               [Portal 1]                 │
│        [P6]              [P2]            │
│                                          │
│                ┌──────┐                  │
│    [Portal 5]  │ Core │  [Portal 3]      │
│                └──────┘                  │
│                                          │
│               [Portal 4]                 │
│                                          │
│         (Rotating slowly)                │
└──────────────────────────────────────────┘
```

**Estrutura HTML:**

```tsx
<section className="portals-section py-24 md:py-32">
  <Container>
    <FadeText
      text="Explore Our Portals"
      className="section-title text-center mb-16"
    />

    <OrbitRotation
      items={portals}
      radius={250}
      speed={30}
      renderItem={(portal) => (
        <div className="portal-orbit-item">
          <Avatar size="lg">
            <Icon className="w-8 h-8" />
          </Avatar>
          <span className="mt-2 text-sm font-medium">{portal.name}</span>
        </div>
      )}
    />
  </Container>
</section>
```

---

## CTA Section

### Layout: Centered

**Wireframe:**

```
┌──────────────────────────────────────────────────────┐
│        [SVG Ripple Effect Background]                │
│                                                      │
│              ╔═══════════════════════╗               │
│              ║  Ready to Transform?  ║               │
│              ╚═══════════════════════╝               │
│                                                      │
│         Join thousands of developers                 │
│         building better applications                 │
│                                                      │
│     [Shiny Primary CTA]  [Secondary CTA]             │
│                                                      │
│         ✓ No credit card  ✓ 14 days free             │
└──────────────────────────────────────────────────────┘
```

**Estrutura HTML:**

```tsx
<section className="cta-section relative overflow-hidden py-24 md:py-32">
  {/* Background Effect */}
  <SVGRippleEffect
    opacity={0.2}
    color="hsl(var(--primary))"
  />

  <Container className="relative z-10">
    <div className="max-w-3xl mx-auto text-center space-y-8">

      {/* Title */}
      <FadeText
        text="Ready to Transform Your Workflow?"
        className="section-title"
        delay={0.2}
      />

      {/* Description */}
      <p className="text-xl text-muted-foreground">
        Join thousands of developers building better applications
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <AnimatedShinyButton size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Start Free Trial
        </AnimatedShinyButton>

        <Button size="lg" variant="outline">
          Talk to Sales
        </Button>
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          No credit card required
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          14 days free
        </div>
      </div>
    </div>
  </Container>
</section>
```

### Componentes Específicos

**SVGRippleEffect:**
- Componente do animate-ui: `SVGRippleEffect`
- Ondas concêntricas animadas
- Cor baseada em `--primary`
- Opacidade baixa (0.1-0.3)
- Loop infinito

---

## Componentes Compartilhados

### Container

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
  {children}
</div>
```

### AnimatedBadge

```tsx
interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}

// Wraps shadcn Badge with entry animation
<Badge
  variant={variant}
  className={cn(
    "animate-in fade-in slide-in-from-bottom-2 duration-500",
    className
  )}
>
  {children}
</Badge>
```

### AnimatedText Wrapper

```tsx
interface AnimatedTextProps {
  text: string;
  type: 'blur-in' | 'pull-up' | 'fade' | 'gradual-spacing';
  className?: string;
  delay?: number;
}

// Conditionally renders appropriate animate-ui component
switch (type) {
  case 'blur-in':
    return <BlurInText text={text} className={className} delay={delay} />;
  case 'pull-up':
    return <LetterPullUpText text={text} className={className} delay={delay} />;
  case 'fade':
    return <FadeText text={text} className={className} delay={delay} />;
  case 'gradual-spacing':
    return <GradualSpacingText text={text} className={className} delay={delay} />;
}
```

---

## Animações

### Timing de Animações por Intensidade

**Subtle:**
```typescript
{
  duration: 200,
  easing: 'ease-out',
  stagger: 50
}
```

**Normal (padrão):**
```typescript
{
  duration: 400,
  easing: 'ease-in-out',
  stagger: 100
}
```

**Intense:**
```typescript
{
  duration: 700,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // bounce
  stagger: 150
}
```

### Sequência de Animações da Página

**Hero Section:**
1. Background fade in (0ms)
2. Badge aparecer (200ms)
3. Title blur in (400ms)
4. Subtitle fade in (600ms)
5. Buttons aparecer (800ms)

**Outras Seções (on scroll):**
1. Section title animar
2. Content fade in + slide up (stagger 100ms)

### Performance

**GPU-Accelerated Properties:**
- `transform`
- `opacity`

**Evitar Animar:**
- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`

**will-change:**
```css
/* Add during animation only */
.animating {
  will-change: transform, opacity;
}

/* Remove after animation */
.animated {
  will-change: auto;
}
```

---

## Responsividade

### Breakpoints

```
sm:  640px   - Phones (landscape)
md:  768px   - Tablets (portrait)
lg:  1024px  - Tablets (landscape), small laptops
xl:  1280px  - Desktops
2xl: 1536px  - Large desktops
```

### Layout Adaptations

**Hero Section:**
- Mobile (<768px): Stacked, centered
- Tablet (768-1023px): Stacked, larger text
- Desktop (≥1024px): Centered ou split based on config

**Features Section:**
- Mobile (<768px): 1 column
- Tablet (768-1023px): 2 columns
- Desktop (≥1024px): 3 columns (se config = 3)

**Portals Section:**
- Mobile (<768px): 1 column
- Tablet (768-1023px): 2 columns
- Desktop (≥1024px): 3 columns

**CTA Section:**
- Mobile (<640px): Buttons stack vertically
- Desktop (≥640px): Buttons side by side

### Typography Scaling

```css
/* Use clamp() for fluid typography */
font-size: clamp(min, preferred, max);

/* Examples: */
.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
}

.section-title {
  font-size: clamp(1.875rem, 3vw, 2.5rem);
}
```

### Touch Targets

Minimum size: **44x44px** (WCAG AAA)

```css
@media (pointer: coarse) {
  /* Touch devices */
  .button, .link {
    min-width: 44px;
    min-height: 44px;
    padding: 12px 24px;
  }
}
```

---

## Temas

### Light Theme

**Hero:**
- Background: `white` ou gradient claro
- Text: `slate-900`
- Accent: `indigo-600`

**Features:**
- Card background: `white`
- Card border: `slate-200`
- Icon background: `indigo-50`

**Portals:**
- Section background: `slate-50`

**CTA:**
- Background: gradient `indigo-600` → `purple-600`
- Text: `white`

### Dark Theme

**Hero:**
- Background: `slate-950` ou gradient escuro
- Text: `slate-50`
- Accent: `indigo-400`

**Features:**
- Card background: `slate-900`
- Card border: `slate-800`
- Icon background: `indigo-950`

**Portals:**
- Section background: `slate-900`

**CTA:**
- Background: gradient `indigo-500` → `purple-500`
- Text: `white`

### Transição de Tema

```css
* {
  transition: background-color 200ms ease-in-out,
              color 200ms ease-in-out,
              border-color 200ms ease-in-out;
}
```

---

## Estados

### Loading State

**Skeleton para Seções:**

```tsx
<section className="py-24">
  <Container>
    <Skeleton className="h-12 w-64 mx-auto mb-16" /> {/* Title */}

    <div className="grid md:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-12 w-12 mb-4" /> {/* Icon */}
          <Skeleton className="h-6 w-32 mb-2" />  {/* Title */}
          <Skeleton className="h-20 w-full" />    {/* Description */}
        </Card>
      ))}
    </div>
  </Container>
</section>
```

### Error State

```tsx
<section className="py-24">
  <Container>
    <Alert variant="destructive" className="max-w-2xl mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Failed to load homepage</AlertTitle>
      <AlertDescription>
        We couldn't load the homepage configuration. Please try again.
      </AlertDescription>
    </Alert>

    <div className="text-center mt-8">
      <Button onClick={retry}>Retry</Button>
    </div>
  </Container>
</section>
```

### Empty State (No Sections Enabled)

```tsx
<section className="py-24">
  <Container>
    <div className="text-center max-w-md mx-auto space-y-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
        <Home className="w-8 h-8 text-muted-foreground" />
      </div>

      <h2 className="text-2xl font-semibold">No sections configured</h2>
      <p className="text-muted-foreground">
        Configure your homepage sections in the Setup module.
      </p>

      <Button asChild>
        <Link to="/setup/homepage">Configure Homepage</Link>
      </Button>
    </div>
  </Container>
</section>
```

---

## Acessibilidade

### Contraste de Cores

Todas as combinações DEVEM passar WCAG 2.1 AA:
- Texto normal: ≥4.5:1
- Texto grande: ≥3:1
- UI components: ≥3:1

**Ferramentas de Validação:**
- https://webaim.org/resources/contrastchecker/
- https://colorable.jxnblk.com/

### Estrutura Semântica

```html
<main>
  <section aria-labelledby="hero-title">
    <h1 id="hero-title">...</h1>
  </section>

  <section aria-labelledby="features-title">
    <h2 id="features-title">...</h2>
  </section>

  <section aria-labelledby="portals-title">
    <h2 id="portals-title">...</h2>
  </section>

  <section aria-labelledby="cta-title">
    <h2 id="cta-title">...</h2>
  </section>
</main>
```

### Keyboard Navigation

**Focus Styles:**
```css
:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  border-radius: 4px;
}
```

**Skip Links:**
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50"
>
  Skip to main content
</a>
```

### ARIA Labels

**Animações Decorativas:**
```tsx
<div aria-hidden="true">
  <GridBackground />
</div>
```

**Botões com Ícones:**
```tsx
<Button aria-label="Start free trial">
  <Sparkles aria-hidden="true" />
  Start Free Trial
</Button>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**React Hook:**
```tsx
function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}
```

---

## Referências

### Componentes animate-ui Utilizados

| Componente | Uso | Documentação |
|------------|-----|--------------|
| **BlurInText** | Hero title | https://animate-ui.com/docs/components/blur-in-text |
| **LetterPullUpText** | Section titles, feature titles | https://animate-ui.com/docs/components/letter-pull-up-text |
| **FadeText** | Subtitles, descriptions | https://animate-ui.com/docs/components/fade-text |
| **GradualSpacingText** | Hero subtitle (opcional) | https://animate-ui.com/docs/components/gradual-spacing-text |
| **AnimatedShinyButton** | Primary CTAs | https://animate-ui.com/docs/components/animated-shiny-button |
| **AnimatedBadge** | Badges, tags | https://animate-ui.com/docs/components/animated-badge |
| **CardFlipHover** | Feature cards, portal cards | https://animate-ui.com/docs/components/card-flip-hover |
| **AnimatedList** | Features grid, portals grid | https://animate-ui.com/docs/components/animated-list |
| **Grid** | Hero background | https://animate-ui.com/docs/components/grid |
| **SVGRippleEffect** | CTA background | https://animate-ui.com/docs/components/svg-ripple-effect |
| **OrbitRotation** | Portals orbit layout | https://animate-ui.com/docs/components/orbit-rotation |

### shadcn/ui Componentes Base

| Componente | Uso |
|------------|-----|
| **Button** | CTAs, links |
| **Card** | Features, portals |
| **Badge** | Status, categories |
| **Skeleton** | Loading states |
| **Alert** | Error states |
| **Separator** | Visual dividers |

### Links Úteis

- **animate-ui docs:** https://animate-ui.com/docs
- **shadcn/ui docs:** https://ui.shadcn.com/docs
- **Lucide Icons:** https://lucide.dev/icons
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Framer Motion:** https://www.framer.com/motion/

---

**Status:** Este documento está em draft e será refinado durante a implementação.

**Histórico de Versões:**

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2025-11-10 | Versão inicial da especificação UI/UX |
